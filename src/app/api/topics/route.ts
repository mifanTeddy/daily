import { proxyGet } from "@/lib/backend-proxy";

export async function GET(request: Request) {
  return proxyGet(request, "/api/topics");
}
