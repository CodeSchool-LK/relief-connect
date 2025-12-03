import { AlertCircle, FileText, Users, Calendar } from 'lucide-react'
import { StatusCard } from '@/components/molecules/common/status-card'
import { RequestCard } from '@/components/molecules/common/request-card'
import { H2 } from '@/components/atoms/typography'

// Mock data
const statusData = {
  pendingUrgentRequests: 23,
  pendingRequests: 156,
  totalPeopleInNeed: 1247,
  activeEvents: 8,
}

const topPriorityRequests = [
  {
    id: 1,
    title: 'Emergency Food Supplies Needed',
    location: 'Colombo District, Western Province',
    priority: 'high' as const,
    itemsNeeded: ['Rice (50kg bags)', 'Canned food', 'Bottled water', 'Medical supplies'],
  },
  {
    id: 2,
    title: 'Shelter Materials Required',
    location: 'Galle District, Southern Province',
    priority: 'high' as const,
    itemsNeeded: ['Tarpaulins', 'Tents', 'Blankets', 'Sleeping mats'],
  },
  {
    id: 3,
    title: 'Clean Water Distribution',
    location: 'Kalutara District, Western Province',
    priority: 'high' as const,
    itemsNeeded: ['Water purification tablets', 'Water containers', 'Water filters'],
  },
]

export function StatusSection() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          <StatusCard
            icon={AlertCircle}
            value={statusData.pendingUrgentRequests}
            label="Pending Urgent Requests"
            variant="urgent"
            iconColor="red"
          />
          <StatusCard
            icon={FileText}
            value={statusData.pendingRequests}
            label="Pending Requests"
            iconColor="blue"
          />
          <StatusCard
            icon={Users}
            value={statusData.totalPeopleInNeed.toLocaleString()}
            label="Total People in Need"
            iconColor="green"
          />
          <StatusCard
            icon={Calendar}
            value={statusData.activeEvents}
            label="Active Events"
            iconColor="purple"
          />
        </div>

        {/* Top Priority Requests */}
        <div className="space-y-8">
          <H2 className="text-center mb-12 text-foreground">
            Urgent Help Requests Needing Immediate Attention
          </H2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
