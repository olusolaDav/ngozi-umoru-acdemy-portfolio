import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { unauthorizedJson } from "../../../../auth/_helpers";
import { withBearerRetry } from "../../_helpers";

type ManageStatusPayload = {
  action: "PUBLISH" | "SCHEDULE" | "UNPUBLISH" | "REVERT_TO_DRAFT";
  scheduledAt?: string;
};

export async function PATCH(request: Request, context: { params: Promise<{ scriptureId: string }> }) {
  try {
    const params = await context.params;
    const payload = (await request.json()) as ManageStatusPayload;

    const { data, status } = await withBearerRetry((token) =>
      callApi(`/daily-scriptures/admin/${params.scriptureId}/status`, {
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
