import { NextResponse } from "next/server";

import { getFeed } from "@/lib/api";
import type { FeedTab } from "@/lib/types";

const VALID_TABS: FeedTab[] = ["recommended", "latest", "following"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const tabParam = searchParams.get("tab") as FeedTab | null;
  const tab = VALID_TABS.includes(tabParam as FeedTab) ? (tabParam as FeedTab) : "recommended";

  const cursor = searchParams.get("cursor") ?? undefined;
  const topic = searchParams.get("topic") ?? undefined;

  const followingTopics = (searchParams.get("following") ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const payload = await getFeed({
    tab,
    cursor,
    topic,
    followingTopics
  });

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
