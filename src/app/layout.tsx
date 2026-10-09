import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GlowScan AI",
  description: "Seu sommelier de skincare: análise da pele, rotina na ordem certa e evolução em gráficos.",
};

export const viewport: Viewport = {
  themeColor: "#FBF8F4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg text-text">{children}</body>
    </html>
  );
}
