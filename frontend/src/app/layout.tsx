import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppToaster } from "@/components/app-toaster";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "GigLink",
  description: "Find gigs fast.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased")}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />

        <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-8">
          {children}
        </main>
        <AppToaster />
      </body>
    </html>
  );
}
