"use server";

import { createClient } from "@/utils/supabase/server";
import { scrapeProduct } from "@/lib/firecrawl";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_URL_LENGTH = 2048;

// Hosts that must never be fetched on the server's behalf. Accepting an
// arbitrary URL and requesting it server-side is an SSRF vector, so private
// and loopback ranges are rejected before the URL ever reaches the scraper.
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
]);

const PRIVATE_IPV4 =
  /^(10\.|127\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

/**
 * Validate and normalize a user-supplied product URL.
 * Returns the normalized URL string, or null when it is unusable.
 */
function normalizeProductUrl(value) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return null;

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTNAMES.has(hostname)) return null;
  if (hostname.endsWith(".local") || hostname.endsWith(".internal")) return null;
  if (PRIVATE_IPV4.test(hostname)) return null;
  if (hostname.startsWith("fc") || hostname.startsWith("fd")) return null;

  // Credentials in the URL are never meaningful for a product page.
  parsed.username = "";
  parsed.password = "";
  parsed.hash = "";

  return parsed.toString();
}

/** Keep only a plausible ISO-4217-style code, falling back to USD. */
function sanitizeCurrency(code) {
  return typeof code === "string" && /^[A-Za-z]{3}$/.test(code.trim())
    ? code.trim().toUpperCase()
    : "USD";
}

/** Trim scraped text to a sane length before it reaches the database. */
function sanitizeText(value, maxLength) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

export async function addProduct(formData) {
  const rawUrl = formData.get("url");

  const url = normalizeProductUrl(rawUrl);
  if (!url) {
    return { error: "Please enter a valid public product URL (http or https)" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Scrape product data with Firecrawl
    const productData = await scrapeProduct(url);

    if (!productData.productName || !productData.currentPrice) {
      return { error: "Could not extract product information from this URL" };
    }

    const newPrice = Number.parseFloat(productData.currentPrice);
    if (!Number.isFinite(newPrice) || newPrice < 0) {
      return { error: "Could not read a valid price from this URL" };
    }

    const currency = sanitizeCurrency(productData.currencyCode);

    // Check if product exists to determine if it's an update.
    // maybeSingle() treats "no row" as a normal result rather than an error.
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id, current_price")
      .eq("user_id", user.id)
      .eq("url", url)
      .maybeSingle();

    const isUpdate = !!existingProduct;

    // Upsert product (insert or update based on user_id + url)
    const { data: product, error } = await supabase
      .from("products")
      .upsert(
        {
          user_id: user.id,
          url,
          name: sanitizeText(productData.productName, 300),
          current_price: newPrice,
          currency: currency,
          image_url: normalizeProductUrl(productData.productImageUrl),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,url", // Unique constraint on user_id + url
          ignoreDuplicates: false, // Always update if exists
        }
      )
      .select()
      .single();

    if (error) throw error;

    // Add to price history if it's a new product OR price changed.
    // Compare numerically: current_price arrives as a string from Postgres
    // numeric columns, so a strict !== would always report a change.
    const shouldAddHistory =
      !isUpdate ||
      Number.parseFloat(existingProduct.current_price) !== newPrice;

    if (shouldAddHistory) {
      await supabase.from("price_history").insert({
        product_id: product.id,
        price: newPrice,
        currency: currency,
      });
    }

    revalidatePath("/");
    return {
      success: true,
      product,
      message: isUpdate
        ? "Product updated with latest price!"
        : "Product added successfully!",
    };
  } catch (error) {
    // Log the detail server-side; return a generic message so database and
    // upstream-API internals are never surfaced to the browser.
    console.error("Add product error:", error);
    return { error: "Failed to add product. Please check the URL and try again." };
  }
}

export async function deleteProduct(productId) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Scope the delete to the caller so a forged id cannot remove another
    // user's row, independently of whatever RLS policies are in place.
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    return { error: "Failed to delete product" };
  }
}

export async function getProducts() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("products")
      .select("id, url, name, current_price, currency, image_url, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get products error:", error);
    return [];
  }
}

export async function getPriceHistory(productId) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    // Confirm the product belongs to the caller before exposing its history.
    const { data: owned } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!owned) return [];

    const { data, error } = await supabase
      .from("price_history")
      .select("price, currency, checked_at")
      .eq("product_id", productId)
      .order("checked_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get price history error:", error);
    return [];
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}
