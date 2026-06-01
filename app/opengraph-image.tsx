import { ImageResponse } from "next/og";

export const alt = "BD2US: a calmer way to navigate U.S. college applications from Bangladesh";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ background: "#052e2b", color: "#fffdf8", display: "flex", height: "100%", overflow: "hidden", position: "relative", width: "100%" }}>
      <div style={{ background: "#0f766e", borderRadius: 999, filter: "blur(70px)", height: 330, opacity: 0.42, position: "absolute", right: -60, top: -110, width: 330 }} />
      <div style={{ background: "#d97706", borderRadius: 999, filter: "blur(72px)", height: 240, opacity: 0.24, position: "absolute", bottom: -90, left: 420, width: 240 }} />
      <div style={{ border: "1px solid rgba(209,250,229,.16)", borderRadius: 42, bottom: 42, left: 42, position: "absolute", right: 42, top: 42 }} />
      <div style={{ alignItems: "center", display: "flex", height: "100%", justifyContent: "space-between", padding: "76px 82px", position: "relative", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}>
          <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
            <span style={{ background: "#fbbf24", borderRadius: 999, height: 11, width: 11 }} />
            <p style={{ color: "#fbbf24", fontSize: 22, fontWeight: 700, letterSpacing: 5, margin: 0 }}>BUILT FOR BANGLADESH</p>
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 88, letterSpacing: -5, lineHeight: 0.94, margin: "30px 0 0" }}>A clearer road to a U.S. college.</h1>
          <p style={{ color: "#d1fae5", fontSize: 29, lineHeight: 1.35, margin: "30px 0 0", maxWidth: 790 }}>A practical guide, interactive roadmap, and college explorer for Bangladeshi students.</p>
          <div style={{ alignItems: "center", display: "flex", gap: 17, marginTop: 43 }}>
            {["Guide", "Roadmap", "Colleges"].map((label) => <span key={label} style={{ border: "1px solid rgba(209,250,229,.28)", borderRadius: 999, color: "#ecfdf5", fontSize: 18, fontWeight: 700, padding: "10px 18px" }}>{label}</span>)}
          </div>
        </div>
        <div style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ alignItems: "center", background: "#fffdf8", borderRadius: 44, boxShadow: "0 24px 60px rgba(0,0,0,.22)", color: "#052e2b", display: "flex", fontFamily: "Georgia, serif", fontSize: 55, fontWeight: 700, height: 190, justifyContent: "center", letterSpacing: -4, width: 190 }}>BD<span style={{ color: "#d97706" }}>2</span>US</div>
          <p style={{ color: "#a7f3d0", fontSize: 19, fontWeight: 700, letterSpacing: 2, margin: 0 }}>WWW.BD2US.APP</p>
        </div>
      </div>
    </div>,
    size
  );
}
