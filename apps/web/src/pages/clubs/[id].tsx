import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuth } from '../../hooks/useAuth';
import { volunteerClubService, membershipService } from '../../services';
import { IVolunteerClub } from '../../types/volunteer-club';
import { IMembership } from '../../types/membership';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MapPin, Phone, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ClubDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [club, setClub] = useState<IVolunteerClub | null>(null);
  const [membership, setMembership] = useState<IMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const clubId = Number(id);
      const [clubResponse, membershipsResponse] = await Promise.all([
        volunteerClubService.getVolunteerClubById(clubId),
        membershipService.getMyMemberships(),
      ]);

      if (clubResponse.success && clubResponse.data) {
        setClub(clubResponse.data);
      }

      if (membershipsResponse.success && membershipsResponse.data) {
        const userMembership = membershipsResponse.data.find((m) => m.volunteerClubId === clubId);
        setMembership(userMembership || null);
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

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/clubs">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clubs
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{club.name}</CardTitle>
              {club.description && <CardDescription className="text-base mt-2">{club.description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
              {club.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-700">Address</p>
                    <p className="text-gray-600">{club.address}</p>
                  </div>
                </div>
              )}

              {club.contactNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-700">Contact Number</p>
                    <a href={`tel:${club.contactNumber}`} className="text-blue-600 hover:underline">
                      {club.contactNumber}
                    </a>
                  </div>
                </div>
              )}

              {club.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-700">Email</p>
                    <a href={`mailto:${club.email}`} className="text-blue-600 hover:underline">
                      {club.email}
                    </a>
                  </div>
                </div>
              )}

              {user?.role === 'USER' && (
                <div className="pt-4 border-t">
                  {!membership ? (
                    <Button onClick={handleRequestJoin} disabled={requesting} className="w-full">
                      {requesting ? 'Submitting Request...' : 'Request to Join'}
                    </Button>
                  ) : membership.status === 'PENDING' ? (
                    <div className="text-center py-2">
                      <p className="text-yellow-600 font-medium">Membership Request Pending</p>
                      <p className="text-sm text-gray-600 mt-1">Your request is being reviewed.</p>
                    </div>
                  ) : membership.status === 'APPROVED' ? (
                    <div className="text-center py-2">
                      <p className="text-green-600 font-medium">You are a member of this club</p>
                    </div>
                  ) : (
                    <Button onClick={handleRequestJoin} disabled={requesting} variant="outline" className="w-full">
                      {requesting ? 'Submitting Request...' : 'Request Again'}
                    </Button>
                  )}
                </div>
              )}
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

