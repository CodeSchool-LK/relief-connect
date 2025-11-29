import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from 'apps/web/src/components/ui/card'
import { Button } from 'apps/web/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'apps/web/src/components/ui/dialog'
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Users,
  Package,
  Calendar,
  AlertCircle,
  Heart,
  User,
  CheckCircle,
} from 'lucide-react'
import { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto'
import { HelpRequestWithOwnershipResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_with_ownership_response_dto'
import { Urgency, HelpRequestCategory, ContactType } from '@nx-mono-repo-deployment-test/shared/src/enums'
import { helpRequestService, donationService } from '../../services'
import { RATION_ITEMS } from '../../components/EmergencyRequestForm'
import { DonationWithDonatorResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation/response/donation_with_donator_response_dto'
import DonationInteractionModal from '../../components/DonationInteractionModal'

interface DonationRequest {
  id: number
  donatorId: number
  donorName: string
  donorContact: string
  donorContactType: string
  items: string
  status: 'pending' | 'confirmed' | 'completed'
  requestedDate: string
  message?: string
  donatorMarkedScheduled: boolean
  donatorMarkedCompleted: boolean
  ownerMarkedCompleted: boolean
}

// Donation requests are now loaded from localStorage

// Dummy photos
const dummyPhotos = [
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=600&fit=crop',
]

export default function RequestDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const [request, setRequest] = useState<HelpRequestWithOwnershipResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<{ name?: string; identifier?: string } | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined)
  const [donationRequests, setDonationRequests] = useState<DonationRequest[]>([])
  const [loadingDonations, setLoadingDonations] = useState(false)
  const [showDonationModal, setShowDonationModal] = useState(false)

  // Load donations from API
  useEffect(() => {
    if (id) {
      const loadDonations = async () => {
        setLoadingDonations(true)
        try {
          const response = await donationService.getDonationsByHelpRequestId(Number(id))
          if (response.success && response.data) {
            // Map API response to UI format
            const mappedDonations: DonationRequest[] = response.data.map((donation: DonationWithDonatorResponseDto) => {
              // Map rationItems from Record<string, number> to readable string
              const itemsList = Object.entries(donation.rationItems)
                .map(([itemId, quantity]) => {
                  const rationItem = RATION_ITEMS.find((item) => item.id === itemId)
                  const label = rationItem ? rationItem.label : itemId
                  return `${label} (${quantity})`
                })
                .join(', ')

              // Map status from boolean flags to UI status
              let status: 'pending' | 'confirmed' | 'completed' = 'pending'
              if (donation.ownerMarkedCompleted) {
                status = 'completed'
              } else if (donation.donatorMarkedScheduled || donation.donatorMarkedCompleted) {
                status = 'confirmed'
              }

              // Format date
              const requestedDate = donation.createdAt
                ? new Date(donation.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Unknown date'

              return {
                id: donation.id,
                donatorId: donation.donatorId,
                donorName: donation.donatorUsername || 'Anonymous',
                donorContact: donation.donatorContactNumber || 'N/A',
                donorContactType: donation.donatorContactNumber ? 'Phone' : 'Email',
                items: itemsList || 'Various items',
                status,
                requestedDate,
                message: undefined, // API doesn't have message field
                donatorMarkedScheduled: donation.donatorMarkedScheduled || false,
                donatorMarkedCompleted: donation.donatorMarkedCompleted || false,
                ownerMarkedCompleted: donation.ownerMarkedCompleted || false,
              }
            })
            setDonationRequests(mappedDonations)
          } else {
            console.error('Failed to load donations:', response.error)
            setDonationRequests([])
          }
        } catch (err) {
          console.error('[RequestPage] Error loading donations:', err)
          setDonationRequests([])
        } finally {
          setLoadingDonations(false)
        }
      }
      loadDonations()
    }
  }, [id])

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
          }
        } catch (e) {
          // Invalid data
        }
      }
    }
  }, [])

  // Get current user ID from API if authenticated
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        if (typeof window !== 'undefined') {
          const accessToken = localStorage.getItem('accessToken')
          if (accessToken) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/users/me`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            })
            if (response.ok) {
              const data = await response.json()
              if (data.success && data.data && data.data.id) {
                setCurrentUserId(data.data.id)
              }
            }
          }
        }
      } catch (error) {
        console.error('[RequestPage] Error getting current user:', error)
      }
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (id) {
      const loadRequest = async () => {
        setLoading(true)
        setError(null)
        try {
          // Fetch the specific request by ID using the API endpoint
          const response = await helpRequestService.getHelpRequestById(Number(id))
          if (response.success && response.data) {
            setRequest(response.data)
          } else {
            setError(response.error || 'Request not found')
          }
        } catch (err) {
          console.error('[RequestPage] Error loading request:', err)
          setError(err instanceof Error ? err.message : 'Failed to load request')
        } finally {
          setLoading(false)
        }
      }
      loadRequest()
    }
  }, [id])

  // Check if current user is the owner of the request
  // isOwner is determined by the backend based on authenticated user
  const isOwner = request?.isOwner || false

  const handleConfirmDonation = async (donationId: number) => {
    if (!id) return
    
    try {
      // Mark donation as completed by owner via API
      const response = await donationService.markAsCompletedByOwner(Number(id), donationId)
      if (response.success) {
        // Update local state
        const updated = donationRequests.map((donation) =>
          donation.id === donationId 
            ? { ...donation, status: 'completed' as const, ownerMarkedCompleted: true }
            : donation
        )
        setDonationRequests(updated)
      } else {
        console.error('Failed to confirm donation:', response.error)
        alert(response.error || 'Failed to confirm donation')
      }
    } catch (err) {
      console.error('[RequestPage] Error confirming donation:', err)
      alert('Failed to confirm donation. Please try again.')
    }
  }

  const handleMarkAsScheduled = async (donationId: number) => {
    if (!id) return
    
    try {
      const response = await donationService.markAsScheduled(Number(id), donationId)
      if (response.success) {
        // Update local state
        const updated = donationRequests.map((donation) =>
          donation.id === donationId 
            ? { ...donation, status: 'confirmed' as const, donatorMarkedScheduled: true }
            : donation
        )
        setDonationRequests(updated)
      } else {
        console.error('Failed to mark donation as scheduled:', response.error)
        alert(response.error || 'Failed to mark donation as scheduled')
      }
    } catch (err) {
      console.error('[RequestPage] Error marking donation as scheduled:', err)
      alert('Failed to mark donation as scheduled. Please try again.')
    }
  }

  const handleMarkAsCompletedByDonator = async (donationId: number) => {
    if (!id) return
    
    try {
      // Find the donation to check if it's already scheduled
      const donation = donationRequests.find((d) => d.id === donationId)
      
      // If not scheduled yet, mark as scheduled first
      if (donation && !donation.donatorMarkedScheduled) {
        const scheduleResponse = await donationService.markAsScheduled(Number(id), donationId)
        if (!scheduleResponse.success) {
          console.error('Failed to mark donation as scheduled:', scheduleResponse.error)
          alert(scheduleResponse.error || 'Failed to mark donation as scheduled')
          return
        }
      }
      
      // Then mark as completed
      const response = await donationService.markAsCompletedByDonator(Number(id), donationId)
      if (response.success) {
        // Update local state - mark both as scheduled and completed
        const updated = donationRequests.map((donation) =>
          donation.id === donationId 
            ? { 
                ...donation, 
                status: 'confirmed' as const, 
                donatorMarkedScheduled: true,
                donatorMarkedCompleted: true 
              }
            : donation
        )
        setDonationRequests(updated)
      } else {
        console.error('Failed to mark donation as completed:', response.error)
        alert(response.error || 'Failed to mark donation as completed')
      }
    } catch (err) {
      console.error('[RequestPage] Error marking donation as completed:', err)
      alert('Failed to mark donation as completed. Please try again.')
    }
  }

  const handleCall = () => {
    if (request?.contact) {
      window.location.href = `tel:${request.contact}`
    }
  }

  const handleDonate = () => {
    if (!request) return
    // Open donation modal instead of navigating
    setShowDonationModal(true)
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading request details...</div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Request not found</p>
          <Button onClick={() => router.push('/')}>Go Back Home</Button>
        </div>
      </div>
    )
  }

  // Use structured fields directly from API response
  const name = request.name || 'Anonymous'
  const peopleCount = request.totalPeople || 1
  const kidsCount = request.children || 0
  const eldersCount = request.elders || 0
  
  // Map rationItems array to readable labels using RATION_ITEMS
  const items = request.rationItems && request.rationItems.length > 0
    ? request.rationItems
        .map((itemId) => {
          const rationItem = RATION_ITEMS.find((item) => item.id === itemId)
          return rationItem ? rationItem.label : itemId
        })
        .join(', ')
    : request.shortNote?.match(/Items:\s*(.+)/)?.[1] || 'Various items'

  return (
    <>
      <Head>
        <title>Request Details - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Request Details</h1>
              <div className="w-20"></div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Photos Section */}
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2">
                {dummyPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative aspect-video cursor-pointer overflow-hidden rounded-lg group"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo}
                      alt={`Request photo ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Photo Modal */}
          {selectedPhoto && (
            <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
              <DialogContent className="max-w-4xl p-0">
                <img
                  src={selectedPhoto}
                  alt="Request photo"
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              </DialogContent>
            </Dialog>
          )}

          {/* Details Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold mb-2">{name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{request.approxArea || 'Unknown location'}</span>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
            </CardHeader>
            <CardContent className="space-y-4">
              {/* People Info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">{peopleCount} people</span>
                </div>
                {kidsCount > 0 && (
                  <span className="text-sm text-gray-600">({kidsCount} kids)</span>
                )}
                {eldersCount > 0 && (
                  <span className="text-sm text-gray-600">({eldersCount} elders)</span>
                )}
              </div>

              {/* Items Needed */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold">Items Needed</span>
                </div>
                <p className="text-gray-700 ml-7">{items}</p>
              </div>


              {/* Contact Info */}
              <div className="flex items-center gap-2">
                {request.contactType === 'Phone' ? (
                  <Phone className="h-4 w-4 text-gray-600" />
                ) : (
                  <Mail className="h-4 w-4 text-gray-600" />
                )}
                <span className="text-sm text-gray-600">{request.contactType}:</span>
                <span className="text-gray-900 font-medium">{request.contact}</span>
              </div>

              {/* Full Details */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Full Details</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {request.shortNote || 'No additional details provided.'}
                </p>
              </div>

              {/* Coordinates */}
              {request.lat != null && request.lng != null && (
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Coordinates:</span> Lat:{' '}
                  {Number(request.lat).toFixed(4)}, Lng: {Number(request.lng).toFixed(4)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              onClick={handleCall}
              className="flex-1 h-12 text-base font-semibold"
              variant="outline"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call
            </Button>
            {/* Only show Donate button if user is NOT the owner */}
            {!isOwner && (
              <Button
                onClick={handleDonate}
                className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Heart className="h-5 w-5 mr-2" />
                Donate
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="flex-1 h-12 text-base font-semibold" 
                  variant="outline"
                  disabled={loadingDonations}
                >
                  <Users className="h-5 w-5 mr-2" />
                  {loadingDonations ? 'Loading...' : `View Donation Requests (${donationRequests.length})`}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Donation Requests</DialogTitle>
                  <DialogDescription>
                    People who want to donate to this request
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {donationRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No donation requests yet</p>
                    </div>
                  ) : (
                    donationRequests.map((donation) => (
                      <Card key={donation.id} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {donation.donorName}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {donation.donorContactType}: {donation.donorContact}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                donation.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : donation.status === 'completed'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-semibold text-gray-600">
                                Items Offered:
                              </span>
                              <p className="text-gray-700 mt-1">{donation.items}</p>
                            </div>
                            {donation.message && (
                              <div>
                                <span className="text-sm font-semibold text-gray-600">Message:</span>
                                <p className="text-gray-700 mt-1">{donation.message}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Requested: {donation.requestedDate}</span>
                            </div>
                            <div className="flex gap-2 pt-2">
                              {donation.donorContact !== 'N/A' && isOwner && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => {
                                    window.location.href =
                                      donation.donorContactType === 'Phone'
                                        ? `tel:${donation.donorContact}`
                                        : `mailto:${donation.donorContact}`
                                  }}
                                >
                                  {donation.donorContactType === 'Phone' ? (
                                    <>
                                      <Phone className="h-4 w-4 mr-2" />
                                      Call
                                    </>
                                  ) : (
                                    <>
                                      <Mail className="h-4 w-4 mr-2" />
                                      Email
                                    </>
                                  )}
                                </Button>
                              )}
                              {/* Owner (Getter) can mark donation as completed - show if not already completed by owner */}
                              {isOwner && !donation.ownerMarkedCompleted && (
                                <Button
                                  size="sm"
                                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                                  onClick={() => handleConfirmDonation(donation.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Completed (Owner)
                                </Button>
                              )}
                              {/* Donator (Giver) can mark their own donation as scheduled or completed */}
                              {currentUserId && donation.donatorId === currentUserId && !donation.ownerMarkedCompleted && (
                                <>
                                  {!donation.donatorMarkedScheduled && !donation.donatorMarkedCompleted && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          handleMarkAsScheduled(donation.id)
                                        }}
                                      >
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Mark as Scheduled
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          handleMarkAsCompletedByDonator(donation.id)
                                        }}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Mark as Completed (Donator)
                                      </Button>
                                    </>
                                  )}
                                  {donation.donatorMarkedScheduled && !donation.donatorMarkedCompleted && (
                                    <Button
                                      size="sm"
                                      className="flex-1 bg-green-600 hover:bg-green-700"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleMarkAsCompletedByDonator(donation.id)
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark as Completed (Donator)
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {request && (
        <DonationInteractionModal
          helpRequest={request}
          isOpen={showDonationModal}
          onClose={() => {
            setShowDonationModal(false)
            // Reload donations after closing modal
            if (id) {
              const loadDonations = async () => {
                setLoadingDonations(true)
                try {
                  const response = await donationService.getDonationsByHelpRequestId(Number(id))
                  if (response.success && response.data) {
                    const mappedDonations: DonationRequest[] = response.data.map((donation: DonationWithDonatorResponseDto) => {
                      const itemsList = Object.entries(donation.rationItems)
                        .map(([itemId, quantity]) => {
                          const rationItem = RATION_ITEMS.find((item) => item.id === itemId)
                          const label = rationItem ? rationItem.label : itemId
                          return `${label} (${quantity})`
                        })
                        .join(', ')

                      let status: 'pending' | 'confirmed' | 'completed' = 'pending'
                      if (donation.ownerMarkedCompleted) {
                        status = 'completed'
                      } else if (donation.donatorMarkedScheduled || donation.donatorMarkedCompleted) {
                        status = 'confirmed'
                      }

                      const requestedDate = donation.createdAt
                        ? new Date(donation.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Unknown date'

                      return {
                        id: donation.id,
                        donatorId: donation.donatorId,
                        donorName: donation.donatorUsername || 'Anonymous',
                        donorContact: donation.donatorContactNumber || 'N/A',
                        donorContactType: donation.donatorContactNumber ? 'Phone' : 'Email',
                        items: itemsList || 'Various items',
                        status,
                        requestedDate,
                        message: undefined,
                        donatorMarkedScheduled: donation.donatorMarkedScheduled || false,
                        donatorMarkedCompleted: donation.donatorMarkedCompleted || false,
                        ownerMarkedCompleted: donation.ownerMarkedCompleted || false,
                      }
                    })
                    setDonationRequests(mappedDonations)
                  }
                } catch (err) {
                  console.error('[RequestPage] Error loading donations:', err)
                } finally {
                  setLoadingDonations(false)
                }
              }
              loadDonations()
            }
          }}
          currentUserId={currentUserId}
          isOwner={isOwner}
        />
      )}
    </>
  )
}

