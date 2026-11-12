import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { unauthorizedJson } from "../../../../auth/_helpers";
import { withBearerRetry } from "../../_helpers";

type BulkRecommendPayload = {
  videoIds: string[];
  recommended: boolean;
};

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as BulkRecommendPayload;

    const { data, status } = await withBearerRetry((token) =>
      callApi("/videos/admin/recommend/bulk", {
        method: "PATCH",
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
