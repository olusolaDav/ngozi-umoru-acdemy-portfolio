const BRAND_BACKGROUNDS = [
  { background: "#2a123f", foreground: "#f8e7c7", accent: "#d39a52" },
  { background: "#725980", foreground: "#fff8ef", accent: "#f0c27b" },
  { background: "#311048", foreground: "#f6d99e", accent: "#c99352" },
  { background: "#d39a52", foreground: "#2a123f", accent: "#fff4df" },
  { background: "#8d6b99", foreground: "#fff8ef", accent: "#311048" },
];

function escapeXml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&apos;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

function titleLines(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    if (line && `${line} ${word}`.length > 22) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines.slice(0, 5);
}

export function generatedThumbnailSrc(title: string) {
  const normalizedTitle = title.trim() || "A Verse A Day";
  const hash = Array.from(normalizedTitle).reduce((total, character) => total + character.charCodeAt(0), 0);
  const palette = BRAND_BACKGROUNDS[hash % BRAND_BACKGROUNDS.length];
  const lines = titleLines(normalizedTitle);
  const titleMarkup = lines
    .map((line, index) => `<tspan x="92" dy="${index === 0 ? 0 : 66}">${escapeXml(line)}</tspan>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="wash" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${palette.background}"/><stop offset="1" stop-color="${palette.accent}" stop-opacity=".82"/></linearGradient>
      <filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity=".22"/></filter>
    </defs>
    <rect width="1200" height="800" fill="url(#wash)"/>
    <circle cx="1050" cy="110" r="190" fill="none" stroke="${palette.foreground}" stroke-opacity=".2" stroke-width="2"/>
    <circle cx="1050" cy="110" r="145" fill="none" stroke="${palette.foreground}" stroke-opacity=".2" stroke-width="2"/>
    <path d="M0 690 C240 580 330 790 610 660 S980 570 1200 690 V800 H0Z" fill="${palette.background}" fill-opacity=".28"/>
    <text x="92" y="92" fill="${palette.foreground}" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="5">AVAD • A VERSE A DAY</text>
    <rect x="92" y="126" width="86" height="6" rx="3" fill="${palette.foreground}"/>
    <text x="92" y="300" fill="${palette.foreground}" font-family="Georgia, serif" font-size="58" font-weight="700" filter="url(#shadow)">${titleMarkup}</text>
    <text x="92" y="710" fill="${palette.foreground}" fill-opacity=".82" font-family="Arial, sans-serif" font-size="18" letter-spacing="3">READ • REFLECT • SHARE</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
