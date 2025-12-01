import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { helpRequestService } from '../../services';
import { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Users, Loader2, Search, Edit } from 'lucide-react';
import { Urgency, HelpRequestStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';

const getUrgencyColor = (urgency: Urgency) => {
  switch (urgency) {
    case Urgency.HIGH:
      return 'bg-red-100 text-red-800 border-red-300';
    case Urgency.MEDIUM:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case Urgency.LOW:
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusColor = (status: HelpRequestStatus) => {
  switch (status) {
    case HelpRequestStatus.OPEN:
      return 'bg-blue-100 text-blue-800';
    case HelpRequestStatus.CLOSED:
      return 'bg-gray-100 text-gray-800';
    case HelpRequestStatus.EXPIRED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function AdminHelpRequestsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [helpRequests, setHelpRequests] = useState<HelpRequestResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<HelpRequestStatus | 'ALL'>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | 'ALL'>('ALL');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin()) {
        router.push('/login');
        return;
      }
      loadHelpRequests();
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const loadHelpRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await helpRequestService.getAllHelpRequests();
      if (response.success && response.data) {
        setHelpRequests(response.data);
      } else {
        setError(response.error || 'Failed to load help requests');
      }
    } catch (err) {
      console.error('Error loading help requests:', err);
      setError('Failed to load help requests');
    } finally {
      setLoading(false);
    }
  };

  const filteredHelpRequests = helpRequests.filter((hr) => {
    const matchesSearch =
      !searchTerm ||
      hr.shortNote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hr.approxArea?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hr.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || hr.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'ALL' || hr.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin - Help Requests</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Requests</h1>
                <p className="text-gray-600">Manage all help requests in the system</p>
              </div>
              <Link href="/admin/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search by note, area, or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as HelpRequestStatus | 'ALL')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="ALL">All Statuses</option>
                      {Object.values(HelpRequestStatus).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Urgency</label>
                    <select
                      value={urgencyFilter}
                      onChange={(e) => setUrgencyFilter(e.target.value as Urgency | 'ALL')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="ALL">All Urgencies</option>
                      {Object.values(Urgency).map((urgency) => (
                        <option key={urgency} value={urgency}>
                          {urgency}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Help Requests List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Help Requests ({filteredHelpRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {filteredHelpRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== 'ALL' || urgencyFilter !== 'ALL'
                        ? 'No help requests found matching your filters.'
                        : 'No help requests found.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredHelpRequests.map((hr) => (
                      <Card key={hr.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="flex flex-col h-full">
                          <div className="mb-2 sm:hidden">
                            {hr.urgency && (
                              <span
                                className={`px-2 py-1 text-xs rounded border inline-block ${getUrgencyColor(hr.urgency)}`}
                              >
                                {hr.urgency}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <h3 className="font-semibold text-lg break-words">
                                {hr.shortNote || "Help Request"}
                              </h3>
                              {hr.urgency && (
                                <span
                                  className={`hidden sm:inline-block px-2 py-1 text-xs rounded border flex-shrink-0 ${getUrgencyColor(hr.urgency)}`}
                                >
                                  {hr.urgency}
                                </span>
                              )}
                            </div>
                            <div className="hidden sm:block flex-shrink-0 flex gap-2">
                              <Link href={`/request/${hr.id}`}>
                                <Button variant="outline" size="sm" className="bg-transparent">
                                  View Details
                                </Button>
                              </Link>
                              <Link href={`/help-requests/${hr.id}/edit?from=admin`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm text-gray-600 mb-4 lg:mb-0">
                            {hr.approxArea && (
                              <div className="break-words">
                                <span className="font-medium">Area:</span> {hr.approxArea}
                              </div>
                            )}
                            {hr.name && (
                              <div className="break-words">
                                <span className="font-medium">Requester:</span> {hr.name}
                              </div>
                            )}
                            {hr.contact && (
                              <div className="break-words">
                                <span className="font-medium">Contact:</span> {hr.contact}
                              </div>
                            )}
                            {hr.status && (
                              <div>
                                <span className="font-medium">Status:</span>{" "}
                                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(hr.status)}`}>
                                  {hr.status}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="sm:hidden mt-auto flex justify-start gap-2">
                            <Link href={`/request/${hr.id}`}>
                              <Button variant="outline" size="sm" className="bg-transparent">
                                View Details
                              </Button>
                            </Link>
                            <Link href={`/help-requests/${hr.id}/edit?from=admin`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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

