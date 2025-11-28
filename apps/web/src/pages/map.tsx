import React, { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from 'apps/web/src/components/ui/card'
import { Button } from 'apps/web/src/components/ui/button'
import { Input } from 'apps/web/src/components/ui/input'
import { Label } from 'apps/web/src/components/ui/label'
import { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto'
import { CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto'
import { Urgency, HelpRequestCategory } from '@nx-mono-repo-deployment-test/shared/src/enums'
import { Filter, ArrowLeft } from 'lucide-react'
import {
  SRI_LANKA_PROVINCES,
  SRI_LANKA_DISTRICTS,
  DISTRICT_COORDINATES,
  getMockCoordinates,
} from '../data/sri-lanka-locations'

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('../components/Map'), { ssr: false })

export default function MapDashboard() {
  const router = useRouter()
  const [helpRequests, setHelpRequests] = useState<HelpRequestResponseDto[]>([])
  const [camps, setCamps] = useState<CampResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
  const [mapCenter, setMapCenter] = useState<[number, number]>([7.8731, 80.7718])
  const [mapZoom, setMapZoom] = useState(8)

  // Read filters from query params on initial load
  useEffect(() => {
    const { province, district, urgency, type } = router.query
    if (province || district || urgency || type) {
      const initialFilters = {
        province: province as string | undefined,
        district: district as string | undefined,
        emergencyLevel: urgency as Urgency | undefined,
        type: type as 'individual' | 'group' | undefined,
      }
      setTempFilters(initialFilters)
      setAppliedFilters(initialFilters)
    }
  }, [router.query])

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

  // Generate mock data
  const generateMockData = () => {
    const mockRequests: HelpRequestResponseDto[] = [
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

    const mockCamps: CampResponseDto[] = [
      {
        id: 1,
        lat: 7.0847,
        lng: 80.0097,
        campType: 'Official' as any,
        name: 'Gampaha Relief Camp',
        peopleRange: '10-50' as any,
        needs: ['Food', 'Medical'] as any,
        shortNote: 'Official relief camp with 35 people',
        contactType: 'Phone' as any,
        contact: '0776789012',
      },
      {
        id: 2,
        lat: 6.6828,
        lng: 80.4012,
        campType: 'Community' as any,
        name: 'Ratnapura Community Camp',
        peopleRange: '50+' as any,
        needs: ['Food', 'Rescue', 'Clothes'] as any,
        shortNote: 'Community organized camp',
        contactType: 'WhatsApp' as any,
        contact: '0777890123',
      },
    ]

    return { mockRequests, mockCamps }
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      const { mockRequests, mockCamps } = generateMockData()

      // Filter mock data based on filters
      let filteredMockRequests = mockRequests
      let filteredMockCamps = mockCamps

      // Filter by district
      if (appliedFilters.district) {
        filteredMockRequests = mockRequests.filter((req) =>
          req.approxArea?.toLowerCase().includes(appliedFilters.district!.toLowerCase())
        )
        filteredMockCamps = mockCamps.filter((camp) =>
          camp.shortNote?.toLowerCase().includes(appliedFilters.district!.toLowerCase())
        )
      }

      // Filter by urgency
      if (appliedFilters.emergencyLevel) {
        filteredMockRequests = filteredMockRequests.filter(
          (req) => req.urgency === appliedFilters.emergencyLevel
        )
      }

      setHelpRequests(filteredMockRequests)
      setCamps(filteredMockCamps)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [appliedFilters.district, appliedFilters.emergencyLevel])

  // Update map center when applied filters change
  useEffect(() => {
    if (appliedFilters.district && DISTRICT_COORDINATES[appliedFilters.district]) {
      setMapCenter(DISTRICT_COORDINATES[appliedFilters.district])
      setMapZoom(10)
    } else if (appliedFilters.province) {
      // Center on first district of province
      const districts = SRI_LANKA_DISTRICTS[appliedFilters.province]
      if (districts && districts.length > 0 && DISTRICT_COORDINATES[districts[0]]) {
        setMapCenter(DISTRICT_COORDINATES[districts[0]])
        setMapZoom(9)
      }
    } else {
      setMapCenter([7.8731, 80.7718])
      setMapZoom(8)
    }
  }, [appliedFilters.district, appliedFilters.province])

  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters })
    // Update URL with filters
    const params = new URLSearchParams()
    if (tempFilters.province) params.set('province', tempFilters.province)
    if (tempFilters.district) params.set('district', tempFilters.district)
    if (tempFilters.emergencyLevel) params.set('urgency', tempFilters.emergencyLevel)
    if (tempFilters.type) params.set('type', tempFilters.type)
    router.push(`/map?${params.toString()}`, undefined, { shallow: true })
  }

  const filteredRequests = useMemo(() => {
    let filtered = requestsWithMockCoords

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
  }, [requestsWithMockCoords, appliedFilters])

  const availableDistricts = tempFilters.province
    ? SRI_LANKA_DISTRICTS[tempFilters.province] || []
    : Object.values(SRI_LANKA_DISTRICTS).flat()

  return (
    <>
      <Head>
        <title>Map Dashboard - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-50 relative">
        {/* Filter Navbar */}
        <nav className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Filters</span>
              </div>

              <div className="flex-1 flex flex-wrap items-center gap-3">
                <select
                  className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm min-w-[150px]"
                  value={tempFilters.province || ''}
                  onChange={(e) => {
                    const province = e.target.value || undefined
                    setTempFilters({
                      ...tempFilters,
                      province,
                      district: undefined, // Reset district when province changes
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

                <select
                  className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm min-w-[150px]"
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

                <select
                  className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm min-w-[130px]"
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

                <select
                  className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm min-w-[120px]"
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

                <Button onClick={handleApplyFilters} className="h-10">
                  Apply Filters
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/#requests')}
                  className="h-10"
                >
                  View Requests List
                </Button>
              </div>
            </div>
            {appliedFilters.district || appliedFilters.province ? (
              <div className="mt-2 text-sm text-gray-600">
                Showing:{' '}
                {appliedFilters.district
                  ? appliedFilters.district
                  : appliedFilters.province
                    ? appliedFilters.province
                    : 'All Locations'}
              </div>
            ) : null}
          </div>
        </nav>

        {/* Map Section */}
        <div className="h-screen pt-24">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-gray-600">Loading map...</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
              <div className="text-red-600">Error: {error}</div>
            </div>
          )}
          {!loading && !error && (
            <div className="h-full w-full">
              <Map
                helpRequests={filteredRequests}
                camps={appliedFilters.type !== 'individual' ? camps : []}
                center={mapCenter}
                zoom={mapZoom}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
