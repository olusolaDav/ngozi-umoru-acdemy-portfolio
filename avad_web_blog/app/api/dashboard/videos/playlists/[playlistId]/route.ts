import { NextResponse } from "next/server";

import { callApi, safeErrorMessage } from "@/lib/server-api";

import { unauthorizedJson } from "../../../../auth/_helpers";
import { withBearerRetry } from "../../_helpers";

type Context = {
  params: Promise<{ playlistId: string }>;
};

export async function DELETE(_: Request, context: Context) {
  try {
    const { playlistId } = await context.params;

    const { data, status } = await withBearerRetry((token) =>
      callApi(`/videos/admin/playlists/${playlistId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("unauthorized")) {
      return unauthorizedJson();
    }

    return NextResponse.json({ message: safeErrorMessage(error) }, { status: 400 });
  }
}
