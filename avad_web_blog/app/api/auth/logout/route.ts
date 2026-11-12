import { NextResponse } from "next/server";

import { callApi } from "@/lib/server-api";

import { clearAuthCookies, getRefreshToken } from "../_helpers";

export async function POST() {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    try {
      await callApi("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Local cookie cleanup still invalidates frontend session.
    }
  }

  await clearAuthCookies();
  return NextResponse.json({ loggedOut: true });
}
