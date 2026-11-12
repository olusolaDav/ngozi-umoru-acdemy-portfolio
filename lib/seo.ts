const DEFAULT_SITE_URL = "https://www.ngoziumoru.info";
export const DEFAULT_SOCIAL_IMAGE = "/academic-portrait.png";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_SITE_URL;

  try {
    const url = new URL(configuredUrl);
    if (url.hostname === "ngoziumoru.info" || url.hostname === "www.ngoziumoru.info" || url.hostname === "ngoziumoru.com" || url.hostname === "www.ngoziumoru.com") {
      return DEFAULT_SITE_URL;
    }
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function absoluteSiteUrl(path: string) {
  const url = new URL(path, `${getSiteUrl()}/`);
  if (["ngoziumoru.info", "www.ngoziumoru.info", "ngoziumoru.com", "www.ngoziumoru.com"].includes(url.hostname)) {
    return new URL(`${url.pathname}${url.search}${url.hash}`, `${getSiteUrl()}/`).toString();
  }
  return url.toString();
}

/** Returns a crawlable 1200x630 social image, using the published post thumbnail when available. */
export function socialImageUrl(thumbnail?: string | null) {
  let image: URL;
  try {
    image = new URL(thumbnail || DEFAULT_SOCIAL_IMAGE, `${getSiteUrl()}/`);
  } catch {
    image = new URL(DEFAULT_SOCIAL_IMAGE, `${getSiteUrl()}/`);
  }

  if (image.protocol !== "https:" && image.hostname !== "localhost") {
    image = new URL(DEFAULT_SOCIAL_IMAGE, `${getSiteUrl()}/`);
  }

  if (image.hostname.endsWith("cloudinary.com") && image.pathname.includes("/image/upload/")) {
    image.pathname = image.pathname.replace(
      "/image/upload/",
      "/image/upload/c_fill,w_1200,h_630,g_auto,q_auto,f_jpg/",
    );
  }

  return image.toString();
}

export function socialImageMetadata(thumbnail: string | null | undefined, alt: string) {
  const image = new URL(socialImageUrl(thumbnail));
  if (image.hostname.endsWith("cloudinary.com")) {
    return { url: image.toString(), alt, width: 1200, height: 630, type: "image/jpeg" };
  }
  if (image.pathname.endsWith("/academic-portrait.png")) {
    return { url: image.toString(), alt, width: 1024, height: 680, type: "image/png" };
  }
  return { url: image.toString(), alt };
}
