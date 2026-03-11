import { proxyGet, proxyPost } from "@/lib/backend-proxy";

export async function GET(request: Request) {
  return proxyGet(request, "/api/articles");
}

export async function POST(request: Request) {
  return proxyPost(request, "/api/articles/upload");
}
