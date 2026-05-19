import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StarSweep",
  description: "Review and batch unstar GitHub repositories safely."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
