import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

type ResetPayload = {
  resetToken: string;
  newPassword: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ResetPayload;
    const { data, status } = await callApi("/auth/forgot-password/reset", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
