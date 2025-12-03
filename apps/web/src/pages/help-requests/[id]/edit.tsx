import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { helpRequestService } from '../../../services';
import { HelpRequestWithOwnershipResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_with_ownership_response_dto';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  Plus, 
  Minus, 
  Save
} from 'lucide-react';
import { Urgency, ContactType, HelpRequestStatus, RationItemType } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { RATION_ITEMS_METADATA } from '@nx-mono-repo-deployment-test/shared/src/enums/ration-item.enum';
import MapLocationPicker from '../../../components/MapLocationPicker';
import { ICreateHelpRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request/ICreateHelpRequest';

export default function EditHelpRequestPage() {
  const router = useRouter();
  const { id, from } = router.query;
  const { isAuthenticated, isAdmin, isVolunteerClub, loading: authLoading } = useAuth();
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [helpRequest, setHelpRequest] = useState<HelpRequestWithOwnershipResponseDto | null>(null);
  
  const [formData, setFormData] = useState({
    lat: 7.8731,
    lng: 80.7718,
    urgency: Urgency.MEDIUM,
    shortNote: '',
    approxArea: '',
    contactType: ContactType.PHONE,
    contact: '',
    name: '',
    totalPeople: '',
    elders: '',
    children: '',
    pets: '',
    status: HelpRequestStatus.OPEN,
    rationItems: {} as Record<string, number>,
  });

  const [showMap, setShowMap] = useState(false);

  const loadHelpRequestData = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      setError('Invalid help request ID');
      setInitialLoading(false);
      return;
    }

    const helpRequestId = parseInt(id, 10);
    if (isNaN(helpRequestId)) {
      setError('Invalid help request ID');
      setInitialLoading(false);
      return;
    }

    setInitialLoading(true);
    setError(null);

    try {
      const response = await helpRequestService.getHelpRequestById(helpRequestId);
      
      if (response.success && response.data) {
        const hr = response.data;
        setHelpRequest(hr);
        
        // Load inventory items to populate rationItems
        // Note: The DTO uses 'inventory' property, not 'inventoryItems'
        const itemsMap: Record<string, number> = {};
        if (hr.inventory && hr.inventory.length > 0) {
          hr.inventory.forEach(item => {
            // itemName should be the item code (e.g., 'dry_rations')
            itemsMap[item.itemName] = item.quantityNeeded;
          });
        }
        
        console.log('[EditHelpRequest] Loaded inventory items:', hr.inventory);
        console.log('[EditHelpRequest] Mapped ration items:', itemsMap);
        
        // Populate form with existing data (including rationItems)
        setFormData({
          lat: typeof hr.lat === 'number' ? hr.lat : parseFloat(hr.lat as any) || 7.8731,
          lng: typeof hr.lng === 'number' ? hr.lng : parseFloat(hr.lng as any) || 80.7718,
          urgency: hr.urgency,
          shortNote: hr.shortNote || '',
          approxArea: hr.approxArea || '',
          contactType: hr.contactType,
          contact: hr.contact || '',
          name: hr.name || '',
          totalPeople: hr.totalPeople?.toString() || '',
          elders: hr.elders?.toString() || '',
          children: hr.children?.toString() || '',
          pets: hr.pets?.toString() || '',
          status: hr.status || HelpRequestStatus.OPEN,
          rationItems: itemsMap,
        });
      } else {
        setError(response.error || 'Failed to load help request');
      }
    } catch (err) {
      console.error('Error loading help request:', err);
      setError('Failed to load help request');
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || (!isAdmin() && !isVolunteerClub())) {
        router.push('/login');
        return;
      }
      loadHelpRequestData();
    }
  }, [authLoading, isAuthenticated, isAdmin, isVolunteerClub, router, loadHelpRequestData]);

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData({ ...formData, lat, lng });
    // Don't hide the map - let user continue selecting if needed
  };

  const toggleRationItem = (itemCode: string) => {
    const currentQuantity = formData.rationItems[itemCode] || 0;
    setFormData({
      ...formData,
      rationItems: {
        ...formData.rationItems,
        [itemCode]: currentQuantity > 0 ? 0 : 1,
      },
    });
  };

  const updateRationItemQuantity = (itemCode: string, quantity: number) => {
    setFormData({
      ...formData,
      rationItems: {
        ...formData.rationItems,
        [itemCode]: Math.max(0, quantity),
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Prepare update data
      const updateData: Partial<ICreateHelpRequest> = {
        lat: formData.lat,
        lng: formData.lng,
        urgency: formData.urgency,
        shortNote: formData.shortNote.trim(),
        approxArea: formData.approxArea.trim(),
        contactType: formData.contactType,
        contact: formData.contact?.trim() || undefined,
        name: formData.name?.trim() || undefined,
        totalPeople: formData.totalPeople ? parseInt(formData.totalPeople, 10) : undefined,
        elders: formData.elders ? parseInt(formData.elders, 10) : undefined,
        children: formData.children ? parseInt(formData.children, 10) : undefined,
        pets: formData.pets ? parseInt(formData.pets, 10) : undefined,
        rationItems: Object.keys(formData.rationItems).length > 0 
          ? Object.fromEntries(
              Object.entries(formData.rationItems).filter(([_, qty]) => qty > 0)
            )
          : undefined,
      };

      // Add status to update data (it's not in ICreateHelpRequest but is in UpdateHelpRequestDto)
      const updatePayload = {
        ...updateData,
        status: formData.status,
      } as any;

      const response = await helpRequestService.updateHelpRequest(
        parseInt(id as string, 10),
        updatePayload
      );

      if (response.success) {
        // Navigate back based on where user came from
        if (from === 'admin') {
          router.push('/admin/help-requests');
        } else if (from === 'dashboard' || from === 'club') {
          router.push('/clubs/dashboard');
        } else if (from === 'detail' && id) {
          router.push(`/request/${id}`);
        } else {
          router.push(`/request/${id}`);
        }
      } else {
        setError(response.error || 'Failed to update help request');
      }
    } catch (err) {
      console.error('Error updating help request:', err);
      setError(err instanceof Error ? err.message : 'Failed to update help request');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error && !helpRequest) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Convert RATION_ITEMS_METADATA array to entries with code as key
  const rationItemEntries = RATION_ITEMS_METADATA.map(item => [item.code, item] as [RationItemType, typeof item]);

  return (
    <>
      <Head>
        <title>Edit Help Request</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                // Navigate back based on where user came from
                if (from === 'admin') {
                  router.push('/admin/help-requests');
                } else if (from === 'dashboard' || from === 'club') {
                  router.push('/clubs/dashboard');
                } else if (from === 'detail' && id) {
                  router.push(`/request/${id}`);
                } else if (id) {
                  router.push(`/request/${id}`);
                } else {
                  router.back();
                }
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Edit Help Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as HelpRequestStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    {Object.values(HelpRequestStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Urgency */}
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency *</Label>
                  <select
                    id="urgency"
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as Urgency })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    {Object.values(Urgency).map((urgency) => (
                      <option key={urgency} value={urgency}>
                        {urgency}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="any"
                        value={formData.lat}
                        onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                        placeholder="Latitude"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="any"
                        value={formData.lng}
                        onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                        placeholder="Longitude"
                        className="flex-1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMap(!showMap)}
                      className="w-full"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {showMap ? 'Hide Map' : 'Select Location on Map'}
                    </Button>
                    {showMap && (
                      <div className="border rounded-md overflow-hidden">
                        <MapLocationPicker
                          onLocationChange={handleLocationChange}
                          initialLat={formData.lat}
                          initialLng={formData.lng}
                          height="400px"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Approximate Area */}
                <div className="space-y-2">
                  <Label htmlFor="approxArea">Approximate Area *</Label>
                  <Input
                    id="approxArea"
                    value={formData.approxArea}
                    onChange={(e) => setFormData({ ...formData, approxArea: e.target.value })}
                    placeholder="e.g., Colombo, Galle"
                    required
                  />
                </div>

                {/* Short Note */}
                <div className="space-y-2">
                  <Label htmlFor="shortNote">Short Note * (max 160 characters)</Label>
                  <Textarea
                    id="shortNote"
                    value={formData.shortNote}
                    onChange={(e) => setFormData({ ...formData, shortNote: e.target.value })}
                    maxLength={160}
                    rows={3}
                    required
                  />
                  <p className="text-sm text-gray-500">{formData.shortNote.length}/160 characters</p>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactType">Contact Type *</Label>
                    <select
                      id="contactType"
                      value={formData.contactType}
                      onChange={(e) => setFormData({ ...formData, contactType: e.target.value as ContactType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      {Object.values(ContactType).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact</Label>
                    <Input
                      id="contact"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      placeholder="Phone number or email"
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Requester Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Name of the person requesting help"
                  />
                </div>

                {/* People Counts */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalPeople">Total People</Label>
                    <Input
                      id="totalPeople"
                      type="number"
                      min="0"
                      value={formData.totalPeople}
                      onChange={(e) => setFormData({ ...formData, totalPeople: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="elders">Elders</Label>
                    <Input
                      id="elders"
                      type="number"
                      min="0"
                      value={formData.elders}
                      onChange={(e) => setFormData({ ...formData, elders: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="children">Children</Label>
                    <Input
                      id="children"
                      type="number"
                      min="0"
                      value={formData.children}
                      onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pets">Pets</Label>
                    <Input
                      id="pets"
                      type="number"
                      min="0"
                      value={formData.pets}
                      onChange={(e) => setFormData({ ...formData, pets: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Ration Items */}
                <div className="space-y-2">
                  <Label>Ration Items</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 border rounded-md">
                    {rationItemEntries.map(([itemCode, metadata]) => {
                      const quantity = formData.rationItems[itemCode] || 0;
                      const isSelected = quantity > 0;
                      return (
                        <div
                          key={itemCode}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRationItem(itemCode)}
                            className="w-5 h-5 cursor-pointer"
                          />
                          <Label className="flex-1 cursor-pointer">{metadata.label}</Label>
                          {isSelected && (
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateRationItemQuantity(itemCode, quantity - 1)}
                                disabled={quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => {
                                  const newQuantity = parseInt(e.target.value, 10) || 1;
                                  updateRationItemQuantity(itemCode, newQuantity);
                                }}
                                className="w-16 text-center"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateRationItemQuantity(itemCode, quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Navigate back based on where user came from
                      if (from === 'admin') {
                        router.push('/admin/help-requests');
                      } else if (from === 'dashboard' || from === 'club') {
                        router.push('/clubs/dashboard');
                      } else if (from === 'detail' && id) {
                        router.push(`/request/${id}`);
                      } else if (id) {
                        router.push(`/request/${id}`);
                      } else {
                        router.back();
                      }
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

