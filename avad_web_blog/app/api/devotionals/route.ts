import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

type DevotionalListItem = {
  devotionalDate?: string;
};

type DevotionalListResponse = {
  items: DevotionalListItem[];
};

function isOnOrBeforeToday(value: string | undefined, now: Date) {
  if (!value) {
    return false;
  }

  const devotionalDate = new Date(value);
  if (Number.isNaN(devotionalDate.getTime())) {
    return false;
  }

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  return devotionalDate <= endOfToday;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ?? "1";
    const limit = searchParams.get("limit") ?? "10";
    const search = searchParams.get("search");
    const recommended = searchParams.get("recommended");

    const params = new URLSearchParams({ page, limit });
    if (search) {
      params.set("search", search);
    }
    if (recommended === "true") {
      params.set("recommended", recommended);
    }

    const { data, status } = await callApi<DevotionalListResponse>(`/devotionals?${params.toString()}`, {
      method: "GET",
    });

    const now = new Date();
    const visibleItems = Array.isArray(data.items)
      ? data.items.filter((item) => isOnOrBeforeToday(item.devotionalDate, now))
      : [];

    return NextResponse.json(
      {
        ...data,
        items: visibleItems,
      },
      { status },
    );
  } catch (error) {
    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
