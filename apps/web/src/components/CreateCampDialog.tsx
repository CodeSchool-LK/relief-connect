"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Loader2, MapPin } from "lucide-react"
import { campService, helpRequestService } from "../services"
import {
  CampType,
  PeopleRange,
  CampNeed,
  ContactType,
  RationItemType,
} from "@nx-mono-repo-deployment-test/shared/src/enums"
import MapLocationPicker from "./MapLocationPicker"
import type { IHelpRequest } from "../types/help-request"

interface CampItem {
  itemType: RationItemType
  quantity: number
  notes?: string
}

interface DropOffLocation {
  name: string
  address?: string
  lat?: number
  lng?: number
  contactNumber?: string
  notes?: string
  dropOffStartDate?: string
  dropOffEndDate?: string
  dropOffStartTime?: string
  dropOffEndTime?: string
}

interface CreateCampDialogProps {
  isOpen: boolean
  onClose: () => void
  onCampCreated: () => void
}

const initialFormData = {
  name: "",
  lat: "7.8731",
  lng: "80.7718",
  campType: CampType.COMMUNITY,
  peopleRange: PeopleRange.ONE_TO_TEN,
  peopleCount: "",
  needs: [] as CampNeed[],
  shortNote: "",
  description: "",
  location: "",
  contactType: ContactType.PHONE,
  contact: "",
}

