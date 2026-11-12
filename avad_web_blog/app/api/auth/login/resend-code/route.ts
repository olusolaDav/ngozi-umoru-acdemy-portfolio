import { NextResponse } from "next/server";
import { callApi, safeErrorMessage } from "@/lib/server-api";

export async function POST(request: Request) {
  try {
    const { data, status } = await callApi("/auth/login/resend-code", { method: "POST", body: JSON.stringify(await request.json()) });
    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}