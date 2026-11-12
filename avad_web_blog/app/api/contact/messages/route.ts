import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

type CreateContactPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateContactPayload;

    const { data, status } = await callApi("/contact/messages", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
