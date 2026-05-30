import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const RESERVED_SUBDOMAINS = new Set(["www", "app", "api", "admin", "mail"]);

function getSubdomain(host: string, rootDomain: string): string | null {
  const hostNoPort = host.split(":")[0];
  const rootNoPort = rootDomain.split(":")[0];
  if (hostNoPort === rootNoPort || hostNoPort === `www.${rootNoPort}`) return null;
  if (!hostNoPort.endsWith(`.${rootNoPort}`)) return null;
  const sub = hostNoPort.slice(0, hostNoPort.length - rootNoPort.length - 1);
  if (!sub || RESERVED_SUBDOMAINS.has(sub)) return null;
  return sub;
}

export async function proxy(request: NextRequest) {
  const { nextUrl: url } = request;
  const host = (request.headers.get("host") || "").toLowerCase();
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  const subdomain = getSubdomain(host, rootDomain);

  // Base response that also carries refreshed Supabase auth cookies.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session (required by @supabase/ssr).
  await supabase.auth.getUser();

  // Paths that must always be served by the platform itself, even on a
  // tenant subdomain (shared assets, API, auth, Next internals).
  const isReserved =
    url.pathname.startsWith("/site-template") ||
    url.pathname.startsWith("/backgrounds") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/auth");

  // Tenant public site: rewrite subdomain traffic to /s/<subdomain>/...
  if (subdomain && !isReserved) {
    const rewriteUrl = new URL(`/s/${subdomain}${url.pathname}${url.search}`, request.url);
    const rewritten = NextResponse.rewrite(rewriteUrl, { request });
    response.cookies.getAll().forEach((c) => rewritten.cookies.set(c));
    return rewritten;
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and Next internals.
    "/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov|ogg|ogv|ico)$).*)",
  ],
};
