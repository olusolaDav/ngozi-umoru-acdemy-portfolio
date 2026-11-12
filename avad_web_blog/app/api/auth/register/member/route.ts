import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterPayload;
    const { data, status } = await callApi("/auth/register/member", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
