import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { membershipService, volunteerClubService } from '../services';
import { IMembership } from '../types/membership';
import { IVolunteerClub } from '../types/volunteer-club';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Loader2, X } from 'lucide-react';

interface MembershipWithClub extends IMembership {
  club?: IVolunteerClub;
}

export default function MyMembershipsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [memberships, setMemberships] = useState<MembershipWithClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadData();
  }, [isAuthenticated, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const membershipsResponse = await membershipService.getMyMemberships();
      if (membershipsResponse.success && membershipsResponse.data) {
        // Load club details for each membership
        const membershipsWithClubs = await Promise.all(
          membershipsResponse.data.map(async (membership) => {
            try {
              const clubResponse = await volunteerClubService.getVolunteerClubById(membership.volunteerClubId);
              return {
                ...membership,
                club: clubResponse.success ? clubResponse.data : undefined,
              };
            } catch (error) {
              console.error(`Error loading club ${membership.volunteerClubId}:`, error);
              return { ...membership };
            }
          })
        );
        setMemberships(membershipsWithClubs);
      }
    } catch (error) {
      console.error('Error loading memberships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (membershipId: number) => {
    if (!confirm('Are you sure you want to cancel this membership request?')) return;

    setCancelling(membershipId);
    try {
      const response = await membershipService.cancelMembership(membershipId);
      if (response.success) {
        // Reload memberships
        await loadData();
      } else {
        alert(response.error || 'Failed to cancel membership request');
      }
    } catch (error) {
      console.error('Error cancelling membership:', error);
      alert('Failed to cancel membership request');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Memberships</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Memberships</h1>
            <p className="text-gray-600">View and manage your volunteer club membership requests</p>
          </div>

          {memberships.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 text-lg mb-4">You haven&apos;t requested to join any clubs yet.</p>
                <Link href="/clubs">
                  <Button>Browse Volunteer Clubs</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {memberships.map((membership) => (
                <Card key={membership.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {membership.club ? (
                            <Link href={`/clubs/${membership.club.id}`} className="hover:underline">
                              {membership.club.name}
                            </Link>
                          ) : (
                            `Club ID: ${membership.volunteerClubId}`
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={membership.status} />
                          {membership.requestedAt && (
                            <span className="text-sm text-gray-500">
                              Requested: {new Date(membership.requestedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {membership.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(membership.id)}
                          disabled={cancelling === membership.id}
                        >
                          {cancelling === membership.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {membership.club?.description && (
                      <p className="text-gray-600 mb-3">{membership.club.description}</p>
                    )}
                    {membership.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium text-gray-700 mb-1">Review Notes:</p>
                        <p className="text-sm text-gray-600">{membership.notes}</p>
                      </div>
                    )}
                    {membership.reviewedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Reviewed: {new Date(membership.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
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

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}

