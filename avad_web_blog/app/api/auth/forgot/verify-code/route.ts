import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

type VerifyPayload = {
  email: string;
  code: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as VerifyPayload;
    const { data, status } = await callApi<{ resetToken: string; expiresIn: string }>(
      "/auth/forgot-password/verify-code",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
