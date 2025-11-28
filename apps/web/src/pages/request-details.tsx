"use client"

import { useState, useMemo } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { Button } from "apps/web/src/components/ui/button"
import { Label } from "apps/web/src/components/ui/label"
import { Phone, Heart, MessageSquare, ArrowLeft, MapPin, AlertCircle, Users, Package } from "lucide-react"
import { Urgency, HelpRequestCategory, ContactType } from "@nx-mono-repo-deployment-test/shared/src/enums"
import type { HelpRequestResponseDto } from "@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto"

export default function RequestDetailsPage() {
  const router = useRouter()
  const { requestData } = router.query
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Parse request data from URL query
  const request = useMemo(() => {
    if (!requestData || typeof requestData !== "string") return null
    try {
      return JSON.parse(decodeURIComponent(requestData)) as HelpRequestResponseDto
    } catch {
      return null
    }
  }, [requestData])

  // Mock images for display (1 main + 4 thumbnails)
  const mockImages = [
    "/disaster-relief-aid.jpg",
    "/food-supplies.jpg",
    "/medical-aid.jpg",
    "/shelter-help.jpg",
    "/emergency-rescue.jpg",
  ]

  if (!request) {
    return (
      <>
        <Head>
          <title>Request Details - Sri Lanka Crisis Help</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900">Request not found</p>
            <Button onClick={() => router.push("/map")} className="mt-4">
              Back to Map
            </Button>
          </div>
        </div>
      </>
    )
  }

  const requestName = request.shortNote?.split(",")[0]?.replace("Name:", "").trim() || "Anonymous"
  const peopleCount = request.shortNote?.match(/People:\s*(\d+)/)?.[1] || "1"
  const kidsCount = request.shortNote?.match(/Kids:\s*(\d+)/)?.[1] || "0"
  const eldersCount = request.shortNote?.match(/Elders:\s*(\d+)/)?.[1] || "0"
  const itemsNeeded = request.shortNote?.match(/Items:\s*(.+)/)?.[1] || "Various items"

  return (
    <>
      <Head>
        <title>{requestName} - Request Details</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">{requestName}</h1>
              <div className="w-[60px]"></div>
            </div>
          </div>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Request Summary Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Title</Label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{requestName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Location</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <p className="text-base font-semibold text-gray-900">{request.approxArea}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Category</Label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {request.category === HelpRequestCategory.FOOD_WATER
                        ? "Food & Water"
                        : request.category === HelpRequestCategory.MEDICAL
                          ? "Medical"
                          : request.category === HelpRequestCategory.SHELTER
                            ? "Shelter"
                            : "Other"}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Urgency</Label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                          request.urgency === Urgency.HIGH
                            ? "bg-red-100 text-red-700"
                            : request.urgency === Urgency.MEDIUM
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        <AlertCircle className="h-4 w-4" />
                        {request.urgency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* People Information Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  People Information
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <Label className="text-sm font-medium text-blue-600">Total People</Label>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{peopleCount}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <Label className="text-sm font-medium text-yellow-600">Children</Label>
                    <p className="text-3xl font-bold text-yellow-900 mt-2">{kidsCount}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <Label className="text-sm font-medium text-purple-600">Elders</Label>
                    <p className="text-3xl font-bold text-purple-900 mt-2">{eldersCount}</p>
                  </div>
                </div>
              </div>

              {/* Items Needed Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Items Needed
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-base text-gray-800 whitespace-pre-wrap">{itemsNeeded}</p>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Contact Type</Label>
                    <p className="text-base text-gray-900 mt-1">{request.contactType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Contact Number</Label>
                    <p className="text-base font-mono text-gray-900 mt-1">{request.contact}</p>
                  </div>
                </div>
              </div>

              {/* Full Details Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Full Details</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{request.shortNote}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 flex items-center justify-center gap-2 h-12 text-base"
                  onClick={() => {
                    if (request.contactType === ContactType.PHONE && request.contact) {
                      window.location.href = `tel:${request.contact}`
                    } else if (request.contactType === ContactType.WHATSAPP && request.contact) {
                      const phoneNumber = request.contact.replace(/[^0-9]/g, "")
                      window.location.href = `https://wa.me/${phoneNumber}`
                    }
                  }}
                >
                  <Phone className="h-5 w-5" />
                  Call
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2 h-12 text-base bg-transparent"
                >
                  <Heart className="h-5 w-5" />
                  Donate
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2 h-12 text-base bg-transparent"
                >
                  <MessageSquare className="h-5 w-5" />
                  View Responses
                </Button>
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Main Image */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      src={mockImages[selectedImageIndex] || "/placeholder.svg"}
                      alt={`Request ${selectedImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Thumbnail Images */}
                <div className="grid grid-cols-4 gap-2">
                  {mockImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImageIndex === index
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Coordinates */}
                {request.lat && request.lng && (
                  <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                    <Label className="text-sm font-medium text-blue-900">Location Coordinates</Label>
                    <p className="text-xs text-blue-700 mt-2">
                      Lat: {request.lat.toFixed(4)}
                      <br />
                      Lng: {request.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
