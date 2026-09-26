import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofAd | creative inspection",
  description: "Generate, inspect, and explain campaign creative decisions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
