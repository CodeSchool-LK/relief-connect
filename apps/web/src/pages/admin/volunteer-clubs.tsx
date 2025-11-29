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
import { Input } from '../../components/ui/input';
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';

export default function AdminVolunteerClubsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [clubs, setClubs] = useState<IVolunteerClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      router.push('/login');
      return;
    }

    loadClubs();
  }, [isAuthenticated, isAdmin, router]);

  const loadClubs = async () => {
    setLoading(true);
    try {
      const response = await volunteerClubService.getAllVolunteerClubs();
      if (response.success && response.data) {
        setClubs(response.data);
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clubId: number) => {
    if (!confirm('Are you sure you want to delete this volunteer club? This action cannot be undone.')) return;

    setDeleting(clubId);
    try {
      const response = await volunteerClubService.deleteVolunteerClub(clubId);
      if (response.success) {
        await loadClubs();
      } else {
        alert(response.error || 'Failed to delete volunteer club');
      }
    } catch (error) {
      console.error('Error deleting club:', error);
      alert('Failed to delete volunteer club');
    } finally {
      setDeleting(null);
    }
  };

  const filteredClubs = clubs.filter(
    (club) =>
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
        <title>Manage Volunteer Clubs - Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Volunteer Clubs</h1>
              <p className="text-gray-600">Create, edit, and manage volunteer clubs</p>
            </div>
            <Link href="/admin/volunteer-clubs/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Club
              </Button>
            </Link>
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
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 text-lg mb-4">
                  {searchTerm ? 'No clubs found matching your search.' : 'No volunteer clubs yet.'}
                </p>
                <Link href="/admin/volunteer-clubs/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Club
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <Card key={club.id}>
                  <CardHeader>
                    <CardTitle className="text-xl">{club.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {club.description && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{club.description}</p>}
                    <div className="flex gap-2">
                      <Link href={`/admin/volunteer-clubs/${club.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(club.id)}
                        disabled={deleting === club.id}
                      >
                        {deleting === club.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
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

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}

