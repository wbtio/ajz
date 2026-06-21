import { AboutClient } from './about-client'

export const metadata = {
  title: 'من نحن — JAZ | Joint Annual Zone',
  description:
    'تعرّف على JAZ (Joint Annual Zone) — المنصة العراقية الرائدة لتنظيم المعارض والمؤتمرات الدولية. رسالتنا، رؤيتنا، وقيمنا التي تربط العراق بالعالم.',
  keywords: ['JAZ', 'Joint Annual Zone', 'من نحن JAZ', 'شركة معارض عراق', 'منظم مؤتمرات العراق'],
  openGraph: {
    title: 'من نحن | JAZ Iraq — Joint Annual Zone',
    description: 'تعرّف على JAZ — المنصة العراقية الرائدة لتنظيم المعارض والمؤتمرات الدولية.',
    url: 'https://jaz.iq/about',
    images: [{ url: '/about-banner.png', width: 1200, height: 630, alt: 'JAZ About Us' }],
  },
  alternates: { canonical: 'https://jaz.iq/about' },
}

export default function AboutPage() {
  return <AboutClient />
}
