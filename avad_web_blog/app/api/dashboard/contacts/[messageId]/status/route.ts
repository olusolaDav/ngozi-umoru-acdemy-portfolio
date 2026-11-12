import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { unauthorizedJson } from "../../../../auth/_helpers";
import { withBearerRetry } from "../../_helpers";

type Params = {
  params: Promise<{ messageId: string }>;
};

type ManageStatusPayload = {
  action: "MARK_READ" | "MARK_UNREAD";
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { messageId } = await params;
    const payload = (await request.json()) as ManageStatusPayload;

    const { data, status } = await withBearerRetry((token) =>
      callApi(`/contact/admin/${messageId}/status`, {
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
