import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { getAccessToken, refreshSessionIfPossible, unauthorizedJson } from "../../../auth/_helpers";

type ChangeEmailPayload = {
  newEmail: string;
  password: string;
};

async function getBearerToken() {
  const accessToken = await getAccessToken();
  if (accessToken) {
    return accessToken;
  }

  const refreshed = await refreshSessionIfPossible();
  return refreshed?.accessToken;
}

export async function PATCH(request: Request) {
  try {
    const token = await getBearerToken();
    if (!token) {
      return unauthorizedJson();
    }

    const payload = (await request.json()) as ChangeEmailPayload;

    const { data, status } = await callApi("/users/me/email", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
