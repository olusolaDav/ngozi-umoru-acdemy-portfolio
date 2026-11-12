import { NextResponse } from "next/server";
import { callApi, safeErrorMessage } from "@/lib/server-api";
import { getAccessToken, refreshSessionIfPossible, unauthorizedJson } from "../../../auth/_helpers";

export async function PATCH(request: Request) {
  try {
    const token = (await getAccessToken()) ?? (await refreshSessionIfPossible())?.accessToken;
    if (!token) return unauthorizedJson();
    const { data, status } = await callApi("/users/me/two-factor", { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(await request.json()) });
    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}