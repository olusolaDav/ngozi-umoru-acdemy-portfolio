import { NextResponse } from "next/server";

import { ApiRequestError, callApi, safeErrorMessage } from "@/lib/server-api";

import { setAuthCookies } from "../_helpers";

type LoginPayload = {
  email: string;
  password: string;
  remember?: boolean;
};

type LoginResult = {
  requiresPasswordChange: boolean;
  passwordChangeToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginPayload;
    const { email, password, remember = false } = payload;
    const { data, status } = await callApi<LoginResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, remember }),
    });

    await setAuthCookies(data, remember);

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json(
      { message: safeErrorMessage(error) },
      {
        status: error instanceof ApiRequestError ? error.status : 400,
      },
    );
  }
}
