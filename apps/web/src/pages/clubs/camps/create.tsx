import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { campService, helpRequestService, donationService } from '../../../services';
import { IHelpRequest } from '../../../types/help-request';
import { DonationWithDonatorResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation/response/donation_with_donator_response_dto';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  Plus, 
  X, 
  Users,
  Package,
  Save
} from 'lucide-react';
import { CampType, PeopleRange, CampNeed, ContactType, RationItemType } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { RATION_ITEMS_METADATA } from '@nx-mono-repo-deployment-test/shared/src/enums/ration-item.enum';
import MapLocationPicker from '../../../components/MapLocationPicker';

interface CampItem {
  itemType: RationItemType;
  quantity: number;
  notes?: string;
}

interface DropOffLocation {
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  contactNumber?: string;
  notes?: string;
}

export default function CreateCampPage() {
  const router = useRouter();
  const { isAuthenticated, isVolunteerClub, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [helpRequests, setHelpRequests] = useState<IHelpRequest[]>([]);
  const [donations, setDonations] = useState<DonationWithDonatorResponseDto[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    lat: '7.8731',
    lng: '80.7718',
    campType: CampType.COMMUNITY,
    peopleRange: PeopleRange.ONE_TO_TEN,
    peopleCount: '',
    needs: [] as CampNeed[],
    shortNote: '',
    description: '',
    location: '',
    contactType: ContactType.Phone,
    contact: '',
  });

  const [showMap, setShowMap] = useState(false);
  const [showDropOffMap, setShowDropOffMap] = useState<number | null>(null); // Track which drop-off location map is showing

  const [items, setItems] = useState<CampItem[]>([]);
  const [dropOffLocations, setDropOffLocations] = useState<DropOffLocation[]>([]);
  const [selectedHelpRequests, setSelectedHelpRequests] = useState<number[]>([]);
  const [selectedDonations, setSelectedDonations] = useState<number[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !isVolunteerClub()) {
      router.push('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, isVolunteerClub, authLoading, router]);

  const loadData = async () => {
    try {
      const [helpRequestsResponse, donationsResponse] = await Promise.all([
        helpRequestService.getAllHelpRequests(),
        // For donations, we'll load them from help requests
        Promise.resolve({ success: true, data: [] as DonationWithDonatorResponseDto[] }),
      ]);

      if (helpRequestsResponse.success && helpRequestsResponse.data) {
        setHelpRequests(helpRequestsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleNeedToggle = (need: CampNeed) => {
    setFormData(prev => ({
      ...prev,
      needs: prev.needs.includes(need)
        ? prev.needs.filter(n => n !== need)
        : [...prev.needs, need],
    }));
  };

  const addItem = () => {
    setItems([...items, { itemType: RationItemType.DRY_RATIONS, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof CampItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addDropOffLocation = () => {
    setDropOffLocations([...dropOffLocations, { name: '' }]);
  };

  const removeDropOffLocation = (index: number) => {
    setDropOffLocations(dropOffLocations.filter((_, i) => i !== index));
  };

  const updateDropOffLocation = (index: number, field: keyof DropOffLocation, value: any) => {
    const updated = [...dropOffLocations];
    updated[index] = { ...updated[index], [field]: value };
    setDropOffLocations(updated);
  };

  const updateDropOffLocationCoordinates = (index: number, lat: number, lng: number) => {
    const updated = [...dropOffLocations];
    updated[index] = { ...updated[index], lat, lng };
    setDropOffLocations(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Filter out items without valid itemType and ensure all required fields are present
      const validItems = items
        .filter(item => item.itemType && item.quantity && item.quantity > 0)
        .map(item => ({
          itemType: item.itemType,
          quantity: item.quantity,
          notes: item.notes || undefined,
        }));

      const campData = {
        name: formData.name.trim(),
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        campType: formData.campType,
        peopleRange: formData.peopleRange,
        peopleCount: formData.peopleCount ? parseInt(formData.peopleCount) : undefined,
        needs: formData.needs,
        shortNote: formData.shortNote.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        contactType: formData.contactType,
        contact: formData.contact.trim() || undefined,
        items: validItems.length > 0 ? validItems : undefined,
        dropOffLocations: dropOffLocations.length > 0 ? dropOffLocations.map(loc => ({
          name: loc.name.trim(),
          address: loc.address?.trim() || undefined,
          lat: loc.lat !== undefined && loc.lat !== null ? String(loc.lat) : undefined,
          lng: loc.lng !== undefined && loc.lng !== null ? String(loc.lng) : undefined,
          contactNumber: loc.contactNumber?.trim() || undefined,
          notes: loc.notes?.trim() || undefined,
        })) : undefined,
        helpRequestIds: selectedHelpRequests.length > 0 ? selectedHelpRequests : undefined,
        donationIds: selectedDonations.length > 0 ? selectedDonations : undefined,
      };

      const response = await campService.createCamp(campData);

      if (response.success && response.data) {
        router.push('/clubs/dashboard');
      } else {
        setError(response.error || 'Failed to create camp');
      }
    } catch (error) {
      console.error('Error creating camp:', error);
      setError('Failed to create camp');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!isAuthenticated || !isVolunteerClub()) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Create Camp - Volunteer Club</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/clubs/dashboard">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create New Camp</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Camp Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="campType">Camp Type <span className="text-red-500">*</span></Label>
                      <select
                        id="campType"
                        value={formData.campType}
                        onChange={(e) => setFormData({ ...formData, campType: e.target.value as CampType })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                        disabled={loading}
                      >
                        <option value={CampType.OFFICIAL}>Official</option>
                        <option value={CampType.COMMUNITY}>Community</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <Label>Camp Location <span className="text-red-500">*</span></Label>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="lat" className="text-xs text-gray-600">Latitude</Label>
                            <Input
                              id="lat"
                              type="number"
                              step="any"
                              value={formData.lat}
                              onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                              placeholder="e.g., 6.9271"
                              required
                              disabled={loading}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lng" className="text-xs text-gray-600">Longitude</Label>
                            <Input
                              id="lng"
                              type="number"
                              step="any"
                              value={formData.lng}
                              onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                              placeholder="e.g., 79.8612"
                              required
                              disabled={loading}
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
                          {showMap ? 'Hide Map' : 'Select Location on Map'}
                        </Button>
                        {showMap && (
                          <div className="border rounded-lg overflow-hidden">
                            <MapLocationPicker
                              initialLat={parseFloat(formData.lat) || 7.8731}
                              initialLng={parseFloat(formData.lng) || 80.7718}
                              onLocationChange={(lat, lng) => {
                                setFormData({
                                  ...formData,
                                  lat: lat.toString(),
                                  lng: lng.toString(),
                                });
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="location">Location/Address</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Address or location description"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="peopleRange">People Range <span className="text-red-500">*</span></Label>
                      <select
                        id="peopleRange"
                        value={formData.peopleRange}
                        onChange={(e) => setFormData({ ...formData, peopleRange: e.target.value as PeopleRange })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                        disabled={loading}
                      >
                        <option value={PeopleRange.ONE_TO_TEN}>1-10</option>
                        <option value={PeopleRange.TEN_TO_FIFTY}>10-50</option>
                        <option value={PeopleRange.FIFTY_PLUS}>50+</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="peopleCount">Exact People Count</Label>
                      <Input
                        id="peopleCount"
                        type="number"
                        min="1"
                        value={formData.peopleCount}
                        onChange={(e) => setFormData({ ...formData, peopleCount: e.target.value })}
                        placeholder="Exact number of people"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Needs */}
                <div className="border-t pt-6">
                  <Label>Camp Needs <span className="text-red-500">*</span></Label>
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

                {/* Description */}
                <div className="border-t pt-6">
                  <Label htmlFor="shortNote">Short Note <span className="text-red-500">*</span></Label>
                  <Input
                    id="shortNote"
                    value={formData.shortNote}
                    onChange={(e) => setFormData({ ...formData, shortNote: e.target.value })}
                    placeholder="Brief description (max 500 characters)"
                    maxLength={500}
                    required
                    disabled={loading}
                  />

                  <Label htmlFor="description" className="mt-4">Detailed Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="More detailed description of the camp"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={loading}
                  />
                </div>

                {/* Contact */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactType">Contact Type <span className="text-red-500">*</span></Label>
                      <select
                        id="contactType"
                        value={formData.contactType}
                        onChange={(e) => setFormData({ ...formData, contactType: e.target.value as ContactType })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                        disabled={loading}
                      >
                        <option value={ContactType.Phone}>Phone</option>
                        <option value={ContactType.WhatsApp}>WhatsApp</option>
                        <option value={ContactType.None}>None</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="contact">Contact</Label>
                      <Input
                        id="contact"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        placeholder="Contact number"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Items Needed */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Items Needed</h3>
                    <Button type="button" onClick={addItem} variant="outline" size="sm" disabled={loading}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-lg">
                      <div>
                        <Label>Item Type <span className="text-red-500">*</span></Label>
                        <select
                          value={item.itemType || RationItemType.DRY_RATIONS}
                          onChange={(e) => {
                            const selectedType = e.target.value as RationItemType;
                            updateItem(index, 'itemType', selectedType);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          disabled={loading}
                          required
                        >
                          {RATION_ITEMS_METADATA.map((rationItem) => (
                            <option key={rationItem.code} value={rationItem.code}>
                              {rationItem.icon} {rationItem.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Input
                          value={item.notes || ''}
                          onChange={(e) => updateItem(index, 'notes', e.target.value)}
                          placeholder="Optional notes"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          onClick={() => removeItem(index)}
                          variant="outline"
                          size="sm"
                          disabled={loading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Drop-off Locations */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Drop-off Locations</h3>
                    <Button type="button" onClick={addDropOffLocation} variant="outline" size="sm" disabled={loading}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Location
                    </Button>
                  </div>
                  {dropOffLocations.map((location, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border rounded-lg">
                      <div>
                        <Label>Location Name <span className="text-red-500">*</span></Label>
                        <Input
                          value={location.name}
                          onChange={(e) => updateDropOffLocation(index, 'name', e.target.value)}
                          placeholder="e.g., Main Collection Point"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Input
                          value={location.address || ''}
                          onChange={(e) => updateDropOffLocation(index, 'address', e.target.value)}
                          placeholder="Full address"
                          disabled={loading}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Location Coordinates (Optional)</Label>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-gray-600">Latitude</Label>
                              <Input
                                type="number"
                                step="any"
                                value={location.lat || ''}
                                onChange={(e) => updateDropOffLocation(index, 'lat', e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder="Optional"
                                disabled={loading}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600">Longitude</Label>
                              <Input
                                type="number"
                                step="any"
                                value={location.lng || ''}
                                onChange={(e) => updateDropOffLocation(index, 'lng', e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder="Optional"
                                disabled={loading}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowDropOffMap(showDropOffMap === index ? null : index);
                            }}
                            className="w-full"
                            disabled={loading}
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            {showDropOffMap === index ? 'Hide Map' : 'Select on Map'}
                          </Button>
                          {showDropOffMap === index && (
                            <div className="border rounded-lg overflow-hidden">
                              <MapLocationPicker
                                initialLat={location.lat}
                                initialLng={location.lng}
                                onLocationChange={(lat, lng) => {
                                  updateDropOffLocationCoordinates(index, lat, lng);
                                }}
                                height="300px"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label>Contact Number</Label>
                        <Input
                          value={location.contactNumber || ''}
                          onChange={(e) => updateDropOffLocation(index, 'contactNumber', e.target.value)}
                          placeholder="Contact for this location"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          onClick={() => removeDropOffLocation(index)}
                          variant="outline"
                          size="sm"
                          disabled={loading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Connect Help Requests */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Connect Help Requests</h3>
                  <p className="text-sm text-gray-600 mb-4">Select help requests to connect with this camp</p>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-4">
                    {helpRequests.length === 0 ? (
                      <p className="text-gray-500 text-sm">No help requests available</p>
                    ) : (
                      helpRequests.map((hr) => (
                        <label key={hr.id} className="flex items-center space-x-2 mb-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedHelpRequests.includes(hr.id!)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedHelpRequests([...selectedHelpRequests, hr.id!]);
                              } else {
                                setSelectedHelpRequests(selectedHelpRequests.filter(id => id !== hr.id));
                              }
                            }}
                            disabled={loading}
                            className="rounded"
                          />
                          <span className="text-sm">{hr.description || hr.shortNote} - {hr.district || 'Unknown'}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="border-t pt-6 flex justify-end gap-2">
                  <Link href="/clubs/dashboard">
                    <Button type="button" variant="outline" disabled={loading}>
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Camp
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
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}

