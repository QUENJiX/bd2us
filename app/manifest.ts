import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BD2US Student Guide",
    short_name: "BD2US",
    description: "Bangladesh-specific U.S. college application guidance, roadmap planning, and saved reading.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f1",
    theme_color: "#064e3b",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }]
  };
}
