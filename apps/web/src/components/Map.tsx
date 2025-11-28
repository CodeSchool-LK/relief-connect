"use client"

import type React from "react"
import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { HelpRequestResponseDto } from "@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto"
import type { CampResponseDto } from "@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto"
import { Urgency, ContactType } from "@nx-mono-repo-deployment-test/shared/src/enums"
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
}

const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])

  return null
}

const Map: React.FC<MapProps> = ({
  helpRequests,
  camps,
  center = [7.8731, 80.7718], // Sri Lanka center
  zoom = 7,
  onRequestClick,
}) => {
  return (
    <div className={styles.mapContainer}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Help Request Markers */}
        {helpRequests.map((request) => (
          <Marker
            key={`help-${request.id}`}
            position={[request.lat, request.lng]}
            icon={getUrgencyIcon(request.urgency)}
          >
            <Popup>
              <div className={styles.popup}>
                <h4>Help Request</h4>
                <p>
                  <strong>Category:</strong> {request.category}
                </p>
                <p>
                  <strong>Urgency:</strong> {request.urgency}
                </p>
                <p>
                  <strong>Area:</strong> {request.approxArea}
                </p>
                <p>
                  <strong>Note:</strong> {request.shortNote}
                </p>
                <div className={styles.contactButtons}>
                  <button
                    onClick={() => {
                      if (onRequestClick) {
                        onRequestClick(request)
                      }
                    }}
                    className={styles.contactButton}
                    style={{
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      marginBottom: "8px",
                      width: "100%",
                    }}
                  >
                    View Details
                  </button>
                  {request.contact && request.contactType !== ContactType.NONE && (
                    <>
                      {request.contactType === ContactType.PHONE && (
                        <a href={`tel:${request.contact}`} className={styles.contactButton}>
                          📞 Call
                        </a>
                      )}
                      {request.contactType === ContactType.WHATSAPP && (
                        <a
                          href={`https://wa.me/${request.contact.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.contactButton}
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Camp Markers */}
        {camps.map((camp) => (
          <Marker key={`camp-${camp.id}`} position={[camp.lat, camp.lng]} icon={campIcon}>
            <Popup>
              <div className={styles.popup}>
                <h4>Camp: {camp.name}</h4>
                <p>
                  <strong>Type:</strong> {camp.campType}
                </p>
                <p>
                  <strong>People:</strong> {camp.peopleRange}
                </p>
                <p>
                  <strong>Needs:</strong> {camp.needs.join(", ")}
                </p>
                <p>
                  <strong>Note:</strong> {camp.shortNote}
                </p>
                {camp.contact && camp.contactType !== ContactType.NONE && (
                  <div className={styles.contactButtons}>
                    {camp.contactType === ContactType.PHONE && (
                      <a href={`tel:${camp.contact}`} className={styles.contactButton}>
                        📞 Call
                      </a>
                    )}
                    {camp.contactType === ContactType.WHATSAPP && (
                      <a
                        href={`https://wa.me/${camp.contact.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.contactButton}
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default Map
