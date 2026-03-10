import { NextResponse } from "next/server";

import { batchUploadArticles } from "@/lib/api";
import type { UploadArticleInput } from "@/lib/types";

export async function POST(request: Request) {
  const payload = (await request.json()) as { items: UploadArticleInput[] };
  const items = await batchUploadArticles(payload.items ?? []);
  return NextResponse.json({ items }, { status: 201 });
}
