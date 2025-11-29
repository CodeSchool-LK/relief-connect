import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuth } from '../../../hooks/useAuth';
import { volunteerClubService } from '../../../services';
import { ICreateVolunteerClub } from '../../../types/volunteer-club';
import VolunteerClubForm from '../../../components/VolunteerClubForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateVolunteerClubPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleSubmit = async (data: ICreateVolunteerClub) => {
    setLoading(true);
    try {
      const response = await volunteerClubService.createVolunteerClub(data);
      if (response.success) {
        router.push('/admin/volunteer-clubs');
      } else {
        alert(response.error || 'Failed to create volunteer club');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating club:', error);
      alert('Failed to create volunteer club');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Volunteer Club - Admin</title>
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
              <CardTitle className="text-2xl">Create Volunteer Club</CardTitle>
            </CardHeader>
            <CardContent>
              <VolunteerClubForm onSubmit={handleSubmit} loading={loading} />
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

