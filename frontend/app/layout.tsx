import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DriveWise - AI-Powered Driving School Registration",
  description: "Register for driving lessons with our AI-assisted platform",
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
