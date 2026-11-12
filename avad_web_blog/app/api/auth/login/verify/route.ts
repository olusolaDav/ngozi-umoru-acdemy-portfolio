import { NextResponse } from "next/server";

import { ApiRequestError, callApi, safeErrorMessage } from "@/lib/server-api";
import { setAuthCookies } from "../../_helpers";

type LoginResult = {
  requiresPasswordChange: boolean;
  remember?: boolean;
  passwordChangeToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: { id: string; email: string; role: string };
};

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { data, status } = await callApi<LoginResult>("/auth/login/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await setAuthCookies(data, data.remember === true);
    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json(
      { message: safeErrorMessage(error) },
      { status: error instanceof ApiRequestError ? error.status : 400 },
    );
  }
}