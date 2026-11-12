import { NextResponse } from "next/server";

import { callApi } from "@/lib/server-api";

import {
  clearAuthCookies,
  getAccessToken,
  refreshSessionIfPossible,
  unauthorizedJson,
} from "../_helpers";

type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
  twoFactorEnabled: boolean;
};

export async function GET() {
  let accessToken = await getAccessToken();

  if (!accessToken) {
    const refreshed = await refreshSessionIfPossible();
    accessToken = refreshed?.accessToken;
  }

  if (!accessToken) {
    return unauthorizedJson();
  }

  try {
    const { data } = await callApi<SessionUser>("/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return NextResponse.json(data);
  } catch {
    await clearAuthCookies();
    return unauthorizedJson();
  }
}
