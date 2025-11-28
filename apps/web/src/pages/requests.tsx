import React, { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from 'apps/web/src/components/ui/card'
import { Button } from 'apps/web/src/components/ui/button'
import { Input } from 'apps/web/src/components/ui/input'
import { Label } from 'apps/web/src/components/ui/label'
import { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto'
import { Urgency, HelpRequestCategory } from '@nx-mono-repo-deployment-test/shared/src/enums'
import {
  Search,
  MapPin,
  AlertCircle,
  Users,
  Package,
  Heart,
  Filter,
  ArrowLeft,
} from 'lucide-react'
import {
  SRI_LANKA_PROVINCES,
  SRI_LANKA_DISTRICTS,
  DISTRICT_COORDINATES,
  getMockCoordinates,
} from '../data/sri-lanka-locations'

// Generate mock data
const generateMockData = (): HelpRequestResponseDto[] => {
  return [
    {
      id: 1,
      lat: 6.9271,
      lng: 79.8612,
      category: HelpRequestCategory.FOOD_WATER,
      urgency: Urgency.HIGH,
      shortNote:
        'Name: John Doe, People: 5, Kids: 2, Elders: 2. Items: Food & Water (3), Torch (2)',
      approxArea: 'Colombo',
      contactType: 'Phone' as any,
      contact: '0771234567',
    },
    {
      id: 2,
      lat: 7.2906,
      lng: 80.6337,
      category: HelpRequestCategory.OTHER,
      urgency: Urgency.MEDIUM,
      shortNote: 'Name: Jane Smith, People: 3. Items: Canned Foods (5), Noodles (10)',
      approxArea: 'Kandy',
      contactType: 'Phone' as any,
      contact: '0777654321',
    },
    {
      id: 3,
      lat: 6.0329,
      lng: 80.217,
      category: HelpRequestCategory.FOOD_WATER,
      urgency: Urgency.HIGH,
      shortNote:
        'Name: Kamal Perera, People: 8, Kids: 3, Elders: 3. Items: Food & Water (5), Candle (4), Matches (2)',
      approxArea: 'Galle',
      contactType: 'Phone' as any,
      contact: '0772345678',
    },
    {
      id: 4,
      lat: 7.4675,
      lng: 80.6234,
      category: HelpRequestCategory.OTHER,
      urgency: Urgency.LOW,
      shortNote: 'Name: Nimal Fernando, People: 2. Items: Tissues (3), Diary (1)',
      approxArea: 'Matale',
      contactType: 'WhatsApp' as any,
      contact: '0773456789',
    },
    {
      id: 5,
      lat: 5.9549,
      lng: 80.555,
      category: HelpRequestCategory.FOOD_WATER,
      urgency: Urgency.MEDIUM,
      shortNote: 'Name: Sunil Silva, People: 4, Kids: 1. Items: Food & Water (2), Noodles (8)',
      approxArea: 'Matara',
      contactType: 'Phone' as any,
      contact: '0774567890',
    },
    {
      id: 6,
      lat: 6.5854,
      lng: 79.9607,
      category: HelpRequestCategory.OTHER,
      urgency: Urgency.HIGH,
      shortNote:
        'Name: Priya Wickramasinghe, People: 6, Kids: 2, Elders: 2. Items: Torch (3), Candle (5), Matches (3)',
      approxArea: 'Kalutara',
      contactType: 'Phone' as any,
      contact: '0775678901',
    },
  ]
}

export default function RequestsPage() {
  const router = useRouter()
  const [helpRequests, setHelpRequests] = useState<HelpRequestResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [tempFilters, setTempFilters] = useState<{
    province?: string
    district?: string
    emergencyLevel?: Urgency
    type?: 'individual' | 'group'
  }>({})
  const [appliedFilters, setAppliedFilters] = useState<{
    province?: string
    district?: string
    emergencyLevel?: Urgency
    type?: 'individual' | 'group'
  }>({})

  // Add mock coordinates to requests that don't have them
  const requestsWithMockCoords = useMemo(() => {
    return helpRequests.map((request) => {
      if (!request.lat || !request.lng || request.lat === 0 || request.lng === 0) {
        const [lat, lng] = getMockCoordinates(appliedFilters.district)
        return { ...request, lat, lng }
      }
      return request
    })
  }, [helpRequests, appliedFilters.district])

  useEffect(() => {
    // Load mock data
    const loadData = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      const mockData = generateMockData()
      setHelpRequests(mockData)
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredRequests = useMemo(() => {
    let filtered = requestsWithMockCoords

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (request) =>
          request.shortNote?.toLowerCase().includes(query) ||
          request.approxArea?.toLowerCase().includes(query) ||
          request.contact?.toLowerCase().includes(query)
      )
    }

    // Filter by district
    if (appliedFilters.district) {
      filtered = filtered.filter((request) =>
        request.approxArea?.toLowerCase().includes(appliedFilters.district!.toLowerCase())
      )
    }

    // Filter by province
    if (appliedFilters.province && !appliedFilters.district) {
      const districts = SRI_LANKA_DISTRICTS[appliedFilters.province] || []
      filtered = filtered.filter((request) =>
        districts.some((district) =>
          request.approxArea?.toLowerCase().includes(district.toLowerCase())
        )
      )
    }

    // Filter by urgency
    if (appliedFilters.emergencyLevel) {
      filtered = filtered.filter((request) => request.urgency === appliedFilters.emergencyLevel)
    }

    // Filter by type
    if (appliedFilters.type === 'individual') {
      filtered = filtered.filter((request) => {
        const peopleMatch = request.shortNote?.match(/People:\s*(\d+)/)
        return peopleMatch && parseInt(peopleMatch[1]) <= 10
      })
    } else if (appliedFilters.type === 'group') {
      filtered = filtered.filter((request) => {
        const peopleMatch = request.shortNote?.match(/People:\s*(\d+)/)
        return peopleMatch && parseInt(peopleMatch[1]) > 10
      })
    }

    return filtered
  }, [requestsWithMockCoords, searchQuery, appliedFilters])

  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters })
  }

  // Calculate analytics based on filtered requests
  const analytics = useMemo(() => {
    const totalRequests = filteredRequests.length
    const totalPeople = filteredRequests.reduce((sum, req) => {
      const match = req.shortNote?.match(/People:\s*(\d+)/)
      return sum + (match ? parseInt(match[1]) : 1)
    }, 0)

    const totalKids = filteredRequests.reduce((sum, req) => {
      const match = req.shortNote?.match(/Kids:\s*(\d+)/)
      return sum + (match ? parseInt(match[1]) : 0)
    }, 0)

    const totalElders = filteredRequests.reduce((sum, req) => {
      const match = req.shortNote?.match(/Elders:\s*(\d+)/)
      return sum + (match ? parseInt(match[1]) : 0)
    }, 0)

    // Calculate food needed (assuming 3 meals per person per day, 7 days)
    const daysOfSupply = 7
    const mealsPerPersonPerDay = 3
    const totalMealsNeeded = totalPeople * daysOfSupply * mealsPerPersonPerDay

    // Extract ration items from shortNote
    const totalRations = filteredRequests.reduce((sum, req) => {
      const itemsMatch = req.shortNote?.match(/Items:\s*(.+)/)
      if (itemsMatch) {
        const items = itemsMatch[1]
        const numbers = items.match(/\((\d+)\)/g) || []
        return sum + numbers.reduce((acc, num) => acc + parseInt(num.replace(/[()]/g, '')), 0)
      }
      return sum
    }, 0)

    // Mock donations done (simulated)
    const donationsDone = Math.floor(totalRequests * 0.6)

    // Get location info
    const locations = filteredRequests.reduce((acc, req) => {
      const location = req.approxArea || 'Unknown'
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const primaryLocation =
      Object.entries(locations).sort((a, b) => b[1] - a[1])[0]?.[0] || 'All Locations'

    return {
      totalRequests,
      totalPeople,
      totalKids,
      totalElders,
      totalMealsNeeded,
      totalRations,
      donationsDone,
      primaryLocation,
    }
  }, [filteredRequests])

  const availableDistricts = tempFilters.province
    ? SRI_LANKA_DISTRICTS[tempFilters.province] || []
    : Object.values(SRI_LANKA_DISTRICTS).flat()

  const handleViewMap = () => {
    // Pass applied filters as query params
    const params = new URLSearchParams()
    if (appliedFilters.province) params.set('province', appliedFilters.province)
    if (appliedFilters.district) params.set('district', appliedFilters.district)
    if (appliedFilters.emergencyLevel) params.set('urgency', appliedFilters.emergencyLevel)
    if (appliedFilters.type) params.set('type', appliedFilters.type)
    router.push(`/map?${params.toString()}`)
  }

  return (
    <>
      <Head>
        <title>Donation Requests - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Donation Requests</h1>
              </div>
              <Button onClick={handleViewMap}>
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Analytics Section */}
          <div className="mb-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-lg font-semibold">
                    Analytics{appliedFilters.district ? ` - ${appliedFilters.district}` : appliedFilters.province ? ` - ${appliedFilters.province}` : ''}
                  </CardTitle>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">Total Requests</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{analytics.totalRequests}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-600">Total People</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">{analytics.totalPeople}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-600">Meals Needed</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {analytics.totalMealsNeeded}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-medium text-orange-600">Children</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">{analytics.totalKids}</div>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-pink-600" />
                      <span className="text-xs font-medium text-pink-600">Elders</span>
                    </div>
                    <div className="text-2xl font-bold text-pink-900">{analytics.totalElders}</div>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-teal-600" />
                      <span className="text-xs font-medium text-teal-600">Donations Done</span>
                    </div>
                    <div className="text-2xl font-bold text-teal-900">{analytics.donationsDone}</div>
                  </div>
                </div>
                {analytics.primaryLocation && (
                  <div className="mt-4 text-sm text-gray-600">
                    <span className="font-medium">Primary Location:</span> {analytics.primaryLocation}
                  </div>
                )}
              </CardHeader>
            </Card>
          </div>

          {/* Filters Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg font-semibold">Filters</CardTitle>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search requests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Province</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    value={tempFilters.province || ''}
                    onChange={(e) => {
                      const province = e.target.value || undefined
                      setTempFilters({
                        ...tempFilters,
                        province,
                        district: undefined,
                      })
                    }}
                  >
                    <option value="">All Provinces</option>
                    {SRI_LANKA_PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>District</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    value={tempFilters.district || ''}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        district: e.target.value || undefined,
                      })
                    }
                    disabled={!tempFilters.province}
                  >
                    <option value="">All Districts</option>
                    {availableDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Emergency Level</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    value={tempFilters.emergencyLevel || ''}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        emergencyLevel: e.target.value ? (e.target.value as Urgency) : undefined,
                      })
                    }
                  >
                    <option value="">All Levels</option>
                    <option value={Urgency.LOW}>Low</option>
                    <option value={Urgency.MEDIUM}>Medium</option>
                    <option value={Urgency.HIGH}>High</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    value={tempFilters.type || ''}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        type: e.target.value ? (e.target.value as 'individual' | 'group') : undefined,
                      })
                    }
                  >
                    <option value="">All Types</option>
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleApplyFilters} className="w-full sm:w-auto">
                  Apply Filters
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Requests Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading requests...</div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">No requests found</p>
                <p className="text-sm text-gray-500">Try adjusting your filters or search query.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <Card
                  key={request.id}
                  className="cursor-pointer transition-all hover:shadow-lg overflow-hidden border-2 hover:border-primary"
                >
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <MapPin className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className="absolute top-3 right-3">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          request.urgency === Urgency.HIGH
                            ? 'bg-red-100 text-red-700'
                            : request.urgency === Urgency.MEDIUM
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {request.urgency || 'Medium'}
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                        <div className="font-semibold text-gray-900 text-sm">
                          {request.approxArea || 'Unknown location'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <div>
                        <div className="font-bold text-lg text-gray-900 mb-1">
                          {request.shortNote?.split(',')[0]?.replace('Name:', '').trim() ||
                            'Anonymous'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.contactType}: {request.contact}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">
                            {request.shortNote?.match(/People:\s*(\d+)/)?.[1] || '1'} people
                          </span>
                          {request.shortNote?.match(/Kids:\s*(\d+)/)?.[1] && (
                            <span className="text-gray-500">
                              ({request.shortNote.match(/Kids:\s*(\d+)/)?.[1]} kids)
                            </span>
                          )}
                          {request.shortNote?.match(/Elders:\s*(\d+)/)?.[1] && (
                            <span className="text-gray-500">
                              ({request.shortNote.match(/Elders:\s*(\d+)/)?.[1]} elders)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Package className="h-4 w-4 text-purple-600" />
                          <span className="line-clamp-1">
                            {request.shortNote?.match(/Items:\s*(.+)/)?.[1] || 'Various items'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

