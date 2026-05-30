// Builds the public URL for an office's site.
//
// - Custom domain (or localhost): uses a real subdomain  ->  slug.example.com
// - *.vercel.app (no wildcard subdomains): falls back to a path  ->  app.vercel.app/s/slug
// Protocol is stripped defensively in case ROOT_DOMAIN was set with "https://".

function cleanDomain(d: string): string {
  return d.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

export function rootDomain(): string {
  return cleanDomain(process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000");
}

function isVercelPreview(root: string): boolean {
  return /\.vercel\.app$/i.test(root);
}

export function tenantUrl(slug: string): string {
  const root = rootDomain();
  const isLocal = root.includes("localhost");
  const proto = isLocal ? "http" : "https";
  if (isVercelPreview(root)) return `${proto}://${root}/s/${slug}`;
  return `${proto}://${slug}.${root}`;
}

// Short label to display in the UI.
export function tenantLabel(slug: string): string {
  const root = rootDomain();
  return isVercelPreview(root) ? `${root}/s/${slug}` : `${slug}.${root}`;
}
