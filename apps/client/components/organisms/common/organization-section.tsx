import { Building2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { H2, P } from '@/components/atoms/typography'

export function OrganizationSection() {
  return (
    <section className="bg-muted/30 py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="space-y-6">
              <H2 className="text-foreground">Join Our Network of Relief Organizations</H2>
              <P className="text-lg leading-relaxed text-muted-foreground">
                Are you part of a relief organization, NGO, or community group? Register your organization on our
                platform to amplify your impact and coordinate relief efforts more effectively.
              </P>
              <P className="leading-relaxed text-muted-foreground">
                Once registered, you can host events, manage volunteers, coordinate donations, and connect with other
                organizations working towards the same goal. Join our network of organizations dedicated to supporting
                communities affected by natural disasters across Sri Lanka.
              </P>
            </div>
            <Button size="lg" variant="outline" className="group border-accent/40 hover:border-accent hover:bg-accent/5">
              <Building2 className="size-5 text-primary" />
              Register Your Organization
              <ArrowRight className="size-5 text-primary transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Right Column - Image */}
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-xl border-2 border-accent/20 order-1 lg:order-2">
            <img
              src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80"
              alt="Community organization and volunteers working together"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}

