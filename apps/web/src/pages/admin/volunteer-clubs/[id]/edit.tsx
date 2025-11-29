import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuth } from '../../../../hooks/useAuth';
import { volunteerClubService } from '../../../../services';
import { IVolunteerClub, IUpdateVolunteerClub } from '../../../../types/volunteer-club';
import VolunteerClubForm from '../../../../components/VolunteerClubForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditVolunteerClubPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, isAdmin } = useAuth();
  const [club, setClub] = useState<IVolunteerClub | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      router.push('/login');
      return;
    }

    if (id) {
      loadClub();
    }
  }, [id, isAuthenticated, isAdmin, router]);

  const loadClub = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await volunteerClubService.getVolunteerClubById(Number(id));
      if (response.success && response.data) {
        setClub(response.data);
      } else {
        alert(response.error || 'Failed to load volunteer club');
        router.push('/admin/volunteer-clubs');
      }
    } catch (error) {
      console.error('Error loading club:', error);
      alert('Failed to load volunteer club');
      router.push('/admin/volunteer-clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: IUpdateVolunteerClub) => {
    if (!club) return;

    setSaving(true);
    try {
      const response = await volunteerClubService.updateVolunteerClub(club.id, data);
      if (response.success) {
        router.push('/admin/volunteer-clubs');
      } else {
        alert(response.error || 'Failed to update volunteer club');
        setSaving(false);
      }
    } catch (error) {
      console.error('Error updating club:', error);
      alert('Failed to update volunteer club');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!club) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Edit Volunteer Club - Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/admin/volunteer-clubs">
            <button className="mb-6 flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clubs
            </button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Edit Volunteer Club</CardTitle>
            </CardHeader>
            <CardContent>
              <VolunteerClubForm club={club} onSubmit={handleSubmit} loading={saving} />
            </CardContent>
          </Card>
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

