"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { useRouter } from "next/router"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { HelpRequestResponseDto } from "@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto"
import type { CampResponseDto } from "@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto"
import { Urgency, ContactType } from "@nx-mono-repo-deployment-test/shared/src/enums"
import { RATION_ITEMS } from "./EmergencyRequestForm"
import styles from "../styles/Map.module.css"

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

// Custom icons for different urgency levels
const getUrgencyIcon = (urgency: string) => {
  const color = urgency === Urgency.HIGH ? "red" : urgency === Urgency.MEDIUM ? "orange" : "green"
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [20, 20],
  })
}

// Camp icon
const campIcon = L.divIcon({
  className: "custom-marker",
  html: '<div style="background-color: blue; width: 24px; height: 24px; border-radius: 4px; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 14px;">🏕️</div>',
  iconSize: [24, 24],
})

interface MapProps {
  helpRequests: HelpRequestResponseDto[]
  camps: CampResponseDto[]
  center?: [number, number]
  zoom?: number
  onRequestClick?: (request: HelpRequestResponseDto) => void
  onBoundsChange?: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void
}

const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap()
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Only set the view on initial mount, not on every render
    // This prevents the map from resetting when user zooms/pans
    if (!hasInitialized.current) {
      map.setView(center, zoom)
      hasInitialized.current = true
    }
  }, [map, center, zoom]) // Include center/zoom in deps but only set once

  return null
}

// Component to track map bounds changes
const MapBoundsTracker: React.FC<{
  onBoundsChange?: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void
}> = ({ onBoundsChange }) => {
  const map = useMap()

  useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds()
        onBoundsChange({
          minLat: bounds.getSouth(),
          maxLat: bounds.getNorth(),
          minLng: bounds.getWest(),
          maxLng: bounds.getEast(),
        })
      }
    },
    zoomend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds()
        onBoundsChange({
          minLat: bounds.getSouth(),
          maxLat: bounds.getNorth(),
          minLng: bounds.getWest(),
          maxLng: bounds.getEast(),
        })
      }
    },
  })

  // Also trigger on initial load
  useEffect(() => {
    if (onBoundsChange) {
      const bounds = map.getBounds()
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      })
    }
  }, [map, onBoundsChange])

  return null
}

