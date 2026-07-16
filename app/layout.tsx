import { createClient } from "@/lib/supabase/server";
import { isDashboardRole, defaultRouteForRole } from "@/lib/permissions";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Plus_Jakarta_Sans, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Tracker } from "@/components/analytics/tracker";
import { ChatWidget } from "@/components/chatbot/chat-widget";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans-arabic",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://jaz.iq'),
  title: {
    default: 'JAZ | Joint Annual Zone — معارض ومؤتمرات دولية في العراق',
    template: '%s | JAZ Iraq',
  },
  description:
    'JAZ (Joint Annual Zone) هي المنصة العراقية الرائدة لتنظيم المعارض والمؤتمرات الدولية، تربط الشركات والحكومة والأكاديميا بالفرص العالمية.',
  keywords: [
    'JAZ', 'Joint Annual Zone', 'معارض العراق', 'مؤتمرات العراق',
    'فعاليات تجارية', 'Iraq exhibitions', 'Iraq conferences',
    'شراكات دولية', 'تدريب مهني', 'JAZ Iraq', 'jaz.iq',
  ],
  authors: [{ name: 'JAZ — Joint Annual Zone', url: 'https://jaz.iq' }],
  creator: 'JAZ Iraq',
  publisher: 'JAZ Iraq',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_IQ',
    alternateLocale: 'en_US',
    url: 'https://jaz.iq',
    siteName: 'JAZ — Joint Annual Zone',
    title: 'JAZ | معارض ومؤتمرات دولية — العراق',
    description:
      'المنصة العراقية الرائدة للمعارض والمؤتمرات الدولية. نربط الشركات والحكومة والأكاديميا بالفرص العالمية.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JAZ — Joint Annual Zone Iraq',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JAZ | Joint Annual Zone — العراق',
    description: 'المنصة العراقية الرائدة للمعارض والمؤتمرات الدولية.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://jaz.iq',
  },
  icons: {
    icon: '/favicon.ico',
  },
  verification: {
    google: 'google2ba5f2f9b386b28a',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let isAdmin = false;
  let currentUser: {
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
    isAdmin: boolean;
    dashboardPath: string | null;
  } | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, permissions, full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    isAdmin = profile?.role === 'admin';
    currentUser = {
      fullName: profile?.full_name ?? null,
      email: user.email ?? '',
      avatarUrl: profile?.avatar_url ?? null,
      isAdmin,
      // مسار لوحة التحكم يظهر للمدير وعضو الفريق فقط
      dashboardPath: isDashboardRole(profile?.role)
        ? defaultRouteForRole(profile?.role, profile?.permissions)
        : null,
    };
  }

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${ibmPlexSansArabic.variable} ${plusJakartaSans.variable} ${outfit.variable} ${jetBrainsMono.variable} font-sans antialiased bg-white text-gray-900`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'JAZ',
              legalName: 'Joint Annual Zone',
              alternateName: ['JAZ Iraq', 'الجاز', 'المنطقة السنوية المشتركة', 'Joint Annual Zone Iraq'],
              url: 'https://jaz.iq',
              logo: {
                '@type': 'ImageObject',
                url: 'https://jaz.iq/Joint%20Annual%20Zone%20logo.png',
                width: 512,
                height: 512,
              },
              image: 'https://jaz.iq/og-image.png',
              description: 'JAZ (Joint Annual Zone) is Iraq\'s leading platform for international exhibitions and conferences, connecting businesses, government, and academia with global opportunities.',
              foundingDate: '2013',
              foundingLocation: {
                '@type': 'Place',
                name: 'Basra, Iraq',
              },
              numberOfEmployees: { '@type': 'QuantitativeValue', value: 20 },
              areaServed: ['IQ', 'Middle East', 'International'],
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Basra',
                addressCountry: 'IQ',
              },
              location: [
                { '@type': 'Place', name: 'Basra Office', address: { '@type': 'PostalAddress', addressLocality: 'Basra', addressCountry: 'IQ' } },
                { '@type': 'Place', name: 'Baghdad Office', address: { '@type': 'PostalAddress', addressLocality: 'Baghdad', addressCountry: 'IQ' } },
                { '@type': 'Place', name: 'Erbil Office', address: { '@type': 'PostalAddress', addressLocality: 'Erbil', addressCountry: 'IQ' } },
              ],
              contactPoint: [
                {
                  '@type': 'ContactPoint',
                  telephone: '+964-771-900-0600',
                  contactType: 'customer service',
                  email: 'contact@jaz.iq',
                  availableLanguage: ['Arabic', 'English'],
                },
                {
                  '@type': 'ContactPoint',
                  contactType: 'sales',
                  email: 'contact@jaz.iq',
                  availableLanguage: ['Arabic', 'English'],
                },
              ],
              employee: [
                {
                  '@type': 'Person',
                  jobTitle: 'Chief Executive Officer',
                  worksFor: { '@type': 'Organization', name: 'JAZ' },
                },
              ],
              knowsAbout: [
                'International Exhibitions',
                'Trade Fairs',
                'Conferences',
                'Business Delegations',
                'Iraq Business',
                'Professional Training',
                'Strategic Partnerships',
              ],
              sameAs: [
                'https://www.instagram.com/jaz.iq',
                'https://www.facebook.com/jaz.iq',
                'https://www.linkedin.com/company/jaz-iraq',
              ],
            }),
          }}
        />
        <Providers>
          <Tracker />
          <Header isAdmin={isAdmin} currentUser={currentUser} />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ChatWidget />
        </Providers>
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
