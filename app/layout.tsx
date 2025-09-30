import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { getUser, getTeamForUser } from "@/lib/db/queries";
import Header from "@/components/Header";
import { SWRConfig } from "swr";

export const metadata: Metadata = {
  title: "Next.js SaaS Starter",
  description: "Get started quickly with Next.js, Postgres, and Stripe.",
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Header />
        {children}
      </body>
    </html>
  );
}
