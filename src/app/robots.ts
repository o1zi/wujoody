import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "https://wujoody.vercel.app").replace(/\/+$/, "");
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/super-admin", "/api"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
