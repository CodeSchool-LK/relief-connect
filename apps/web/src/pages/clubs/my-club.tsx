import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { volunteerClubService } from '../../services';
import { IVolunteerClub } from '../../types/volunteer-club';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Loader2, Building2, Mail, Phone, MapPin, Edit } from 'lucide-react';

export default function MyClubPage() {
  const router = useRouter();
  const { isAuthenticated, isVolunteerClub, loading: authLoading } = useAuth();
  const [club, setClub] = useState<IVolunteerClub | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) {
      return;
    }

    // Check authentication and role after loading is complete
    if (!isAuthenticated || !isVolunteerClub()) {
      router.push('/login');
      return;
    }

    loadMyClub();
  }, [isAuthenticated, isVolunteerClub, authLoading, router]);

  const loadMyClub = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await volunteerClubService.getMyClub();
      if (response.success && response.data) {
        setClub(response.data);
      } else {
        setError(response.error || 'Failed to load club information');
      }
    } catch (error) {
      console.error('Error loading club:', error);
      setError('Failed to load club information');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is loading or club data is loading
  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>My Club - Volunteer Club</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  // If not authenticated or not volunteer club, don't render (redirect will happen)
  if (!isAuthenticated || !isVolunteerClub()) {
    return null;
  }

  if (error && !club) {
    return (
      <>
        <Head>
          <title>My Club - Volunteer Club</title>
        </Head>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/clubs/dashboard">
              <Button variant="outline" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Club
              </Button>
            </Link>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={loadMyClub}>Retry</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Club - {club?.name || 'Volunteer Club'}</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/clubs/dashboard">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Club Dashboard
            </Button>
          </Link>

          {club ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{club.name}</CardTitle>
                      {club.status && (
                        <span
                          className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                            club.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {club.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {club.description && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{club.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {club.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <a
                          href={`mailto:${club.email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {club.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {club.contactNumber && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Contact Number</p>
                        <a
                          href={`tel:${club.contactNumber}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {club.contactNumber}
                        </a>
                      </div>
                    </div>
                  )}

                  {club.address && (
                    <div className="flex items-start gap-3 md:col-span-2">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Address</p>
                        <p className="text-sm text-gray-600">{club.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                {club.createdAt && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Created: {new Date(club.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Club Found</h3>
                  <p className="text-gray-600 mb-4">
                    You don&apos;t have a club associated with your account yet.
                  </p>
                  <p className="text-sm text-gray-500">
                    Please contact an administrator to set up your volunteer club.
                  </p>
                </div>
              </CardContent>
            </Card>
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

