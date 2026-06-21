import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تواصل معنا — JAZ Iraq',
  description:
    'تواصل مع فريق JAZ في البصرة، بغداد، أو أربيل. نحن هنا للإجابة على استفساراتك حول المعارض والمؤتمرات والشراكات الدولية.',
  keywords: ['تواصل مع JAZ', 'JAZ contact Iraq', 'مكاتب JAZ', 'البصرة بغداد أربيل'],
  openGraph: {
    title: 'تواصل مع JAZ — Joint Annual Zone',
    description: 'تواصل مع فريق JAZ في مكاتبنا بالبصرة وبغداد وأربيل.',
    url: 'https://jaz.iq/contact',
    images: [{ url: '/contact-banner.png', width: 1200, height: 630, alt: 'Contact JAZ' }],
  },
  alternates: { canonical: 'https://jaz.iq/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
