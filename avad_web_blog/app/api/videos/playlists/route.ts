import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

export async function GET() {
  try {
    const { data, status } = await callApi("/videos/playlists", { method: "GET" });
    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
