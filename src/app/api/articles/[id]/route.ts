import { NextResponse } from "next/server";

import { getArticleById } from "@/lib/api";

export async function GET(_request: Request, context: { params: { id: string } }) {
  const article = await getArticleById(context.params.id);
  return NextResponse.json({ item: article }, { headers: { "Cache-Control": "no-store" } });
}
