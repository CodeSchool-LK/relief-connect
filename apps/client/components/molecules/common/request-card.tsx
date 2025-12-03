import { MapPin, Package, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { cn } from '@/utils/shadcn.utils'

interface RequestCardProps {
  title: string
  location: string
  priority: 'high' | 'medium' | 'low'
  itemsNeeded: string[]
  className?: string
}

const priorityConfig = {
  high: {
    variant: 'destructive' as const,
    label: 'High Priority',
    icon: AlertTriangle,
  },
  medium: {
    variant: 'default' as const,
    label: 'Medium Priority',
    icon: AlertTriangle,
  },
  low: {
    variant: 'secondary' as const,
    label: 'Low Priority',
    icon: AlertTriangle,
  },
}

export function RequestCard({ title, location, priority, itemsNeeded, className }: RequestCardProps) {
  const config = priorityConfig[priority]
  const PriorityIcon = config.icon

  return (
    <Card className={cn('transition-all hover:shadow-lg hover:border-accent/40 border-accent/20', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg leading-tight pr-2">{title}</CardTitle>
          <Badge variant={config.variant} className="shrink-0">
            <PriorityIcon className="size-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0 text-primary" />
          <span>{location}</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Package className="size-4 shrink-0 text-primary" />
            <span>Items Needed:</span>
          </div>
          <ul className="ml-6 list-disc space-y-2 text-sm text-muted-foreground">
            {itemsNeeded.map((item, index) => (
              <li key={index} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

