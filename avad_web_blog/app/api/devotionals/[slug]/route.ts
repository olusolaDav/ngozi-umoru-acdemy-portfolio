import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const params = await context.params;
    const { data, status } = await callApi(`/devotionals/${params.slug}`, {
      method: "GET",
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
