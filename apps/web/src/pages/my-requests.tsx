import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Card, CardContent, CardHeader, CardTitle } from 'apps/web/src/components/ui/card'
import { Button } from 'apps/web/src/components/ui/button'
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
  Package,
  HelpCircle,
  ArrowLeft,
  MapPin,
  Users,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto'
import { Urgency, HelpRequestCategory } from '@nx-mono-repo-deployment-test/shared/src/enums'

type RequestType = 'donor' | 'victim'

interface DonorRequest {
  id: number
  requestId: number
  requestTitle: string
  location: string
  category: HelpRequestCategory
  urgency: Urgency
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  donatedItems: string
  donatedDate: string
  contact: string
  contactType: string
  shortNote: string
}

interface VictimRequest {
  id: number
  title: string
  location: string
  category: HelpRequestCategory
  urgency: Urgency
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  createdDate: string
  contact: string
  contactType: string
  shortNote: string
  peopleCount: number
  items: string
}

// Dummy data for donor requests (donations made)
const dummyDonorRequests: DonorRequest[] = [
  {
    id: 1,
    requestId: 101,
    requestTitle: 'Family of 5 needs food supplies',
    location: 'Colombo',
    category: HelpRequestCategory.FOOD_WATER,
    urgency: Urgency.HIGH,
    status: 'completed',
    donatedItems: 'Food & Water (5), Rice (10kg), Canned Goods (12)',
    donatedDate: '2024-01-15',
    contact: '+94771234567',
    contactType: 'Phone',
    shortNote: 'Name: John Doe, People: 5, Kids: 2, Elders: 2. Items: Food & Water (3), Torch (2)',
  },
  {
    id: 2,
    requestId: 102,
    requestTitle: 'Elderly couple needs medical supplies',
    location: 'Kandy',
    category: HelpRequestCategory.MEDICAL,
    urgency: Urgency.MEDIUM,
    status: 'in_progress',
    donatedItems: 'Medicine (5), First Aid Kit (2)',
    donatedDate: '2024-01-18',
    contact: '+94771234568',
    contactType: 'Phone',
    shortNote: 'Name: Jane Smith, People: 2, Elders: 2. Items: Medicine (5), First Aid Kit (2)',
  },
  {
    id: 3,
    requestId: 103,
    requestTitle: 'Group needs shelter assistance',
    location: 'Galle',
    category: HelpRequestCategory.SHELTER,
    urgency: Urgency.HIGH,
    status: 'pending',
    donatedItems: 'Tents (3), Blankets (10)',
    donatedDate: '2024-01-20',
    contact: 'shelter@example.com',
    contactType: 'Email',
    shortNote: 'Name: Group Request, People: 15, Kids: 5, Elders: 3. Items: Tents (3), Blankets (10)',
  },
]

// Dummy data for victim requests (help requests made)
const dummyVictimRequests: VictimRequest[] = [
  {
    id: 1,
    title: 'Family needs urgent food supplies',
    location: 'Colombo',
    category: HelpRequestCategory.FOOD_WATER,
    urgency: Urgency.HIGH,
    status: 'completed',
    createdDate: '2024-01-10',
    contact: '+94771234567',
    contactType: 'Phone',
    shortNote: 'Name: John Doe, People: 5, Kids: 2, Elders: 2. Items: Food & Water (3), Torch (2)',
    peopleCount: 5,
    items: 'Food & Water (3), Torch (2)',
  },
  {
    id: 2,
    title: 'Need medical assistance',
    location: 'Kandy',
    category: HelpRequestCategory.MEDICAL,
    urgency: Urgency.MEDIUM,
    status: 'in_progress',
    createdDate: '2024-01-12',
    contact: '+94771234568',
    contactType: 'Phone',
    shortNote: 'Name: Jane Smith, People: 2, Elders: 2. Items: Medicine (5), First Aid Kit (2)',
    peopleCount: 2,
    items: 'Medicine (5), First Aid Kit (2)',
  },
  {
    id: 3,
    title: 'Urgent shelter needed',
    location: 'Galle',
    category: HelpRequestCategory.SHELTER,
    urgency: Urgency.HIGH,
    status: 'pending',
    createdDate: '2024-01-20',
    contact: 'shelter@example.com',
    contactType: 'Email',
    shortNote: 'Name: Group Request, People: 15, Kids: 5, Elders: 3. Items: Tents (3), Blankets (10)',
    peopleCount: 15,
    items: 'Tents (3), Blankets (10)',
  },
]

