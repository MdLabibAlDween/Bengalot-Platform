import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

type PublicConfig = {
  pages: Record<string, boolean>;
  redirects: {
    source_path: string;
    destination_url: string;
    status_code: number;
  }[];
};

async function refreshSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // This refreshes the auth cookies when the access token is close to expiry.
  await supabase.auth.getUser();
  return response;
}

let cache: { expires: number; value: PublicConfig | null } = { expires: 0, value: null };

async function loadConfig(): Promise<PublicConfig | null> {
  if (cache.value && Date.now() < cache.expires) return cache.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const headers = { apikey: key, Authorization: `Bearer ${key}` };
    const [pagesResponse, redirectsResponse] = await Promise.all([
      fetch(`${url}/rest/v1/settings?key=eq.page_visibility&select=value`, {
        headers,
        cache: "no-store",
      }),
      fetch(
        `${url}/rest/v1/admin_redirects?enabled=eq.true&select=source_path,destination_url,status_code&order=sort.asc`,
        { headers, cache: "no-store" }
      ),
    ]);
    const pagesRows = pagesResponse.ok ? await pagesResponse.json() : [];
    const redirects = redirectsResponse.ok ? await redirectsResponse.json() : [];
    const value: PublicConfig = {
      pages: pagesRows?.[0]?.value ?? {},
      redirects: Array.isArray(redirects) ? redirects : [],
    };
    cache = { value, expires: Date.now() + 15_000 };
    return value;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Admin and account pages need fresh Supabase auth cookies so sessions do not
  // silently expire after the one-hour access-token lifetime.
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/account")
  ) {
    return refreshSession(request);
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/.well-known")
  ) {
    return NextResponse.next();
  }

  const config = await loadConfig();
  if (!config) return NextResponse.next();

  const redirect = config.redirects.find(
    (rule) => rule.source_path === pathname || `${rule.source_path}/` === pathname
  );
  if (redirect) {
    const destination = redirect.destination_url.startsWith("http")
      ? redirect.destination_url
      : `${request.nextUrl.origin}${redirect.destination_url}`;
    return NextResponse.redirect(destination, redirect.status_code as 301 | 302 | 307 | 308);
  }

  if (pathname !== "/" && config.pages[pathname] === false) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = `?unavailable=${encodeURIComponent(pathname)}${search ? `&${search.slice(1)}` : ""}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
