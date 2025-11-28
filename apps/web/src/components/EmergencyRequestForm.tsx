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
  rationItems: Record<string, number>
  urgent: boolean
}

const RATION_ITEMS = [
  { id: 'food', label: 'Food & Water', icon: '🍞' },
  { id: 'torch', label: 'Torch', icon: '🔦' },
  { id: 'candle', label: 'Candle', icon: '🕯️' },
  { id: 'matches', label: 'Matches', icon: '🔥' },
  { id: 'tissues', label: 'Tissues', icon: '🧻' },
  { id: 'canned', label: 'Canned Foods', icon: '🥫' },
  { id: 'noodles', label: 'Noodles', icon: '🍜' },
  { id: 'diary', label: 'Diary', icon: '📔' },
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
    urgent: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData({ ...formData, gpsLocation: { lat, lng } })
  }

  const updateRationItem = (itemId: string, delta: number) => {
    setFormData({
      ...formData,
      rationItems: {
        ...formData.rationItems,
        [itemId]: Math.max(0, (formData.rationItems[itemId] || 0) + delta),
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
      const hasItems = Object.values(formData.rationItems).some((count) => count > 0)
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
        .filter(([_, count]) => count > 0)
        .map(([id, count]) => {
          const item = RATION_ITEMS.find((i) => i.id === id)
          return item ? `${item.label} (${count})` : ''
        })
        .filter(Boolean)
        .join(', ')

      const helpRequestData: ICreateHelpRequest = {
        lat: formData.gpsLocation.lat,
        lng: formData.gpsLocation.lng,
        category:
          formData.rationItems.food || formData.rationItems.water
            ? HelpRequestCategory.FOOD_WATER
            : HelpRequestCategory.OTHER,
        urgency: formData.urgent ? Urgency.HIGH : Urgency.MEDIUM,
        shortNote:
          formData.notes ||
          `Name: ${formData.name}, People: ${totalPeople}${formData.children > 0 ? `, Kids: ${formData.children}` : ''}${formData.elders > 0 ? `, Elders: ${formData.elders}` : ''}${formData.pets > 0 ? `, Pets: ${formData.pets}` : ''}. Items: ${rationItemsList}`,
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
              {RATION_ITEMS.map((item) => {
                const count = formData.rationItems[item.id] || 0
                return (
                  <Card key={item.id} className="bg-gray-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <Label className="text-base font-medium">{item.label}</Label>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => updateRationItem(item.id, -1)}
                            disabled={count === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-lg font-semibold w-8 text-center">{count}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => updateRationItem(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

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
      .filter(([_, count]) => count > 0)
      .map(([id, count]) => {
        const item = RATION_ITEMS.find((i) => i.id === id)
        return item ? `${item.label} (${count})` : ''
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
                  {selectedItems.includes('Food & Water') && <div>• Requested food & water</div>}
                  {selectedItems.length > 0 && <div>• Req items ({selectedItems.join(', ')})</div>}
                  {formData.children > 0 && <div>• Kids count ({formData.children} kids)</div>}
                  {formData.elders > 0 && <div>• Adults count ({formData.elders} adults)</div>}
                  <div>
                    • Location ({formData.gpsLocation.lat}, {formData.gpsLocation.lng})
                  </div>
                  {formData.urgent && <div>• Urgent (Medical emergency)</div>}
                  {formData.contactNumber && <div>• Contact number ({formData.contactNumber})</div>}
                  {formData.notes ? (
                    <div>• Add notes ({formData.notes})</div>
                  ) : (
                    <div>• Add notes (No description)</div>
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
