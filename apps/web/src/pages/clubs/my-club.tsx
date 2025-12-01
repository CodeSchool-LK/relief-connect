"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { useAuth } from "../../hooks/useAuth"
import { volunteerClubService } from "../../services"
import type { IVolunteerClub } from "../../types/volunteer-club"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Loader2, Building2, Mail, Phone, MapPin, ChevronRight } from "lucide-react"
import ClubDashboardSidebar from "../../components/ClubDashboardSidebar"
import CreateCampDialog from "../../components/CreateCampDialog"

export default function MyClubPage() {
  const router = useRouter()
  const { isAuthenticated, isVolunteerClub, loading: authLoading } = useAuth()
  const [club, setClub] = useState<IVolunteerClub | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"help-requests" | "camps" | "memberships" | "camp-donations">(
    "help-requests",
  )
  const [showCreateCampDialog, setShowCreateCampDialog] = useState(false)

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!isAuthenticated || !isVolunteerClub()) {
      router.push("/login")
      return
    }

    loadMyClub()
  }, [isAuthenticated, isVolunteerClub, authLoading, router])

  const loadMyClub = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await volunteerClubService.getMyClub()
      if (response.success && response.data) {
        setClub(response.data)
      } else {
        setError(response.error || "Failed to load club information")
      }
    } catch (error) {
      console.error("Error loading club:", error)
      setError("Failed to load club information")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    router.push("/logout")
  }

  const handleTabChange = (tab: "help-requests" | "camps" | "memberships" | "camp-donations") => {
    setActiveTab(tab)
    router.push(`/clubs/dashboard?tab=${tab}`)
  }

  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>View Club Info - Volunteer Club</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600">
              {authLoading ? "Checking authentication..." : "Loading club information..."}
            </p>
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
        <title>View Club Info - {club?.name || "Volunteer Club"}</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        <ClubDashboardSidebar
          clubName={club?.name || "Club"}
          onLogout={handleLogout}
          activeTab="view-club-info"
          onTabChange={(tab) => handleTabChange(tab as any)}
          onCreateCampClick={() => setShowCreateCampDialog(true)}
        />

        <div className="flex-1 flex flex-col lg:ml-0 w-full lg:w-auto pt-16 lg:pt-0">
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 lg:top-0 z-20">
            <div className="px-4 sm:px-6 py-4 sm:py-6 lg:py-0 lg:h-20 lg:flex lg:items-center lg:justify-between">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 mb-3 lg:mb-0">
                <span className="text-gray-900 font-medium">Dashboard</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900 lg:hidden">View Club Info</h1>
              <div className="hidden sm:flex items-center gap-1 text-sm text-gray-600 mt-2 lg:mt-0">
                <span>Home</span>
                <ChevronRight className="w-4 h-4" />
                <span>Dashboard</span>
                <ChevronRight className="w-4 h-4" />
                <span>View Club Info</span>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 sm:py-8 flex-1 overflow-y-auto">
            {error && !club ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">{error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : club ? (
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-xl sm:text-2xl break-words">{club.name}</CardTitle>
                        {club.status && (
                          <span
                            className={`inline-block mt-1 px-2 py-1 text-xs rounded ${club.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {club.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {club.description && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                      <p className="text-gray-600 whitespace-pre-wrap break-words">{club.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {club.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700">Email</p>
                          <a
                            href={`mailto:${club.email}`}
                            className="text-sm text-emerald-600 hover:underline break-all"
                          >
                            {club.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {club.contactNumber && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700">Contact Number</p>
                          <a
                            href={`tel:${club.contactNumber}`}
                            className="text-sm text-emerald-600 hover:underline break-all"
                          >
                            {club.contactNumber}
                          </a>
                        </div>
                      </div>
                    )}

                    {club.address && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700">Address</p>
                          <p className="text-sm text-gray-600 break-words">{club.address}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {club.createdAt && (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-gray-500">Created: {new Date(club.createdAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Club Found</h3>
                    <p className="text-gray-600 mb-4">You don&apos;t have a club associated with your account yet.</p>
                    <p className="text-sm text-gray-500">
                      Please contact an administrator to set up your volunteer club.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* create camp dialog */}
      {showCreateCampDialog && (
        <CreateCampDialog
          isOpen={showCreateCampDialog}
          onClose={() => setShowCreateCampDialog(false)}
          onCampCreated={() => {
            setShowCreateCampDialog(false)
            router.push("/clubs/dashboard?tab=camps")
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
