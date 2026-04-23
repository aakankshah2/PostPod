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
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Wordmark — top left */}
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 700,
            color: "#FAFAFA",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: "auto",
          }}
        >
          <span>Post</span>
          <span style={{ position: "relative", display: "flex" }}>
            Pod
            <span
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                width: "100%",
                height: 2.5,
                backgroundColor: "#F5C518",
              }}
            />
          </span>
        </div>

        {/* Headline — centered vertically */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: "#FAFAFA",
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              maxWidth: 900,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            Turn every podcast episode into a&nbsp;
            <span style={{ color: "#F5C518" }}>week</span>
            &nbsp;of content.
          </div>
        </div>

        {/* Bottom label */}
        <div
          style={{
            display: "flex",
            fontSize: 16,
            color: "#8A8A8A",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Coming 2026
        </div>
      </div>
    ),
    { ...size }
  );
}
