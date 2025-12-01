import { Button } from '@/components/atoms/button'
import { PageHeader, PageSubheader } from '@/components/atoms/typography'
import { HandHeart, Heart } from 'lucide-react'

export function HeroSection() {
  return (
    <div className="col-span-1 space-y-4">
      <PageHeader className="text-white">
        Rebuild Sri Lanka
        <br />
        <span className="text-orange-500">Disaster Relief Platform</span>
      </PageHeader>
      <PageSubheader className="text-white">
        Join us in delivering hope and help. Connect with those in need or offer support to
        communities impacted by ongoing crises across Sri Lanka.
      </PageSubheader>
      <div className="flex gap-2">
        <Button variant={'destructive'}>
          <Heart className="w-4 h-4" />I Need Help
        </Button>
        <Button variant={'secondary'}>
          <HandHeart className="w-4 h-4" />I Can Help
        </Button>
      </div>
    </div>
  )
}

