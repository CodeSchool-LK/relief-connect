import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuth } from '../../hooks/useAuth';
import { volunteerClubService, membershipService, campService } from '../../services';
import { IVolunteerClub } from '../../types/volunteer-club';
import { IMembership } from '../../types/membership';
import { CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto';
import { CampStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MapPin, Phone, Mail, ArrowLeft, Loader2, Package, Users } from 'lucide-react';
import Link from 'next/link';

export default function ClubDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [club, setClub] = useState<IVolunteerClub | null>(null);
  const [membership, setMembership] = useState<IMembership | null>(null);
  const [camps, setCamps] = useState<CampResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const clubId = Number(id);
      const [clubResponse, membershipsResponse, campsResponse] = await Promise.all([
        volunteerClubService.getVolunteerClubById(clubId),
        membershipService.getMyMemberships(),
        campService.getAllCamps(),
      ]);

      if (clubResponse.success && clubResponse.data) {
        setClub(clubResponse.data);
      }

      if (membershipsResponse.success && membershipsResponse.data) {
        const userMembership = membershipsResponse.data.find((m) => m.volunteerClubId === clubId);
        setMembership(userMembership || null);
      }

      if (campsResponse.success && campsResponse.data) {
        // Filter camps for this club (only active camps)
        const clubCamps = campsResponse.data.filter(
          (camp) => camp.volunteerClubId === clubId && camp.status === CampStatus.ACTIVE
        );
        setCamps(clubCamps);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) {
      return;
    }

    // Check authentication after loading is complete
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (id) {
      loadData();
    }
  }, [id, isAuthenticated, authLoading, router, loadData]);

  const handleRequestJoin = async () => {
    if (!club) return;

    setRequesting(true);
    try {
      const response = await membershipService.requestMembership({ volunteerClubId: club.id });
      if (response.success && response.data) {
        setMembership(response.data);
      } else {
        alert(response.error || 'Failed to submit membership request');
      }
    } catch (error) {
      console.error('Error requesting membership:', error);
      alert('Failed to submit membership request');
    } finally {
      setRequesting(false);
    }
  };

  // Show loading while auth is loading or club data is loading
  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>Loading Club - Volunteer Club</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600">
              {authLoading ? 'Checking authentication...' : 'Loading club information...'}
            </p>
          </div>
        </div>
      </>
    );
  }

  // If not authenticated, don't render (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Club Not Found</h1>
          <p className="text-gray-600 mb-4">The volunteer club you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/clubs">
            <Button>Back to Clubs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{club.name} - Volunteer Club</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/clubs">
            <Button variant="outline" className="mb-4 sm:mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clubs
            </Button>
          </Link>

          {/* Club Information Card */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">{club.name}</CardTitle>
              {club.description && (
                <CardDescription className="text-sm sm:text-base mt-2">{club.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {club.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-700 text-sm sm:text-base">Address</p>
                    <p className="text-gray-600 text-sm sm:text-base">{club.address}</p>
                  </div>
                </div>
              )}

              {club.contactNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-700 text-sm sm:text-base">Contact Number</p>
                    <a href={`tel:${club.contactNumber}`} className="text-blue-600 hover:underline text-sm sm:text-base">
                      {club.contactNumber}
                    </a>
                  </div>
                </div>
              )}

              {club.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-700 text-sm sm:text-base">Email</p>
                    <a href={`mailto:${club.email}`} className="text-blue-600 hover:underline text-sm sm:text-base break-all">
                      {club.email}
                    </a>
                  </div>
                </div>
              )}

              {user?.role === 'USER' && (
                <div className="pt-4 border-t">
                  {!membership ? (
                    <Button onClick={handleRequestJoin} disabled={requesting} className="w-full text-sm sm:text-base">
                      {requesting ? 'Submitting Request...' : 'Request to Support'}
                    </Button>
                  ) : membership.status === 'PENDING' ? (
                    <div className="text-center py-2">
                      <p className="text-yellow-600 font-medium text-sm sm:text-base">Membership Request Pending</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Your request is being reviewed.</p>
                    </div>
                  ) : membership.status === 'APPROVED' ? (
                    <div className="space-y-2">
                      <div className="text-center py-2">
                        <p className="text-green-600 font-medium text-sm sm:text-base">You are a member of this club</p>
                      </div>
                      <Link href={`/clubs/${club.id}/camps`}>
                        <Button className="w-full text-sm sm:text-base" variant="default">
                          View Camps & Inventory
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Button onClick={handleRequestJoin} disabled={requesting} variant="outline" className="w-full text-sm sm:text-base">
                      {requesting ? 'Submitting Request...' : 'Request Again'}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Camps Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Active Camps ({camps.length})
            </h2>

            {camps.length === 0 ? (
              <Card>
                <CardContent className="py-8 sm:py-12 text-center">
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm sm:text-base">No active camps found for this club.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {camps.map((camp) => (
                  <Card key={camp.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-lg sm:text-xl line-clamp-2">{camp.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col space-y-3 sm:space-y-4">
                      {camp.description && (
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 flex-1">{camp.description}</p>
                      )}

                      <div className="space-y-2 text-xs sm:text-sm">
                        {camp.location && (
                          <div className="flex items-start gap-2 text-gray-600">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{camp.location}</span>
                          </div>
                        )}
                        {camp.peopleRange && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>{camp.peopleRange}</span>
                          </div>
                        )}
                        {camp.campType && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {camp.campType}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t">
                        <Link href={`/camps/${camp.id}?clubId=${club.id}`}>
                          <Button className="w-full text-xs sm:text-sm" variant="default" size="sm">
                            <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
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

