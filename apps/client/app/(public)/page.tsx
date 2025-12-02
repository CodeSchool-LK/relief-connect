import { HeroSection } from '@/components/organisms/common/hero-section'
import { DisasterMapCard } from '@/components/organisms/common/disaster-map-card'
import { StatusSection } from '@/components/organisms/common/status-section'
import { RequestHelpSection } from '@/components/organisms/common/request-help-section'
import { ProvideHelpSection } from '@/components/organisms/common/provide-help-section'
import { OrganizationSection } from '@/components/organisms/common/organization-section'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div
        style={{
          backgroundImage: `url('https://static.independent.co.uk/2025/11/30/10/30/TOPSHOT-SRI-LANKA-WEATHER-FLOOD-5nysiea9.jpeg?quality=75&width=1250&crop=3%3A2%2Csmart&trim=0%2C0%2C0%2C0&auto=webp')`,
        }}
        className="w-full h-[calc(80vh - 4rem)] bg-cover bg-center bg-no-repeat"
      >
        <div className="h-[80vh] bg-linear-to-r from-black/80 to-transparent">
          <div className="container mx-auto grid gap-16 grid-cols-2 items-center justify-center pt-16 h-full">
            <HeroSection />
            <DisasterMapCard />
          </div>
        </div>
      </div>

      {/* Section 0: Statuses */}
      <StatusSection />

      {/* Section 1: Requesting Help */}
      <RequestHelpSection />

      {/* Section 2: Providing Help */}
      <ProvideHelpSection />

      {/* Section 3: Organizations */}
      <OrganizationSection />
    </div>
  )
}
