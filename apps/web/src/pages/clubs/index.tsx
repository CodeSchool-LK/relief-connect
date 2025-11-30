import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuth } from '../../hooks/useAuth';
import { volunteerClubService, membershipService } from '../../services';
import { IVolunteerClub } from '../../types/volunteer-club';
import { IMembership } from '../../types/membership';
import VolunteerClubCard from '../../components/VolunteerClubCard';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Loader2, ArrowLeft } from 'lucide-react';

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

      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-4 sm:mb-6">
            <Link href="/camps">
              <Button
                variant="outline"
                className="mb-4 sm:mb-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Volunteer Clubs</h1>
            <p className="text-sm sm:text-base text-gray-600">Browse and support volunteer clubs in your area</p>
          </div>

          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type="text"
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 text-sm sm:text-base"
              />
            </div>
          </div>

          {filteredClubs.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 text-base sm:text-lg px-4">
                {searchTerm ? 'No clubs found matching your search.' : 'No volunteer clubs available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

