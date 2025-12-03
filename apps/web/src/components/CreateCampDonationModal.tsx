import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Package, CheckCircle, Loader2, AlertCircle, HandHeart, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ICamp } from '../types/camp';
import { ICampInventoryItem } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampInventoryItem';
import { ICreateCampDonation } from '@nx-mono-repo-deployment-test/shared/src/interfaces/donation/ICreateCampDonation';
import { donationService, campService } from '../services';
import { RATION_ITEMS_METADATA } from '@nx-mono-repo-deployment-test/shared/src/enums/ration-item.enum';
import { CampStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';

interface CreateCampDonationModalProps {
  camps: ICamp[];
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: number;
  onDonationCreated?: () => void;
}

export default function CreateCampDonationModal({
  camps = [],
  isOpen,
  onClose,
  currentUserId,
  onDonationCreated,
}: CreateCampDonationModalProps) {
  const [selectedCampId, setSelectedCampId] = useState<number | null>(null);
  const [inventoryItems, setInventoryItems] = useState<ICampInventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [creating, setCreating] = useState(false);
  const [rationItems, setRationItems] = useState<Record<string, number>>({});
  const [donatorName, setDonatorName] = useState('');
  const [donatorMobileNumber, setDonatorMobileNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedCamp = useMemo(() => {
    return camps.find(c => c.id === selectedCampId) || null;
  }, [camps, selectedCampId]);

  useEffect(() => {
    if (selectedCampId) {
      loadCampInventory(selectedCampId);
    } else {
      setInventoryItems([]);
      setRationItems({});
    }
  }, [selectedCampId]);

  const loadCampInventory = async (campId: number) => {
    setLoadingInventory(true);
    setError(null);
    try {
      const response = await campService.getCampInventoryItems(campId);
      if (response.success && response.data) {
        setInventoryItems(response.data);
      } else {
        setError(response.error || 'Failed to load camp inventory');
      }
    } catch (err) {
      console.error('Error loading camp inventory:', err);
      setError('Failed to load camp inventory');
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleRationItemChange = (itemId: string, count: number) => {
    if (count <= 0) {
      const newItems = { ...rationItems };
      delete newItems[itemId];
      setRationItems(newItems);
    } else {
      setRationItems({ ...rationItems, [itemId]: count });
    }
  };

  // Filter RATION_ITEMS to only show those requested by the selected camp
  const requestedRationItems = useMemo(() => {
    if (!selectedCampId || inventoryItems.length === 0) return [];
    const requestedItemNames = new Set(
      inventoryItems.filter(item => item.quantityNeeded > 0).map(item => item.itemName)
    );
    return RATION_ITEMS_METADATA.filter(item => requestedItemNames.has(item.code));
  }, [inventoryItems, selectedCampId]);

  const handleCreateDonation = async () => {
    if (!selectedCampId) {
      setError('Please select a camp');
      return;
    }
    if (Object.keys(rationItems).length === 0) {
      setError('Please select at least one ration item with a count');
      return;
    }
    if (!donatorName.trim()) {
      setError('Please enter donator name');
      return;
    }
    if (!donatorMobileNumber.trim()) {
      setError('Please enter donator mobile number');
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const createDonationDto: ICreateCampDonation = {
        campId: selectedCampId,
        donatorName: donatorName.trim(),
        donatorMobileNumber: donatorMobileNumber.trim(),
        rationItems,
      };

      // Auto-approve for admin donations
      const response = await donationService.createCampDonation(selectedCampId, createDonationDto, true);
      if (response.success) {
        // Reset form
        setSelectedCampId(null);
        setRationItems({});
        setDonatorName('');
        setDonatorMobileNumber('');
        setInventoryItems([]);
        if (onDonationCreated) {
          onDonationCreated();
        }
        onClose();
      } else {
        setError(response.error || 'Failed to create donation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create donation');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-2 sm:p-4">
      <Card className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 z-10 border-b shadow-sm p-4 sm:p-6">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <HandHeart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                <span className="truncate">Create Camp Donation</span>
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                Add items directly to camp inventory (auto-approved)
              </p>
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

          {/* Camp Selection */}
          <div>
            <Label htmlFor="campSelect" className="text-base font-semibold text-gray-700 mb-2 block">
              Select Camp <span className="text-red-500">*</span>
            </Label>
            <select
              id="campSelect"
              value={selectedCampId || ''}
              onChange={(e) => setSelectedCampId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">-- Select a camp --</option>
              {camps
                .filter(camp => camp.status === CampStatus.ACTIVE)
                .map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name}
                  </option>
                ))}
            </select>
            {camps.filter(camp => camp.status === CampStatus.ACTIVE).length === 0 && (
              <p className="text-sm text-gray-500 mt-2">No active camps available</p>
            )}
          </div>

          {/* Donator Information */}
          {selectedCampId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div>
                <Label htmlFor="donatorName" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Donator Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="donatorName"
                  type="text"
                  value={donatorName}
                  onChange={(e) => setDonatorName(e.target.value)}
                  placeholder="Enter donator name"
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
          )}

          {/* Loading Inventory */}
          {selectedCampId && loadingInventory && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto mb-3 text-blue-600 animate-spin" />
              <p className="text-gray-600">Loading camp inventory...</p>
            </div>
          )}

          {/* Items Selection */}
          {selectedCampId && !loadingInventory && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Select Items to Add to Inventory (Only requested items are shown)
              </h4>
              {requestedRationItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-10 w-10 mx-auto mb-2" />
                  <p>This camp is not currently requesting any specific items.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-3 max-h-[400px] sm:max-h-[300px] overflow-y-auto pr-1">
                  {requestedRationItems.map((item) => {
                    const count = rationItems[item.code] || 0;
                    const inventoryItem = inventoryItems.find(inv => inv.itemName === item.code);
                    const needed = inventoryItem?.quantityNeeded || 0;
                    const donated = inventoryItem?.quantityDonated || 0;
                    const pending = inventoryItem?.quantityPending || 0;
                    const remainingNeeded = Math.max(0, needed - donated - pending);

                    return (
                      <div
                        key={item.code}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 bg-gray-50"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl sm:text-3xl flex-shrink-0">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <Label className="text-sm sm:text-base font-medium block truncate">{item.label}</Label>
                            <p className="text-xs text-gray-500 mt-0.5">
                              <span className="block sm:inline">Needed: {needed}</span>
                              <span className="hidden sm:inline"> | </span>
                              <span className="block sm:inline">
                                Remaining: <span className={remainingNeeded > 0 ? 'text-orange-600 font-semibold' : 'text-green-600 font-semibold'}>{remainingNeeded}</span>
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="default"
                            onClick={() => handleRationItemChange(item.code, Math.max(0, count - 1))}
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
                              handleRationItemChange(item.code, parseInt(e.target.value) || 0)
                            }
                            className="w-24 sm:w-20 h-10 sm:h-9 text-center text-base sm:text-sm font-semibold touch-manipulation"
                            inputMode="numeric"
                            pattern="[0-9]*"
                          />
                          <Button
                            variant="outline"
                            size="default"
                            onClick={() => handleRationItemChange(item.code, count + 1)}
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
          )}

          {/* Submit Button */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={creating}
              className="w-full sm:w-auto h-11 sm:h-9 touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDonation}
              disabled={creating || !selectedCampId || Object.keys(rationItems).length === 0}
              className="w-full sm:w-auto h-11 sm:h-9 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg disabled:opacity-50 touch-manipulation"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                  Adding to Inventory...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Add to Inventory
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

