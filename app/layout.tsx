import type { Metadata, Viewport } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import { LINKS, SITE } from "./content";
import "./globals.css";

// Font persis milo.gg: Roboto (body) + Roboto Mono (teks slide)
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE.url,
    siteName: SITE.displayName,
    title: `Hii, Aku ${SITE.handle} 🍜`,
    description: SITE.description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: SITE.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Hii, Aku ${SITE.handle} 🍜`,
    description: SITE.description,
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#FBF3E4",
};

// JSON-LD: Person + ProfilePage — lapisan SEO untuk SPA-style page (pola milo.gg)
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE.url}/#person`,
      name: SITE.handle,
      alternateName: ["eatrovert_", "DefEat your craving"],
      url: SITE.url,
      description: SITE.description,
      knowsAbout: ["mukbang", "ASMR", "food content", "kuliner Indonesia"],
      sameAs: [LINKS.tiktok, LINKS.instagram, LINKS.youtube, LINKS.threads],
      image: `${SITE.url}/og.jpg`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.title,
      publisher: { "@id": `${SITE.url}/#person` },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE.url}/#profilepage`,
      url: SITE.url,
      name: SITE.title,
      isPartOf: { "@id": `${SITE.url}/#website` },
      mainEntity: { "@id": `${SITE.url}/#person` },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${roboto.variable} ${robotoMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
