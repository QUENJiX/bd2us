import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ alignItems: "center", background: "#052e2b", color: "#fffdf8", display: "flex", fontFamily: "Georgia, serif", fontSize: 58, fontWeight: 700, height: "100%", justifyContent: "center", letterSpacing: -5, position: "relative", width: "100%" }}>
      <div style={{ border: "2px solid rgba(209,250,229,.16)", borderRadius: 34, bottom: 10, left: 10, position: "absolute", right: 10, top: 10 }} />
      <div style={{ background: "#f59e0b", borderRadius: 999, height: 23, position: "absolute", right: 27, top: 27, width: 23 }} />
      <span>BD</span><span style={{ color: "#fbbf24" }}>2</span><span>US</span>
    </div>,
    size
  );
}
