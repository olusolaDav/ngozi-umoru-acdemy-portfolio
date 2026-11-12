import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

type LikePayload = {
  action: "LIKE" | "UNLIKE" | "like" | "unlike";
};

export async function POST(request: Request, context: { params: Promise<{ commentId: string }> }) {
  try {
    const params = await context.params;
    const payload = (await request.json()) as LikePayload;
    const action = payload.action?.toUpperCase() as "LIKE" | "UNLIKE";

    const { data, status } = await callApi(`/blogs/comments/${params.commentId}/like`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
