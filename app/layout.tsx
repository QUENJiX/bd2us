import type { Metadata, Viewport } from "next";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource-variable/literata/wght.css";
import "./globals.css";
import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import { SearchDialog } from "@/components/search-dialog";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bd2us.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BD2US | Your U.S. College Application Compass",
    template: "%s | BD2US"
  },
  description:
    "A clear, Bangladesh-specific guide and planning workspace for applying to U.S. colleges with confidence.",
  applicationName: "BD2US",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico"
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BD2US",
    title: "BD2US | Your U.S. College Application Compass",
    description:
      "A practical guide, interactive roadmap, and college explorer for Bangladeshi students."
  },
  twitter: {
    card: "summary_large_image",
    title: "BD2US | Your U.S. College Application Compass",
    description:
      "A practical guide, interactive roadmap, and college explorer for Bangladeshi students."
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#064e3b"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{const theme=localStorage.getItem("bd2us-theme");document.documentElement.classList.toggle("dark",theme==="dark"||(theme===null&&matchMedia("(prefers-color-scheme: dark)").matches))}catch{}` }} />
      </head>
      <body>
        <a
          href="#main-content"
          className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-900 shadow-lg transition focus:translate-y-0"
        >
          Skip to content
        </a>
        <AppHeader />
        <div id="main-content">{children}</div>
        <AppFooter />
        <SearchDialog />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
