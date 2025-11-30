import React, { useState, useEffect, useCallback } from 'react';
import { CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto';
import { DonationWithDonatorResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation/response/donation_with_donator_response_dto';
import { donationService } from '../services';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2, CheckCircle, Clock, User, Package } from 'lucide-react';
import { RATION_ITEMS } from './EmergencyRequestForm';

interface MyCampDonationsProps {
  camp: CampResponseDto;
  currentUserId?: number;
}

export default function MyCampDonations({ camp, currentUserId }: MyCampDonationsProps) {
  const [donations, setDonations] = useState<DonationWithDonatorResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDonations = useCallback(async () => {
    if (!camp.id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await donationService.getDonationsByCampId(camp.id);
      if (response.success && response.data) {
        // Filter to show only current user's donations
        const myDonations = response.data.filter(
          (donation) => donation.donatorId === currentUserId
        );
        setDonations(myDonations);
      } else {
        setError(response.error || 'Failed to load donations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load donations');
    } finally {
      setLoading(false);
    }
  }, [camp.id, currentUserId]);

  useEffect(() => {
    if (currentUserId && camp.id) {
      loadDonations();
    } else {
      setLoading(false);
    }
  }, [currentUserId, camp.id, loadDonations]);

  // Don't show component if user is not logged in or has no donations
  if (!currentUserId || (!loading && donations.length === 0)) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            My Donations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            My Donations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          My Donations ({donations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {donations.map((donation) => (
            <div
              key={donation.id}
              className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-gray-50"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <span className="font-bold text-base sm:text-lg text-gray-900">
                      Your Donation
                    </span>
                    <div className="text-xs text-gray-500 mt-1">Donation #{donation.id}</div>
                  </div>
                  {donation.ownerMarkedCompleted ? (
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle className="h-3 w-3" />
                      Accepted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {Object.entries(donation.rationItems || {}).map(([itemId, count]) => {
                    const item = RATION_ITEMS.find((i) => i.id === itemId);
                    return (
                      <div
                        key={itemId}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white border border-gray-200"
                      >
                        <span className="text-xl sm:text-2xl">{item?.icon || '📦'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {item?.label || itemId}
                          </div>
                        </div>
                        <div className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs sm:text-sm">
                          ×{count}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {donation.createdAt && (
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    Donated on:{' '}
                    {new Date(donation.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

