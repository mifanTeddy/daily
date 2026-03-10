import { NextResponse } from "next/server";

import { getRelatedArticles } from "@/lib/api";
import type { LanguageCode } from "@/lib/types";

function parseLanguage(value: string | null): LanguageCode {
  return value === "en" ? "en" : "zh";
}

export async function GET(request: Request, context: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const lang = parseLanguage(searchParams.get("lang"));

  const related = await getRelatedArticles(context.params.id, lang);
  return NextResponse.json({ items: related }, { headers: { "Cache-Control": "no-store" } });
}
