import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/atoms/card'
import { cn } from '@/utils/shadcn.utils'

interface StatusCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  variant?: 'default' | 'urgent'
  iconColor?: 'red' | 'blue' | 'green' | 'purple' | 'orange'
  className?: string
}

const iconColorClasses = {
  red: 'bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-800/50 text-red-600 dark:text-red-400',
  blue: 'bg-blue-100 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800/50 text-blue-600 dark:text-blue-400',
  green: 'bg-green-100 dark:bg-green-950/30 border-green-300 dark:border-green-800/50 text-green-600 dark:text-green-400',
  purple: 'bg-purple-100 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800/50 text-purple-600 dark:text-purple-400',
  orange: 'bg-orange-100 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800/50 text-orange-600 dark:text-orange-400',
}

export function StatusCard({ icon: Icon, value, label, variant = 'default', iconColor, className }: StatusCardProps) {
  const colorClass = variant === 'urgent' 
    ? 'bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-800/50 text-red-600 dark:text-red-400'
    : iconColor 
      ? iconColorClasses[iconColor]
      : 'bg-accent/15 border-2 border-accent/30 text-accent'

  return (
    <Card className={cn('text-center border-accent/20', className)}>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
        <div
          className={cn(
            'rounded-full p-4 transition-transform hover:scale-110 border-2',
            colorClass
          )}
        >
          <Icon className="size-7" />
        </div>
        <div className="space-y-2">
          <div className="text-4xl font-bold tracking-tight md:text-5xl text-foreground">{value}</div>
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

