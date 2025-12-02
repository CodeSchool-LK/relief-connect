import { Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { H2, P } from '@/components/atoms/typography'
import { RequestCard } from '@/components/molecules/common/request-card'

// Mock data for top priority requests
const topPriorityRequests = [
  {
    id: 1,
    title: 'Emergency Food Supplies Needed',
    location: 'Colombo District, Western Province',
    priority: 'high' as const,
    itemsNeeded: ['Rice (50kg bags)', 'Canned food', 'Bottled water'],
  },
  {
    id: 2,
    title: 'Shelter Materials Required',
    location: 'Galle District, Southern Province',
    priority: 'high' as const,
    itemsNeeded: ['Tarpaulins', 'Tents', 'Blankets'],
  },
]

export function RequestHelpSection() {
  return (
    <section className="bg-muted/30 py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <H2 className="text-foreground">Need Help? We're Here for You</H2>
              <P className="text-lg leading-relaxed text-muted-foreground">
                If you or your community are affected by the ongoing natural disasters in Sri Lanka, we're here to
                support you. Our platform connects those in need with volunteers and organizations ready to provide
                assistance.
              </P>
              <P className="leading-relaxed text-muted-foreground">
                You can request help for essential items like food, water, shelter materials, medical supplies, and
                other critical resources. Simply submit a help request with details about your location and what you
                need, and our network of volunteers will work to fulfill your request as quickly as possible.
              </P>
            </div>
            <Button size="lg" className="group bg-accent text-accent-foreground hover:bg-accent/90">
              <Heart className="size-5 text-accent-foreground" />
              Request Help Now
              <ArrowRight className="size-5 text-accent-foreground transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Right Column - Request Cards */}
          <div className="space-y-6">
            {topPriorityRequests.map((request) => (
              <RequestCard
                key={request.id}
                title={request.title}
                location={request.location}
                priority={request.priority}
                itemsNeeded={request.itemsNeeded}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

