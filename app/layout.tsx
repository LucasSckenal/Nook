import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GlobalChrome } from "@/components/GlobalChrome";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Nook — seu quarto de estudos",
  description:
    "Um ambiente digital de estudos: organização acadêmica dentro de um quarto virtual aconchegante.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable} min-h-screen`}
      >
        {children}
        <GlobalChrome />
      </body>
    </html>
  );
}
