import { Inter, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider, QueryProvider } from "./providers";
import "./globals.css";
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700']
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700']
});
export const metadata = {
  title: 'Banking Admin',
  description: 'Professional Banking Administration Panel',
}
export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html
      lang="en"
      className={cn("font-sans", inter.variable, playfair.variable)}
      suppressHydrationWarning={isDev}
    >
      <body className="text-base">
        <QueryProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}