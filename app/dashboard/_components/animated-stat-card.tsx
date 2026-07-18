import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

interface AnimatedStatCardProps {
  name: string
  value: number
  icon: React.ReactNode
  color: string
  textColor: string
  bgLight: string
  index: number
  href?: string
}

// Kept under the existing name for compatibility; analytics cards are intentionally static.
export function AnimatedStatCard({ name, value, icon, textColor, bgLight, href }: AnimatedStatCardProps) {
  const content = (
    <Card className="h-full border-stone-200/70 shadow-sm transition-colors hover:border-stone-300">
      <CardContent className="flex h-[68px] items-center gap-2.5 p-2.5">
        <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${bgLight}`}>{icon}</div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-stone-500">{name}</p>
          <p className={`mt-0.5 text-xl font-bold leading-none tabular-nums ${textColor}`}>{value.toLocaleString('en-US')}</p>
        </div>
      </CardContent>
    </Card>
  )

  return href ? <Link href={href} className="block h-full">{content}</Link> : content
}
