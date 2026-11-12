import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { unauthorizedJson } from "../../../../auth/_helpers";
import { withBearerRetry } from "../../_helpers";

type ModeratePayload = {
  action: "PUBLISH" | "UNPUBLISH" | "DELETE";
};

export async function PATCH(request: Request, context: { params: Promise<{ commentId: string }> }) {
  try {
    const params = await context.params;
    const payload = (await request.json()) as ModeratePayload;

    const { data, status } = await withBearerRetry((token) =>
      callApi(`/devotionals/admin/comments/${params.commentId}`, {
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
