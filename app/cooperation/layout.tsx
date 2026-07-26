import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'التعاون — JAZ Iraq | Joint Annual Zone',
  description:
    'انضم إلى شبكة تعاون JAZ الدولية. نعمل مع الشركات والجامعات والمهنيين والشباب لتطوير فرص المشاركة المهنية والعمل المشترك.',
  keywords: ['تعاون JAZ', 'JAZ cooperation Iraq', 'شبكة تعاون دولية', 'شراكات مؤسسية', 'فرص شباب'],
  openGraph: {
    title: 'التعاون | JAZ — Joint Annual Zone',
    description: 'انضم إلى شبكة تعاون JAZ الدولية لبناء تعاون مؤسسي مستدام.',
    url: 'https://jaz.iq/cooperation',
    images: [{ url: '/partners-banner.png', width: 1200, height: 630, alt: 'JAZ Cooperation' }],
  },
  alternates: { canonical: 'https://jaz.iq/cooperation' },
}

export default function CooperationLayout({ children }: { children: React.ReactNode }) {
  return children
}
