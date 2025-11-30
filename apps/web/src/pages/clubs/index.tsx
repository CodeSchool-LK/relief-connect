import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuth } from '../../hooks/useAuth';
import { volunteerClubService, membershipService } from '../../services';
import { IVolunteerClub } from '../../types/volunteer-club';
import { IMembership } from '../../types/membership';
import VolunteerClubCard from '../../components/VolunteerClubCard';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Loader2 } from 'lucide-react';

export default function ClubsPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [clubs, setClubs] = useState<IVolunteerClub[]>([]);
  const [memberships, setMemberships] = useState<IMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [requesting, setRequesting] = useState<number | null>(null);

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

    loadData();
  }, [isAuthenticated, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clubsResponse, membershipsResponse] = await Promise.all([
        volunteerClubService.getAllVolunteerClubs(),
        membershipService.getMyMemberships(),
      ]);

      if (clubsResponse.success && clubsResponse.data) {
        setClubs(clubsResponse.data);
      }

      if (membershipsResponse.success && membershipsResponse.data) {
        setMemberships(membershipsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestJoin = async (clubId: number) => {
    setRequesting(clubId);
    try {
      const response = await membershipService.requestMembership({ volunteerClubId: clubId });
      if (response.success) {
        // Reload memberships
        const membershipsResponse = await membershipService.getMyMemberships();
        if (membershipsResponse.success && membershipsResponse.data) {
          setMemberships(membershipsResponse.data);
        }
      } else {
        alert(response.error || 'Failed to submit membership request');
      }
    } catch (error) {
      console.error('Error requesting membership:', error);
      alert('Failed to submit membership request');
    } finally {
      setRequesting(null);
    }
  };

  const getMembershipStatus = (clubId: number): 'PENDING' | 'APPROVED' | 'REJECTED' | null => {
    const membership = memberships.find((m) => m.volunteerClubId === clubId);
    return membership ? (membership.status as 'PENDING' | 'APPROVED' | 'REJECTED') : null;
  };

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <title>Volunteer Clubs</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Clubs</h1>
            <p className="text-gray-600">Browse and join volunteer clubs in your area</p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredClubs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No clubs found matching your search.' : 'No volunteer clubs available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <VolunteerClubCard
                  key={club.id}
                  club={club}
                  onRequestJoin={handleRequestJoin}
                  membershipStatus={getMembershipStatus(club.id)}
                  showRequestButton={user?.role === 'USER'}
                />
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

