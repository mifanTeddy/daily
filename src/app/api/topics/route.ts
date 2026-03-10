import { NextResponse } from "next/server";

import { getTopics } from "@/lib/api";

export async function GET() {
  const topics = await getTopics();
  return NextResponse.json({ items: topics }, { headers: { "Cache-Control": "no-store" } });
}
