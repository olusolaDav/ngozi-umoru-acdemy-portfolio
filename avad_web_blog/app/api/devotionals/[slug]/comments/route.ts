import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { getAccessToken, refreshSessionIfPossible } from "../../../auth/_helpers";

type CreateCommentPayload = {
  name: string;
  email?: string;
  subject?: string;
  message: string;
};

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const params = await context.params;
    const { data, status } = await callApi(`/devotionals/${params.slug}/comments`, {
      method: "GET",
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const params = await context.params;
    const payload = (await request.json()) as CreateCommentPayload;
    const accessToken = (await getAccessToken()) ?? (await refreshSessionIfPossible())?.accessToken;

    const { data, status } = await callApi(`/devotionals/${params.slug}/comments`, {
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
