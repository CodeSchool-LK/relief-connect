import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuth } from '../../../hooks/useAuth';
import { campService, volunteerClubService, membershipService } from '../../../services';
import { CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto';
import { ICampInventoryItem } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampInventoryItem';
import { IVolunteerClub } from '../../../types/volunteer-club';
import { IMembership } from '../../../types/membership';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { MapPin, Package, Users, ArrowLeft, Loader2, Phone, Mail, Building2 } from 'lucide-react';
import Link from 'next/link';
import CampInventoryDisplay from '../../../components/CampInventoryDisplay';
import CampDonationModal from '../../../components/CampDonationModal';
import dynamic from 'next/dynamic';
import { RATION_ITEMS } from '../../../components/EmergencyRequestForm';

const DropOffLocationsMap = dynamic(() => import('../../../components/DropOffLocationsMap'), { ssr: false });

export default function CampDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user, loading: authLoading, isVolunteerClub } = useAuth();
  const [club, setClub] = useState<IVolunteerClub | null>(null);
  const [membership, setMembership] = useState<IMembership | null>(null);
  const [camp, setCamp] = useState<CampResponseDto | null>(null);
  const [inventoryItems, setInventoryItems] = useState<ICampInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [isClubAdmin, setIsClubAdmin] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (id) {
      loadData();
    }
  }, [id, isAuthenticated, authLoading, router]);

  const loadData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const campId = Number(id);
      if (isNaN(campId)) {
        setLoading(false);
        return;
      }
      
      // First load the camp to get the volunteerClubId
      const [campResponse, membershipsResponse, inventoryResponse] = await Promise.all([
        campService.getCampById(campId),
        membershipService.getMyMemberships(),
        campService.getCampInventoryItems(campId),
      ]);

      if (campResponse.success && campResponse.data) {
        setCamp(campResponse.data);
        const volunteerClubId = campResponse.data.volunteerClubId;
        
        if (volunteerClubId) {
          // Load club info
          const clubResponse = await volunteerClubService.getVolunteerClubById(volunteerClubId);
          if (clubResponse.success && clubResponse.data) {
            setClub(clubResponse.data);
            // Check if user is club admin (owner of the club)
            if (user && clubResponse.data.userId && user.id === clubResponse.data.userId) {
              setIsClubAdmin(true);
            }
          }

          // Check membership
          if (membershipsResponse.success && membershipsResponse.data) {
            const userMembership = membershipsResponse.data.find((m) => m.volunteerClubId === volunteerClubId);
            setMembership(userMembership || null);
          }
        }
      }

      if (inventoryResponse.success && inventoryResponse.data) {
        setInventoryItems(inventoryResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCamps = () => {
    // Navigate to camps page and force a full page reload to fetch fresh data
    window.location.href = '/camps';
  };

  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>Loading Camp - Volunteer Club</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      </>
    );
  }

  // Only require authentication - no membership needed to view camp details and donate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to view camp details.</p>
          <Button onClick={() => router.push('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Camp Not Found</h1>
          {club?.id && (
            <Link href={`/clubs/camps?clubId=${club.id}`}>
              <Button>Back to Camps</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{camp.name} - {club?.name || 'Club'} Camp</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBackToCamps}
              className="flex items-center gap-2 -ml-2 sm:ml-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Camps</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Camp Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{camp.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {camp.description && (
                    <p className="text-gray-600">{camp.description}</p>
                  )}
                  
                  {camp.shortNote && (
                    <p className="text-sm text-gray-500">{camp.shortNote}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {camp.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                        <div>
                          <span className="font-medium text-gray-700">Location:</span>
                          <p className="text-gray-600">{camp.location}</p>
                        </div>
                      </div>
                    )}
                    {camp.peopleRange && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <div>
                          <span className="font-medium text-gray-700">People Range:</span>
                          <span className="text-gray-600 ml-1">{camp.peopleRange}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Drop-off Locations */}
              {camp.dropOffLocations && camp.dropOffLocations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Drop-off Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DropOffLocationsMap 
                      dropOffLocations={camp.dropOffLocations?.map(loc => ({
                        ...loc,
                        campName: camp.name,
                        campId: camp.id!,
                      })) || []}
                      camps={[camp]}
                    />
                    <div className="mt-4 space-y-2">
                      {camp.dropOffLocations.map((location, index) => (
                        <div key={location.id || index} className="bg-gray-50 p-3 rounded-lg border">
                          <h5 className="font-medium">{location.name}</h5>
                          {location.address && (
                            <p className="text-sm text-gray-600">{location.address}</p>
                          )}
                          {location.contactNumber && (
                            <a href={`tel:${location.contactNumber}`} className="text-sm text-blue-600 hover:underline">
                              {location.contactNumber}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Inventory */}
              <CampInventoryDisplay inventoryItems={inventoryItems} />

              {/* Donation Button */}
              {user && !isClubAdmin && (
                <Card>
                  <CardContent className="pt-6">
                    <Button
                      onClick={() => setShowDonationModal(true)}
                      className="w-full"
                      size="lg"
                    >
                      <Package className="w-5 h-5 mr-2" />
                      Donate to Camp
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Club Admin: View/Manage Donations */}
              {user && isClubAdmin && (
                <Card>
                  <CardContent className="pt-6">
                    <Button
                      onClick={() => setShowDonationModal(true)}
                      className="w-full"
                      size="lg"
                      variant="default"
                    >
                      <Package className="w-5 h-5 mr-2" />
                      View & Manage Donations
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Club Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {club?.name && (
                    <div className="pb-4 border-b border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Club Name</div>
                      <p className="text-lg font-bold text-gray-900">{club.name}</p>
                    </div>
                  )}
                  {club?.address && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</div>
                        <p className="text-sm text-gray-700 break-words leading-relaxed">{club.address}</p>
                      </div>
                    </div>
                  )}
                  {club?.contactNumber && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Contact Number</div>
                        <a 
                          href={`tel:${club.contactNumber}`} 
                          className="text-sm font-medium text-green-700 hover:text-green-900 transition-colors inline-block"
                        >
                          {club.contactNumber}
                        </a>
                      </div>
                    </div>
                  )}
                  {club?.email && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</div>
                        <a 
                          href={`mailto:${club.email}`} 
                          className="text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors break-all"
                        >
                          {club.email}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {camp && (
        <CampDonationModal
          camp={camp}
          isOpen={showDonationModal}
          onClose={() => setShowDonationModal(false)}
          currentUserId={user?.id}
          isClubAdmin={isClubAdmin}
          inventoryItems={inventoryItems}
          onDonationCreated={async () => {
            await loadData();
            // Reload inventory after donation is accepted
            if (id) {
              const campId = Number(id);
              const inventoryResponse = await campService.getCampInventoryItems(campId);
              if (inventoryResponse.success && inventoryResponse.data) {
                setInventoryItems(inventoryResponse.data);
              }
            }
          }}
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

