import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run session refresh on page requests only. Everything below is skipped
     * so no Supabase round-trip is spent on assets and crawler files:
     * - _next/static, _next/image (build output and optimized images)
     * - favicon / icons / manifest
     * - robots.txt and sitemap.xml (must stay publicly cacheable)
     * - common static file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|woff|woff2|ttf|otf|map)$).*)",
  ],
};
