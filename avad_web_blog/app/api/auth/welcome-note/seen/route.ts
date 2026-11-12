import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { getAccessToken, refreshSessionIfPossible, unauthorizedJson } from "../../_helpers";

async function withTokenRetry<T>(executor: (token: string) => Promise<T>) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    return await executor(token);
  } catch (error) {
    const refreshed = await refreshSessionIfPossible();
    if (!refreshed?.accessToken) {
      throw error;
    }

    return executor(refreshed.accessToken);
  }
}

export async function POST() {
  try {
    const { data, status } = await withTokenRetry((token) =>
      callApi("/auth/welcome-note/seen", {
        method: "POST",
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
