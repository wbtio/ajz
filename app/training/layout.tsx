import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'التدريب والتطوير — JAZ Iraq',
  description:
    'برامج تدريب وتطوير مهني معتمدة دولياً من JAZ. نعزز الجاهزية المهنية والقدرات القيادية للأفراد والمؤسسات في العراق.',
  keywords: ['تدريب مهني العراق', 'JAZ training', 'تطوير مهني', 'برامج تدريب معتمدة'],
  openGraph: {
    title: 'التدريب والتطوير | JAZ Iraq',
    description: 'برامج تدريب وتطوير مهني معتمدة دولياً من JAZ.',
    url: 'https://jaz.iq/training',
  },
  alternates: { canonical: 'https://jaz.iq/training' },
}

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  return children
}
