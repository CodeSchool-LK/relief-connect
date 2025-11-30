import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuth } from '../../../hooks/useAuth';
import { campService, volunteerClubService, membershipService } from '../../../services';
import { CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto';
import { IVolunteerClub } from '../../../types/volunteer-club';
import { IMembership } from '../../../types/membership';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { MapPin, Package, Users, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { CampStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';

export default function ClubCampsPage() {
  const router = useRouter();
  const { id, clubId } = router.query;
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [club, setClub] = useState<IVolunteerClub | null>(null);
  const [membership, setMembership] = useState<IMembership | null>(null);
  const [camps, setCamps] = useState<CampResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const clubIdParam = clubId || id;
    if (clubIdParam) {
      loadData();
    }
  }, [id, clubId, isAuthenticated, authLoading, router]);

  const loadData = async () => {
    const clubIdParam = clubId || id;
    if (!clubIdParam) return;

    setLoading(true);
    try {
      const clubIdNum = Number(clubIdParam);
      if (isNaN(clubIdNum)) {
        setLoading(false);
        return;
      }
      
      const [clubResponse, membershipsResponse, campsResponse] = await Promise.all([        
        volunteerClubService.getVolunteerClubById(clubIdNum),
        membershipService.getMyMemberships(),
        campService.getAllCamps(),
      ]);

      if (clubResponse.success && clubResponse.data) {
        setClub(clubResponse.data);
      }

      if (membershipsResponse.success && membershipsResponse.data) {
        const userMembership = membershipsResponse.data.find((m) => m.volunteerClubId === clubIdNum);
        setMembership(userMembership || null);
      }

      if (campsResponse.success && campsResponse.data) {
        // Filter camps for this club
        const clubCamps = campsResponse.data.filter(
          camp => camp.volunteerClubId === clubIdNum && camp.status === CampStatus.ACTIVE
        );
        setCamps(clubCamps);
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
          <title>Loading Camps - Volunteer Club</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      </>
    );
  }

  if (!isAuthenticated || !membership || membership.status !== 'APPROVED') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You must be an approved member to view camps.</p>
          <Link href={`/clubs/${id}`}>
            <Button>Back to Club</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{club?.name || 'Club'} Camps - Volunteer Club</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            {(clubId || id) && (
              <Link href={`/clubs/${clubId || id}`}>
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Club
                </Button>
              </Link>
            )}
            <h1 className="text-3xl font-bold text-gray-900">{club?.name} Camps</h1>
            <div></div>
          </div>

          {camps.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No active camps found for this club.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {camps.map((camp) => (
                <Card key={camp.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{camp.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {camp.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">{camp.description}</p>
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

                    <div className="pt-2 border-t">
                      <Link href={`/clubs/camps/${camp.id}`}>
                        <Button className="w-full" variant="default">
                          <Package className="w-4 h-4 mr-2" />
                          View Details & Inventory
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

