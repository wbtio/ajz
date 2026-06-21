import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الشراكات — JAZ Iraq | Joint Annual Zone',
  description:
    'انضم إلى شبكة شركاء JAZ الدولية. نبني شراكات استراتيجية بين الشركات والمؤسسات العراقية والمنظمات العالمية.',
  keywords: ['شراكات JAZ', 'JAZ partnership Iraq', 'شبكة شركاء دولية', 'تعاون مؤسسي'],
  openGraph: {
    title: 'الشراكات | JAZ — Joint Annual Zone',
    description: 'انضم إلى شبكة شركاء JAZ الدولية وابنِ تعاوناً مؤسسياً مستداماً.',
    url: 'https://jaz.iq/partnership',
    images: [{ url: '/partners-banner.png', width: 1200, height: 630, alt: 'JAZ Partnership' }],
  },
  alternates: { canonical: 'https://jaz.iq/partnership' },
}

export default function PartnershipLayout({ children }: { children: React.ReactNode }) {
  return children
}
