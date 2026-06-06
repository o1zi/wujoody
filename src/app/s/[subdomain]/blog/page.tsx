import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { googleFontsHref } from "@/lib/site-fonts";
import { blogTheme } from "@/lib/blog-theme";
import { tenantUrl } from "@/lib/urls";
import NotLive from "@/components/site/NotLive";
import { loadBlogContext, getPublishedPosts } from "./data";

type Params = Promise<{ subdomain: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { subdomain } = await params;
  const ctx = await loadBlogContext(subdomain);
  if (!ctx) return { title: "المدوّنة" };
  const title = `المدوّنة · ${ctx.content.brand.ar || ctx.office.name}`;
  return {
    title,
    description: `أحدث المقالات والأخبار من ${ctx.content.brand.ar || ctx.office.name}.`,
    alternates: { canonical: `${tenantUrl(ctx.office.slug)}/blog` },
    robots: ctx.live && ctx.blogEnabled ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function BlogList({ params }: { params: Params }) {
  const { subdomain } = await params;
  const ctx = await loadBlogContext(subdomain);
  if (!ctx) return <NotLive variant="missing" slug={subdomain} />;
  if (!ctx.live) return <NotLive variant="suspended" slug={subdomain} name={ctx.office.name} />;
  if (!ctx.blogEnabled || ctx.content.visible.blog === false) notFound();

  const posts = await getPublishedPosts(ctx.office.id);
  const bt = blogTheme(ctx.content.theme);
  const home = tenantUrl(ctx.office.slug);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/site-template/blog.css" precedence="high" />
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href={googleFontsHref([bt.fontKey])} precedence="high" />

      <div style={bt.style} className="blog-page">
        <header className="blog-top">
          <Link href={home} className="brand-link">{ctx.content.brand.ar || ctx.office.name}<span style={{ color: "var(--accent)" }}>.</span></Link>
          <Link href={home} className="back-link">← العودة للموقع</Link>
        </header>

        <main className="wrap blog-wrap">
          <div className="eyebrow mono"><span className="ln"></span> المدوّنة — <span className="en">JOURNAL</span></div>
          <h1 className="blog-h1">أحدث المقالات والأخبار</h1>

          {posts.length === 0 ? (
            <div className="glass-card" style={{ marginTop: 24 }}>
              <div className="glass-body" style={{ textAlign: "center", color: "var(--text-2)" }}>
                لا توجد مقالات منشورة بعد.
              </div>
            </div>
          ) : (
            <div className="blog-grid">
              {posts.map((p) => (
                <Link key={p.id} href={`${home}/blog/${encodeURIComponent(p.slug)}`} className="post-card glass-card">
                  {p.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="post-cover" src={p.cover} alt={p.title} />
                  ) : null}
                  <div className="glass-body">
                    <div className="post-date mono">{new Date(p.published_at || p.created_at).toLocaleDateString("ar-SA")}</div>
                    <h2 className="post-title">{p.title}</h2>
                    {p.excerpt ? <p className="post-excerpt">{p.excerpt}</p> : null}
                    <span className="post-more mono">اقرأ المزيد ←</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
