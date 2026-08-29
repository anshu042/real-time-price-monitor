const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shopalert.vercel.app";

export default function sitemap() {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
