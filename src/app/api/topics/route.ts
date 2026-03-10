import { NextResponse } from "next/server";

import { getTopics } from "@/lib/api";
import type { LanguageCode } from "@/lib/types";

function parseLanguage(value: string | null): LanguageCode {
  return value === "en" ? "en" : "zh";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = parseLanguage(searchParams.get("lang"));

  const topics = await getTopics(lang);
  return NextResponse.json({ items: topics }, { headers: { "Cache-Control": "no-store" } });
}
