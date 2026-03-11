import { proxyGet } from "@/lib/backend-proxy";

export async function GET(request: Request, context: { params: { id: string } }) {
  return proxyGet(request, `/api/articles/${context.params.id}/related`);
}
