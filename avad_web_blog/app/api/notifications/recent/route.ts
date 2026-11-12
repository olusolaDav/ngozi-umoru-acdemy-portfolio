import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { unauthorizedJson } from "../../auth/_helpers";
import { withBearerRetry } from "../_helpers";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.toString();
    const suffix = search ? `?${search}` : "";

    const { data, status } = await withBearerRetry((token) =>
      callApi(`/notifications/recent${suffix}`, {
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
