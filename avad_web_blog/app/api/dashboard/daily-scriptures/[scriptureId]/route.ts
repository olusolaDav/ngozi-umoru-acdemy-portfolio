import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { unauthorizedJson } from "../../../auth/_helpers";
import { withBearerRetry } from "../_helpers";

type UpdateDailyScripturePayload = {
  verse?: string;
  content?: string;
  scriptureDate?: string;
  excerpt?: string;
};

export async function GET(_: Request, context: { params: Promise<{ scriptureId: string }> }) {
  try {
    const params = await context.params;
    const { data, status } = await withBearerRetry((token) =>
      callApi(`/daily-scriptures/admin/${params.scriptureId}`, {
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

export async function PATCH(request: Request, context: { params: Promise<{ scriptureId: string }> }) {
  try {
    const params = await context.params;
    const payload = (await request.json()) as UpdateDailyScripturePayload;

    const { data, status } = await withBearerRetry((token) =>
      callApi(`/daily-scriptures/admin/${params.scriptureId}`, {
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

export async function DELETE(_: Request, context: { params: Promise<{ scriptureId: string }> }) {
  try {
    const params = await context.params;

    const { data, status } = await withBearerRetry((token) =>
      callApi(`/daily-scriptures/admin/${params.scriptureId}`, {
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
