import React, { useState, useEffect, useCallback } from 'react';
import { X, Package, CheckCircle, Clock, User, Phone, HandHeart, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto';
import { DonationWithDonatorResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation/response/donation_with_donator_response_dto';
import { ICreateCampDonation } from '@nx-mono-repo-deployment-test/shared/src/interfaces/donation/ICreateCampDonation';
import { ICampInventoryItem } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampInventoryItem';
import { donationService } from '../services';
import { RATION_ITEMS } from './EmergencyRequestForm';

interface CampDonationModalProps {
  camp: CampResponseDto;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: number;
  isClubAdmin?: boolean;
  inventoryItems?: ICampInventoryItem[];
  onDonationCreated?: () => void;
}

export default function CampDonationModal({
  camp,
  isOpen,
  onClose,
  currentUserId,
  isClubAdmin = false,
  inventoryItems = [],
  onDonationCreated,
}: CampDonationModalProps) {
  const [donations, setDonations] = useState<DonationWithDonatorResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [rationItems, setRationItems] = useState<Record<string, number>>({});
  const [donatorName, setDonatorName] = useState('');
  const [donatorMobileNumber, setDonatorMobileNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadDonations = useCallback(async () => {
    if (!camp.id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await donationService.getDonationsByCampId(camp.id);
      if (response.success && response.data) {
        setDonations(response.data);
      } else {
        setError(response.error || 'Failed to load donations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load donations');
    } finally {
      setLoading(false);
    }
  }, [camp.id]);

  useEffect(() => {
    if (isOpen && camp.id) {
      loadDonations();
    }
  }, [isOpen, camp.id, loadDonations]);

  const handleRationItemChange = (itemId: string, count: number) => {
    if (count <= 0) {
      const newItems = { ...rationItems };
      delete newItems[itemId];
      setRationItems(newItems);
    } else {
      setRationItems({ ...rationItems, [itemId]: count });
    }
  };

  const handleCreateDonation = async () => {
    if (!camp.id) return;
    if (Object.keys(rationItems).length === 0) {
      setError('Please select at least one ration item with a count');
      return;
    }
    if (!donatorName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!donatorMobileNumber.trim()) {
      setError('Please enter your mobile number');
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const createDonationDto: ICreateCampDonation = {
        campId: camp.id,
        donatorName: donatorName.trim(),
        donatorMobileNumber: donatorMobileNumber.trim(),
        rationItems,
      };

      // For club admins, auto-approve donations (directly add to inventory)
      const autoApprove = isClubAdmin;
      const response = await donationService.createCampDonation(camp.id, createDonationDto, autoApprove);
      if (response.success) {
        setRationItems({});
        setDonatorName('');
        setDonatorMobileNumber('');
        setShowCreateForm(false);
        await loadDonations();
        if (onDonationCreated) {
          onDonationCreated();
        }
      } else {
        setError(response.error || 'Failed to create donation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create donation');
    } finally {
      setCreating(false);
    }
  };

  const handleAcceptDonation = async (donationId: number) => {
    if (!camp.id) return;
    try {
      const response = await donationService.acceptCampDonation(camp.id, donationId);
      if (response.success) {
        await loadDonations();
        if (onDonationCreated) {
          onDonationCreated();
        }
      } else {
        setError(response.error || 'Failed to accept donation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept donation');
    }
  };

  if (!isOpen) return null;

  const myDonations = donations.filter((d) => d.donatorId === currentUserId);
  const otherDonations = donations.filter((d) => d.donatorId !== currentUserId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-2 sm:p-4">
      <Card className="w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 z-10 border-b shadow-sm p-4 sm:p-6">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                <span className="truncate">Donations for {camp.name}</span>
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">{camp.shortNote}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="ml-2 sm:ml-4 flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 p-0">
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

              {/* Create Donation Section */}
              {currentUserId && (
            <div className="border-2 border-dashed border-blue-200 rounded-xl p-3 sm:p-5 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
              {!showCreateForm ? (
                <Button 
                  onClick={() => setShowCreateForm(true)} 
                  className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg touch-manipulation"
                >
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {isClubAdmin ? 'Add Items to Inventory' : 'Create New Donation'}
                </Button>
              ) : (
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200 gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 min-w-0">
                      <HandHeart className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                      <span className="truncate">{isClubAdmin ? 'Add Items to Camp Inventory' : 'Select Items to Donate'}</span>
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCreateForm(false);
                        setRationItems({});
                        setDonatorName('');
                        setDonatorMobileNumber('');
                        setError(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 p-0"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {/* Donator Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div>
                        <Label htmlFor="donatorName" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Your Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="donatorName"
                          type="text"
                          value={donatorName}
                          onChange={(e) => setDonatorName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full h-11 sm:h-9 text-base sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="donatorMobileNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Mobile Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="donatorMobileNumber"
                          type="tel"
                          value={donatorMobileNumber}
                          onChange={(e) => setDonatorMobileNumber(e.target.value)}
                          placeholder="+94771234567"
                          className="w-full h-11 sm:h-9 text-base sm:text-sm"
                          inputMode="tel"
                          required
                        />
                      </div>
                    </div>

                    {/* Requested Items Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Select Items to Donate
                        {inventoryItems.length > 0 && (
                          <span className="text-xs font-normal text-gray-500 ml-2">
                            (Showing only requested items)
                          </span>
                        )}
                      </h4>
                      {inventoryItems.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                          <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">No items are currently requested for this camp.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 sm:gap-3 max-h-[400px] sm:max-h-[300px] overflow-y-auto pr-1">
                          {inventoryItems
                            .filter(invItem => invItem.quantityNeeded > 0)
                            .map((invItem) => {
                              const item = RATION_ITEMS.find((r) => r.id === invItem.itemName);
                              if (!item) return null; // Skip if item not found in RATION_ITEMS
                              
                              const count = rationItems[invItem.itemName] || 0;
                              const remainingNeeded = Math.max(0, invItem.quantityNeeded - invItem.quantityDonated - invItem.quantityPending);
                              
                              return (
                                <div
                                  key={invItem.itemName}
                                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 bg-gray-50 hover:bg-blue-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="text-2xl sm:text-3xl flex-shrink-0">{item.icon}</span>
                                    <div className="flex-1 min-w-0">
                                      <Label className="text-sm sm:text-base font-medium block truncate">{item.label}</Label>
                                      <div className="text-xs text-gray-600 mt-0.5">
                                        <span className="block sm:inline">Needed: {invItem.quantityNeeded}</span>
                                        <span className="hidden sm:inline"> | </span>
                                        <span className="block sm:inline">
                                          Remaining: <span className={remainingNeeded > 0 ? 'font-semibold text-orange-600' : 'text-green-600'}>
                                            {remainingNeeded}
                                          </span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 sm:gap-2 flex-shrink-0">
                                    <Button
                                      variant="outline"
                                      size="default"
                                      onClick={() => handleRationItemChange(invItem.itemName, Math.max(0, count - 1))}
                                      className="h-10 w-10 sm:h-9 sm:w-9 p-0 text-lg sm:text-base font-bold touch-manipulation"
                                      aria-label="Decrease quantity"
                                    >
                                      -
                                    </Button>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={count}
                                      onChange={(e) =>
                                        handleRationItemChange(invItem.itemName, parseInt(e.target.value) || 0)
                                      }
                                      className="w-24 sm:w-20 h-10 sm:h-9 text-center text-base sm:text-sm font-semibold touch-manipulation"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                    />
                                    <Button
                                      variant="outline"
                                      size="default"
                                      onClick={() => handleRationItemChange(invItem.itemName, count + 1)}
                                      className="h-10 w-10 sm:h-9 sm:w-9 p-0 text-lg sm:text-base font-bold touch-manipulation"
                                      aria-label="Increase quantity"
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateDonation}
                    disabled={creating || Object.keys(rationItems).length === 0}
                    className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg disabled:opacity-50 touch-manipulation"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        {isClubAdmin ? 'Adding to Inventory...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        {isClubAdmin ? 'Add to Inventory' : 'Submit Donation'}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Donations */}
          {myDonations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-blue-200">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Donations ({myDonations.length})</h3>
              </div>
              {myDonations.map((donation) => (
                <Card key={donation.id} className="border-2 border-blue-200 shadow-md">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                        <div>
                          <span className="font-bold text-lg text-gray-900">Donation</span>
                          <div className="text-xs text-gray-500">Donation #{donation.id}</div>
                        </div>
                        {donation.ownerMarkedCompleted && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle className="h-3 w-3" />
                            Accepted
                          </span>
                        )}
                        {!donation.ownerMarkedCompleted && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(donation.rationItems).map(([itemId, count]) => {
                          const item = RATION_ITEMS.find((i) => i.id === itemId);
                          return (
                            <div key={itemId} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200">
                              <span className="text-2xl">{item?.icon || '📦'}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{item?.label || itemId}</div>
                              </div>
                              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                                ×{count}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Other Donations (for club admins) */}
          {isClubAdmin && otherDonations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-200">
                <Package className="h-5 w-5 text-gray-600" />
                <h3 className="text-xl font-bold text-gray-900">All Donations ({otherDonations.length})</h3>
              </div>
              {otherDonations.map((donation) => (
                <Card key={donation.id} className="border-2 border-gray-200 shadow-md">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                        <div>
                          <span className="font-bold text-lg text-gray-900">Donation #{donation.id}</span>
                          {donation.donatorUsername && (
                            <div className="text-xs text-gray-500">by {donation.donatorUsername}</div>
                          )}
                        </div>
                        {!donation.ownerMarkedCompleted && (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptDonation(donation.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept Donation
                          </Button>
                        )}
                        {donation.ownerMarkedCompleted && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle className="h-3 w-3" />
                            Accepted
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(donation.rationItems).map(([itemId, count]) => {
                          const item = RATION_ITEMS.find((i) => i.id === itemId);
                          return (
                            <div key={itemId} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                              <span className="text-2xl">{item?.icon || '📦'}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{item?.label || itemId}</div>
                              </div>
                              <div className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full font-bold text-sm">
                                ×{count}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {(donation.donatorName || donation.donatorMobileNumber) && (
                        <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          {donation.donatorName && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-700">Name:</span>
                              <span className="text-sm font-semibold text-gray-900">{donation.donatorName}</span>
                            </div>
                          )}
                          {donation.donatorMobileNumber && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-700">Contact:</span>
                              <a
                                href={`tel:${donation.donatorMobileNumber}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                              >
                                {donation.donatorMobileNumber}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 mx-auto mb-3 text-blue-600 animate-spin" />
              <p className="text-gray-600">Loading donations...</p>
            </div>
          )}
          {!loading && donations.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No donations yet</h3>
              <p className="text-gray-500 mb-4">Be the first to help by making a donation!</p>
              {currentUserId && !isClubAdmin && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <HandHeart className="h-4 w-4 mr-2" />
                  Create First Donation
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

