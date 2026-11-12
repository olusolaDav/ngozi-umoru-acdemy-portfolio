import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

type ConfirmPayload = {
  email: string;
  code: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ConfirmPayload;
    const { data, status } = await callApi("/auth/verify-email/confirm", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
