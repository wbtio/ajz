import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'خدماتنا — JAZ | معارض ومؤتمرات دولية',
  description:
    'خدمات JAZ الشاملة: تنظيم المعارض الدولية، إدارة الوفود، برامج التدريب والتطوير، والشراكات الاستراتيجية للشركات والمؤسسات العراقية.',
  keywords: ['خدمات JAZ', 'معارض دولية العراق', 'إدارة فعاليات', 'وفود تجارية', 'JAZ services Iraq'],
  openGraph: {
    title: 'خدمات JAZ — معارض ومؤتمرات دولية',
    description: 'خدمات JAZ الشاملة للشركات والمؤسسات العراقية الراغبة في الحضور الدولي.',
    url: 'https://jaz.iq/services',
    images: [{ url: '/services-banner.png', width: 1200, height: 630, alt: 'JAZ Services' }],
  },
  alternates: { canonical: 'https://jaz.iq/services' },
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
