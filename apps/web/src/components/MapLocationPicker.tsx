"use client"

import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { Button } from './ui/button'

interface MapLocationPickerProps {
  onLocationChange: (lat: number, lng: number) => void
  initialLat?: number
  initialLng?: number
  height?: string
}

// Internal map component that uses Leaflet
const MapLocationPickerInternal: React.FC<MapLocationPickerProps> = ({
  onLocationChange,
  initialLat,
  initialLng,
  height = '400px',
}) => {
  // Default to Sri Lanka center for map view only, but don't set as selected location
  const defaultMapCenter: [number, number] = [7.8731, 80.7718]
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>(
    initialLat && initialLng ? [initialLat, initialLng] : [0, 0]
  )
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<'permission' | 'unavailable' | 'timeout' | 'other' | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [L, setL] = useState<any>(null)
  const [MapContainer, setMapContainer] = useState<any>(null)
  const [TileLayer, setTileLayer] = useState<any>(null)
  const [Marker, setMarker] = useState<any>(null)
  const [ReactLeaflet, setReactLeaflet] = useState<any>(null)

  // Dynamically load Leaflet only on client
  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadLeaflet = async () => {
      try {
        // Import CSS separately (doesn't need to be awaited)
        if (typeof window !== 'undefined') {
          await import('leaflet/dist/leaflet.css' as any)
        }
        
        const [leaflet, reactLeaflet] = await Promise.all([
          import('leaflet'),
          import('react-leaflet'),
        ])

        const LModule = leaflet.default
        setL(LModule)

        // Fix for default marker icons in Next.js
        if (LModule.Icon && LModule.Icon.Default) {
          delete (LModule.Icon.Default.prototype as any)._getIconUrl
          LModule.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          })
        }

        setMapContainer(reactLeaflet.MapContainer)
        setTileLayer(reactLeaflet.TileLayer)
        setMarker(reactLeaflet.Marker)
        setReactLeaflet(reactLeaflet)
        setLeafletLoaded(true)
      } catch (err) {
        console.error('[MapLocationPicker] Error loading Leaflet:', err)
        setError('Failed to load map. Please refresh the page.')
      }
    }

    loadLeaflet()
  }, [])

  // Only update if initialLat/initialLng are provided and valid (not 0,0)
  // But don't automatically call onLocationChange - let user explicitly select
  useEffect(() => {
    if (
      initialLat !== undefined && 
      initialLng !== undefined && 
      initialLat !== 0 && 
      initialLng !== 0 && 
      (initialLat !== selectedLocation[0] || initialLng !== selectedLocation[1])
    ) {
      setSelectedLocation([initialLat, initialLng])
      // Don't call onLocationChange here - only when user explicitly selects
    }
  }, [initialLat, initialLng, selectedLocation])

  const handleMapClick = (lat: number, lng: number) => {
    console.log('[MapLocationPicker] Map clicked at:', lat, lng)
    const newLocation: [number, number] = [lat, lng]
    setSelectedLocation(newLocation)
    onLocationChange(lat, lng)
    setError(null)
    setErrorType(null)
  }


  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setIsGettingLocation(false)
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }

    console.log('[MapLocationPicker] Requesting current location...')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const accuracy = position.coords.accuracy
        console.log('[MapLocationPicker] Location received:', { lat, lng, accuracy })

        if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
          console.error('[MapLocationPicker] Invalid coordinates received')
          setError('Invalid location received. Please try again or click on the map.')
          setIsGettingLocation(false)
          return
        }

        const newLocation: [number, number] = [lat, lng]
        console.log('[MapLocationPicker] Setting location state to:', newLocation)

        setSelectedLocation(newLocation)
        onLocationChange(lat, lng)
        console.log('[MapLocationPicker] Location change callback called')

        setIsGettingLocation(false)
        setError(null)
      },
      (err) => {
        // Enhanced error logging
        console.error('[MapLocationPicker] Geolocation error:', {
          code: err.code,
          message: err.message,
          PERMISSION_DENIED: err.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: err.POSITION_UNAVAILABLE,
          TIMEOUT: err.TIMEOUT,
          fullError: err,
          isSecureContext: window.isSecureContext,
          protocol: window.location.protocol,
          hostname: window.location.hostname,
        })
        
        setIsGettingLocation(false)
        let errorMessage = ''
        let errorTypeValue: 'permission' | 'unavailable' | 'timeout' | 'other' = 'other'

        // Handle error codes - use numeric values as fallback since err.PERMISSION_DENIED might not be available
        const errorCode = err.code
        const PERMISSION_DENIED = err.PERMISSION_DENIED ?? 1
        const POSITION_UNAVAILABLE = err.POSITION_UNAVAILABLE ?? 2
        const TIMEOUT = err.TIMEOUT ?? 3

        switch (errorCode) {
          case PERMISSION_DENIED:
          case 1: // Fallback for code: 1
            errorTypeValue = 'permission'
            errorMessage = 'Location access was denied. Location services are needed to automatically find your position, but you can still select your location manually by clicking on the map.'
            setShowInstructions(true) // Auto-expand instructions for permission denied
            break
          case POSITION_UNAVAILABLE:
          case 2: // Fallback for code: 2
            errorTypeValue = 'unavailable'
            errorMessage = 'Your location information is currently unavailable. Please select your location by clicking on the map.'
            break
          case TIMEOUT:
          case 3: // Fallback for code: 3
            errorTypeValue = 'timeout'
            errorMessage = 'Location request timed out. Please try again or select your location by clicking on the map.'
            break
          default:
            errorTypeValue = 'other'
            errorMessage = 'Unable to get your location. Please select your location by clicking on the map.'
            break
        }
        setError(errorMessage)
        setErrorType(errorTypeValue)
      },
      options
    )
  }

  // Custom marker icon
  const markerIcon = leafletLoaded && L
    ? L.divIcon({
        className: 'custom-location-marker',
        html: '<div style="background-color: #3b82f6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="background-color: white; width: 12px; height: 12px; border-radius: 50%;"></div></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      })
    : undefined

  if (!leafletLoaded || !MapContainer || !TileLayer || !ReactLeaflet) {
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Select your location on the map</p>
            <p className="text-xs text-gray-500">Loading map...</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Loading...
          </Button>
        </div>
        <div style={{ height, width: '100%', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e5e7eb', backgroundColor: '#f3f4f6' }}>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  // Create handler components that use hooks - these must be defined inside the component
  // but the hooks will only be called when these components are rendered inside MapContainer
  const MapClickHandler = ({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) => {
    ReactLeaflet.useMapEvents({
      click: (e: any) => {
        const { lat, lng } = e.latlng
        onLocationChange(lat, lng)
      },
    })
    return null
  }

  const MapUpdater = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
    const map = ReactLeaflet.useMap()
    const prevCenterRef = useRef<string>('')

    useEffect(() => {
      if (center && Array.isArray(center) && center.length === 2 && center[0] !== 0 && center[1] !== 0) {
        const centerKey = `${center[0]}-${center[1]}`

        if (prevCenterRef.current !== centerKey) {
          console.log('[MapUpdater] Updating map view to:', center, 'zoom:', zoom)
          prevCenterRef.current = centerKey

          try {
            map.flyTo(center, zoom, { duration: 1 })
          } catch (error) {
            console.error('[MapUpdater] Error updating map view:', error)
            try {
              map.setView(center, zoom, { animate: true, duration: 0.5 })
            } catch (e) {
              console.error('[MapUpdater] Error with setView:', e)
              map.setView(center, zoom)
            }
          }
        }
      }
    }, [map, center, zoom])

    return null
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Select your location on the map</p>
          <p className="text-xs text-gray-500">
            Click anywhere on the map to set your location
            {selectedLocation[0] !== 0 && selectedLocation[1] !== 0 && (
              <span className="ml-2 text-green-600">
                ✓ Location: {selectedLocation[0].toFixed(4)}, {selectedLocation[1].toFixed(4)}
              </span>
            )}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          {isGettingLocation ? 'Getting...' : 'Use My Location'}
        </Button>
      </div>

      {/* Error Message with Instructions */}
      {error && (
        <div className={`rounded-md text-sm ${
          errorType === 'permission' 
            ? 'bg-orange-50 border border-orange-200 text-orange-800' 
            : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
        }`}>
          <div className="px-3 py-2">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">{error}</p>
                
                {/* Instructions for Permission Denied */}
                {errorType === 'permission' && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowInstructions(!showInstructions)}
                      className="flex items-center gap-1 text-sm font-medium text-orange-700 hover:text-orange-800 mb-2"
                    >
                      {showInstructions ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Hide instructions
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show how to enable location access
                        </>
                      )}
                    </button>
                    
                    {showInstructions && (
                      <div className="mt-2 pl-4 border-l-2 border-orange-300 space-y-2 text-sm">
                        <div>
                          <p className="font-medium mb-1">Chrome/Edge:</p>
                          <ol className="list-decimal list-inside space-y-1 text-gray-700">
                            <li>Click the lock icon (🔒) or info icon (i) in the address bar</li>
                            <li>Find &quot;Location&quot; in the permissions list</li>
                            <li>Change it from &quot;Block&quot; to &quot;Allow&quot;</li>
                            <li>Refresh the page and try again</li>
                          </ol>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Firefox:</p>
                          <ol className="list-decimal list-inside space-y-1 text-gray-700">
                            <li>Click the lock icon in the address bar</li>
                            <li>Click &quot;More Information&quot;</li>
                            <li>Go to the &quot;Permissions&quot; tab</li>
                            <li>Find &quot;Access your location&quot; and click &quot;Allow&quot;</li>
                            <li>Refresh the page and try again</li>
                          </ol>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Safari:</p>
                          <ol className="list-decimal list-inside space-y-1 text-gray-700">
                            <li>Go to Safari → Settings → Websites → Location Services</li>
                            <li>Find this website and set it to &quot;Allow&quot;</li>
                            <li>Refresh the page and try again</li>
                          </ol>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          <strong>Note:</strong> You can also select your location by clicking on the map.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e5e7eb' }}>
        <MapContainer
          center={selectedLocation[0] !== 0 && selectedLocation[1] !== 0 ? selectedLocation : defaultMapCenter}
          zoom={selectedLocation[0] === 0 && selectedLocation[1] === 0 ? 7 : 15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater
            center={selectedLocation[0] !== 0 && selectedLocation[1] !== 0 ? selectedLocation : defaultMapCenter}
            zoom={selectedLocation[0] === 0 && selectedLocation[1] === 0 ? 7 : 15}
          />
          <MapClickHandler onLocationChange={handleMapClick} />
          {selectedLocation[0] !== 0 && selectedLocation[1] !== 0 && markerIcon && (
            <Marker
              key={`marker-${selectedLocation[0]}-${selectedLocation[1]}`}
              position={selectedLocation}
              icon={markerIcon}
            />
          )}
        </MapContainer>
      </div>
    </div>
  )
}

// Export with dynamic import to avoid SSR issues
const MapLocationPicker = dynamic(() => Promise.resolve(MapLocationPickerInternal), {
  ssr: false,
})

export default MapLocationPicker
