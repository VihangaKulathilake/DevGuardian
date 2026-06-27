import "@/styles/globals.css";
import type { Metadata } from "next";
import { StoreProvider } from "@/app/Provider";
import { Orbitron, Space_Grotesk, Share_Tech_Mono } from "next/font/google";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DevGuardian - AI Security & Code Analysis",
  description: "AI-powered software security and code analysis platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${spaceGrotesk.variable} ${shareTechMono.variable} dark`}>
      <body className="bg-background text-foreground antialiased min-h-screen font-sans">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}


