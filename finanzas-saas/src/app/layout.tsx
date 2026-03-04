import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cashora | Finanzas Inteligentes",
  description: "Controla tus finanzas personales usando IA con Cashora",
  icons: {
    icon: "/icon.png",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      {/* Forzamos modo oscuro para un look premium por defecto, pero permitiremos toggle luego */}
      <body className={`${inter.className} bg-[#0A0A0A] text-white antialiased min-h-screen selection:bg-indigo-500/30`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
