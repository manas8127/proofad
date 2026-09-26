import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofAd | creative evaluation",
  description: "Run clear, evidence-backed evaluations for campaign creative.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
