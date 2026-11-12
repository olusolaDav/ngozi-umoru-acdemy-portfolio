const HTML_ENTITY_MAP: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (match, decimal: string) => {
      const codePoint = Number(decimal);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    })
    .replace(/&#x([\da-f]+);/gi, (match, hexadecimal: string) => {
      const codePoint = Number.parseInt(hexadecimal, 16);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    })
    .replace(/&([a-z]+);/gi, (match, name: string) => HTML_ENTITY_MAP[name.toLowerCase()] ?? match);
}

/**
 * Quill content is stored as HTML, but legacy posts may contain HTML-escaped
 * markup. Normalize those records before rendering both preview and public pages.
 */
export function normalizeBlogHtmlForRender(value: string | null | undefined) {
  if (!value) return "";

  let html = value.trim();
  const containsHtmlMarkup = /<\/?(?:p|div|h[1-6]|ul|ol|li|blockquote|strong|em|a|img|video|iframe|table|br)\b/i.test(html);

  if (!containsHtmlMarkup && /&lt;\/?(?:p|div|h[1-6]|ul|ol|li|blockquote|strong|em|a|img|video|iframe|table|br)\b/i.test(html)) {
    html = decodeHtmlEntities(decodeHtmlEntities(html));
  }

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"');
}

export function blogContentText(value: string | null | undefined) {
  return decodeHtmlEntities(
    normalizeBlogHtmlForRender(value)
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style\s*>/gi, " ")
      .replace(/<[^>]*>/g, " "),
  )
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function estimateBlogReadTime(value: string | null | undefined, wordsPerMinute = 200) {
  const text = blogContentText(value);
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}