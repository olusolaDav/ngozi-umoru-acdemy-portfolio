import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { callApi, safeErrorMessage } from "@/lib/server-api";

type EngagementPayload = {
  action: "VIEW" | "LIKE" | "UNLIKE" | "SHARE";
};

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const params = await context.params;
    const payload = (await request.json()) as EngagementPayload;

    if (payload.action === "VIEW") {
      const cookieName = `devotional_viewed_${params.slug}`;
      const store = await cookies();
      const viewed = store.get(cookieName)?.value === "1";

      if (viewed) {
        return NextResponse.json({ message: "View already counted." }, { status: 200 });
      }

      const { data, status } = await callApi(`/devotionals/${params.slug}/engagement`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const response = NextResponse.json(data, { status });
      response.cookies.set({
        name: cookieName,
        value: "1",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });

      return response;
    }

    const { data, status } = await callApi(`/devotionals/${params.slug}/engagement`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
