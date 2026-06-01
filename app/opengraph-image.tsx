import { ImageResponse } from "next/og";

export const alt = "BD2US: a calmer way to navigate U.S. college applications from Bangladesh";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ alignItems: "center", background: "#064e3b", color: "#fffdf8", display: "flex", height: "100%", justifyContent: "space-between", padding: "76px", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 850 }}>
        <p style={{ color: "#fbbf24", fontSize: 24, fontWeight: 700, letterSpacing: 5, margin: 0 }}>BUILT FOR BANGLADESH</p>
        <h1 style={{ fontFamily: "serif", fontSize: 84, letterSpacing: -5, lineHeight: 0.95, margin: "26px 0 0" }}>A calmer road to a U.S. college.</h1>
        <p style={{ color: "#d1fae5", fontSize: 30, lineHeight: 1.3, margin: "30px 0 0" }}>Source-backed guidance, an interactive roadmap, and a curated college explorer.</p>
      </div>
      <div style={{ alignItems: "center", background: "#fffdf8", borderRadius: 42, color: "#064e3b", display: "flex", fontFamily: "serif", fontSize: 54, fontWeight: 700, height: 180, justifyContent: "center", width: 180 }}>BD<span style={{ color: "#b45309" }}>2</span>US</div>
    </div>,
    size
  );
}
