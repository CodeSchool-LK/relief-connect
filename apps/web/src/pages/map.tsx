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
import { Filter, ArrowLeft, MapPin, Navigation, AlertCircle, X } from 'lucide-react'
import { helpRequestService, campService } from '../services'

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('../components/Map'), { ssr: false })

// Helper function to convert errors to user-friendly messages
const getErrorMessage = (error: unknown): string => {
  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.'
    }

    // Timeout errors
    if (message.includes('timeout')) {
      return 'The request took too long. Please try again.'
    }

    // API errors
    if (message.includes('401') || message.includes('unauthorized')) {
      return 'You are not authorized. Please log in and try again.'
    }
    if (message.includes('403') || message.includes('forbidden')) {
      return 'You do not have permission to perform this action.'
    }
    if (message.includes('404') || message.includes('not found')) {
      return 'The requested resource was not found.'
    }
    if (message.includes('500') || message.includes('internal server error')) {
      return 'Server error occurred. Please try again later.'
    }
    if (message.includes('503') || message.includes('service unavailable')) {
      return 'Service is temporarily unavailable. Please try again later.'
    }

    // Geolocation errors
    if (message.includes('geolocation') || message.includes('location')) {
      return 'Unable to access your location. Please enable location permissions in your browser settings.'
    }

    // Generic error message
    return 'An unexpected error occurred. Please try again.'
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  // Handle API response errors
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>
    
    // Check for common API error formats
    if (errorObj.message && typeof errorObj.message === 'string') {
      return getErrorMessage(errorObj.message)
    }
    if (errorObj.error && typeof errorObj.error === 'string') {
      return getErrorMessage(errorObj.error)
    }
    if (errorObj.details && typeof errorObj.details === 'string') {
      return errorObj.details
    }
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.'
}

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

      let errorMessage: string | null = null

      if (helpRequestsResponse.success && helpRequestsResponse.data) {
        setHelpRequests(helpRequestsResponse.data)
      } else {
        console.error('[MapPage] Failed to load help requests:', helpRequestsResponse.error)
        errorMessage = getErrorMessage(helpRequestsResponse.error || 'Failed to load help requests')
        setHelpRequests([])
      }

      if (campsResponse.success && campsResponse.data) {
        setCamps(campsResponse.data)
      } else {
        console.error('[MapPage] Failed to load camps:', campsResponse.error)
        const campErrorMsg = getErrorMessage(campsResponse.error || 'Failed to load camps')
        if (errorMessage) {
          errorMessage = `${errorMessage} Also unable to load camps.`
        } else {
          errorMessage = campErrorMsg
        }
        setCamps([])
      }

      // Set error if any occurred, otherwise clear it
      if (errorMessage) {
        setError(errorMessage)
      } else {
        // Clear error if all requests succeeded
        setError(null)
      }
    } catch (err) {
      console.error('[MapPage] Error in fetchDataWithFilters:', err)
      setError(getErrorMessage(err))
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
    // Don't clear error here to avoid flickering - errors are handled per response

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

      let errorMessage: string | null = null

      if (helpRequestsResponse.success && helpRequestsResponse.data) {
        setHelpRequests(helpRequestsResponse.data)
      } else {
        console.error('[MapPage] Failed to load help requests:', helpRequestsResponse.error)
        errorMessage = getErrorMessage(helpRequestsResponse.error || 'Failed to load help requests')
        setHelpRequests([])
      }

      if (campsResponse.success && campsResponse.data) {
        setCamps(campsResponse.data)
      } else {
        console.error('[MapPage] Failed to load camps:', campsResponse.error)
        const campErrorMsg = getErrorMessage(campsResponse.error || 'Failed to load camps')
        if (errorMessage) {
          errorMessage = `${errorMessage} Also unable to load camps.`
        } else {
          errorMessage = campErrorMsg
        }
        setCamps([])
      }

      // Only set error if there was one (don't clear existing errors unnecessarily)
      if (errorMessage) {
        setError(errorMessage)
      }
    } catch (err) {
      console.error('[MapPage] Error in fetchDataWithBounds:', err)
      setError(getErrorMessage(err))
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
      setError('Location services are not available in your browser. Please use a modern browser that supports location services.')
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
        setError(null) // Clear any previous errors
        console.log('[MapPage] User location found:', userLoc)
      },
      (error) => {
        console.error('[MapPage] Geolocation error:', error)
        let errorMsg = 'Unable to get your location. '
        
        // Provide specific messages based on error code
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Please enable location permissions in your browser settings and try again.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Your location is currently unavailable. Please try again.'
            break
          case error.TIMEOUT:
            errorMsg += 'Location request timed out. Please try again.'
            break
          default:
            errorMsg += 'Please check your browser settings and try again.'
        }
        
        setError(errorMsg)
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
        
        {/* Error Notification Banner */}
        {error && (
          <div className="fixed top-0 md:top-16 left-0 right-0 z-[100] px-4 pt-4 md:pt-4 animate-in slide-in-from-top-5 duration-300">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-4xl mx-auto flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base mb-1">Error Loading Data</p>
                <p className="text-sm text-red-600 break-words">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-100"
                aria-label="Dismiss error"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Map Section */}
        <div className="h-screen pt-0 md:pt-24 pb-0 md:pb-0 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm z-10">
              <div className="bg-white rounded-lg shadow-lg px-6 py-4 flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div className="text-gray-700 font-medium">Loading map data...</div>
              </div>
            </div>
          )}
          {!loading && (
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
