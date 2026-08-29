import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * Only same-origin relative paths are accepted as a post-login destination.
 * Anything else (absolute URLs, protocol-relative "//evil.com") is discarded
 * so the callback cannot be used as an open redirect.
 */
function safeNextPath(next) {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/error", origin));
}
