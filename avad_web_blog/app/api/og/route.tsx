import { ImageResponse } from "next/og";

export const runtime = "edge";

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    if (line && `${line} ${word}`.length > 25) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }

  if (line) lines.push(line);
  return lines.slice(0, 4);
}

export async function GET(request: Request) {
  const title = new URL(request.url).searchParams.get("title")?.trim() || "A Verse A Day";
  const titleLines = splitTitle(title);

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #2a123f 0%, #d39a52 140%)",
          color: "#f8e7c7",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 84px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, fontWeight: 700, letterSpacing: 6 }}>
          AVAD • A VERSE A DAY
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 1020 }}>
          <div style={{ background: "#f8e7c7", height: 7, width: 90 }} />
          {titleLines.map((line, index) => (
            <div key={`${line}-${index}`} style={{ display: "flex", fontFamily: "Georgia", fontSize: 64, fontWeight: 700, lineHeight: 1.08 }}>
              {line}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 19, letterSpacing: 4 }}>READ • REFLECT • SHARE</div>
      </div>
    ),
    { height: 630, width: 1200 },
  );
}