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
  ArrowLeft
} from 'lucide-react';
import { CampStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';
import CampDonationModal from '../components/CampDonationModal';
import { ICampInventoryItem } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampInventoryItem';
import { RATION_ITEMS } from '../components/EmergencyRequestForm';

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

    // Allow viewing camps without authentication
    loadData();
  }, [authLoading]);

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
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
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

  return (
    <>
      <Head>
        <title>All Camps - Donate to Camps</title>
        <meta name="description" content="View all active camps and make donation requests" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Back Button and Navigation Buttons */}
          <div className="mb-6 sm:mb-8">
            {/* Top Bar - Mobile optimized */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 border-b border-gray-200">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center gap-2 flex-shrink-0 -ml-2 sm:ml-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              
              {/* Navigation Buttons - Two lines on mobile */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => router.push('/clubs')}
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-sm sm:text-sm px-4 h-10 sm:h-10 whitespace-nowrap w-full sm:w-auto transition-all duration-200"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Clubs
                </Button>
                <Button
                  onClick={() => router.push('/drop-off-locations')}
                  variant="outline"
                  className="border-2 border-purple-600 bg-purple-600 text-white text-sm sm:text-sm px-4 h-10 sm:h-10 whitespace-nowrap w-full sm:w-auto transition-all duration-200 relative overflow-hidden shadow-lg hover:shadow-xl group"
                >
                  {/* Glittering effect overlay - always visible */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shimmer-sweep_3s_ease-in-out_infinite]"></span>
                  <span className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.5)_50%,transparent_70%)] bg-[length:200%_200%] animate-[shimmer_2s_linear_infinite]"></span>
                  
                  <MapPin className="h-4 w-4 mr-2 relative z-10 animate-pulse" />
                  <span className="font-semibold relative z-10">Drop-off Locations</span>
                </Button>
              </div>
            </div>

            {/* Title Section */}
            <div className="px-0 sm:px-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">All Active Camps</h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                Browse all active camps and make donation requests. Once approved by club admins, you&apos;ll be automatically registered as a member.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type="text"
                placeholder="Search camps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm sm:text-base"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCamps.map((camp) => {
                const inventory = campInventories[camp.id!] || [];
                const hasRequestedItems = inventory.some(item => item.quantityNeeded > 0);

                // Map inventory items to RATION_ITEMS for proper labels and icons
                // itemName is the code/id (e.g., 'dry_rations', 'bottled_water')
                const itemsWithMetadata = inventory
                  .filter(item => item.quantityNeeded > 0)
                  .map((item) => {
                    const remaining = Math.max(0, item.quantityNeeded - item.quantityDonated - item.quantityPending);
                    // Match by id (itemName is the code/id from RATION_ITEMS)
                    const rationItem = RATION_ITEMS.find((ri) => ri.id === item.itemName);
                    return {
                      id: item.id,
                      label: rationItem ? rationItem.label : item.itemName,
                      icon: rationItem ? rationItem.icon : '📦',
                      remaining,
                    };
                  });

                // Calculate items to show (limit to 2 lines)
                // Approximately 4-5 tags per line on mobile, 6-7 on desktop
                const maxItemsToShow = 8; // Approximately 2 lines
                const itemsToShow = itemsWithMetadata.slice(0, maxItemsToShow);
                const remainingCount = itemsWithMetadata.length - maxItemsToShow;

                return (
                  <Card key={camp.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                    <CardHeader className="p-4 sm:p-6 flex-shrink-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg sm:text-xl mb-1 line-clamp-2">{camp.name}</CardTitle>
                          {camp.clubName && (
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mt-1">
                              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{camp.clubName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {camp.shortNote && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">{camp.shortNote}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 flex-1 flex flex-col p-4 sm:p-6 pt-0">
                      {camp.description && (
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 flex-1">{camp.description}</p>
                      )}

                      <div className="space-y-2 text-xs sm:text-sm">
                        {camp.location && (
                          <div className="flex items-start gap-2 text-gray-600">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2 break-words">{camp.location}</span>
                          </div>
                        )}
                        {camp.peopleRange && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>{camp.peopleRange}</span>
                          </div>
                        )}
                      </div>

                      {/* Items Needed - Tag Style */}
                      {itemsWithMetadata.length > 0 && (
                        <div className="pt-2 border-t flex-shrink-0">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                            <Package className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="font-medium">Items Needed:</span>
                          </div>
                          <div className="relative">
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 min-h-[2.5rem] max-h-[5rem] overflow-hidden">
                              {itemsToShow.map((item) => (
                                <div
                                  key={item.id}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md text-xs font-medium transition-colors duration-200 flex-shrink-0"
                                >
                                  <span>{item.icon}</span>
                                  <span className="whitespace-nowrap">{item.label}</span>
                                  <span className="font-bold">×{item.remaining}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          {remainingCount > 0 && (
                            <p className="text-xs text-purple-600 font-semibold mt-2">
                              +{remainingCount} more items
                            </p>
                          )}
                        </div>
                      )}

                      <div className="pt-2 border-t mt-auto flex-shrink-0">
                        {hasRequestedItems ? (
                          <Button
                            onClick={() => handleDonateClick(camp)}
                            className="w-full h-9 sm:h-10 text-xs sm:text-sm"
                            variant="default"
                          >
                            <HandHeart className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                            <span className="hidden xs:inline">Make Donation Request</span>
                            <span className="xs:hidden">Donate</span>
                          </Button>
                        ) : (
                          <div className="text-center py-2">
                            <p className="text-xs text-gray-500">
                              No items currently requested
                            </p>
                          </div>
                        )}
                        <Button
                          onClick={() => router.push(`/camps/${camp.id}`)}
                          className="w-full mt-2 h-9 sm:h-10 text-xs sm:text-sm"
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

