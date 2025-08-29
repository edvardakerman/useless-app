import type { Metadata } from "next";
import { Cutive_Mono } from "next/font/google";
import "./globals.css";

const cutiveMono = Cutive_Mono(
  {
    subsets: ["latin"],
    weight: ["400"],
  }
);

export const metadata: Metadata = {
  title: "Poke - Ed vs Noami",
  description: "Poke app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cutiveMono.className}>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-500 to-blue-500
 text-white p-4">
          {children}
        </div>
      </body>
    </html>
  );
}