export default function CreateCampDialog({ isOpen, onClose, onCampCreated }: CreateCampDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [helpRequests, setHelpRequests] = useState<IHelpRequest[]>([])
  const [showMap, setShowMap] = useState(false)
  const [showDropOffMap, setShowDropOffMap] = useState<number | null>(null)

  const [formData, setFormData] = useState(initialFormData)
  const [items, setItems] = useState<CampItem[]>([])
  const [dropOffLocations, setDropOffLocations] = useState<DropOffLocation[]>([])
  const [selectedHelpRequests, setSelectedHelpRequests] = useState<number[]>([])
  const [selectedDonations, setSelectedDonations] = useState<number[]>([])

  useEffect(() => {
    if (isOpen) {
      loadHelpRequests()
    }
  }, [isOpen])

  const loadHelpRequests = async () => {
    try {
      const response = await helpRequestService.getAllHelpRequests()
      if (response.success && response.data) {
        setHelpRequests(response.data)
      }
    } catch (error) {
      console.error("Error loading help requests:", error)
    }
  }

  const handleNeedToggle = (need: CampNeed) => {
    setFormData((prev) => ({
      ...prev,
      needs: prev.needs.includes(need) ? prev.needs.filter((n) => n !== need) : [...prev.needs, need],
    }))
  }

  const addItem = () => {
    setItems([...items, { itemType: RationItemType.DRY_RATIONS, quantity: 1 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof CampItem, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const addDropOffLocation = () => {
    setDropOffLocations([...dropOffLocations, { name: "" }])
  }

  const removeDropOffLocation = (index: number) => {
    setDropOffLocations(dropOffLocations.filter((_, i) => i !== index))
  }

  const updateDropOffLocation = (index: number, field: keyof DropOffLocation, value: any) => {
    const updated = [...dropOffLocations]
    updated[index] = { ...updated[index], [field]: value }
    setDropOffLocations(updated)
  }

  const updateDropOffLocationCoordinates = (index: number, lat: number, lng: number) => {
    const updated = [...dropOffLocations]
    updated[index] = { ...updated[index], lat, lng }
    setDropOffLocations(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const validItems = items
        .filter((item) => item.itemType && item.quantity && item.quantity > 0)
        .map((item) => ({
          itemType: item.itemType,
          quantity: item.quantity,
          notes: item.notes || undefined,
        }))

      const campData = {
        name: formData.name.trim(),
        lat: Number.parseFloat(formData.lat),
        lng: Number.parseFloat(formData.lng),
        campType: formData.campType,
        peopleRange: formData.peopleRange,
        peopleCount: formData.peopleCount ? Number.parseInt(formData.peopleCount) : undefined,
        needs: formData.needs,
        shortNote: formData.shortNote.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        contactType: formData.contactType,
        contact: formData.contact.trim() || undefined,
        items: validItems.length > 0 ? validItems : undefined,
        dropOffLocations:
          dropOffLocations.length > 0
            ? dropOffLocations.map((loc) => ({
                name: loc.name.trim(),
                address: loc.address?.trim() || undefined,
                lat: loc.lat !== undefined && loc.lat !== null ? String(loc.lat) : undefined,
                lng: loc.lng !== undefined && loc.lng !== null ? String(loc.lng) : undefined,
                contactNumber: loc.contactNumber?.trim() || undefined,
                notes: loc.notes?.trim() || undefined,
                dropOffStartDate: loc.dropOffStartDate || undefined,
                dropOffEndDate: loc.dropOffEndDate || undefined,
                dropOffStartTime: loc.dropOffStartTime || undefined,
                dropOffEndTime: loc.dropOffEndTime || undefined,
              }))
            : undefined,
        helpRequestIds: selectedHelpRequests.length > 0 ? selectedHelpRequests : undefined,
        donationIds: selectedDonations.length > 0 ? selectedDonations : undefined,
      }

      const response = await campService.createCamp(campData)

      if (response.success && response.data) {
        // reset
        setFormData(initialFormData)
        setItems([])
        setDropOffLocations([])
        setSelectedHelpRequests([])
        setSelectedDonations([])
        onCampCreated()
      } else {
        setError(response.error || "Failed to create camp")
      }
    } catch (error) {
      console.error("Error creating camp:", error)
      setError("Failed to create camp")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData(initialFormData)
    setItems([])
    setDropOffLocations([])
    setSelectedHelpRequests([])
    setSelectedDonations([])
    setShowMap(false)
    setShowDropOffMap(null)
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Camp</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* basic info */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Camp Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                  className="h-11 border-gray-300 text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campType" className="text-base">
                  Camp Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="campType"
                  value={formData.campType}
                  onChange={(e) => setFormData({ ...formData, campType: e.target.value as CampType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-11 text-black"
                  required
                  disabled={loading}
                >
                  <option value={CampType.OFFICIAL}>Official</option>
                  <option value={CampType.COMMUNITY}>Community</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-3">
                <Label className="text-base">
                  Camp Location <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="lat" className="text-sm text-black">
                        Latitude
                      </Label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        value={formData.lat}
                        onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                        required
                        disabled={loading}
                        className="h-11 border-gray-300 text-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lng" className="text-sm text-black">
                        Longitude
                      </Label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        value={formData.lng}
                        onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                        required
                        disabled={loading}
                        className="h-11 border-gray-300 text-black"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMap(!showMap)}
                    className="w-full"
                    disabled={loading}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {showMap ? "Hide Map" : "Select Location on Map"}
                  </Button>
                  {showMap && (
                    <div className="p-2 border rounded-lg overflow-hidden">
                      <MapLocationPicker
                        initialLat={Number.parseFloat(formData.lat) || 7.8731}
                        initialLng={Number.parseFloat(formData.lng) || 80.7718}
                        onLocationChange={(lat, lng) => {
                          setFormData({
                            ...formData,
                            lat: lat.toString(),
                            lng: lng.toString(),
                          })
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-base">Location/Address</Label>
                <Input
                  id="location"
                  className="h-11 border-gray-300 text-black"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="peopleRange" className="text-base">
                  People Range <span className="text-red-500">*</span>
                </Label>
                <select
                  id="peopleRange"
                  value={formData.peopleRange}
                  onChange={(e) => setFormData({ ...formData, peopleRange: e.target.value as PeopleRange })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-11 text-black"
                  required
                  disabled={loading}
                >
                  <option value={PeopleRange.ONE_TO_TEN}>1-10</option>
                  <option value={PeopleRange.TEN_TO_FIFTY}>10-50</option>
                  <option value={PeopleRange.FIFTY_PLUS}>50+</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="peopleCount" className="text-base">Exact People Count</Label>
                <Input
                  id="peopleCount"
                  type="number"
                  min="1"
                  className="h-11 border-gray-300 text-black"
                  value={formData.peopleCount}
                  onChange={(e) => setFormData({ ...formData, peopleCount: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* needs */}
          <div className="border-t pt-6">
            <Label className="text-base">
              Camp Needs <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {Object.values(CampNeed).map((need) => (
                <label key={need} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needs.includes(need)}
                    onChange={() => handleNeedToggle(need)}
                    disabled={loading}
                    className="rounded"
                  />
                  <span>{need}</span>
                </label>
              ))}
            </div>
          </div>

          {/* description */}
          <div className="border-t pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shortNote" className="text-base">
                Short Note <span className="text-red-500">*</span>
              </Label>
              <Input
                id="shortNote"
                value={formData.shortNote}
                onChange={(e) => setFormData({ ...formData, shortNote: e.target.value })}
                maxLength={500}
                required
                disabled={loading}
                className="h-11 border-gray-300 text-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">
                Detailed Description
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                disabled={loading}
              />
            </div>
          </div>

          {/* contact */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactType" className="text-base">
                  Contact Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="contactType"
                  value={formData.contactType}
                  onChange={(e) => setFormData({ ...formData, contactType: e.target.value as ContactType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-11 text-black"
                  required
                  disabled={loading}
                >
                  <option value={ContactType.PHONE}>Phone</option>
                  <option value={ContactType.WHATSAPP}>WhatsApp</option>
                  <option value={ContactType.NONE}>None</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact" className="text-base">Contact</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  disabled={loading}
                  className="h-11 border-gray-300 text-black"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6 flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Camp"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
