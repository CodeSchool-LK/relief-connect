"use client"

import React, { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto'
import type { ICampDropOffLocation } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampDropOffLocation'

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

// Camp icon (blue)
const campIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="background-color: #3b82f6; width: 28px; height: 28px; border-radius: 4px; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🏕️</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

// Drop-off location icon (green)
const dropOffIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

interface DropOffLocationsMapProps {
  dropOffLocations: Array<ICampDropOffLocation & { campName: string; campId: number }>
  camps: CampResponseDto[]
}

const MapUpdater: React.FC<{ bounds: L.LatLngBounds }> = ({ bounds }) => {
  const map = useMap()

  useEffect(() => {
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [map, bounds])

  return null
}

const DropOffLocationsMap: React.FC<DropOffLocationsMapProps> = ({ dropOffLocations, camps }) => {
  // Calculate center and bounds
  const { center, bounds, validDropOffLocations, validCamps } = useMemo(() => {
    const locations: [number, number][] = []
    
    // Add camp locations
    camps.forEach(camp => {
      const lat = Number(camp.lat)
      const lng = Number(camp.lng)
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        locations.push([lat, lng])
      }
    })

    // Add drop-off locations
    const validDropOffs = dropOffLocations.filter((loc) => {
      const lat = Number(loc.lat)
      const lng = Number(loc.lng)
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
    })

    validDropOffs.forEach((loc) => {
      const lat = Number(loc.lat)
      const lng = Number(loc.lng)
      locations.push([lat, lng])
    })

    const validCampList = camps.filter((camp) => {
      const lat = Number(camp.lat)
      const lng = Number(camp.lng)
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
    })

    if (locations.length === 0) {
      return {
        center: [7.8731, 80.7718] as [number, number], // Default to Sri Lanka center
        bounds: L.latLngBounds([7.8731, 80.7718], [7.8731, 80.7718]),
        validDropOffLocations: [],
        validCamps: [],
      }
    }

    const calculatedBounds = L.latLngBounds(locations)
    const calculatedCenter = calculatedBounds.getCenter()

    return {
      center: [calculatedCenter.lat, calculatedCenter.lng] as [number, number],
      bounds: calculatedBounds,
      validDropOffLocations: validDropOffs,
      validCamps: validCampList,
    }
  }, [dropOffLocations, camps])

  if (validDropOffLocations.length === 0 && validCamps.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No locations available to display on map</p>
      </div>
    )
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapUpdater bounds={bounds} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Camp Markers */}
        {validCamps.map((camp) => {
          const lat = Number(camp.lat)
          const lng = Number(camp.lng)
          return (
            <Marker key={`camp-${camp.id}`} position={[lat, lng]} icon={campIcon}>
              <Popup>
                <div className="min-w-[200px]">
                  <h4 className="font-bold text-lg mb-2">🏕️ {camp.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Type:</strong> {camp.campType}
                  </p>
                  {camp.location && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Location:</strong> {camp.location}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <strong>People:</strong> {camp.peopleRange}
                    {camp.peopleCount && ` (${camp.peopleCount} exact)`}
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Drop-off Location Markers */}
        {validDropOffLocations.map((location, index) => {
          const lat = Number(location.lat)
          const lng = Number(location.lng)
          return (
            <Marker key={location.id || `dropoff-${index}`} position={[lat, lng]} icon={dropOffIcon}>
              <Popup>
                <div className="min-w-[200px]">
                  <h4 className="font-bold text-base mb-2">📍 {location.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Camp:</strong> {location.campName}
                  </p>
                  {location.address && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Address:</strong> {location.address}
                    </p>
                  )}
                  {location.contactNumber && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Contact:</strong>{' '}
                      <a href={`tel:${location.contactNumber}`} className="text-blue-600 hover:underline">
                        {location.contactNumber}
                      </a>
                    </p>
                  )}
                  {location.notes && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Notes:</strong> {location.notes}
                    </p>
                  )}
                  <div className="mt-2">
                    <a
                      href={`https://www.google.com/maps?q=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default DropOffLocationsMap

