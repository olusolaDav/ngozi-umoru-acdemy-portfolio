import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { getAccessToken, refreshSessionIfPossible } from "../../../../auth/_helpers";

type CreateReplyPayload = {
  name: string;
  email?: string;
  subject?: string;
  message: string;
};

export async function GET(_: Request, context: { params: Promise<{ commentId: string }> }) {
  try {
    const params = await context.params;
    const { data, status } = await callApi(`/community/comments/${params.commentId}/replies`, {
      method: "GET",
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ commentId: string }> }) {
  try {
    const params = await context.params;
    const payload = (await request.json()) as CreateReplyPayload;
    const accessToken = (await getAccessToken()) ?? (await refreshSessionIfPossible())?.accessToken;

    const { data, status } = await callApi(`/community/comments/${params.commentId}/replies`, {
      method: "POST",
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
      body: JSON.stringify(payload),
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
