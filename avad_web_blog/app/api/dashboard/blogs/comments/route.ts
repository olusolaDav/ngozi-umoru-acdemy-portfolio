import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { unauthorizedJson } from "../../../auth/_helpers";
import { withBearerRetry } from "../_helpers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ?? "1";
    const limit = searchParams.get("limit") ?? "10";
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const blogId = searchParams.get("blogId");

    const params = new URLSearchParams({ page, limit });
    if (search) {
      params.set("search", search);
    }
    if (status) {
      params.set("status", status);
    }
    if (blogId) {
      params.set("blogId", blogId);
    }

    const { data, status: responseStatus } = await withBearerRetry((token) =>
      callApi(`/blogs/admin/comments/list?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );

    return NextResponse.json(data, { status: responseStatus });
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("unauthorized")) {
      return unauthorizedJson();
    }
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
