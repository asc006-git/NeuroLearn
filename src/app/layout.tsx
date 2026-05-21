import type { Metadata } from "next";
import { Providers } from "./providers";
import "@/index.css";

export const metadata: Metadata = {
  title: "NeuroLearn AI — Cognitive Operating System",
  description: "NeuroLearn AI is a next-generation cognitive operating system that transforms raw information into structured, intelligent mastery using AI-powered learning.",
  themeColor: "#050816",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
