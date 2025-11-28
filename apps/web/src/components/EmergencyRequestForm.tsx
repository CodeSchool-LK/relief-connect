import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'apps/web/src/components/ui/card'
import { Button } from 'apps/web/src/components/ui/button'
import { Input } from 'apps/web/src/components/ui/input'
import { Label } from 'apps/web/src/components/ui/label'
import { Textarea } from 'apps/web/src/components/ui/textarea'
// import LocationPicker from './LocationPicker' // Temporarily disabled - will integrate later
import { ICreateHelpRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request/ICreateHelpRequest'
import {
  HelpRequestCategory,
  Urgency,
  ContactType,
} from '@nx-mono-repo-deployment-test/shared/src/enums'
import { Minus, Plus, MapPin } from 'lucide-react'

interface EmergencyRequestFormProps {
  onSubmit: (data: ICreateHelpRequest) => Promise<{ success: boolean; data?: any; error?: string }>
  onCancel?: () => void
  isGroup?: boolean
}

type FormStep = 1 | 2 | 3

interface FormData {
  name: string
  contactNumber: string
  requestType: 'family' | 'camp'
  elders: number
  children: number
  pets: number
  gpsLocation: { lat: number; lng: number }
  notes: string
  rationItems: Record<string, boolean>
  specialNeeds: string
  urgent: boolean
}

const RATION_ITEMS = [
  { id: 'dry_rations', label: 'Dry rations (rice, dhal, canned food)', icon: '🍚' },
  { id: 'ready_meals', label: 'Ready‑to‑eat meals', icon: '🍱' },
  { id: 'milk_powder', label: 'Milk powder / baby food', icon: '🥛' },
  { id: 'bottled_water', label: 'Bottled water', icon: '💧' },
  { id: 'first_aid', label: 'First aid kit', icon: '🩹' },
  { id: 'medicines', label: 'Basic medicines (Panadol / ORS)', icon: '💊' },
  { id: 'mosquito_repellent', label: 'Mosquito repellent', icon: '🦟' },
  { id: 'hygiene', label: 'Soap / toothpaste / toothbrush', icon: '🧴' },
  { id: 'sanitary_pads', label: 'Sanitary pads', icon: '🩹' },
  { id: 'baby_diapers', label: 'Baby diapers', icon: '👶' },
  { id: 'disinfectant', label: 'Disinfectant / cleaning liquid', icon: '🧽' },
  { id: 'clothes', label: 'Clothes', icon: '👕' },
  { id: 'blankets', label: 'Blankets', icon: '🛏️' },
  { id: 'towels', label: 'Towels', icon: '🧺' },
  { id: 'temporary_shelters', label: 'Temporary shelters', icon: '⛺' },
  { id: 'polythene_sheets', label: 'Polythene sheets', icon: '📦' },
  { id: 'flashlights', label: 'Flashlights', icon: '🔦' },
]

export default function EmergencyRequestForm({
  onSubmit,
  onCancel,
  isGroup = false,
}: EmergencyRequestFormProps) {
  const router = useRouter()
  const { t } = useTranslation('common')
  const [currentStep, setCurrentStep] = useState<FormStep>(1)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    contactNumber: '',
    requestType: 'family',
    elders: 0,
    children: 0,
    pets: 0,
    gpsLocation: { lat: 7.8731, lng: 80.7718 },
    notes: '',
    rationItems: {},
    specialNeeds: '',
    urgent: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData({ ...formData, gpsLocation: { lat, lng } })
  }

  const toggleRationItem = (itemId: string) => {
    setFormData({
      ...formData,
      rationItems: {
        ...formData.rationItems,
        [itemId]: !formData.rationItems[itemId],
      },
    })
  }

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!formData.name.trim()) {
        setError(t('nameIsRequired'))
        return
      }
      if (!formData.contactNumber.trim()) {
        setError(t('contactNumberIsRequired'))
        return
      }
      if (!formData.gpsLocation.lat || !formData.gpsLocation.lng) {
        setError(t('gpsLocationIsRequired'))
        return
      }
    }
    if (currentStep === 2) {
      // Check if at least one ration item is selected
      const hasItems = Object.values(formData.rationItems).some((selected) => selected === true)
      if (!hasItems) {
        setError('Please select at least one item')
        return
      }
    }
    setError(null)
    setCurrentStep((prev) => (prev + 1) as FormStep)
  }

  const handleBack = () => {
    setError(null)
    if (currentStep === 1) {
      if (onCancel) {
        onCancel()
      } else {
        router.push('/')
      }
    } else {
      setCurrentStep((prev) => (prev - 1) as FormStep)
    }
  }

  const handlePublish = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const totalPeople =
        formData.elders + formData.children + (formData.requestType === 'family' ? 1 : 0)
      const rationItemsList = Object.entries(formData.rationItems)
        .filter(([_, selected]) => selected === true)
        .map(([id]) => {
          const item = RATION_ITEMS.find((i) => i.id === id)
          return item ? item.label : ''
        })
        .filter(Boolean)
        .join(', ')

      const specialNeedsText = formData.specialNeeds.trim()
        ? ` Special Needs: ${formData.specialNeeds}`
        : ''

      const helpRequestData: ICreateHelpRequest = {
        lat: formData.gpsLocation.lat,
        lng: formData.gpsLocation.lng,
        category:
          formData.rationItems.dry_rations ||
          formData.rationItems.ready_meals ||
          formData.rationItems.milk_powder ||
          formData.rationItems.bottled_water
            ? HelpRequestCategory.FOOD_WATER
            : HelpRequestCategory.OTHER,
        urgency: formData.urgent ? Urgency.HIGH : Urgency.MEDIUM,
        shortNote:
          formData.notes ||
          `Name: ${formData.name}, People: ${totalPeople}${formData.children > 0 ? `, Kids: ${formData.children}` : ''}${formData.elders > 0 ? `, Elders: ${formData.elders}` : ''}${formData.pets > 0 ? `, Pets: ${formData.pets}` : ''}. Items: ${rationItemsList}${specialNeedsText}`,
        approxArea: `${formData.gpsLocation.lat}, ${formData.gpsLocation.lng}`,
        contactType: ContactType.PHONE,
        contact: formData.contactNumber,
      }

      const response = await onSubmit(helpRequestData)

      if (response.success && response.data?.id) {
        setRequestId(response.data.id.toString())
        setCurrentStep(3)
      } else {
        setError(response.error || 'Failed to submit request. Please try again.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit request'
      setError(errorMessage)
      console.error('Error submitting request:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDontPublish = () => {
    router.push('/')
  }

  // Step 1: Personal Information & Location
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 pb-20">
        <div className="max-w-md mx-auto">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {t('step')} 1 {t('of')} 3
              </span>
              <span className="text-sm text-gray-500">33%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '33%' }}></div>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{t('personalInformation')}</CardTitle>
              <CardDescription>{t('enterYourDetailsAndLocation')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('name')}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">{t('contactNumber')} *</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="0771234567"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('areYouRequestingForMultiplePeople')}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.requestType === 'family' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, requestType: 'family' })}
                    className="flex-1"
                  >
                    {t('individual')}
                  </Button>
                  <Button
                    type="button"
                    variant={formData.requestType === 'camp' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, requestType: 'camp' })}
                    className="flex-1"
                  >
                    {t('multiplePeople')}
                  </Button>
                </div>
              </div>

              {formData.requestType === 'camp' && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">{t('elders')}</Label>
                        <p className="text-sm text-gray-500">{t('adults')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setFormData({ ...formData, elders: Math.max(0, formData.elders - 1) })
                          }
                          disabled={formData.elders === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-semibold w-8 text-center">
                          {formData.elders}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setFormData({ ...formData, elders: formData.elders + 1 })}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">{t('childrenLabel')}</Label>
                        <p className="text-sm text-gray-500">{t('under18Years')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              children: Math.max(0, formData.children - 1),
                            })
                          }
                          disabled={formData.children === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-semibold w-8 text-center">
                          {formData.children}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setFormData({ ...formData, children: formData.children + 1 })
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">{t('pets')}</Label>
                        <p className="text-sm text-gray-500">{t('numberOfPets')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setFormData({ ...formData, pets: Math.max(0, formData.pets - 1) })
                          }
                          disabled={formData.pets === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-semibold w-8 text-center">
                          {formData.pets}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setFormData({ ...formData, pets: formData.pets + 1 })}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label>{t('gpsLocation')} *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="latitude" className="text-xs">
                      {t('latitude')}
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.gpsLocation.lat}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gpsLocation: {
                            ...formData.gpsLocation,
                            lat: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      placeholder="7.8731"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="longitude" className="text-xs">
                      {t('longitude')}
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.gpsLocation.lng}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gpsLocation: {
                            ...formData.gpsLocation,
                            lng: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      placeholder="80.7718"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          handleLocationChange(position.coords.latitude, position.coords.longitude)
                        },
                        () => {
                          alert(t('unableToGetLocation'))
                        }
                      )
                    } else {
                      alert(t('geolocationNotSupported'))
                    }
                  }}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {t('getCurrentLocation')}
                </Button>
                <p className="text-xs text-gray-500">{t('orEnterCoordinatesManually')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">
                  {t('notes')} ({t('optional')})
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('anyAdditionalInformation')}
                  rows={5}
                  className="w-full"
                />
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  {t('previous')}
                </Button>
                <Button type="button" onClick={handleNext} className="flex-1">
                  {t('next')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Step 2: Ration Items Selection
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 pb-20">
        <div className="max-w-md mx-auto">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {t('step')} 2 {t('of')} 3
              </span>
              <span className="text-sm text-gray-500">67%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '67%' }}></div>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{t('rationItems')}</CardTitle>
              <CardDescription>{t('selectItemsYouNeed')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                {RATION_ITEMS.map((item) => {
                  const isSelected = formData.rationItems[item.id] || false
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleRationItem(item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRationItem(item.id)}
                        className="w-5 h-5 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-2xl">{item.icon}</span>
                      <Label className="text-base font-medium cursor-pointer flex-1">
                        {item.label}
                      </Label>
                    </div>
                  )
                })}
              </div>

              <div className="pt-4 border-t">
                <Label htmlFor="specialNeeds" className="text-base font-semibold mb-2 block">
                  Special Needs (Optional)
                </Label>
                <textarea
                  id="specialNeeds"
                  value={formData.specialNeeds}
                  onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                  placeholder="Please specify any special requirements or additional needs..."
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-y"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={formData.urgent}
                    onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="urgent" className="cursor-pointer">
                    {t('urgent')} (e.g., medical emergency)
                  </Label>
                </div>
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  {t('previous')}
                </Button>
                <Button type="button" onClick={handleNext} className="flex-1">
                  {t('next')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Step 3: Confirmation & Success
  if (currentStep === 3) {
    const totalPeople =
      formData.elders + formData.children + (formData.requestType === 'family' ? 1 : 0)
    const selectedItems = Object.entries(formData.rationItems)
      .filter(([_, selected]) => selected === true)
      .map(([id]) => {
        const item = RATION_ITEMS.find((i) => i.id === id)
        return item ? item.label : ''
      })
      .filter(Boolean)

    if (requestId) {
      // Success screen
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 pb-20">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-center">
                  Donation Request Form Submit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-5xl">✅</div>
                  <div className="text-xl font-bold text-green-600">Form submission Success</div>
                  <div className="text-base text-gray-700">
                    Your form submitted successfully. Hope you&apos;ll get help soon.
                  </div>
                  <div className="text-base font-medium text-gray-900">
                    Emergency Support: <span className="text-primary">117</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="w-full"
                  >
                    {t('goToYourRequest')}
                  </Button>
                  <Button type="button" onClick={() => router.push('/')} className="w-full">
                    {t('seeAllRequests')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    // Confirmation screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 pb-20">
        <div className="max-w-md mx-auto">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Step 3 of 3</span>
              <span className="text-sm text-gray-500">100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{t('confirmData')}</CardTitle>
              <CardDescription>{t('reviewYourRequestDetails')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Help needed:</div>
                <div className="space-y-1 pl-4 text-sm">
                  {selectedItems.length > 0 && (
                    <div>
                      <div className="font-medium mb-1">Selected Items:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {formData.specialNeeds.trim() && (
                    <div>
                      <div className="font-medium mb-1">Special Needs:</div>
                      <div className="text-gray-700">{formData.specialNeeds}</div>
                    </div>
                  )}
                  {formData.children > 0 && <div>• Kids count ({formData.children} kids)</div>}
                  {formData.elders > 0 && <div>• Adults count ({formData.elders} adults)</div>}
                  <div>
                    • Location ({formData.gpsLocation.lat.toFixed(4)},{' '}
                    {formData.gpsLocation.lng.toFixed(4)})
                  </div>
                  {formData.urgent && <div>• Urgent (Medical emergency)</div>}
                  {formData.contactNumber && <div>• Contact number ({formData.contactNumber})</div>}
                  {formData.notes ? (
                    <div>• Additional notes: {formData.notes}</div>
                  ) : (
                    <div>• Additional notes: (No description)</div>
                  )}
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="text-center text-lg font-medium">
                  {t('areYouSureYouWantToPublish')}
                </div>

                {error && <div className="text-red-600 text-sm text-center">{error}</div>}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDontPublish}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {t('dontPublish')}
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? t('publishing') : t('publishRequest')}
                  </Button>
                </div>
              </div>

              <Button type="button" variant="ghost" onClick={handleBack} className="w-full">
                {t('previous')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
