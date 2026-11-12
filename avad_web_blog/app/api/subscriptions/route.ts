import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email: string };
    const { data, status } = await callApi("/subscriptions", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}