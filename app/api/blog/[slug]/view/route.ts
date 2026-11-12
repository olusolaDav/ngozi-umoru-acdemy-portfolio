import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { getBlogBySlug, recordUniqueBlogView } from "@/lib/blog";

const VISITOR_COOKIE = "blog_visitor_id";
const VISITOR_ID_PATTERN = /^[a-f\d-]{36}$/i;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const post = await getBlogBySlug(slug);
    if (!post?._id) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existingVisitorId = request.cookies.get(VISITOR_COOKIE)?.value;
    const visitorId = existingVisitorId && VISITOR_ID_PATTERN.test(existingVisitorId)
      ? existingVisitorId
      : randomUUID();
    const result = await recordUniqueBlogView(post._id, visitorId);

    const response = NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
    if (visitorId !== existingVisitorId) {
      response.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    }

    return response;
  } catch (error) {
    console.error("/api/blog/[slug]/view POST error:", error);
    return NextResponse.json({ error: "Unable to record blog view" }, { status: 500 });
  }
}
