import { NextResponse } from "next/server";

import { getRelatedArticles } from "@/lib/api";

export async function GET(_request: Request, context: { params: { id: string } }) {
  const related = await getRelatedArticles(context.params.id);
  return NextResponse.json({ items: related }, { headers: { "Cache-Control": "no-store" } });
}
