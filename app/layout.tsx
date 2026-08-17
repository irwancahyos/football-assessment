import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, Geist } from "next/font/google";
import { AssessmentProvider } from "@/lib/assessment-context";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Football IQ Assessment",
  description: "Ukuran kemampuan membaca permainan sepak bola kamu",
};

export const viewport: Viewport = {
  themeColor: "#FAD707",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={cn(bebasNeue.variable, inter.variable, "font-sans", geist.variable)}>
      <body className="min-h-screen font-body">
        <I18nProvider>
          <AssessmentProvider>{children}</AssessmentProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