// Camp Popup Content Component
const CampPopupContent: React.FC<{
  camp: CampResponseDto
}> = ({ camp }) => {
  const router = useRouter()

  const handleViewDetails = () => {
    router.push(`/camps/${camp.id}`)
  }

  const handleViewDropOffPlaces = () => {
    router.push(`/camps/${camp.id}?tab=dropoff`)
  }

  return (
    <div className="min-w-[280px] max-w-[320px]">
      <div className="mb-3">
        <h4 className="text-lg font-bold text-gray-900 mb-2">🏕️ {camp.name}</h4>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            {camp.campType}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-3 text-sm">
        <div>
          <span className="font-semibold text-gray-700">People:</span>{' '}
          <span className="text-gray-600">{camp.peopleRange}</span>
          {camp.peopleCount && (
            <span className="text-gray-600"> ({camp.peopleCount} exact)</span>
          )}
        </div>

        {camp.needs && camp.needs.length > 0 && (
          <div>
            <span className="font-semibold text-gray-700">Needs:</span>{' '}
            <span className="text-gray-600">{camp.needs.join(", ")}</span>
          </div>
        )}

        {camp.shortNote && (
          <div>
            <span className="font-semibold text-gray-700">Note:</span>{' '}
            <span className="text-gray-600">{camp.shortNote}</span>
          </div>
        )}

        {camp.location && (
          <div>
            <span className="font-semibold text-gray-700">Location:</span>{' '}
            <span className="text-gray-600">{camp.location}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleViewDetails}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
        >
          View Details
        </button>

        {camp.dropOffLocations && camp.dropOffLocations.length > 0 && (
          <button
            onClick={handleViewDropOffPlaces}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center gap-1"
          >
            <span>📍</span>
            <span>View Drop-off Places ({camp.dropOffLocations.length})</span>
          </button>
        )}

        {camp.contact && camp.contactType !== ContactType.NONE && (
          <div className="flex gap-2">
            {camp.contactType === ContactType.PHONE && (
              <a
                href={`tel:${camp.contact}`}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm text-center flex items-center justify-center gap-1"
                style={{ color: 'white' }}
              >
                <span style={{ color: 'white' }}>📞</span>
                <span style={{ color: 'white' }}>Call</span>
              </a>
            )}
            {camp.contactType === ContactType.WHATSAPP && (
              <a
                href={`https://wa.me/${camp.contact.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm text-center flex items-center justify-center gap-1"
                style={{ color: 'white' }}
              >
                <span style={{ color: 'white' }}>💬</span>
                <span style={{ color: 'white' }}>WhatsApp</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Popup Content Component
const PopupContent: React.FC<{
  request: HelpRequestResponseDto
  onRequestClick?: (request: HelpRequestResponseDto) => void
}> = ({ request, onRequestClick }) => {
  const router = useRouter()

  // Format location - hide coordinates if they're just numbers
  const formatLocation = (location: string | null | undefined) => {
    if (!location) return 'Unknown location'
    // Check if it's just coordinates (e.g., "8.032034155598001, 80.59982299804689")
    const coordPattern = /^-?\d+\.\d+,\s*-?\d+\.\d+$/
    if (coordPattern.test(location.trim())) {
      return 'View on map'
    }
    return location
  }

  // Format ration items - rationItems is string[] (array of item IDs)
  const formatRationItems = () => {
    if (!request.rationItems || request.rationItems.length === 0) {
      return null
    }

    return request.rationItems
      .map((itemId) => {
        const item = RATION_ITEMS.find((r) => r.id === itemId)
        return item ? `${item.icon} ${item.label}` : itemId
      })
      .join(', ')
  }

  const handleViewDetails = () => {
    router.push(`/request/${request.id}`)
  }

  const urgencyColor =
    request.urgency === Urgency.HIGH
      ? 'bg-red-100 text-red-700'
      : request.urgency === Urgency.MEDIUM
        ? 'bg-orange-100 text-orange-700'
        : 'bg-green-100 text-green-700'

  const rationItemsText = formatRationItems()
  const locationText = formatLocation(request.approxArea)

  return (
    <div className="min-w-[280px] max-w-[320px]">
      <div className="mb-3">
        <h4 className="text-lg font-bold text-gray-900 mb-2">Help Request</h4>
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${urgencyColor}`}>
            {request.urgency || 'Medium'}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-3 text-sm">
        <div>
          <span className="font-semibold text-gray-700">Location:</span>{' '}
          <span className="text-gray-600">{locationText}</span>
        </div>

        {rationItemsText && (
          <div>
            <span className="font-semibold text-gray-700">Items:</span>{' '}
            <span className="text-gray-600">{rationItemsText}</span>
          </div>
        )}

        {request.shortNote && !rationItemsText && (
          <div>
            <span className="font-semibold text-gray-700">Note:</span>{' '}
            <span className="text-gray-600">{request.shortNote}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleViewDetails}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
        >
          View Details
        </button>

        {request.contact && request.contactType !== ContactType.NONE && (
          <div className="flex gap-2">
            {request.contactType === ContactType.PHONE && (
              <a
                href={`tel:${request.contact}`}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm text-center flex items-center justify-center gap-1"
                style={{ color: 'white' }}
              >
                <span style={{ color: 'white' }}>📞</span>
                <span style={{ color: 'white' }}>Call</span>
              </a>
            )}
            {request.contactType === ContactType.WHATSAPP && (
              <a
                href={`https://wa.me/${request.contact.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm text-center flex items-center justify-center gap-1"
                style={{ color: 'white' }}
              >
                <span style={{ color: 'white' }}>💬</span>
                <span style={{ color: 'white' }}>WhatsApp</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const Map: React.FC<MapProps> = ({
  helpRequests,
  camps,
  center = [7.8731, 80.7718], // Sri Lanka center
  zoom = 7,
  onRequestClick,
  onBoundsChange,
}) => {
  // Filter and validate coordinates
  const validHelpRequests = helpRequests.filter((request) => {
    const lat = Number(request.lat)
    const lng = Number(request.lng)
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
  })

  const validCamps = camps.filter((camp) => {
    const lat = Number(camp.lat)
    const lng = Number(camp.lng)
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
  })

  console.log('[Map Component] Rendering markers:', {
    helpRequests: validHelpRequests.length,
    camps: validCamps.length,
    totalHelpRequests: helpRequests.length,
    totalCamps: camps.length,
  })

  return (
    <div className={styles.mapContainer}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <MapUpdater center={center} zoom={zoom} />
        <MapBoundsTracker onBoundsChange={onBoundsChange} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Help Request Markers */}
        {validHelpRequests.map((request) => {
          const lat = Number(request.lat)
          const lng = Number(request.lng)
          return (
            <Marker
              key={`help-${request.id}`}
              position={[lat, lng]}
              icon={getUrgencyIcon(request.urgency)}
            >
            <Popup>
              <PopupContent request={request} onRequestClick={onRequestClick} />
            </Popup>
          </Marker>
            )
          })}

        {/* Camp Markers */}
        {validCamps.map((camp) => {
          const lat = Number(camp.lat)
          const lng = Number(camp.lng)
          return (
            <Marker key={`camp-${camp.id}`} position={[lat, lng]} icon={campIcon}>
            <Popup>
              <CampPopupContent camp={camp} />
            </Popup>
          </Marker>
            )
          })}
      </MapContainer>
    </div>
  )
}

export default Map
