import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PostPod — Turn every podcast episode into a week of content";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#FAFAF7",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#0A0A0A",
            marginBottom: 60,
            display: "flex",
          }}
        >
          <span>POST</span>
          <span style={{ position: "relative", display: "flex" }}>
            POD
            <span
              style={{
                position: "absolute",
                left: 0,
                bottom: -4,
                width: "100%",
                height: 3,
                backgroundColor: "#F5C518",
                borderRadius: 2,
              }}
            />
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.08,
            color: "#0A0A0A",
            maxWidth: 860,
            letterSpacing: "-0.02em",
          }}
        >
          Turn every podcast episode into a week of content.
        </div>

        {/* Yellow accent bar */}
        <div
          style={{
            width: 48,
            height: 3,
            backgroundColor: "#F5C518",
            marginTop: 56,
            borderRadius: 2,
          }}
        />

        {/* Subline */}
        <div
          style={{
            marginTop: 28,
            fontSize: 22,
            color: "#6B6B6B",
            fontWeight: 300,
            textAlign: "center",
          }}
        >
          Upload once. Publish everywhere.
        </div>
      </div>
    ),
    { ...size }
  );
}
