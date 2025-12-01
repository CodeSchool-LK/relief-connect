import { HandHeart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { H2, P } from '@/components/atoms/typography'

export function ProvideHelpSection() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <H2 className="text-foreground">Make a Difference Today</H2>
              <P className="text-lg leading-relaxed text-muted-foreground">
                Your support can make a real difference in the lives of those affected by natural disasters across Sri
                Lanka. Whether you're an individual volunteer or part of an organization, there are many ways you can
                contribute.
              </P>
              <P className="leading-relaxed text-muted-foreground">
                You can donate essential items, volunteer your time, or provide financial support. Browse through urgent
                requests from affected communities and see how you can help. Every contribution, no matter how small,
                brings hope and relief to those in need.
              </P>
            </div>
            <Button size="lg" variant="destructive" className="group">
              <HandHeart className="size-5 text-white" />
              I Can Help
              <ArrowRight className="size-5 text-white transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Right Column - Image */}
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-xl border-2 border-accent/20">
            <img
              src="https://static.independent.co.uk/2025/11/30/10/30/TOPSHOT-SRI-LANKA-WEATHER-FLOOD-5nysiea9.jpeg?quality=75&width=1250&crop=3%3A2%2Csmart&trim=0%2C0%2C0%2C0&auto=webp"
              alt="Sri Lanka flood relief support"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}

