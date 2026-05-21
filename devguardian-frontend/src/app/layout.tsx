import "@/styles/globals.css";
import type { Metadata } from "next";

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
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
