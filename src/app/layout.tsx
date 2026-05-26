import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoBridge Commerce",
  description: "Enterprise Commerce Infrastructure",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}