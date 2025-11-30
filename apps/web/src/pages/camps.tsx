import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuth } from '../hooks/useAuth';
import { campService, volunteerClubService } from '../services';
import { CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Search, 
  Loader2, 
  MapPin, 
  Users,
  Package,
  HandHeart,
  Building2,
  AlertCircle
} from 'lucide-react';
import { CampStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';
import CampDonationModal from '../components/CampDonationModal';
import { ICampInventoryItem } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampInventoryItem';

interface CampWithClub extends CampResponseDto {
  clubName?: string;
  clubId?: number;
}

export default function CampsPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [camps, setCamps] = useState<CampWithClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCamp, setSelectedCamp] = useState<CampWithClub | null>(null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [campInventories, setCampInventories] = useState<Record<number, ICampInventoryItem[]>>({});

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadData();
  }, [isAuthenticated, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [campsResponse, clubsResponse] = await Promise.all([
        campService.getAllCamps(),
        volunteerClubService.getAllVolunteerClubs(),
      ]);

      if (campsResponse.success && campsResponse.data) {
        const allCamps = campsResponse.data.filter(camp => camp.status === CampStatus.ACTIVE);
        const clubs = clubsResponse.success && clubsResponse.data ? clubsResponse.data : [];

        // Enrich camps with club information
        const campsWithClub: CampWithClub[] = allCamps.map(camp => {
          const club = clubs.find(c => c.id === camp.volunteerClubId);
          return {
            ...camp,
            clubName: club?.name,
            clubId: camp.volunteerClubId,
          };
        });

        setCamps(campsWithClub);

        // Load inventory for all camps
        await loadCampInventories(campsWithClub);
      } else {
        setError(campsResponse.error || 'Failed to load camps');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load camps');
    } finally {
      setLoading(false);
    }
  };

  const loadCampInventories = async (campsList: CampWithClub[]) => {
    const inventoryPromises = campsList.map(async (camp) => {
      if (!camp.id) return;
      try {
        const inventoryResponse = await campService.getCampInventoryItems(camp.id);
        if (inventoryResponse.success && inventoryResponse.data) {
          return { campId: camp.id, inventory: inventoryResponse.data };
        }
      } catch (error) {
        console.error(`Error loading inventory for camp ${camp.id}:`, error);
      }
      return null;
    });

    const inventoryResults = await Promise.all(inventoryPromises);
    const inventoryMap: Record<number, ICampInventoryItem[]> = {};
    inventoryResults.forEach(result => {
      if (result) {
        inventoryMap[result.campId] = result.inventory;
      }
    });
    setCampInventories(inventoryMap);
  };

  const filteredCamps = useMemo(() => {
    return camps.filter(camp =>
      camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.clubName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [camps, searchTerm]);

  const handleDonateClick = (camp: CampWithClub) => {
    setSelectedCamp(camp);
    setShowDonationModal(true);
  };

  const handleDonationCreated = async () => {
    // Reload data to update inventory
    await loadData();
  };

  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>Loading Camps</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      </>
    );
  }

  if (!isAuthenticated) return null; // Redirect handled by useEffect

  return (
    <>
      <Head>
        <title>All Camps - Donate to Camps</title>
        <meta name="description" content="View all active camps and make donation requests" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Active Camps</h1>
            <p className="text-gray-600">
              Browse all active camps and make donation requests. Once approved by club admins, you&apos;ll be automatically registered as a member.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search camps by name, location, description, or club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {filteredCamps.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm
                  ? 'No camps found matching your search.'
                  : 'No active camps available at the moment.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCamps.map((camp) => {
                const inventory = campInventories[camp.id!] || [];
                const hasRequestedItems = inventory.some(item => item.quantityNeeded > 0);

                return (
                  <Card key={camp.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">{camp.name}</CardTitle>
                          {camp.clubName && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <Building2 className="w-4 h-4" />
                              <span>{camp.clubName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {camp.shortNote && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{camp.shortNote}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                      {camp.description && (
                        <p className="text-sm text-gray-600 line-clamp-3 flex-1">{camp.description}</p>
                      )}

                      <div className="space-y-2 text-sm">
                        {camp.location && (
                          <div className="flex items-start gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{camp.location}</span>
                          </div>
                        )}
                        {camp.peopleRange && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4 flex-shrink-0" />
                            <span>{camp.peopleRange}</span>
                          </div>
                        )}
                      </div>

                      {/* Inventory Summary */}
                      {inventory.length > 0 && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Package className="w-4 h-4" />
                            <span className="font-medium">Items Needed:</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {inventory
                              .filter(item => item.quantityNeeded > 0)
                              .slice(0, 4)
                              .map((item) => {
                                const remaining = Math.max(0, item.quantityNeeded - item.quantityDonated - item.quantityPending);
                                return (
                                  <div key={item.id} className="text-xs bg-gray-50 p-2 rounded">
                                    <div className="font-medium truncate">{item.itemName}</div>
                                    <div className="text-gray-500">Need: {remaining}</div>
                                  </div>
                                );
                              })}
                          </div>
                          {inventory.filter(item => item.quantityNeeded > 0).length > 4 && (
                            <p className="text-xs text-gray-500 mt-1">
                              +{inventory.filter(item => item.quantityNeeded > 0).length - 4} more items
                            </p>
                          )}
                        </div>
                      )}

                      <div className="pt-2 border-t mt-auto">
                        {hasRequestedItems ? (
                          <Button
                            onClick={() => handleDonateClick(camp)}
                            className="w-full"
                            variant="default"
                          >
                            <HandHeart className="w-4 h-4 mr-2" />
                            Make Donation Request
                          </Button>
                        ) : (
                          <div className="text-center py-2">
                            <p className="text-xs text-gray-500">
                              No items currently requested
                            </p>
                          </div>
                        )}
                        <Button
                          onClick={() => router.push(`/clubs/camps/${camp.id}`)}
                          className="w-full mt-2"
                          variant="outline"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Donation Modal */}
      {selectedCamp && (
        <CampDonationModal
          camp={selectedCamp}
          isOpen={showDonationModal}
          onClose={() => {
            setShowDonationModal(false);
            setSelectedCamp(null);
          }}
          currentUserId={user?.id}
          isClubAdmin={false}
          inventoryItems={campInventories[selectedCamp.id!] || []}
          onDonationCreated={handleDonationCreated}
        />
      )}
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

