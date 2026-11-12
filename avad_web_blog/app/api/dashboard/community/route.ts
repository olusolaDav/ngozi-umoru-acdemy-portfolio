import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { unauthorizedJson } from "../../auth/_helpers";
import { withBearerRetry } from "./_helpers";

type CreateCommunityPayload = {
  title: string;
  slug?: string;
  content: string;
  prayerPoint: string;
  communityDate: string;
  excerpt?: string;
  metaDescription?: string;
  thumbnail?: string;
  tags?: string[];
  readTime?: number;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ?? "1";
    const limit = searchParams.get("limit") ?? "10";
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const scope = searchParams.get("scope");
    const submissionState = searchParams.get("submissionState");

    const params = new URLSearchParams({ page, limit });
    if (search) {
      params.set("search", search);
    }
    if (status) {
      params.set("status", status);
    }
    if (scope) {
      params.set("scope", scope);
    }
    if (submissionState) {
      params.set("submissionState", submissionState);
    }

    const { data, status: responseStatus } = await withBearerRetry((token) =>
      callApi(`/community/manage/list?${params.toString()}`, {
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

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateCommunityPayload;

    const { data, status } = await withBearerRetry((token) =>
      callApi("/community", {
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
