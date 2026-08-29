import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import { scrapeProduct } from "@/lib/firecrawl";
import { sendPriceDropAlert } from "@/lib/email";

// Never cache or statically evaluate a privileged, side-effecting endpoint.
export const dynamic = "force-dynamic";

// Scraping is network-bound; a small amount of parallelism cuts total runtime
// substantially without hammering the upstream API.
const CONCURRENCY = 5;

/** Constant-time bearer-token comparison, resistant to timing analysis. */
function isAuthorized(authHeader, secret) {
  if (!secret || typeof authHeader !== "string") return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authHeader);

  // timingSafeEqual throws on length mismatch, so check length separately.
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

/** Run an async worker over items with a bounded number of parallel tasks. */
async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  });

  await Promise.all(runners);
  return results;
}

export async function POST(request) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (!isAuthorized(request.headers.get("authorization"), cronSecret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, url, name, current_price, currency, image_url, user_id");

    if (productsError) throw productsError;

    console.log(`Found ${products.length} products to check`);

    const results = {
      total: products.length,
      updated: 0,
      failed: 0,
      priceChanges: 0,
      alertsSent: 0,
    };

    await mapWithConcurrency(products, CONCURRENCY, async (product) => {
      try {
        const productData = await scrapeProduct(product.url);

        const newPrice = Number.parseFloat(productData?.currentPrice);
        const oldPrice = Number.parseFloat(product.current_price);

        if (!Number.isFinite(newPrice)) {
          results.failed++;
          return;
        }

        await supabase
          .from("products")
          .update({
            current_price: newPrice,
            currency: productData.currencyCode || product.currency,
            name: productData.productName || product.name,
            image_url: productData.productImageUrl || product.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

        if (Number.isFinite(oldPrice) && oldPrice !== newPrice) {
          await supabase.from("price_history").insert({
            product_id: product.id,
            price: newPrice,
            currency: productData.currencyCode || product.currency,
          });

          results.priceChanges++;

          if (newPrice < oldPrice) {
            const {
              data: { user },
            } = await supabase.auth.admin.getUserById(product.user_id);

            if (user?.email) {
              const emailResult = await sendPriceDropAlert(
                user.email,
                product,
                oldPrice,
                newPrice
              );

              if (emailResult.success) {
                results.alertsSent++;
              }
            }
          }
        }

        results.updated++;
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        results.failed++;
      }
    });

    return NextResponse.json({
      success: true,
      message: "Price check completed",
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    // Generic message: internal errors must not leak to the caller.
    return NextResponse.json(
      { error: "Price check failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // The endpoint is privileged; do not describe it to unauthenticated callers.
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
