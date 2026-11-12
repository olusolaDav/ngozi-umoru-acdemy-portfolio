import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const params = new URLSearchParams();
    if (date) {
      params.set("date", date);
    }

    const suffix = params.size ? `?${params.toString()}` : "";
    const { data, status } = await callApi(`/daily-scriptures/today${suffix}`, {
      method: "GET",
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
