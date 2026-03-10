import { NextResponse } from "next/server";

import { uploadArticle } from "@/lib/api";
import type { UploadArticleInput } from "@/lib/types";

export async function POST(request: Request) {
  const payload = (await request.json()) as UploadArticleInput;
  const item = await uploadArticle(payload);
  return NextResponse.json({ item }, { status: 201 });
}
