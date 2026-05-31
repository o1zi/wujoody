import { tenantUrl } from "@/lib/urls";
import { loadBlogContext, getPublishedPosts } from "../blog/data";

export const dynamic = "force-dynamic";

type Params = Promise<{ subdomain: string }>;

function xmlEscape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET(_req: Request, { params }: { params: Params }) {
  const { subdomain } = await params;
  const base = tenantUrl(subdomain);
  const ctx = await loadBlogContext(subdomain);

  const urls: { loc: string; lastmod?: string }[] = [];
  if (ctx && ctx.live) {
    urls.push({ loc: base });
    const blogOn = ctx.blogEnabled && ctx.content.visible.blog !== false;
    if (blogOn) {
      urls.push({ loc: `${base}/blog` });
      const posts = await getPublishedPosts(ctx.office.id);
      for (const p of posts) {
        urls.push({ loc: `${base}/blog/${encodeURIComponent(p.slug)}`, lastmod: (p.published_at || p.created_at).slice(0, 10) });
      }
    }
  }

  const items = urls
    .map((u) => `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}\n  </url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`;

  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
