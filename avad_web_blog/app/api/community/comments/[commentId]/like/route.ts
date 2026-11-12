import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";
import { getAccessToken, refreshSessionIfPossible } from "../../../../auth/_helpers";

type LikePayload = {
  action: "LIKE" | "UNLIKE" | "like" | "unlike";
};

export async function POST(request: Request, context: { params: Promise<{ commentId: string }> }) {
  try {
    const params = await context.params;
    const payload = (await request.json()) as LikePayload;
    const action = payload.action?.toUpperCase() as "LIKE" | "UNLIKE";
    const accessToken = (await getAccessToken()) ?? (await refreshSessionIfPossible())?.accessToken;

    const { data, status } = await callApi(`/community/comments/${params.commentId}/like`, {
      method: "POST",
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
      body: JSON.stringify({ action }),
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
