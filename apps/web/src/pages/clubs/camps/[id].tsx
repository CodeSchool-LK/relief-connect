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
import { MapPin, Package, Users, ArrowLeft, Loader2, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import CampInventoryDisplay from '../../../components/CampInventoryDisplay';
import CampDonationModal from '../../../components/CampDonationModal';
import dynamic from 'next/dynamic';

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

  if (!isAuthenticated || (!isClubAdmin && (!membership || membership.status !== 'APPROVED'))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You must be an approved member or club admin to view camp details.</p>
          {camp?.volunteerClubId && (
            <Link href={`/clubs/camps?clubId=${camp.volunteerClubId}`}>
              <Button>Back to Camps</Button>
            </Link>
          )}
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
            {camp?.volunteerClubId && (
              <Link href={`/clubs/camps?clubId=${camp.volunteerClubId}`}>
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Camps
                </Button>
              </Link>
            )}
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
                  <CardTitle>Club Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {club?.name && (
                    <div>
                      <span className="font-medium text-gray-700">Club:</span>
                      <p className="text-gray-600">{club.name}</p>
                    </div>
                  )}
                  {club?.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">Address:</span>
                        <p className="text-sm text-gray-600">{club.address}</p>
                      </div>
                    </div>
                  )}
                  {club?.contactNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <a href={`tel:${club.contactNumber}`} className="text-sm text-blue-600 hover:underline">
                        {club.contactNumber}
                      </a>
                    </div>
                  )}
                  {club?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <a href={`mailto:${club.email}`} className="text-sm text-blue-600 hover:underline">
                        {club.email}
                      </a>
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

