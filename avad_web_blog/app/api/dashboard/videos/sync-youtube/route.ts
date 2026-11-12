import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { unauthorizedJson } from "../../../auth/_helpers";
import { withBearerRetry } from "../_helpers";

type SyncPayload = {
  maxResults?: number;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as SyncPayload;

    const { data, status } = await withBearerRetry((token) =>
      callApi("/videos/admin/sync-youtube", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }),
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("unauthorized")) {
      return unauthorizedJson();
    }

    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
