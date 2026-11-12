import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ?? "1";
    const limit = searchParams.get("limit") ?? "10";
    const search = searchParams.get("search");
    const recommended = searchParams.get("recommended");

    const params = new URLSearchParams({ page, limit });
    if (search) {
      params.set("search", search);
    }
    if (recommended === "true") {
      params.set("recommended", recommended);
    }

    const { data, status } = await callApi(`/blogs?${params.toString()}`, {
      method: "GET",
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
