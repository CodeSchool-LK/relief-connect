"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { useAuth } from "../../hooks/useAuth"
import {
  helpRequestService,
  donationService,
  campService,
  volunteerClubService,
  membershipService,
} from "../../services"
import type { IHelpRequest } from "../../types/help-request"
import type { ICamp } from "../../types/camp"
import type { DonationWithDonatorResponseDto } from "@nx-mono-repo-deployment-test/shared/src/dtos/donation/response/donation_with_donator_response_dto"
import type { IVolunteerClub } from "../../types/volunteer-club"
import type { IMembership } from "../../types/membership"
import { Card, CardContent, CardHeader } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
  Loader2,
  Users,
  Package,
  MapPin,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  HandHeart,
  ChevronRight,
} from "lucide-react"
import CreateCampDonationModal from "../../components/CreateCampDonationModal"
import ClubDashboardSidebar from "../../components/ClubDashboardSidebar"
import Link from "next/link"
import CreateCampDialog from "../../components/CreateCampDialog"

export default function VolunteerClubDashboard() {
  const router = useRouter()
  const { isAuthenticated, isVolunteerClub, user, loading: authLoading, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [club, setClub] = useState<IVolunteerClub | null>(null)
  const [helpRequests, setHelpRequests] = useState<IHelpRequest[]>([])
  const [campDonations, setCampDonations] = useState<DonationWithDonatorResponseDto[]>([])
  const [camps, setCamps] = useState<ICamp[]>([])
  const [memberships, setMemberships] = useState<IMembership[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"help-requests" | "camps" | "memberships" | "camp-donations">(
    (router.query.tab as "help-requests" | "camps" | "memberships" | "camp-donations") || "help-requests",
  )
  const [reviewingMembershipId, setReviewingMembershipId] = useState<number | null>(null)
  const [acceptingDonationId, setAcceptingDonationId] = useState<number | null>(null)
  const [showCreateDonationModal, setShowCreateDonationModal] = useState(false)
  const [showCreateCampDialog, setShowCreateCampDialog] = useState(false)

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!isAuthenticated || !isVolunteerClub()) {
      router.push("/login")
      return
    }

    loadDashboardData()
  }, [isAuthenticated, isVolunteerClub, authLoading, router])

  useEffect(() => {
    if (
      router.query.tab &&
      ["help-requests", "camps", "memberships", "camp-donations"].includes(router.query.tab as string)
    ) {
      setActiveTab(router.query.tab as "help-requests" | "camps" | "memberships" | "camp-donations")
    }
  }, [router.query.tab])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const clubResponse = await volunteerClubService.getMyClub()
      if (clubResponse.success && clubResponse.data) {
        setClub(clubResponse.data)
      }

      const helpRequestsResponse = await helpRequestService.getAllHelpRequests()
      if (helpRequestsResponse.success && helpRequestsResponse.data) {
        setHelpRequests(helpRequestsResponse.data)
      }

      const campsResponse = await campService.getAllCamps()
      if (campsResponse.success && campsResponse.data) {
        const clubCamps =
          clubResponse.success && clubResponse.data
            ? campsResponse.data.filter((camp) => camp.volunteerClubId === clubResponse.data!.id)
            : []
        setCamps(clubCamps)

        const allCampDonations: DonationWithDonatorResponseDto[] = []
        for (const camp of clubCamps) {
          try {
            const campDonations = await donationService.getDonationsByCampId(camp.id!)
            if (campDonations.success && campDonations.data) {
              allCampDonations.push(...campDonations.data)
            }
          } catch (error) {
            console.error(`Error loading donations for camp ${camp.id}:`, error)
          }
        }
        setCampDonations(allCampDonations)
      }

      if (clubResponse.success && clubResponse.data && clubResponse.data.id) {
        const membershipsResponse = await membershipService.getClubMemberships(clubResponse.data.id)
        if (membershipsResponse.success && membershipsResponse.data) {
          setMemberships(membershipsResponse.data)
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHelpRequests = helpRequests.filter((hr) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      hr.shortNote?.toLowerCase().includes(search) ||
      hr.approxArea?.toLowerCase().includes(search) ||
      hr.name?.toLowerCase().includes(search) ||
      hr.contact?.toLowerCase().includes(search)
    )
  })

  const filteredCamps = camps.filter((c) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      c.name?.toLowerCase().includes(search) ||
      c.location?.toLowerCase().includes(search) ||
      c.shortNote?.toLowerCase().includes(search) ||
      c.description?.toLowerCase().includes(search)
    )
  })

  const filteredMemberships = memberships.filter((m) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return m.status?.toLowerCase().includes(search)
  })

  const filteredCampDonations = campDonations.filter((d) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      d.donatorName?.toLowerCase().includes(search) ||
      d.donatorMobileNumber?.toLowerCase().includes(search) ||
      d.donatorUsername?.toLowerCase().includes(search)
    )
  })

  const handleAcceptCampDonation = async (campId: number, donationId: number) => {
    setAcceptingDonationId(donationId)
    try {
      const response = await donationService.acceptCampDonation(campId, donationId)
      if (response.success) {
        // reload camp donations
        if (club?.id) {
          const campsResponse = await campService.getAllCamps()
          if (campsResponse.success && campsResponse.data) {
            const clubCamps = campsResponse.data.filter((camp) => camp.volunteerClubId === club.id)
            const allCampDonations: DonationWithDonatorResponseDto[] = []
            for (const camp of clubCamps) {
              try {
                const campDonations = await donationService.getDonationsByCampId(camp.id!)
                if (campDonations.success && campDonations.data) {
                  allCampDonations.push(...campDonations.data)
                }
              } catch (error) {
                console.error(`Error loading donations for camp ${camp.id}:`, error)
              }
            }
            setCampDonations(allCampDonations)
          }
        }
      } else {
        setError(response.error || "Failed to accept donation")
      }
    } catch (err) {
      console.error("Error accepting camp donation:", err)
      setError("Failed to accept donation")
    } finally {
      setAcceptingDonationId(null)
    }
  }

  const handleReviewMembership = async (membershipId: number, status: "APPROVED" | "REJECTED", notes?: string) => {
    setReviewingMembershipId(membershipId)
    try {
      const response = await membershipService.reviewMembership(membershipId, { status, notes })
      if (response.success) {
        // reload memberships
        if (club?.id) {
          const membershipsResponse = await membershipService.getClubMemberships(club.id)
          if (membershipsResponse.success && membershipsResponse.data) {
            setMemberships(membershipsResponse.data)
          }
        }
      } else {
        setError(response.error || "Failed to review membership")
      }
    } catch (err) {
      console.error("Error reviewing membership:", err)
      setError("Failed to review membership")
    } finally {
      setReviewingMembershipId(null)
    }
  }

  const handleLogout = async () => {
    try {
      logout()
      await router.push("/login")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getBreadcrumbLabel = () => {
    const breadcrumbMap: Record<string, string> = {
      "help-requests": "Help Requests",
      camps: "Camps",
      memberships: "Memberships",
      "camp-donations": "Camp Donations",
    }
    return breadcrumbMap[activeTab] || "Dashboard"
  }

  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>Dashboard - Volunteer Club</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600">{authLoading ? "Checking authentication..." : "Loading dashboard..."}</p>
          </div>
        </div>
      </>
    )
  }

  if (!isAuthenticated || !isVolunteerClub()) {
    return null
  }

  return (
    <>
      <Head>
        <title>Dashboard - {club?.name || "Volunteer Club"}</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        <ClubDashboardSidebar
          clubName={club?.name || "Club"}
          onLogout={handleLogout}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as any)}
          onCreateCampClick={() => setShowCreateCampDialog(true)}
        />

        <div className="flex-1 flex flex-col lg:ml-0 w-full lg:w-auto pt-16 lg:pt-0">
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 lg:top-0 z-20">
            <div className="px-4 sm:px-6 py-4 sm:py-6 lg:py-0 lg:h-20 lg:flex lg:items-center lg:justify-between">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 mb-3 lg:mb-0">
                <span className="text-gray-900 font-medium">Dashboard</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900 lg:hidden">{getBreadcrumbLabel()}</h1>
              <div className="hidden sm:flex items-center gap-1 text-sm text-gray-600 mt-2 lg:mt-0">
                <span>Home</span>
                <ChevronRight className="w-4 h-4" />
                <span>Dashboard</span>
                <ChevronRight className="w-4 h-4" />
                <span>{getBreadcrumbLabel()}</span>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 sm:py-8 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <Card>
                <CardContent className="p-6 flex flex-col justify-center h-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Help Requests</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{helpRequests.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col justify-center h-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Camps</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{camps.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col justify-center h-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {helpRequests.filter((hr) => hr.status === "OPEN").length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col justify-center h-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Memberships</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        xx
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="gap-2">
              <CardHeader className="">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full h-10 text-sm bg-gray-100"
                    />
                  </div>

                  {activeTab === "camp-donations" && (
                    <Button
                      onClick={() => setShowCreateDonationModal(true)}
                      className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                    >
                      <HandHeart className="w-4 h-4 mr-2" />
                      Create Camp Donation
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* help requests tab */}
                {activeTab === "help-requests" && (
                  <div className="space-y-4">
                    {filteredHelpRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No help requests found</p>
                      </div>
                    ) : (
                      filteredHelpRequests.map((hr) => (
                        <Card key={hr.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="flex flex-col h-full">
                            <div className="mb-2 sm:hidden">
                              {hr.urgency && (
                                <span
                                  className={`px-2 py-1 text-xs rounded border inline-block ${getUrgencyColor(hr.urgency)}`}
                                >
                                  {hr.urgency}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <h3 className="font-semibold text-lg break-words">
                                  {hr.shortNote || "Help Request"}
                                </h3>
                                {hr.urgency && (
                                  <span
                                    className={`hidden sm:inline-block px-2 py-1 text-xs rounded border flex-shrink-0 ${getUrgencyColor(hr.urgency)}`}
                                  >
                                    {hr.urgency}
                                  </span>
                                )}
                              </div>
                              <div className="hidden sm:block flex-shrink-0 flex gap-2">
                                <Link href={`/request/${hr.id}?from=dashboard`}>
                                  <Button variant="outline" size="sm" className="bg-transparent">
                                    View Details
                                  </Button>
                                </Link>
                                <Link href={`/help-requests/${hr.id}/edit?from=dashboard`}>
                                  <Button variant="outline" size="sm">
                                    Edit
                                  </Button>
                                </Link>
                              </div>
                            </div>



                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm text-gray-600 mb-4 lg:mb-0">
                              {hr.approxArea && (
                                <div className="break-words">
                                  <span className="font-medium">Area:</span> {hr.approxArea}
                                </div>
                              )}
                              {hr.name && (
                                <div className="break-words">
                                  <span className="font-medium">Requester:</span> {hr.name}
                                </div>
                              )}
                              {hr.contact && (
                                <div className="break-words">
                                  <span className="font-medium">Contact:</span> {hr.contact}
                                </div>
                              )}
                              {hr.status && (
                                <div>
                                  <span className="font-medium">Status:</span>{" "}
                                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(hr.status)}`}>
                                    {hr.status}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="sm:hidden mt-auto flex justify-start gap-2">
                              <Link href={`/request/${hr.id}?from=dashboard`}>
                                <Button variant="outline" size="sm" className="bg-transparent">
                                  View Details
                                </Button>
                              </Link>
                              <Link href={`/help-requests/${hr.id}/edit?from=dashboard`}>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}

                {/* camps tab */}
                {activeTab === "camps" && (
                  <div className="space-y-4">
                    {filteredCamps.length === 0 ? (
                      <div className="text-center py-12">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No camps found</p>
                      </div>
                    ) : (
                      filteredCamps.map((camp) => (
                        <Card key={camp.id} className="hover:shadow-md transition-shadow">
                          <CardContent>
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg break-words">{camp.name || "Camp"}</h3>
                                  {camp.status && (
                                    <span
                                      className={`px-2 py-1 text-xs rounded flex-shrink-0 ${getStatusColor(camp.status)}`}
                                    >
                                      {camp.status}
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 mb-4 lg:mb-0">
                                  {camp.location && (
                                    <div className="break-words">
                                      <span className="font-medium">Location:</span> {camp.location}
                                    </div>
                                  )}
                                  {camp.peopleRange && (
                                    <div>
                                      <span className="font-medium">People Range:</span> {camp.peopleRange}
                                    </div>
                                  )}
                                  {camp.peopleCount && (
                                    <div>
                                      <span className="font-medium">People Count:</span> {camp.peopleCount}
                                    </div>
                                  )}
                                </div>
                                {camp.description && (
                                  <p className="text-sm text-gray-600 break-words">{camp.description}</p>
                                )}
                              </div>
                              <div className="flex flex-row sm:flex-col gap-2 sm:ml-4 flex-shrink-0">
                                <Link href={`/camps/${camp.id}`} className="flex-1 sm:flex-none">
                                  <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                                    View Details
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}

                {/* memberships tab */}
                {activeTab === "memberships" && (
                  <div className="space-y-4">
                    {filteredMemberships.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No memberships found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* pending memberships */}
                        {filteredMemberships.filter((m) => m.status === "PENDING").length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Pending Requests</h3>
                            {filteredMemberships
                              .filter((m) => m.status === "PENDING")
                              .map((membership) => (
                                <Card key={membership.id} className="mb-4 border-l-4 border-l-yellow-500">
                                  <CardContent>
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-col-reverse items-start sm:flex-row sm:items-center gap-2 mb-2">
                                          <h4 className="font-semibold text-base">Member #{membership.id}</h4>
                                          <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 flex-shrink-0">
                                            PENDING
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 mb-4">
                                          <div>
                                            <span className="font-medium">User ID:</span> {membership.userId}
                                          </div>
                                          {membership.requestedAt && (
                                            <div>
                                              <span className="font-medium">Requested:</span>{" "}
                                              {new Date(membership.requestedAt).toLocaleDateString()}
                                            </div>
                                          )}
                                        </div>
                                        {membership.notes && (
                                          <p className="text-sm text-gray-600 mb-4 break-words">{membership.notes}</p>
                                        )}
                                      </div>
                                      <div className="flex flex-row sm:flex-col gap-2 sm:ml-4 flex-shrink-0">
                                        <Button
                                          size="sm"
                                          onClick={() => handleReviewMembership(membership.id, "APPROVED")}
                                          disabled={reviewingMembershipId === membership.id}
                                          className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                                        >
                                          {reviewingMembershipId === membership.id ? (
                                            <>
                                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                              Processing...
                                            </>
                                          ) : (
                                            <>
                                              <CheckCircle className="w-4 h-4 mr-2" />
                                              Approve
                                            </>
                                          )}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleReviewMembership(membership.id, "REJECTED")}
                                          disabled={reviewingMembershipId === membership.id}
                                          className="border-red-300 text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Reject
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        )}

                        {/* approved memberships */}
                        {filteredMemberships.filter((m) => m.status === "APPROVED").length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Approved Members</h3>
                            {filteredMemberships
                              .filter((m) => m.status === "APPROVED")
                              .map((membership) => (
                                <Card key={membership.id} className="mb-4 border-l-4 border-l-green-500">
                                  <CardContent>
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-col-reverse items-start sm:flex-row sm:items-center gap-2 mb-2">
                                          <h4 className="font-semibold text-base">Member #{membership.id}</h4>
                                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 flex-shrink-0">
                                            APPROVED
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                                          <div>
                                            <span className="font-medium">User ID:</span> {membership.userId}
                                          </div>
                                          {membership.reviewedAt && (
                                            <div>
                                              <span className="font-medium">Approved:</span>{" "}
                                              {new Date(membership.reviewedAt).toLocaleDateString()}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        )}

                        {/* rejected memberships */}
                        {filteredMemberships.filter((m) => m.status === "REJECTED").length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Rejected Requests</h3>
                            {filteredMemberships
                              .filter((m) => m.status === "REJECTED")
                              .map((membership) => (
                                <Card key={membership.id} className="mb-4 border-l-4 border-l-red-500">
                                  <CardContent>
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-col-reverse items-start sm:flex-row sm:items-center gap-2 mb-2">
                                          <h4 className="font-semibold text-base">Member #{membership.id}</h4>
                                          <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800 flex-shrink-0">
                                            REJECTED
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                                          <div>
                                            <span className="font-medium">User ID:</span> {membership.userId}
                                          </div>
                                          {membership.reviewedAt && (
                                            <div>
                                              <span className="font-medium">Rejected:</span>{" "}
                                              {new Date(membership.reviewedAt).toLocaleDateString()}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* camp donations tab */}
                {activeTab === "camp-donations" && (
                  <div className="space-y-4">
                    {filteredCampDonations.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No camp donations found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* pending donations */}
                        {filteredCampDonations.filter((d) => !d.ownerMarkedCompleted).length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Pending Donations</h3>
                            {filteredCampDonations
                              .filter((d) => !d.ownerMarkedCompleted)
                              .map((donation) => {
                                const camp = camps.find((c) => c.id === donation.campId)
                                return (
                                  <Card key={donation.id} className="mb-4 border-l-4 border-l-yellow-500">
                                    <CardContent>
                                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-col-reverse items-start sm:flex-row sm:items-center gap-2 mb-2">
                                            <h4 className="font-semibold text-base break-words">
                                              Donation #{donation.id} - {camp?.name || "Camp"}
                                            </h4>
                                            <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 flex-shrink-0">
                                              PENDING
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 mb-4">
                                            {donation.donatorName && (
                                              <div className="break-words">
                                                <span className="font-medium">Donator:</span> {donation.donatorName}
                                              </div>
                                            )}
                                            {donation.donatorMobileNumber && (
                                              <div className="break-words">
                                                <span className="font-medium">Contact:</span>{" "}
                                                {donation.donatorMobileNumber}
                                              </div>
                                            )}
                                            {donation.createdAt && (
                                              <div>
                                                <span className="font-medium">Created:</span>{" "}
                                                {new Date(donation.createdAt).toLocaleDateString()}
                                              </div>
                                            )}
                                          </div>
                                          {Object.keys(donation.rationItems || {}).length > 0 && (
                                            <div className="mb-4">
                                              <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {Object.entries(donation.rationItems).map(([key, value]) => (
                                                  <div key={key} className="p-2 bg-gray-50 rounded text-sm">
                                                    <span className="text-gray-600">{key}: </span>
                                                    <span className="font-medium text-gray-900">{value}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex flex-row sm:flex-col gap-2 sm:ml-4 flex-shrink-0">
                                          <Button
                                            size="sm"
                                            onClick={() => handleAcceptCampDonation(donation.campId!, donation.id)}
                                            disabled={acceptingDonationId === donation.id}
                                            className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                                          >
                                            {acceptingDonationId === donation.id ? (
                                              <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Processing...
                                              </>
                                            ) : (
                                              <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Accept
                                              </>
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              })}
                          </div>
                        )}

                        {/* completed donations */}
                        {filteredCampDonations.filter((d) => d.ownerMarkedCompleted).length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Completed Donations</h3>
                            {filteredCampDonations
                              .filter((d) => d.ownerMarkedCompleted)
                              .map((donation) => {
                                const camp = camps.find((c) => c.id === donation.campId)
                                return (
                                  <Card key={donation.id} className="mb-4 border-l-4 border-l-green-500">
                                    <CardContent>
                                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-col-reverse items-start sm:flex-row sm:items-center gap-2 mb-2">
                                            <h4 className="font-semibold text-base break-words">
                                              Donation #{donation.id} - {camp?.name || "Camp"}
                                            </h4>
                                            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 flex-shrink-0">
                                              COMPLETED
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                                            {donation.donatorName && (
                                              <div className="break-words">
                                                <span className="font-medium">Donator:</span> {donation.donatorName}
                                              </div>
                                            )}
                                            {donation.donatorMobileNumber && (
                                              <div className="break-words">
                                                <span className="font-medium">Contact:</span>{" "}
                                                {donation.donatorMobileNumber}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* create donation modal */}
      {showCreateDonationModal && (
        <CreateCampDonationModal
          camps={camps}
          isOpen={showCreateDonationModal}
          onClose={() => setShowCreateDonationModal(false)}
          onDonationCreated={() => {
            setShowCreateDonationModal(false)
            loadDashboardData()
          }}
        />
      )}

      {showCreateCampDialog && (
        <CreateCampDialog
          isOpen={showCreateCampDialog}
          onClose={() => setShowCreateCampDialog(false)}
          onCampCreated={() => {
            setShowCreateCampDialog(false)
            loadDashboardData()
          }}
        />
      )}
    </>
  )
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common"])),
    },
  }
}
