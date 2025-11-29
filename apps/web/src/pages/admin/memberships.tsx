import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { membershipService, volunteerClubService } from '../../services';
import { IMembership } from '../../types/membership';
import { IVolunteerClub } from '../../types/volunteer-club';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeft, Search, Loader2, Check, X } from 'lucide-react';

interface MembershipWithClub extends IMembership {
  club?: IVolunteerClub;
}

export default function AdminMembershipsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [memberships, setMemberships] = useState<MembershipWithClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      router.push('/login');
      return;
    }

    loadMemberships();
  }, [isAuthenticated, isAdmin, router]);

  const loadMemberships = async () => {
    setLoading(true);
    try {
      // Get all clubs first
      const clubsResponse = await volunteerClubService.getAllVolunteerClubs();
      const clubs = clubsResponse.success && clubsResponse.data ? clubsResponse.data : [];

      // Get memberships for each club
      const allMemberships: MembershipWithClub[] = [];
      for (const club of clubs) {
        try {
          const membershipsResponse = await membershipService.getClubMemberships(club.id);
          if (membershipsResponse.success && membershipsResponse.data) {
            const membershipsWithClub = membershipsResponse.data.map((m) => ({
              ...m,
              club,
            }));
            allMemberships.push(...membershipsWithClub);
          }
        } catch (error) {
          console.error(`Error loading memberships for club ${club.id}:`, error);
        }
      }

      setMemberships(allMemberships);
    } catch (error) {
      console.error('Error loading memberships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (membershipId: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await membershipService.reviewMembership(membershipId, {
        status,
        notes: `Reviewed by admin`,
      });
      if (response.success) {
        await loadMemberships();
      } else {
        alert(response.error || 'Failed to review membership');
      }
    } catch (error) {
      console.error('Error reviewing membership:', error);
      alert('Failed to review membership');
    }
  };

  const filteredMemberships = memberships.filter((membership) => {
    const matchesSearch =
      membership.club?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membership.club?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || membership.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <title>Review Memberships - Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/admin/dashboard">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Memberships</h1>
            <p className="text-gray-600">Review and manage membership requests</p>
          </div>

          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {filteredMemberships.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 text-lg">
                  {searchTerm || statusFilter !== 'ALL'
                    ? 'No memberships found matching your filters.'
                    : 'No membership requests found.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredMemberships.map((membership) => (
                <Card key={membership.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {membership.club ? membership.club.name : `Club ID: ${membership.volunteerClubId}`}
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
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReview(membership.id, 'APPROVED')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReview(membership.id, 'REJECTED')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
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

