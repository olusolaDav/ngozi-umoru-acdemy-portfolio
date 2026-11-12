import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

type UploadResponse = {
  secure_url?: string;
  resource_type?: string;
  public_id?: string;
};

function signCloudinaryParams(params: Record<string, string>, apiSecret: string) {
  const serial = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${serial}${apiSecret}`).digest("hex");
}

export async function POST(request: Request) {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ message: "Cloudinary environment variables are not configured." }, { status: 500 });
    }

    const form = await request.formData();
    const file = form.get("file");
    const folderInput = form.get("folder");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "A file is required." }, { status: 400 });
    }

    const folder = typeof folderInput === "string" && folderInput.trim() ? folderInput.trim() : "blog_content";
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const signature = signCloudinaryParams({ folder, timestamp }, apiSecret);
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("api_key", apiKey);
    uploadData.append("timestamp", timestamp);
    uploadData.append("folder", folder);
    uploadData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: uploadData,
    });

    const payload = (await response.json().catch(() => ({}))) as UploadResponse & {
      error?: { message?: string };
    };

    if (!response.ok || !payload.secure_url) {
      return NextResponse.json(
        {
          message: payload.error?.message ?? "Unable to upload media.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      data: {
        url: payload.secure_url,
        secureUrl: payload.secure_url,
        resourceType: payload.resource_type ?? "auto",
        publicId: payload.public_id ?? "",
      },
    });
  } catch {
    return NextResponse.json({ message: "Unable to upload media." }, { status: 500 });
  }
}
