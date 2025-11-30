'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import type { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto'
import type { CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto'
import { Urgency } from '@nx-mono-repo-deployment-test/shared/src/enums'
import { Filter, ArrowLeft, MapPin, Navigation } from 'lucide-react'
import { helpRequestService, campService } from '../services'

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('../components/Map'), { ssr: false })

export default function MapDashboard() {
  const router = useRouter()
  const { t } = useTranslation('common')
  const [helpRequests, setHelpRequests] = useState<HelpRequestResponseDto[]>([])
  const [camps, setCamps] = useState<CampResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [tempFilters, setTempFilters] = useState<{
    emergencyLevel?: Urgency
    type?: 'individual' | 'group'
  }>({})
  const [appliedFilters, setAppliedFilters] = useState<{
    emergencyLevel?: Urgency
    type?: 'individual' | 'group'
  }>({})
  const [mapCenter, setMapCenter] = useState<[number, number]>([7.8731, 80.7718])
  const [mapZoom, setMapZoom] = useState(8)
  const [mapBounds, setMapBounds] = useState<{ minLat: number; maxLat: number; minLng: number; maxLng: number } | null>(null)
  const [debouncedBounds, setDebouncedBounds] = useState<{ minLat: number; maxLat: number; minLng: number; maxLng: number } | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [centerUpdateKey, setCenterUpdateKey] = useState(0)
  const isInitialLoadRef = useRef(true)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Read filters from query params on initial load
  useEffect(() => {
    const { urgency, type } = router.query
    if (urgency || type) {
      const initialFilters = {
        emergencyLevel: urgency as Urgency | undefined,
        type: type as 'individual' | 'group' | undefined,
      }
      setTempFilters(initialFilters)
      setAppliedFilters(initialFilters)
    }
  }, [router.query])

  // Use requests as-is (coordinates should come from API)
  const requestsWithMockCoords = useMemo(() => {
    return helpRequests
  }, [helpRequests])

  // Debounce bounds changes - but skip on initial load
  useEffect(() => {
    if (!mapBounds || isInitialLoadRef.current) return

    const timer = setTimeout(() => {
      setDebouncedBounds(mapBounds)
    }, 600) // 600ms debounce delay

    return () => clearTimeout(timer)
  }, [mapBounds])

  // Fetch data function for filter changes (shows loading)
  const fetchDataWithFilters = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch help requests from API
      const helpRequestsResponse = await helpRequestService.getAllHelpRequests({
        urgency: appliedFilters.emergencyLevel,
        bounds: debouncedBounds || undefined,
      })

      // Fetch camps from API
      const campsResponse = await campService.getAllCamps({
        bounds: debouncedBounds || undefined,
      })

      if (helpRequestsResponse.success && helpRequestsResponse.data) {
        setHelpRequests(helpRequestsResponse.data)
      } else {
        console.error('[MapPage] Failed to load help requests:', helpRequestsResponse.error)
        setHelpRequests([])
      }

      if (campsResponse.success && campsResponse.data) {
        setCamps(campsResponse.data)
      } else {
        console.error('[MapPage] Failed to load camps:', campsResponse.error)
        setCamps([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
      // Mark initial load as complete after first fetch
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false
      }
    }
  }, [appliedFilters.emergencyLevel, debouncedBounds])

  // Fetch data function for bounds changes (doesn't show loading)
  const fetchDataWithBounds = useCallback(async () => {
    setError(null)

    try {
      // Fetch help requests from API
      const helpRequestsResponse = await helpRequestService.getAllHelpRequests({
        urgency: appliedFilters.emergencyLevel,
        bounds: debouncedBounds || undefined,
      })

      // Fetch camps from API
      const campsResponse = await campService.getAllCamps({
        bounds: debouncedBounds || undefined,
      })

      if (helpRequestsResponse.success && helpRequestsResponse.data) {
        setHelpRequests(helpRequestsResponse.data)
      } else {
        console.error('[MapPage] Failed to load help requests:', helpRequestsResponse.error)
        setHelpRequests([])
      }

      if (campsResponse.success && campsResponse.data) {
        setCamps(campsResponse.data)
      } else {
        console.error('[MapPage] Failed to load camps:', campsResponse.error)
        setCamps([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    }
  }, [appliedFilters.emergencyLevel, debouncedBounds])

  // Initial load and filter changes - show loading
  useEffect(() => {
    fetchDataWithFilters()
  }, [appliedFilters.emergencyLevel])

  // Fetch when bounds change (but not on initial load) - don't show loading
  useEffect(() => {
    if (isInitialLoadRef.current || !debouncedBounds) return
    fetchDataWithBounds()
  }, [debouncedBounds, fetchDataWithBounds])

  const handleBoundsChange = useCallback((bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
    setMapBounds(bounds)
  }, [])

  const handleFindMyLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLocationLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const userLoc = { lat: latitude, lng: longitude }
        setUserLocation(userLoc)
        // Center map on user location with a closer zoom
        setMapCenter([latitude, longitude])
        setMapZoom(12) // Zoom in closer when showing user location
        setCenterUpdateKey((prev) => prev + 1) // Force map center update
        setLocationLoading(false)
        console.log('[MapPage] User location found:', userLoc)
      },
      (error) => {
        console.error('[MapPage] Geolocation error:', error)
        setError('Unable to get your location. Please enable location permissions.')
        setLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Don't use cached location
      }
    )
  }, [])

  // Map center is fixed to Sri Lanka center
  // Province/District filter logic removed

  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters })
    // Update URL with filters
    const params = new URLSearchParams()
    if (tempFilters.emergencyLevel) params.set('urgency', tempFilters.emergencyLevel)
    if (tempFilters.type) params.set('type', tempFilters.type)
    router.push(`/map?${params.toString()}`, undefined, { shallow: true })
    setIsDrawerOpen(false)
  }

  const handleViewRequestDetails = (request: HelpRequestResponseDto) => {
    router.push(`/request/${request.id}`)
  }

  const filteredRequests = useMemo(() => {
    let filtered = requestsWithMockCoords

    // Always exclude Low urgency requests - only show Medium and High
    filtered = filtered.filter((request) => 
      request.urgency === Urgency.MEDIUM || request.urgency === Urgency.HIGH
    )

    // Filter by urgency (only Medium or High can be selected)
    if (appliedFilters.emergencyLevel) {
      filtered = filtered.filter((request) => request.urgency === appliedFilters.emergencyLevel)
    }

    // Filter by type (individual = 1 person, group = more than 1 person)
    if (appliedFilters.type === 'individual') {
      filtered = filtered.filter((request) => {
        // Use totalPeople field from API, fallback to parsing shortNote
        const totalPeople = request.totalPeople || (() => {
          const peopleMatch = request.shortNote?.match(/People:\s*(\d+)/)
          return peopleMatch ? Number.parseInt(peopleMatch[1]) : 1
        })()
        return totalPeople === 1
      })
    } else if (appliedFilters.type === 'group') {
      filtered = filtered.filter((request) => {
        // Use totalPeople field from API, fallback to parsing shortNote
        const totalPeople = request.totalPeople || (() => {
          const peopleMatch = request.shortNote?.match(/People:\s*(\d+)/)
          return peopleMatch ? Number.parseInt(peopleMatch[1]) : 1
        })()
        return totalPeople > 1
      })
    }

    // Filter out requests with invalid coordinates
    filtered = filtered.filter((request) => {
      const lat = Number(request.lat)
      const lng = Number(request.lng)
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
    })

    console.log('[MapPage] Filtered requests:', {
      total: requestsWithMockCoords.length,
      filtered: filtered.length,
      filters: appliedFilters,
    })

    return filtered
  }, [requestsWithMockCoords, appliedFilters])

  const DesktopFiltersBar = () => (
    <nav className="hidden md:block absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Button>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="font-semibold text-gray-900">{t('filters')}</span>
          </div>

          <div className="flex-1 flex flex-wrap items-center gap-3">
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
              <option value="">All Levels (Medium & High)</option>
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

            <Button variant="outline" onClick={() => router.push('/#requests')} className="h-10">
              View Requests List
            </Button>

            <Button
              variant="outline"
              onClick={handleFindMyLocation}
              disabled={locationLoading}
              className="h-10 flex items-center gap-2"
            >
              <Navigation className={`h-4 w-4 ${locationLoading ? 'animate-spin' : ''}`} />
              {locationLoading ? 'Finding...' : 'My Location'}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )

  const MobileBottomBar = () => (
    <div
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[92%] transition-all duration-300 ease-out"
      style={{ transform: isDrawerOpen ? 'translateY(150px)' : 'translateY(0)' }}
    >
      <div className="flex items-center justify-around bg-white/90 backdrop-blur-xl shadow-lg border border-gray-200 rounded-2xl py-3 px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="flex flex-col items-center justify-center gap-1 text-gray-700 hover:text-gray-900 hover:bg-transparent"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-[11px] font-medium">Back</span>
        </Button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300/60"></div>

        {/* Find My Location Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFindMyLocation}
          disabled={locationLoading}
          className="flex flex-col items-center justify-center gap-1 text-gray-700 hover:text-gray-900 hover:bg-transparent"
        >
          <Navigation className={`h-5 w-5 ${locationLoading ? 'animate-spin' : ''}`} />
          <span className="text-[11px] font-medium">My Location</span>
        </Button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300/60"></div>

        {/* Filters Button */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center justify-center gap-1 text-gray-700 hover:text-gray-900 hover:bg-transparent"
            >
              <Filter className="h-5 w-5" />
              <span className="text-[11px] font-medium">Filters</span>
            </Button>
          </DrawerTrigger>

          <DrawerContent className="max-h-[45vh]">
            <DrawerHeader className="text-center">
              <DrawerTitle>Filter Map</DrawerTitle>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="urgency-select">Urgency Level</Label>
                <select
                  id="urgency-select"
                  className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm"
                  value={tempFilters.emergencyLevel || ''}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      emergencyLevel: e.target.value ? (e.target.value as Urgency) : undefined,
                    })
                  }
                >
                  <option value="">All Levels (Medium & High)</option>
                  <option value={Urgency.MEDIUM}>{t('medium')}</option>
                  <option value={Urgency.HIGH}>{t('high')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-select">Type</Label>
                <select
                  id="type-select"
                  className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm"
                  value={tempFilters.type || ''}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      type: e.target.value ? (e.target.value as 'individual' | 'group') : undefined,
                    })
                  }
                >
                  <option value="">{t('allTypes')}</option>
                  <option value="individual">{t('individual')}</option>
                  <option value="group">{t('group')}</option>
                </select>
              </div>
            </div>
            <DrawerFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setTempFilters({})
                  setAppliedFilters({})
                  router.push('/map', undefined, { shallow: true })
                  setIsDrawerOpen(false)
                }}
                className="w-full"
              >
                Clear
              </Button>

              <Button onClick={handleApplyFilters} className="w-full">
                Apply
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Help Map - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-50 relative">
        {isMobile ? <MobileBottomBar /> : <DesktopFiltersBar />}
        {/* Map Section */}
        <div className="h-screen pt-0 md:pt-24 pb-0 md:pb-0 relative">
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
                key={`map-${appliedFilters.emergencyLevel || 'all'}-${appliedFilters.type || 'all'}`}
                helpRequests={filteredRequests}
                camps={camps}
                center={mapCenter}
                zoom={mapZoom}
                centerUpdateKey={centerUpdateKey}
                onRequestClick={handleViewRequestDetails}
                onBoundsChange={handleBoundsChange}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  }
}
