import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { unauthorizedJson } from "../../../auth/_helpers";
import { withBearerRetry } from "../_helpers";

type UpdateCommunityPayload = {
  title?: string;
  slug?: string;
  content?: string;
  prayerPoint?: string;
  communityDate?: string;
  excerpt?: string;
  metaDescription?: string;
  thumbnail?: string;
  tags?: string[];
  readTime?: number;
};

export async function GET(_: Request, context: { params: Promise<{ communityId: string }> }) {
  try {
    const params = await context.params;
    const { data, status } = await withBearerRetry((token) =>
      callApi(`/community/manage/${params.communityId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

export async function PATCH(request: Request, context: { params: Promise<{ communityId: string }> }) {
  try {
    const params = await context.params;
    const payload = (await request.json()) as UpdateCommunityPayload;

    const { data, status } = await withBearerRetry((token) =>
      callApi(`/community/manage/${params.communityId}`, {
        method: "PATCH",
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

export async function DELETE(_: Request, context: { params: Promise<{ communityId: string }> }) {
  try {
    const params = await context.params;

    const { data, status } = await withBearerRetry((token) =>
      callApi(`/community/manage/${params.communityId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