export default function MyRequestsPage() {
  const router = useRouter()
  const { t } = useTranslation('common')
  const { tab } = router.query
  const [activeTab, setActiveTab] = useState<RequestType>(
    (tab as RequestType) || 'donor'
  )
  const [userInfo, setUserInfo] = useState<{ name?: string; identifier?: string } | null>(null)
  const [donorRequests, setDonorRequests] = useState<DonorRequest[]>(() => {
    // Load donation statuses from localStorage
    if (typeof window !== 'undefined') {
      const donationStatuses = JSON.parse(
        localStorage.getItem('donation_statuses') || '{}'
      )
      return dummyDonorRequests.map((request) => ({
        ...request,
        status: (donationStatuses[request.id] as DonorRequest['status']) || request.status,
      }))
    }
    return dummyDonorRequests
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const donorUser = localStorage.getItem('donor_user')
      if (donorUser) {
        try {
          const user = JSON.parse(donorUser)
          if (user.loggedIn && user.identifier) {
            setUserInfo({
              name: user.name || user.identifier,
              identifier: user.identifier || user.phone || user.email,
            })
          } else {
            router.push('/')
          }
        } catch (e) {
          router.push('/')
        }
      } else {
        router.push('/')
      }
    }
  }, [router])

  useEffect(() => {
    if (tab && (tab === 'donor' || tab === 'victim')) {
      setActiveTab(tab as RequestType)
    }
  }, [tab])

  const handleMarkAsCompleted = (donationId: number) => {
    const updatedRequests = donorRequests.map((request) =>
      request.id === donationId ? { ...request, status: 'completed' as const } : request
    )
    setDonorRequests(updatedRequests)
    
    // Store in localStorage to sync with request details page
    if (typeof window !== 'undefined') {
      const donationStatuses = JSON.parse(
        localStorage.getItem('donation_statuses') || '{}'
      )
      donationStatuses[donationId] = 'completed'
      localStorage.setItem('donation_statuses', JSON.stringify(donationStatuses))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t('statusPending')
      case 'in_progress':
        return t('statusInProgress')
      case 'completed':
        return t('statusCompleted')
      case 'cancelled':
        return t('statusCancelled')
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700'
      case 'pending':
        return 'bg-orange-100 text-orange-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (!userInfo) {
    return null // Will redirect
  }

  return (
    <>
      <Head>
        <title>My Requests - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('back')}
                </Button>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t('myRequests')}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('donor')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'donor'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <span>{t('myDonations')} ({dummyDonorRequests.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('victim')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'victim'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                <span>{t('myHelpRequests')} ({dummyVictimRequests.length})</span>
              </div>
            </button>
          </div>

          {/* Donor Requests Tab */}
          {activeTab === 'donor' && (
            <div className="space-y-4">
              {donorRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">{t('noDonationsYet')}</p>
                    <p className="text-sm text-gray-500">
                      {t('startHelpingByViewing')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {donorRequests.map((request) => (
                    <Card
                      key={request.id}
                      className="transition-all hover:shadow-lg overflow-hidden border-2"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-green-100 via-blue-50 to-purple-100">
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                          <Package className="h-16 w-16 text-gray-400" />
                        </div>
                        <div className="absolute top-3 right-3">
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {getStatusIcon(request.status)}
                            {getStatusText(request.status)}
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                            <div className="font-semibold text-gray-900 text-sm">
                              {request.location}
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <div className="space-y-3">
                          <div>
                            <div className="font-bold text-lg text-gray-900 mb-1">
                              {request.requestTitle}
                            </div>
                            <div className="text-xs text-gray-500">
                              {request.contactType}: {request.contact}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Package className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{request.donatedItems}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span>{t('donated')}: {request.donatedDate}</span>
                            </div>
                          </div>
<div className="flex flex-col gap-2 mt-4">
                            <Button
                              className="w-full"
                              onClick={() => router.push(`/request/${request.requestId}`)}
                            >
                              {t('seeDetails')}
                            </Button>
                            {request.status !== 'completed' && (
                              <Button
                                variant="outline"
                                className="w-full border-green-300 text-green-700 hover:bg-green-50"
                                onClick={() => handleMarkAsCompleted(request.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {t('markAsCompleted')}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Victim Requests Tab */}
          {activeTab === 'victim' && (
            <div className="space-y-4">
              {dummyVictimRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">{t('noHelpRequestsYet')}</p>
                    <p className="text-sm text-gray-500">
                      {t('createRequestToGetAssistance')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dummyVictimRequests.map((request) => (
                    <Card
                      key={request.id}
                      className="transition-all hover:shadow-lg overflow-hidden border-2"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-red-100 via-orange-50 to-pink-100">
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                          <HelpCircle className="h-16 w-16 text-gray-400" />
                        </div>
                        <div className="absolute top-3 right-3">
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {getStatusIcon(request.status)}
                            {getStatusText(request.status)}
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                            <div className="font-semibold text-gray-900 text-sm">
                              {request.location}
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <div className="space-y-3">
                          <div>
                            <div className="font-bold text-lg text-gray-900 mb-1">
                              {request.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {request.contactType}: {request.contact}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Users className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{request.peopleCount} {t('people')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Package className="h-4 w-4 text-purple-600" />
                              <span className="line-clamp-1">{request.items}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span>{t('created')}: {request.createdDate}</span>
                            </div>
                          </div>
<Button
                            className="w-full mt-4"
                            onClick={() => router.push(`/request/${request.id}`)}
                          >
                            {t('seeDetails')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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

