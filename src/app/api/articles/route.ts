import { NextResponse } from "next/server";

import { getAllArticles, uploadArticle } from "@/lib/api";
import type { LanguageCode, UploadArticleInput } from "@/lib/types";

function parseLanguage(value: string | null): LanguageCode {
  return value === "en" ? "en" : "zh";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = parseLanguage(searchParams.get("lang"));

  const items = await getAllArticles(lang);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as UploadArticleInput;
  const item = await uploadArticle(payload);
  return NextResponse.json({ item }, { status: 201 });
}
