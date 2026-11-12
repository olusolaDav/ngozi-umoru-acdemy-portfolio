import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_KEYS } from "@/lib/auth-constants";
import { callApi, safeErrorMessage } from "@/lib/server-api";

import { clearAuthCookies } from "../../_helpers";

type ChangePayload = {
  newPassword: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ChangePayload;
    const store = await cookies();
    const changeToken = store.get(AUTH_COOKIE_KEYS.passwordChangeToken)?.value;

    if (!changeToken) {
      return NextResponse.json({ message: "Missing password change token." }, { status: 401 });
    }

    const { data, status } = await callApi("/auth/first-login/change-password", {
      method: "POST",
      body: JSON.stringify({
        changeToken,
        newPassword: payload.newPassword,
      }),
    });

    await clearAuthCookies();

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
