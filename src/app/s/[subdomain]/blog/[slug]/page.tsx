import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { googleFontsHref } from "@/lib/site-fonts";
import { blogTheme } from "@/lib/blog-theme";
import { tenantUrl } from "@/lib/urls";
import NotLive from "@/components/site/NotLive";
import { loadBlogContext, getPublishedPost } from "../data";

type Params = Promise<{ subdomain: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const ctx = await loadBlogContext(subdomain);
  if (!ctx) return { title: "مقال" };
  const post = await getPublishedPost(ctx.office.id, decodeURIComponent(slug));
  if (!post) return { title: "مقال غير موجود", robots: { index: false, follow: false } };
  const url = `${tenantUrl(ctx.office.slug)}/blog/${encodeURIComponent(post.slug)}`;
  const description = post.excerpt || (post.body || "").slice(0, 160);
  return {
    title: `${post.title} · ${ctx.content.brand.ar || ctx.office.name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      type: "article",
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
  };
}

export default async function BlogArticle({ params }: { params: Params }) {
  const { subdomain, slug } = await params;
  const ctx = await loadBlogContext(subdomain);
  if (!ctx) return <NotLive variant="missing" slug={subdomain} />;
  if (!ctx.live) return <NotLive variant="suspended" slug={subdomain} name={ctx.office.name} />;
  if (!ctx.blogEnabled || ctx.content.visible.blog === false) notFound();

  const post = await getPublishedPost(ctx.office.id, decodeURIComponent(slug));
  if (!post) notFound();

  const bt = blogTheme(ctx.content.theme);
  const home = tenantUrl(ctx.office.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: post.cover || undefined,
    datePublished: post.published_at || post.created_at,
    author: { "@type": "Organization", name: ctx.content.brand.ar || ctx.office.name },
  };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/site-template/blog.css" precedence="high" />
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href={googleFontsHref([bt.fontKey])} precedence="high" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={bt.style} className="blog-page">
        <header className="blog-top">
          <Link href={home} className="brand-link">{ctx.content.brand.ar || ctx.office.name}<span style={{ color: "var(--accent)" }}>.</span></Link>
          <Link href={`${home}/blog`} className="back-link">← كل المقالات</Link>
        </header>

        <main className="wrap article-wrap">
          <article className="glass-card">
            {post.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="article-cover" src={post.cover} alt={post.title} />
            ) : null}
            <div className="glass-body">
              <div className="post-date mono">{new Date(post.published_at || post.created_at).toLocaleDateString("ar-SA")}</div>
              <h1 className="article-title">{post.title}</h1>
              {post.excerpt ? <p className="article-lead">{post.excerpt}</p> : null}
              {post.body ? <div className="article-body">{post.body}</div> : null}
            </div>
          </article>
        </main>
      </div>
    </>
  );
}
