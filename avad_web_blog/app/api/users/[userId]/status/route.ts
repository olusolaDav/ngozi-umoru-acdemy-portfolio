import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { getAccessToken, refreshSessionIfPossible, unauthorizedJson } from "../../../auth/_helpers";

async function getBearerToken() {
  const accessToken = await getAccessToken();
  if (accessToken) {
    return accessToken;
  }

  const refreshed = await refreshSessionIfPossible();
  return refreshed?.accessToken;
}

export async function PATCH(_: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const token = await getBearerToken();
    if (!token) {
      return unauthorizedJson();
    }

    const params = await context.params;
    const { data, status } = await callApi(`/users/${params.userId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
