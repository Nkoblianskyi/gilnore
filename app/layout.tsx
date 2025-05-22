import type React from "react"
import type { Metadata } from "next"
import { Jost } from "next/font/google"
import "./globals.css"


const inter = Jost({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Glimvora - Ingyenes Közösségi Platform",
  description:
    "Glimvora - Egy teljesen ingyenes közösségi platform régészeti kalandokhoz. Nincs valódi pénz nyeremény vagy veszteség, kizárólag szórakoztatási célokra. 18+ éven felülieknek.",
  keywords:
    "ingyenes játék, közösségi platform, régészeti játék, virtuális kaland, szórakozás, nincs valódi pénz, 18+, társasági játék",
  authors: [{ name: "Glimvora" }],
  creator: "Glimvora",
  publisher: "Glimvora",
  metadataBase: new URL("https://glimvora.com"), // ✅ Додано для OpenGraph
  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: "https://glimvora.com",
    title: "Glimvora - Ingyenes Közösségi Platform",
    description:
      "Teljesen ingyenes közösségi platform régészeti kalandokhoz. Nincs valódi pénz nyeremény vagy veszteség, kizárólag szórakoztatási célokra.",
    siteName: "Glimvora",
    images: [
      {
        url: "/archaeology-hero.png",
        width: 1200,
        height: 630,
        alt: "Glimvora - Ingyenes Közösségi Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Glimvora - Ingyenes Közösségi Platform",
    description:
      "Teljesen ingyenes közösségi platform régészeti kalandokhoz. Nincs valódi pénz nyeremény vagy veszteség.",
    images: ["/archaeology-hero.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="hu">
      <body className={inter.className}>
          {children}
      </body>
    </html>
  )
}
