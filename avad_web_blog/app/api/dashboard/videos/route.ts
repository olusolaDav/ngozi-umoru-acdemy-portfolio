import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { unauthorizedJson } from "../../auth/_helpers";
import { withBearerRetry } from "./_helpers";

type CreateVideoPayload = {
  title?: string;
  description?: string;
  category?: string;
  youtubeUrl: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ?? "1";
    const limit = searchParams.get("limit") ?? "30";
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

    const { data, status } = await withBearerRetry((token) =>
      callApi(`/videos/admin/list?${params.toString()}`, {
        method: "GET",
        next: { revalidate: 0 },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );

    return NextResponse.json(data, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("unauthorized")) {
      return unauthorizedJson();
    }

    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateVideoPayload;

    const { data, status } = await withBearerRetry((token) =>
      callApi("/videos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }),
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("unauthorized")) {
      return unauthorizedJson();
    }

    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
