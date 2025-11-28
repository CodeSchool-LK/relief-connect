import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'apps/web/src/components/ui/card'
import { Button } from 'apps/web/src/components/ui/button'
import { Input } from 'apps/web/src/components/ui/input'
import { Label } from 'apps/web/src/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'apps/web/src/components/ui/dialog'
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
} from 'lucide-react'
import { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto'
import { Urgency, HelpRequestCategory } from '@nx-mono-repo-deployment-test/shared/src/enums'
import {
  SRI_LANKA_PROVINCES,
  SRI_LANKA_DISTRICTS,
  DISTRICT_COORDINATES,
  getMockCoordinates,
} from '../data/sri-lanka-locations'

type ViewMode = 'initial' | 'need-help' | 'can-help'

// Generate mock data for analytics
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

export default function LandingPage() {
  const router = useRouter()
  const requestsSectionRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('initial')
  const [userInfo, setUserInfo] = useState<{ name?: string; identifier?: string } | null>(null)
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [showIdentifierPrompt, setShowIdentifierPrompt] = useState(true)
  const [helpRequests, setHelpRequests] = useState<HelpRequestResponseDto[]>([])
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
  const [selectedRequest, setSelectedRequest] = useState<HelpRequestResponseDto | null>(null)

  // Check for token in URL and localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { token } = router.query
      if (token) {
        // Token in URL - store it and set user as logged in
        const userData = {
          identifier: token as string,
          name: token as string,
        }
        localStorage.setItem('donor_user', JSON.stringify({ ...userData, loggedIn: true }))
        setUserInfo(userData)
        setShowIdentifierPrompt(false)
        // Remove token from URL
        router.replace('/', undefined, { shallow: true })
      } else {
        // Check localStorage
        const donorUser = localStorage.getItem('donor_user')
        if (donorUser) {
          try {
            const user = JSON.parse(donorUser)
            if (user.loggedIn && user.identifier) {
              setUserInfo({
                name: user.name || user.identifier,
                identifier: user.identifier || user.phone || user.email,
              })
              setShowIdentifierPrompt(false)
            }
          } catch (e) {
            // Invalid data
          }
        }
      }
    }
  }, [router.query])

  // Load mock requests data
  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const mockData = generateMockData()
      setHelpRequests(mockData)
    }
    loadData()
  }, [])

  // Add mock coordinates to requests
  const requestsWithMockCoords = useMemo(() => {
    return helpRequests.map((request) => {
      if (!request.lat || !request.lng || request.lat === 0 || request.lng === 0) {
        const [lat, lng] = getMockCoordinates(appliedFilters.district)
        return { ...request, lat, lng }
      }
      return request
    })
  }, [helpRequests, appliedFilters.district])

  const handleIdentifierSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!identifier.trim()) return

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate token (in real app, this would come from API)
    const token = identifier.replace(/[^a-zA-Z0-9]/g, '') + Date.now()
    const userData = {
      name: identifier,
      identifier: identifier,
      loggedIn: true,
    }

    localStorage.setItem('donor_user', JSON.stringify(userData))
    setUserInfo(userData)
    setShowIdentifierPrompt(false)
    setIdentifier('')

    // Add token to URL
    router.push(`/?token=${token}`, undefined, { shallow: true })
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('donor_user')
    setUserInfo(null)
    setShowIdentifierPrompt(true)
    setIdentifier('')
    router.push('/')
  }

  const handleViewRequests = () => {
    router.push('/my-requests')
  }

  // Calculate analytics from mock data
  const analytics = useMemo(() => {
    const mockRequests = generateMockData()
    const totalRequests = mockRequests.length
    const totalPeople = mockRequests.reduce((sum, req) => {
      const match = req.shortNote?.match(/People:\s*(\d+)/)
      return sum + (match ? parseInt(match[1]) : 1)
    }, 0)

    const totalRations = mockRequests.reduce((sum, req) => {
      const itemsMatch = req.shortNote?.match(/Items:\s*(.+)/)
      if (itemsMatch) {
        const items = itemsMatch[1]
        const numbers = items.match(/\((\d+)\)/g) || []
        return sum + numbers.reduce((acc, num) => acc + parseInt(num.replace(/[()]/g, '')), 0)
      }
      return sum
    }, 0)

    const donationsDone = Math.floor(totalRequests * 0.6)

    return {
      totalRequests,
      totalPeople,
      totalRations,
      donationsDone,
    }
  }, [])

  const filteredRequests = useMemo(() => {
    let filtered = requestsWithMockCoords

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (request) =>
          request.shortNote?.toLowerCase().includes(query) ||
          request.approxArea?.toLowerCase().includes(query) ||
          request.contact?.toLowerCase().includes(query)
      )
    }

    if (appliedFilters.district) {
      filtered = filtered.filter((request) =>
        request.approxArea?.toLowerCase().includes(appliedFilters.district!.toLowerCase())
      )
    }

    if (appliedFilters.province && !appliedFilters.district) {
      const districts = SRI_LANKA_DISTRICTS[appliedFilters.province] || []
      filtered = filtered.filter((request) =>
        districts.some((district) =>
          request.approxArea?.toLowerCase().includes(district.toLowerCase())
        )
      )
    }

    if (appliedFilters.emergencyLevel) {
      filtered = filtered.filter((request) => request.urgency === appliedFilters.emergencyLevel)
    }

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

  // Calculate analytics for requests section
  const requestsAnalytics = useMemo(() => {
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

    const daysOfSupply = 7
    const mealsPerPersonPerDay = 3
    const totalMealsNeeded = totalPeople * daysOfSupply * mealsPerPersonPerDay

    const totalRations = filteredRequests.reduce((sum, req) => {
      const itemsMatch = req.shortNote?.match(/Items:\s*(.+)/)
      if (itemsMatch) {
        const items = itemsMatch[1]
        const numbers = items.match(/\((\d+)\)/g) || []
        return sum + numbers.reduce((acc, num) => acc + parseInt(num.replace(/[()]/g, '')), 0)
      }
      return sum
    }, 0)

    const donationsDone = Math.floor(totalRequests * 0.6)

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
      donationsDone,
      primaryLocation,
    }
  }, [filteredRequests])

  const availableDistricts = tempFilters.province
    ? SRI_LANKA_DISTRICTS[tempFilters.province] || []
    : Object.values(SRI_LANKA_DISTRICTS).flat()

  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters })
  }

  const handleNeedHelp = () => {
    setViewMode('need-help')
  }

  const handleCanHelp = () => {
    handleViewRequests()
  }

  const handleViewMap = () => {
    router.push('/map')
  }

  const handleIndividual = () => {
    router.push('/need-help')
  }

  const handleGroup = () => {
    router.push('/camp')
  }

  const handleBack = () => {
    setViewMode('initial')
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
            <CardTitle className="text-2xl font-bold">Enter Unique Identifier</CardTitle>
            <CardDescription className="text-base mt-2">
              Please enter your email or phone number to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIdentifierSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Phone Number</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter your email or phone number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10 h-12"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500">
                  This will be used to identify you on the platform
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Continue'}
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Top Bar with Profile */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Sri Lanka Crisis Help
                </h1>
              </div>

              <div className="flex items-center gap-3">
                {userInfo && (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-green-700" />
                      </div>
                      <div className="hidden sm:block">
                        <div className="text-sm font-semibold text-gray-900">
                          {userInfo.name || 'Donor'}
                        </div>
                        <div className="text-xs text-gray-500">{userInfo.identifier}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Connect Those in Need with Those Who Can Help
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6">
              Your support can make a difference
            </p>

            {/* Top Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {userInfo && (
                <Button
                  onClick={handleViewRequests}
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 flex items-center gap-2"
                >
                  <Package className="h-5 w-5" />
                  View My Requests
                </Button>
              )}
              <Button
                onClick={handleViewMap}
                className="relative overflow-hidden group h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Map className="h-5 w-5 animate-pulse" />
                  View Map
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* I Need Help Card */}
            <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <HelpCircle className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">I Need Help</CardTitle>
                <CardDescription className="text-base mt-2">
                  Request assistance for food, medical, rescue, or shelter
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={handleNeedHelp}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  Get Help Now
                </Button>
              </CardContent>
            </Card>

            {/* I Can Help Card */}
            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <HandHeart className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">I Can Help</CardTitle>
                <CardDescription className="text-base mt-2">
                  View requests and offer assistance to those in need
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={handleCanHelp}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  View Requests
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Requests Section */}
          <div ref={requestsSectionRef} id="requests-section" className="scroll-mt-20">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-2xl font-bold">Donation Requests</CardTitle>
                  <Button onClick={handleViewMap} variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                </div>

                {/* Analytics for Requests */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">Total Requests</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {requestsAnalytics.totalRequests}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-600">Total People</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {requestsAnalytics.totalPeople}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-600">Meals Needed</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {requestsAnalytics.totalMealsNeeded}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-medium text-orange-600">Children</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">
                      {requestsAnalytics.totalKids}
                    </div>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-pink-600" />
                      <span className="text-xs font-medium text-pink-600">Elders</span>
                    </div>
                    <div className="text-2xl font-bold text-pink-900">
                      {requestsAnalytics.totalElders}
                    </div>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-teal-600" />
                      <span className="text-xs font-medium text-teal-600">Donations Done</span>
                    </div>
                    <div className="text-2xl font-bold text-teal-900">
                      {requestsAnalytics.donationsDone}
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                  </div>

                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search requests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>

                  <select
                    className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm min-w-[150px]"
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

                  <select
                    className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm min-w-[150px]"
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
                    className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm min-w-[130px]"
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
                    className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm min-w-[120px]"
                    value={tempFilters.type || ''}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        type: e.target.value
                          ? (e.target.value as 'individual' | 'group')
                          : undefined,
                      })
                    }
                  >
                    <option value="">All Types</option>
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                  </select>

                  <Button onClick={handleApplyFilters} size="sm" className="h-9">
                    Apply Filters
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Requests Grid */}
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">No requests found</p>
                  <p className="text-sm text-gray-500">
                    Try adjusting your filters or search query.
                  </p>
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="w-full mt-4"
                              onClick={() => setSelectedRequest(request)}
                            >
                              See Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">
                                {request.shortNote?.split(',')[0]?.replace('Name:', '').trim() ||
                                  'Anonymous Request'}
                              </DialogTitle>
                              <DialogDescription>Request Details and Information</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-semibold text-gray-600">
                                    Location
                                  </Label>
                                  <p className="text-base">{request.approxArea || 'Unknown'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-semibold text-gray-600">
                                    Urgency
                                  </Label>
                                  <p className="text-base">{request.urgency || 'Medium'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-semibold text-gray-600">
                                    Category
                                  </Label>
                                  <p className="text-base">{request.category || 'General'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-semibold text-gray-600">
                                    Contact Type
                                  </Label>
                                  <p className="text-base">{request.contactType || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                  <Label className="text-sm font-semibold text-gray-600">
                                    Contact
                                  </Label>
                                  <p className="text-base">{request.contact || 'N/A'}</p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">
                                  Full Details
                                </Label>
                                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                                  <p className="text-sm whitespace-pre-wrap">
                                    {request.shortNote || 'No additional details provided.'}
                                  </p>
                                </div>
                              </div>
                              {request.lat && request.lng && (
                                <div>
                                  <Label className="text-sm font-semibold text-gray-600">
                                    Coordinates
                                  </Label>
                                  <p className="text-sm text-gray-600">
                                    Lat: {request.lat.toFixed(4)}, Lng: {request.lng.toFixed(4)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Need Help view - Choose between Individual or Group
  if (viewMode === 'need-help') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <Button onClick={handleBack} variant="ghost" className="mb-4">
              ← Back
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">I Need Help</h1>
            <p className="text-lg md:text-xl text-gray-600">
              Are you requesting help as an individual or as a group?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Individual Card */}
            <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  I'm an Individual
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Request help for yourself or your family
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={handleIndividual}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  Continue as Individual
                </Button>
              </CardContent>
            </Card>

            {/* Group/Camp Card */}
            <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">We're a Group</CardTitle>
                <CardDescription className="text-base mt-2">
                  Register your camp or group and share your needs
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={handleGroup}
                  variant="secondary"
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  Continue as Group
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return null
}
