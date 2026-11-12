import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ?? "1";
    const limit = searchParams.get("limit") ?? "12";
    const search = searchParams.get("search");
    const recommended = searchParams.get("recommended");
    const videoType = searchParams.get("videoType");
    const playlistId = searchParams.get("playlistId");
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");

    const params = new URLSearchParams({ page, limit });
    if (search?.trim()) {
      params.set("search", search.trim());
    }
    if (recommended === "true" || recommended === "false") {
      params.set("recommended", recommended);
    }
    if (videoType === "AVAD_DAY" || videoType === "MEMOIR_FROM_THE_FATHER" || videoType === "OTHERS") {
      params.set("videoType", videoType);
    }
    if (playlistId?.trim()) {
      params.set("playlistId", playlistId.trim());
    }
    if (category?.trim()) {
      params.set("category", category.trim());
    }
    if (sortBy?.trim()) {
      params.set("sortBy", sortBy.trim());
    }
    if (sortOrder === "asc" || sortOrder === "desc") {
      params.set("sortOrder", sortOrder);
    }

    const { data, status } = await callApi(`/videos?${params.toString()}`, { method: "GET" });
    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
