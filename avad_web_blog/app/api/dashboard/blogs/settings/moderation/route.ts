import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { unauthorizedJson } from "../../../../auth/_helpers";
import { withBearerRetry } from "../../_helpers";

type ModerationSettingsPayload = {
  autoApprovePosts?: boolean;
  autoApproveComments?: boolean;
  autoApproveReplies?: boolean;
};

export async function GET() {
  try {
    const { data, status } = await withBearerRetry((token) =>
      callApi("/blogs/admin/settings/moderation", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as ModerationSettingsPayload;

    const { data, status } = await withBearerRetry((token) =>
      callApi("/blogs/admin/settings/moderation", {
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
