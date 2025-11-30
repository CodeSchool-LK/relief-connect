import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  HelpCircle,
  HandHeart,
  User,
  Users,
  Map,
  AlertCircle,
  Heart,
  Package,
  Search,
  MapPin,
  Filter,
  Phone,
  Mail,
  LogOut,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Home,
  Building2,
  Baby,
  UserCog,
  FileText,
} from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto'
import { IHelpRequestSummary } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request/IHelpRequestSummary'
import { Urgency } from '@nx-mono-repo-deployment-test/shared/src/enums'
import { RATION_ITEMS } from './EmergencyRequestForm'
import {
  SRI_LANKA_PROVINCES,
  SRI_LANKA_DISTRICTS,
  DISTRICT_COORDINATES,
} from '../data/sri-lanka-locations'
import apiClient from '../services/api-client'
import { helpRequestService } from '../services'

type ViewMode = 'initial' | 'need-help' | 'can-help'

export default function LandingPage() {
  const router = useRouter()
  const { t } = useTranslation('common')
  const requestsSectionRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('initial')
  const [userInfo, setUserInfo] = useState<{ name?: string; identifier?: string } | null>(null)
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showIdentifierPrompt, setShowIdentifierPrompt] = useState(true)
  const [helpRequests, setHelpRequests] = useState<HelpRequestResponseDto[]>([])
  const [summary, setSummary] = useState<IHelpRequestSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<Urgency | undefined>(undefined)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<HelpRequestResponseDto | null>(null)

  // Check for existing authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user has access token (from API registration)
      const accessToken = localStorage.getItem('accessToken')
      const donorUser = localStorage.getItem('donor_user')

      if (accessToken && donorUser) {
        try {
          const user = JSON.parse(donorUser)
          if (user.loggedIn && user.identifier) {
            setUserInfo({
              name: user.name || user.identifier,
              identifier: user.identifier,
            })
            setShowIdentifierPrompt(false)
          }
        } catch (e) {
          // Invalid data, clear it
          localStorage.removeItem('donor_user')
          apiClient.clearTokens()
        }
      } else if (!accessToken && donorUser) {
        // Old format without tokens, clear it
        localStorage.removeItem('donor_user')
        setShowIdentifierPrompt(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query])

  // Load requests from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await helpRequestService.getAllHelpRequests()
        if (response.success && response.data) {
          setHelpRequests(response.data)
        } else {
          console.error('[LandingPage] Failed to load help requests:', response.error)
          setHelpRequests([])
        }
      } catch (error) {
        console.error('[LandingPage] Error loading help requests:', error)
        setHelpRequests([])
      }
    }
    loadData()
  }, [])

  // Load summary statistics from API (for Donation Requests cards)
  useEffect(() => {
    const loadSummary = async () => {
      setSummaryLoading(true)
      try {
        const response = await helpRequestService.getHelpRequestsSummary()
        if (response.success && response.data) {
          setSummary(response.data)
        } else {
          console.error('[LandingPage] Failed to load summary:', response.error)
        }
      } catch (error) {
        console.error('[LandingPage] Error loading summary:', error)
      } finally {
        setSummaryLoading(false)
      }
    }
    loadSummary()
  }, [])

  // Use requests as-is (coordinates should come from API)
  const requestsWithMockCoords = useMemo(() => {
    return helpRequests
  }, [helpRequests])

  const handleIdentifierSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedIdentifier = identifier.trim()

    // Frontend validation
    if (!trimmedIdentifier) {
      setError('Please enter a username, email, or phone number')
      return
    }

    if (trimmedIdentifier.length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }

    if (trimmedIdentifier.length > 50) {
      setError('Username must be less than 50 characters')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('[LandingPage] Starting registration for username:', trimmedIdentifier)
      console.log(
        '[LandingPage] API URL:',
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      )

      // Call the registration API
      const response = await apiClient.post<{
        success: boolean
        data?: {
          user: {
            id: number
            username: string
            role: string
            status: string
            createdAt: string
            updatedAt: string
          }
          accessToken: string
          refreshToken: string
        }
        message?: string
        error?: string
        details?: Array<{
          field: string
          constraints: Record<string, string>
        }>
      }>('/api/users/register', { username: trimmedIdentifier }, true)

      console.log('[LandingPage] Registration response:', response)

      if (response.success && response.data) {
        console.log('[LandingPage] Registration successful! User ID:', response.data.user.id)
        console.log('[LandingPage] Storing tokens and user info...')

        // Store tokens using apiClient
        apiClient.setTokens(response.data.accessToken, response.data.refreshToken)
        console.log('[LandingPage] Tokens stored successfully')

        // Store user info
        const userData = {
          name: response.data.user.username,
          identifier: response.data.user.username,
          loggedIn: true,
        }
        localStorage.setItem('donor_user', JSON.stringify(userData))
        console.log('[LandingPage] User info stored:', userData)

        setUserInfo(userData)
        setShowIdentifierPrompt(false)
        setIdentifier('')

        // Clear any URL tokens
        router.replace('/', undefined, { shallow: true })
        console.log('[LandingPage] Registration complete, redirecting...')
      } else {
        console.error('[LandingPage] Registration failed - response not successful:', response)
        // Handle validation errors
        let errorMessage = response.error || 'Registration failed. Please try again.'
        if (response.details && Array.isArray(response.details) && response.details.length > 0) {
          const firstError = response.details[0]
          const constraintMessages = Object.values(firstError.constraints || {})
          if (constraintMessages.length > 0) {
            errorMessage = constraintMessages[0]
          }
        }
        setError(errorMessage)
      }
    } catch (err) {
      console.error('[LandingPage] Registration error caught:', err)
      console.error(
        '[LandingPage] Error type:',
        err instanceof Error ? err.constructor.name : typeof err
      )
      console.error(
        '[LandingPage] Error message:',
        err instanceof Error ? err.message : String(err)
      )

      // Try to extract error details from the error
      let errorMessage = 'Failed to register. Please check your connection and try again.'

      if (err instanceof Error) {
        errorMessage = err.message

        // Check if it's a validation error with details
        const errorObj = err as Error & { details?: unknown }
        if (errorObj.details) {
          try {
            const details = Array.isArray(errorObj.details) ? errorObj.details : [errorObj.details]
            if (details.length > 0) {
              const firstDetail = details[0] as {
                field?: string
                constraints?: Record<string, string>
              }
              if (firstDetail?.constraints) {
                const constraintMessages = Object.values(firstDetail.constraints)
                if (constraintMessages.length > 0) {
                  errorMessage = constraintMessages[0]
                }
              }
            }
          } catch (parseErr) {
            // If parsing fails, use the original error message
            console.error('Error parsing error details:', parseErr)
          }
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('donor_user')
    apiClient.clearTokens()
    setUserInfo(null)
    setShowIdentifierPrompt(true)
    setIdentifier('')
    router.push('/')
  }

  const handleViewRequests = () => {
    router.push('/my-requests')
  }

  // Calculate analytics from actual data
  const analytics = useMemo(() => {
    const totalRequests = helpRequests.length
    const totalPeople = helpRequests.reduce((sum, req) => {
      // Use real API field first, fallback to parsing shortNote
      return (
        sum +
        (req.totalPeople ||
          (() => {
            const match = req.shortNote?.match(/People:\s*(\d+)/)
            return match ? parseInt(match[1]) : 1
          })())
      )
    }, 0)

    const totalRations = helpRequests.reduce((sum, req) => {
      // Use rationItems array if available
      if (req.rationItems && req.rationItems.length > 0) {
        return sum + req.rationItems.length
      }
      // Fallback to parsing shortNote
      const itemsMatch = req.shortNote?.match(/Items:\s*(.+)/)
      if (itemsMatch) {
        const items = itemsMatch[1]
        const numbers = items.match(/\((\d+)\)/g) || []
        return sum + numbers.reduce((acc, num) => acc + parseInt(num.replace(/[()]/g, '')), 0)
      }
      return sum
    }, 0)

    return {
      totalRequests,
      totalPeople,
      totalRations,
    }
  }, [helpRequests])

  const filteredRequests = useMemo(() => {
    let filtered = requestsWithMockCoords

    // Filter by selected priority level (Medium / High)
    if (selectedLevel) {
      filtered = filtered.filter((request) => request.urgency === selectedLevel)
    }

    // If we have the user's location, sort requests by distance (nearest first)
    if (userLocation) {
      const { lat: userLat, lng: userLng } = userLocation

      const distanceSq = (req: HelpRequestResponseDto) => {
        const lat = Number(req.lat)
        const lng = Number(req.lng)
        if (Number.isNaN(lat) || Number.isNaN(lng)) return Number.POSITIVE_INFINITY
        const dLat = lat - userLat
        const dLng = lng - userLng
        return dLat * dLat + dLng * dLng
      }

      filtered = [...filtered].sort((a, b) => distanceSq(a) - distanceSq(b))
    }

    return filtered
  }, [requestsWithMockCoords, selectedLevel, userLocation])

  // Calculate analytics for requests section
  // - When NO level or location is applied: use summary API data (overall picture)
  // - When level or location is applied: use filteredRequests so cards match the list
  const requestsAnalytics = useMemo(() => {
    const hasActiveFilters = !!selectedLevel || !!userLocation

    // If there are no active filters and summary from API is available, use it directly
    if (!hasActiveFilters && summary) {
      const mealsPerPersonPerDay = 3
      // Total people should include elders and children as well
      const totalPeopleFromSummary =
        (summary.people?.totalPeople || 0) +
        (summary.people?.elders || 0) +
        (summary.people?.children || 0)

      // Meals needed PER DAY (not for multiple days)
      const totalMealsNeeded = totalPeopleFromSummary * mealsPerPersonPerDay

      return {
        totalRequests: summary.total || 0,
        totalPeople: totalPeopleFromSummary,
        totalMealsNeeded,
        totalKids: summary.people?.children || 0,
        totalElders: summary.people?.elders || 0,
        // totalRations is only used in charts, not the top cards
        // Now calculated on backend - total number of unique ration item types
        totalRations: summary.totalRationItemTypes || 0,
        primaryLocation: 'All Locations',
      }
    }

    // Fallback: calculate from filtered requests (used when filters/search are applied
    // or when summary is not available)
    const totalRequests = filteredRequests.length
    const totalPeople = filteredRequests.reduce((sum, req) => {
      // Use real API field first, fallback to parsing shortNote
      return (
        sum +
        (req.totalPeople ||
          (() => {
            const match = req.shortNote?.match(/People:\s*(\d+)/)
            return match ? parseInt(match[1]) : 1
          })())
      )
    }, 0)

    const totalKids = filteredRequests.reduce((sum, req) => {
      // Use real API field first, fallback to parsing shortNote
      return (
        sum +
        (req.children ||
          (() => {
            const match = req.shortNote?.match(/Kids:\s*(\d+)/)
            return match ? parseInt(match[1]) : 0
          })())
      )
    }, 0)

    const totalElders = filteredRequests.reduce((sum, req) => {
      // Use real API field first, fallback to parsing shortNote
      return (
        sum +
        (req.elders ||
          (() => {
            const match = req.shortNote?.match(/Elders:\s*(\d+)/)
            return match ? parseInt(match[1]) : 0
          })())
      )
    }, 0)

    const mealsPerPersonPerDay = 3
    // Meals needed PER DAY (not for multiple days)
    const totalMealsNeeded = totalPeople * mealsPerPersonPerDay

    const totalRations = filteredRequests.reduce((sum, req) => {
      const itemsMatch = req.shortNote?.match(/Items:\s*(.+)/)
      if (itemsMatch) {
        const items = itemsMatch[1]
        const numbers = items.match(/\((\d+)\)/g) || []
        return sum + numbers.reduce((acc, num) => acc + parseInt(num.replace(/[()]/g, '')), 0)
      }
      return sum
    }, 0)

    const locations = filteredRequests.reduce(
      (acc, req) => {
        const location = req.approxArea || 'Unknown'
        acc[location] = (acc[location] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const primaryLocation =
      Object.entries(locations).sort((a, b) => b[1] - a[1])[0]?.[0] || 'All Locations'

    return {
      totalRequests,
      totalPeople,
      totalKids,
      totalElders,
      totalMealsNeeded,
      totalRations,
      primaryLocation,
    }
  }, [filteredRequests, summary, selectedLevel, userLocation])

  const handleNeedHelp = () => {
    router.push('/need-help')
  }

  const handleCanHelp = () => {
    if (requestsSectionRef.current) {
      requestsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleHelpVolunteers = () => {
    router.push('/find-clubs')
  }

  const handleUseMyLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      console.error('[LandingPage] Geolocation not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
      },
      (error) => {
        console.error('[LandingPage] Geolocation error for sorting requests:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  }

  const handleViewMap = () => {
    router.push('/map')
  }

  // Show identifier prompt if not logged in
  if (showIdentifierPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">{t('enterUniqueIdentifier')}</CardTitle>
            <CardDescription className="text-base mt-2">{t('enterEmailOrPhone')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIdentifierSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  <div className="font-semibold mb-1">Error:</div>
                  <div>{error}</div>
                  <div className="mt-2 text-xs text-red-600">
                    API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="identifier">{t('emailOrPhoneNumber')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder={t('enterYourEmailOrPhone')}
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value)
                      setError(null)
                    }}
                    className="pl-10 h-12"
                    required
                    autoFocus
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500">{t('willBeUsedToIdentify')}</p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? t('processing') : t('continue')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Initial view - Choose between "I Need Help" or "I Can Help"
  if (viewMode === 'initial') {
    return (
      <div className="min-h-screen">
        {/* Hero Section with Background Image */}
        <div className="relative w-full min-h-[600px] sm:min-h-[700px] md:min-h-[800px] lg:min-h-[900px] overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
          {/* Top Bar with Profile */}
          <div className="sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <img
                    src="/logo.png"
                    alt="RebuildSL Logo"
                    className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 xl:w-72 xl:h-72 object-contain drop-shadow-2xl filter brightness-110 contrast-110"
                    style={{
                      imageRendering: 'auto' as const,
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <LanguageSwitcher variant="dark" />
                  {userInfo && (
                    <>
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                        <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="hidden sm:block">
                          <div className="text-sm font-semibold text-white">
                            {userInfo.name || t('donor')}
                          </div>
                          <div className="text-xs text-white/80">{userInfo.identifier}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        title={t('logout')}
                        className="text-white hover:bg-white/20"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-purple-900/80"></div>
            {/* Additional overlay pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMCA0djJoLTJ2LTJoMnptLTQtNHYyaC0ydi0yaDJ6bTAgNHYyaC0ydi0yaDJ6bTQtNHYyaC0ydi0yaDJ6bTAgNHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 md:py-16">
            {/* Welcome Section */}
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {t('welcome')}
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 mb-6 max-w-3xl mx-auto drop-shadow-md font-sub">
                {t('subtitle')}
              </p>

              {/* Top Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-4">
                {userInfo && (
                  <Button
                    onClick={handleViewRequests}
                    size="lg"
                    className="h-12 px-4 sm:px-6 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  >
                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">{t('viewMyRequests')}</span>
                  </Button>
                )}
                <Button
                  onClick={handleViewMap}
                  className="relative overflow-hidden group h-12 px-4 sm:px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Map className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">{t('viewMap')}</span>
                  </span>
                </Button>
              </div>
            </div>

            {/* Cards Section */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 max-w-6xl mx-auto">
              {/* Help Volunteers Card */}
              <Card className="cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 overflow-hidden group relative w-full md:w-80 lg:w-96 min-h-[320px] sm:min-h-[380px] md:min-h-[420px] flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Background Icon */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <Users className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 text-white" />
                </div>
                {/* Decorative blur circles */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl -ml-16 -mb-16"></div>
                <CardHeader className="text-center pb-6 pt-8 sm:pt-10 relative z-10 flex-1 flex flex-col justify-center">
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-5 drop-shadow-lg">
                    Help Volunteers
                  </CardTitle>
                  <CardDescription className="text-base sm:text-lg mt-2 text-blue-50 font-sub drop-shadow-md px-2">
                    Find volunteer clubs and support their efforts
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-6 sm:pb-8 relative z-10">
                  <Button
                    onClick={handleHelpVolunteers}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-white text-blue-600 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:shadow-xl transition-all duration-300 font-bold"
                    size="lg"
                  >
                    Find Clubs
                  </Button>
                </CardContent>
              </Card>

              {/* I Need Help Card */}
              <Card className="cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 bg-gradient-to-br from-red-500 via-red-600 to-rose-700 overflow-hidden group relative w-full md:w-80 lg:w-96 min-h-[320px] sm:min-h-[380px] md:min-h-[420px] flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-t from-red-600 via-red-500 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Background Icon */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <HelpCircle className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 text-white" />
                </div>
                {/* Decorative blur circles */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-300/20 rounded-full blur-2xl -ml-16 -mb-16"></div>
                <CardHeader className="text-center pb-6 pt-8 sm:pt-10 relative z-10 flex-1 flex flex-col justify-center">
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-5 drop-shadow-lg">
                    {t('iNeedHelp')}
                  </CardTitle>
                  <CardDescription className="text-base sm:text-lg mt-2 text-red-50 font-sub drop-shadow-md px-2">
                    Request assistance for food, medical, rescue, or shelter
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-6 sm:pb-8 relative z-10">
                  <Button
                    onClick={handleNeedHelp}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-white text-red-600 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:shadow-xl transition-all duration-300 font-bold"
                    size="lg"
                  >
                    {t('getHelpNow')}
                  </Button>
                </CardContent>
              </Card>

              {/* I Can Help Card */}
              <Card className="cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 overflow-hidden group relative w-full md:w-80 lg:w-96 min-h-[320px] sm:min-h-[380px] md:min-h-[420px] flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-t from-green-600 via-green-500 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Background Icon */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <HandHeart className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 text-white" />
                </div>
                {/* Decorative blur circles */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-300/20 rounded-full blur-2xl -ml-16 -mb-16"></div>
                <CardHeader className="text-center pb-6 pt-8 sm:pt-10 relative z-10 flex-1 flex flex-col justify-center">
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-5 drop-shadow-lg">
                    {t('iCanHelp')}
                  </CardTitle>
                  <CardDescription className="text-base sm:text-lg mt-2 text-green-50 font-sub drop-shadow-md px-2">
                    View requests and offer assistance to those in need
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-6 sm:pb-8 relative z-10">
                  <Button
                    onClick={handleCanHelp}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-white text-green-600 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:shadow-xl transition-all duration-300 font-bold"
                    size="lg"
                  >
                    {t('viewRequests')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Requests Section */}
          <div ref={requestsSectionRef} id="requests-section" className="scroll-mt-20">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-2xl font-bold">{t('donationRequests')}</CardTitle>
                  <Button onClick={handleViewMap} variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    {t('viewOnMap')}
                  </Button>
                </div>

                {/* Analytics for Requests */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
                  {/* Total Requests Card */}
                  <div className="relative overflow-hidden rounded-xl p-4 sm:p-5 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl -ml-12 -mb-12"></div>
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white/90" />
                          <span className="text-xs sm:text-sm font-medium text-white/90 font-sub">
                            {t('totalRequests')}
                          </span>
                        </div>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                          {requestsAnalytics.totalRequests}
                        </div>
                      </div>
                      <div className="ml-2 sm:ml-4">
                        <FileText className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white/30" />
                      </div>
                    </div>
                  </div>

                  {/* Total People Card */}
                  <div className="relative overflow-hidden rounded-xl p-4 sm:p-5 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-tr from-green-400/20 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-400/20 rounded-full blur-2xl -ml-12 -mb-12"></div>
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white/90" />
                          <span className="text-xs sm:text-sm font-medium text-white/90 font-sub">
                            {t('totalPeople')}
                          </span>
                        </div>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                          {requestsAnalytics.totalPeople}
                        </div>
                      </div>
                      <div className="ml-2 sm:ml-4">
                        <Users className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white/30" />
                      </div>
                    </div>
                  </div>

                  {/* Children Card */}
                  <div className="relative overflow-hidden rounded-xl p-4 sm:p-5 bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/20 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl -ml-12 -mb-12"></div>
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white/90" />
                          <span className="text-xs sm:text-sm font-medium text-white/90 font-sub">
                            {t('children')}
                          </span>
                        </div>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                          {requestsAnalytics.totalKids}
                        </div>
                      </div>
                      <div className="ml-2 sm:ml-4">
                        <Baby className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white/30" />
                      </div>
                    </div>
                  </div>

                  {/* Elders Card */}
                  <div className="relative overflow-hidden rounded-xl p-4 sm:p-5 bg-gradient-to-br from-pink-500 via-rose-600 to-fuchsia-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-tr from-pink-400/20 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-400/20 rounded-full blur-2xl -ml-12 -mb-12"></div>
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white/90" />
                          <span className="text-xs sm:text-sm font-medium text-white/90 font-sub">
                            {t('elders')}
                          </span>
                        </div>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                          {requestsAnalytics.totalElders}
                        </div>
                      </div>
                      <div className="ml-2 sm:ml-4">
                        <UserCog className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white/30" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed summary from API (without locations) */}
                {summary && (
                  <div className="space-y-3 mb-4 text-xs text-gray-700">
                    {/* Urgency & Status */}
                    <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
                      <div className="font-semibold mb-2 flex items-center justify-between">
                        <span>{t('priorityBreakdown') || 'Priority'}</span>
                        <span className="text-[11px] text-gray-500">
                          {t('totalRequests')}: {summary.total ?? 0}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div className="bg-orange-50 rounded-lg px-2 py-2 flex flex-col items-start">
                          <span className="font-semibold text-orange-700 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            {t('medium')}
                          </span>
                          <span className="text-lg font-bold text-orange-700">
                            {summary.byUrgency?.Medium ?? 0}
                          </span>
                        </div>
                        <div className="bg-red-50 rounded-lg px-2 py-2 flex flex-col items-start">
                          <span className="font-semibold text-red-700 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            {t('high')}
                          </span>
                          <span className="text-lg font-bold text-red-700">
                            {summary.byUrgency?.High ?? 0}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-2 py-2 flex flex-col items-start">
                          <span className="font-semibold text-gray-700 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            {t('open') || 'Open'}
                          </span>
                          <span className="text-lg font-bold text-gray-800">
                            {summary.byStatus?.OPEN ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible ration items as cards */}
                    <details className="bg-white/60 rounded-lg border border-gray-100" open>
                      <summary className="list-none cursor-pointer px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs">
                            {t('rationItems') || 'Items requested'}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {Object.keys(summary.rationItems || {}).length} items
                          </span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <ChevronDown className="h-3 w-3" aria-hidden="true" />
                        </div>
                      </summary>
                      <div className="px-3 pb-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {Object.entries(summary.rationItems || {}).map(
                            ([itemId, itemSummary]) => {
                              const meta = RATION_ITEMS.find((item) => item.id === itemId)
                              const label = meta?.label || itemId
                              const icon = meta?.icon
                              // Show request count (number of help requests requesting this item)
                              const requestCount = itemSummary?.quantityRemaining || 0

                              return (
                                <div
                                  key={itemId}
                                  className="bg-purple-50 border border-purple-100 rounded-lg px-2 py-2 flex flex-col gap-1"
                                >
                                  <div className="flex items-center gap-1">
                                    {icon && <span className="text-sm">{icon}</span>}
                                    <span className="text-[11px] font-semibold text-purple-800 line-clamp-2">
                                      {label}
                                    </span>
                                  </div>
                                  <span className="text-xs font-bold text-purple-700">
                                    ×{requestCount}
                                  </span>
                                </div>
                              )
                            }
                          )}
                        </div>
                      </div>
                    </details>
                  </div>
                )}

                {/* Level + Location controls */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{t('filters')}:</span>
                  </div>

                  <select
                    className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm min-w-[130px]"
                    value={selectedLevel || ''}
                    onChange={(e) =>
                      setSelectedLevel(e.target.value ? (e.target.value as Urgency) : undefined)
                    }
                  >
                    <option value="">{t('allLevels')}</option>
                    <option value={Urgency.MEDIUM}>{t('medium')}</option>
                    <option value={Urgency.HIGH}>{t('high')}</option>
                  </select>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={handleUseMyLocation}
                  >
                    {t('My Location')}
                  </Button>

                  {userLocation && (
                    <span className="text-xs text-gray-500">{t('sortedByNearest')}</span>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Requests Grid */}
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">{t('noRequestsFound')}</p>
                  <p className="text-sm text-gray-500">{t('tryAdjustingFilters')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map((request) => {
                  // Use real data from API response fields
                  const name =
                    request.name ||
                    request.shortNote?.split(',')[0]?.replace('Name:', '').trim() ||
                    'Anonymous'
                  const peopleCount =
                    request.totalPeople || request.shortNote?.match(/People:\s*(\d+)/)?.[1] || '1'
                  const kidsCount =
                    request.children || request.shortNote?.match(/Kids:\s*(\d+)/)?.[1] || '0'
                  const eldersCount =
                    request.elders || request.shortNote?.match(/Elders:\s*(\d+)/)?.[1] || '0'
                  // Use rationItems if available, otherwise parse from shortNote
                  const rationItemsList =
                    request.rationItems && request.rationItems.length > 0
                      ? request.rationItems
                          .map((itemId) => {
                            const item = RATION_ITEMS.find((i) => i.id === itemId)
                            return item ? { id: itemId, label: item.label, icon: item.icon } : null
                          })
                          .filter(
                            (item): item is { id: string; label: string; icon: string } =>
                              item !== null
                          )
                      : []
                  const fallbackItems = request.shortNote?.match(/Items:\s*(.+)/)?.[1] || null
                  const peopleCountNumber = Number(peopleCount) || 0
                  const requestType = peopleCountNumber <= 1 ? 'Individual' : 'Group'

                  return (
                    <Card
                      key={request.id}
                      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] overflow-hidden border-2 hover:border-primary bg-white"
                      onClick={() => router.push(`/request/${request.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Header with name and urgency */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="font-bold text-xl text-gray-900 group-hover:text-primary transition-colors">
                                  {name}
                                </div>
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
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                  {requestType}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Location (single clickable link to Google Maps) */}
                          {request.lat != null && request.lng != null ? (
                            <a
                              href={`https://www.google.com/maps?q=${encodeURIComponent(
                                `${Number(request.lat)},${Number(request.lng)}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 text-gray-900 hover:text-gray-950"
                              style={{ backgroundColor: '#92eb34' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#7dd321'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#92eb34'
                              }}
                            >
                              <MapPin className="h-3.5 w-3.5" />
                              Click on map
                            </a>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="font-medium truncate">
                                {request.approxArea &&
                                !request.approxArea.match(/^-?\d+\.\d+,\s*-?\d+\.\d+/)
                                  ? request.approxArea
                                  : 'Unknown location'}
                              </span>
                            </div>
                          )}

                          {/* People Details */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Users className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="text-lg font-bold text-blue-700">{peopleCount}</div>
                              <div className="text-xs text-gray-600">People</div>
                            </div>
                            {Number(kidsCount) > 0 && (
                              <div className="bg-purple-50 rounded-lg p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Users className="h-4 w-4 text-purple-600" />
                                </div>
                                <div className="text-lg font-bold text-purple-700">{kidsCount}</div>
                                <div className="text-xs text-gray-600">Kids</div>
                              </div>
                            )}
                            {Number(eldersCount) > 0 && (
                              <div className="bg-orange-50 rounded-lg p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Users className="h-4 w-4 text-orange-600" />
                                </div>
                                <div className="text-lg font-bold text-orange-700">
                                  {eldersCount}
                                </div>
                                <div className="text-xs text-gray-600">Elders</div>
                              </div>
                            )}
                          </div>

                          {/* Items Needed */}
                          {rationItemsList.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                                <Package className="h-3.5 w-3.5" />
                                Items Needed
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {rationItemsList.map((item) => (
                                  <div
                                    key={item.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md text-xs font-medium transition-colors duration-200"
                                  >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : fallbackItems ? (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                              <div className="flex items-start gap-2">
                                <Package className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="text-xs font-semibold text-purple-700 mb-1">
                                    Items Needed
                                  </div>
                                  <div className="text-sm text-gray-700 line-clamp-2">
                                    {fallbackItems}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {/* Contact Info */}
                          <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-gray-200">
                            {request.contactType === 'Phone' ? (
                              <Phone className="h-4 w-4 text-green-600" />
                            ) : (
                              <Mail className="h-4 w-4 text-blue-600" />
                            )}
                            <span className="font-medium">{request.contact}</span>
                          </div>

                          {/* Action Button */}
                          <Button
                            className="w-full mt-2 group-hover:bg-gradient-to-r group-hover:from-red-500 group-hover:to-red-600 group-hover:text-white group-hover:border-red-600 transition-all"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/request/${request.id}`)
                            }}
                          >
                            <span className="group-hover:text-white">View Details</span>
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:text-white transition-transform" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
