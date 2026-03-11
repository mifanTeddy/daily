import { NextResponse } from "next/server";

const DEFAULT_BACKEND_BASE_URL = "https://daily-api.clawrun-test.app";
const BACKEND_BASE_URL = (
  process.env.DAILY_BACKEND_URL ??
  process.env.NEXT_PUBLIC_DAILY_BACKEND_URL ??
  DEFAULT_BACKEND_BASE_URL
).replace(/\/$/, "");

const CACHE_SECONDS = 30;
const CACHE_HEADER = `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 4}`;

function buildUpstreamUrl(request: Request, upstreamPath: string): string {
  const incoming = new URL(request.url);
  const upstream = new URL(`${BACKEND_BASE_URL}${upstreamPath}`);

  incoming.searchParams.forEach((value, key) => {
    upstream.searchParams.append(key, value);
  });

  return upstream.toString();
}

function pickForwardHeaders(request: Request): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json"
  };

  const authorization = request.headers.get("authorization");
  if (authorization) {
    headers.Authorization = authorization;
  }

  const adminToken = request.headers.get("x-admin-token");
  if (adminToken) {
    headers["x-admin-token"] = adminToken;
  }

  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  return headers;
}

export async function proxyGet(request: Request, upstreamPath: string): Promise<NextResponse> {
  const upstream = buildUpstreamUrl(request, upstreamPath);

  try {
    const res = await fetch(upstream, {
      method: "GET",
      headers: pickForwardHeaders(request),
      next: { revalidate: CACHE_SECONDS }
    });

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/json; charset=utf-8",
        "Cache-Control": CACHE_HEADER
      }
    });
  } catch {
    return NextResponse.json(
      { error: "upstream_unreachable", upstream, backend: BACKEND_BASE_URL },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function proxyPost(request: Request, upstreamPath: string): Promise<NextResponse> {
  const upstream = buildUpstreamUrl(request, upstreamPath);
  const rawBody = await request.text();

  const headers = pickForwardHeaders(request) as Record<string, string>;
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  try {
    const res = await fetch(upstream, {
      method: "POST",
      headers,
      body: rawBody,
      cache: "no-store"
    });

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return NextResponse.json(
      { error: "upstream_unreachable", upstream, backend: BACKEND_BASE_URL },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
