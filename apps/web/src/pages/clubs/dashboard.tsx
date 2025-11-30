import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuth } from '../../hooks/useAuth';
import { helpRequestService, donationService, campService, volunteerClubService, membershipService } from '../../services';
import { IHelpRequest } from '../../types/help-request';
import { ICamp } from '../../types/camp';
import { DonationWithDonatorResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation/response/donation_with_donator_response_dto';
import { IVolunteerClub } from '../../types/volunteer-club';
import { IMembership } from '../../types/membership';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Loader2, 
  Users, 
  Package, 
  MapPin, 
  Search, 
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  Plus,
  XCircle,
  HandHeart
} from 'lucide-react';
import CreateCampDonationModal from '../../components/CreateCampDonationModal';
import Link from 'next/link';

export default function VolunteerClubDashboard() {
  const router = useRouter();
  const { isAuthenticated, isVolunteerClub, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [club, setClub] = useState<IVolunteerClub | null>(null);
  const [helpRequests, setHelpRequests] = useState<IHelpRequest[]>([]);
  const [campDonations, setCampDonations] = useState<DonationWithDonatorResponseDto[]>([]);
  const [camps, setCamps] = useState<ICamp[]>([]);
  const [memberships, setMemberships] = useState<IMembership[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'help-requests' | 'camps' | 'memberships' | 'camp-donations'>('help-requests');
  const [reviewingMembershipId, setReviewingMembershipId] = useState<number | null>(null);
  const [acceptingDonationId, setAcceptingDonationId] = useState<number | null>(null);
  const [showCreateDonationModal, setShowCreateDonationModal] = useState(false);

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
    
    loadDashboardData();
  }, [isAuthenticated, isVolunteerClub, authLoading, router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load club info
      const clubResponse = await volunteerClubService.getMyClub();
      if (clubResponse.success && clubResponse.data) {
        setClub(clubResponse.data);
      }

      // Load help requests
      const helpRequestsResponse = await helpRequestService.getAllHelpRequests();
      if (helpRequestsResponse.success && helpRequestsResponse.data) {
        setHelpRequests(helpRequestsResponse.data);
      }

      // Load camps
      const campsResponse = await campService.getAllCamps();
      if (campsResponse.success && campsResponse.data) {
        const clubCamps = clubResponse.success && clubResponse.data
          ? campsResponse.data.filter(camp => camp.volunteerClubId === clubResponse.data!.id)
          : [];
        setCamps(clubCamps);

        // Load camp donations
        const allCampDonations: DonationWithDonatorResponseDto[] = [];
        for (const camp of clubCamps) {
          try {
            const campDonations = await donationService.getDonationsByCampId(camp.id!);
            if (campDonations.success && campDonations.data) {
              allCampDonations.push(...campDonations.data);
            }
          } catch (error) {
            console.error(`Error loading donations for camp ${camp.id}:`, error);
          }
        }
        setCampDonations(allCampDonations);
      }

      // Load memberships for this club
      if (clubResponse.success && clubResponse.data && clubResponse.data.id) {
        const membershipsResponse = await membershipService.getClubMemberships(clubResponse.data.id);
        if (membershipsResponse.success && membershipsResponse.data) {
          setMemberships(membershipsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHelpRequests = helpRequests.filter(hr => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      hr.shortNote?.toLowerCase().includes(search) ||
      hr.approxArea?.toLowerCase().includes(search) ||
      hr.name?.toLowerCase().includes(search) ||
      hr.contact?.toLowerCase().includes(search)
    );
  });

  const filteredCamps = camps.filter(c => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(search) ||
      c.location?.toLowerCase().includes(search) ||
      c.shortNote?.toLowerCase().includes(search) ||
      c.description?.toLowerCase().includes(search)
    );
  });

  const filteredMemberships = memberships.filter(m => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      m.status?.toLowerCase().includes(search)
    );
  });

  const filteredCampDonations = campDonations.filter(d => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      d.donatorName?.toLowerCase().includes(search) ||
      d.donatorMobileNumber?.toLowerCase().includes(search) ||
      d.donatorUsername?.toLowerCase().includes(search)
    );
  });

  const handleAcceptCampDonation = async (campId: number, donationId: number) => {
    setAcceptingDonationId(donationId);
    try {
      const response = await donationService.acceptCampDonation(campId, donationId);
      if (response.success) {
        // Reload camp donations
        if (club?.id) {
          const campsResponse = await campService.getAllCamps();
          if (campsResponse.success && campsResponse.data) {
            const clubCamps = campsResponse.data.filter(camp => camp.volunteerClubId === club.id);
            const allCampDonations: DonationWithDonatorResponseDto[] = [];
            for (const camp of clubCamps) {
              try {
                const campDonations = await donationService.getDonationsByCampId(camp.id!);
                if (campDonations.success && campDonations.data) {
                  allCampDonations.push(...campDonations.data);
                }
              } catch (error) {
                console.error(`Error loading donations for camp ${camp.id}:`, error);
              }
            }
            setCampDonations(allCampDonations);
          }
        }
      } else {
        setError(response.error || 'Failed to accept donation');
      }
    } catch (err) {
      console.error('Error accepting camp donation:', err);
      setError('Failed to accept donation');
    } finally {
      setAcceptingDonationId(null);
    }
  };

  const handleReviewMembership = async (membershipId: number, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    setReviewingMembershipId(membershipId);
    try {
      const response = await membershipService.reviewMembership(membershipId, { status, notes });
      if (response.success) {
        // Reload memberships
        if (club?.id) {
          const membershipsResponse = await membershipService.getClubMemberships(club.id);
          if (membershipsResponse.success && membershipsResponse.data) {
            setMemberships(membershipsResponse.data);
          }
        }
      } else {
        setError(response.error || 'Failed to review membership');
      }
    } catch (err) {
      console.error('Error reviewing membership:', err);
      setError('Failed to review membership');
    } finally {
      setReviewingMembershipId(null);
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading while auth is loading or dashboard data is loading
  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>Dashboard - Volunteer Club</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600">
              {authLoading ? 'Checking authentication...' : 'Loading dashboard...'}
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

  return (
    <>
      <Head>
        <title>Dashboard - {club?.name || 'Volunteer Club'}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {club?.name || 'Volunteer Club'} Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Manage your volunteer activities</p>
              </div>
              <div className="flex gap-2">
                <Link href="/clubs/camps/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Camp
                  </Button>
                </Link>
                <Link href="/clubs/my-club">
                  <Button variant="outline">
                    <Building2 className="w-4 h-4 mr-2" />
                    View Club Info
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Help Requests</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{helpRequests.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Camps</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{camps.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {helpRequests.filter(hr => hr.status === 'OPEN').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-1 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('help-requests')}
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === 'help-requests'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Help Requests
                  </button>
                  <button
                    onClick={() => setActiveTab('camps')}
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === 'camps'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Camps
                  </button>
                  <button
                    onClick={() => setActiveTab('memberships')}
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === 'memberships'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Memberships
                    {memberships.filter(m => m.status === 'PENDING').length > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        {memberships.filter(m => m.status === 'PENDING').length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('camp-donations')}
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === 'camp-donations'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Camp Donations
                    {campDonations.filter(d => !d.ownerMarkedCompleted).length > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        {campDonations.filter(d => !d.ownerMarkedCompleted).length}
                      </span>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
              {/* Help Requests Tab */}
              {activeTab === 'help-requests' && (
                <div className="space-y-4">
                  {filteredHelpRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No help requests found</p>
                    </div>
                  ) : (
                    filteredHelpRequests.map((hr) => (
                      <Card key={hr.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{hr.shortNote || 'Help Request'}</h3>
                                {hr.urgency && (
                                  <span className={`px-2 py-1 text-xs rounded border ${getUrgencyColor(hr.urgency)}`}>
                                    {hr.urgency}
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                                {hr.approxArea && (
                                  <div>
                                    <span className="font-medium">Area:</span> {hr.approxArea}
                                  </div>
                                )}
                                {hr.name && (
                                  <div>
                                    <span className="font-medium">Requester:</span> {hr.name}
                                  </div>
                                )}
                                {hr.contact && (
                                  <div>
                                    <span className="font-medium">Contact:</span> {hr.contact}
                                  </div>
                                )}
                                {hr.status && (
                                  <div>
                                    <span className="font-medium">Status:</span>{' '}
                                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(hr.status)}`}>
                                      {hr.status}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <Link href={`/help-requests/${hr.id}`}>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                              <Link href={`/help-requests/${hr.id}/donations`}>
                                <Button variant="outline" size="sm">
                                  View Donations
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Camps Tab */}
              {activeTab === 'camps' && (
                <div className="space-y-4">
                  {filteredCamps.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No camps found</p>
                    </div>
                  ) : (
                    filteredCamps.map((camp) => (
                      <Card key={camp.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{camp.name || 'Camp'}</h3>
                                {camp.status && (
                                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(camp.status)}`}>
                                    {camp.status}
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                {camp.location && (
                                  <div>
                                    <span className="font-medium">Location:</span> {camp.location}
                                  </div>
                                )}
                                {camp.peopleRange && (
                                  <div>
                                    <span className="font-medium">People Range:</span> {camp.peopleRange}
                                  </div>
                                )}
                                {camp.peopleCount && (
                                  <div>
                                    <span className="font-medium">People Count:</span> {camp.peopleCount}
                                  </div>
                                )}
                              </div>
                              {camp.description && (
                                <p className="text-sm text-gray-600 mb-4">{camp.description}</p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <Link href={`/camps/${camp.id}`}>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Memberships Tab */}
              {activeTab === 'memberships' && (
                <div className="space-y-4">
                  {filteredMemberships.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No memberships found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Pending Memberships */}
                      {filteredMemberships.filter(m => m.status === 'PENDING').length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Pending Requests</h3>
                          {filteredMemberships.filter(m => m.status === 'PENDING').map((membership) => (
                            <Card key={membership.id} className="mb-4 border-l-4 border-l-yellow-500">
                              <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold text-lg">Membership Request #{membership.id}</h4>
                                      <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                                        PENDING
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                      <div>
                                        <span className="font-medium">User ID:</span> {membership.userId}
                                      </div>
                                      {membership.requestedAt && (
                                        <div>
                                          <span className="font-medium">Requested:</span>{' '}
                                          {new Date(membership.requestedAt).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                    {membership.notes && (
                                      <p className="text-sm text-gray-600 mb-4">{membership.notes}</p>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-2 ml-4">
                                    <Button
                                      size="sm"
                                      onClick={() => handleReviewMembership(membership.id, 'APPROVED')}
                                      disabled={reviewingMembershipId === membership.id}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      {reviewingMembershipId === membership.id ? (
                                        <>
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          Processing...
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Approve
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleReviewMembership(membership.id, 'REJECTED')}
                                      disabled={reviewingMembershipId === membership.id}
                                      className="border-red-300 text-red-700 hover:bg-red-50"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Approved Memberships */}
                      {filteredMemberships.filter(m => m.status === 'APPROVED').length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Approved Members</h3>
                          {filteredMemberships.filter(m => m.status === 'APPROVED').map((membership) => (
                            <Card key={membership.id} className="mb-4 border-l-4 border-l-green-500">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold text-lg">Member #{membership.id}</h4>
                                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                                        APPROVED
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                      <div>
                                        <span className="font-medium">User ID:</span> {membership.userId}
                                      </div>
                                      {membership.reviewedAt && (
                                        <div>
                                          <span className="font-medium">Approved:</span>{' '}
                                          {new Date(membership.reviewedAt).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Rejected Memberships */}
                      {filteredMemberships.filter(m => m.status === 'REJECTED').length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Rejected Requests</h3>
                          {filteredMemberships.filter(m => m.status === 'REJECTED').map((membership) => (
                            <Card key={membership.id} className="mb-4 border-l-4 border-l-red-500">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold text-lg">Request #{membership.id}</h4>
                                      <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                                        REJECTED
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                      <div>
                                        <span className="font-medium">User ID:</span> {membership.userId}
                                      </div>
                                      {membership.reviewedAt && (
                                        <div>
                                          <span className="font-medium">Rejected:</span>{' '}
                                          {new Date(membership.reviewedAt).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Camp Donations Tab */}
              {activeTab === 'camp-donations' && (
                <div className="space-y-4">
                  {/* Create Donation Button */}
                  <div className="flex justify-end mb-4">
                    <Button
                      onClick={() => setShowCreateDonationModal(true)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                    >
                      <HandHeart className="w-4 h-4 mr-2" />
                      Create Camp Donation
                    </Button>
                  </div>

                  {filteredCampDonations.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No camp donations found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Pending Donations */}
                      {filteredCampDonations.filter(d => !d.ownerMarkedCompleted).length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Pending Donations</h3>
                          {filteredCampDonations.filter(d => !d.ownerMarkedCompleted).map((donation) => {
                            const camp = camps.find(c => c.id === donation.campId);
                            return (
                              <Card key={donation.id} className="mb-4 border-l-4 border-l-yellow-500">
                                <CardContent className="pt-6">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-lg">
                                          Donation #{donation.id} - {camp?.name || 'Camp'}
                                        </h4>
                                        <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                                          PENDING
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                        {donation.donatorName && (
                                          <div>
                                            <span className="font-medium">Donator:</span> {donation.donatorName}
                                          </div>
                                        )}
                                        {donation.donatorMobileNumber && (
                                          <div>
                                            <span className="font-medium">Contact:</span> {donation.donatorMobileNumber}
                                          </div>
                                        )}
                                        {donation.createdAt && (
                                          <div>
                                            <span className="font-medium">Created:</span>{' '}
                                            {new Date(donation.createdAt).toLocaleDateString()}
                                          </div>
                                        )}
                                      </div>
                                      {Object.keys(donation.rationItems || {}).length > 0 && (
                                        <div className="mb-4">
                                          <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {Object.entries(donation.rationItems).map(([itemId, qty]) => (
                                              <div key={itemId} className="bg-gray-50 p-2 rounded text-sm">
                                                <span className="font-medium">{itemId}:</span> {qty}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                      {camp && (
                                        <Button
                                          size="sm"
                                          onClick={() => handleAcceptCampDonation(camp.id!, donation.id)}
                                          disabled={acceptingDonationId === donation.id}
                                          className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                          {acceptingDonationId === donation.id ? (
                                            <>
                                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                              Accepting...
                                            </>
                                          ) : (
                                            <>
                                              <CheckCircle className="w-4 h-4 mr-2" />
                                              Accept
                                            </>
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}

                      {/* Accepted Donations */}
                      {filteredCampDonations.filter(d => d.ownerMarkedCompleted).length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Accepted Donations</h3>
                          {filteredCampDonations.filter(d => d.ownerMarkedCompleted).map((donation) => {
                            const camp = camps.find(c => c.id === donation.campId);
                            return (
                              <Card key={donation.id} className="mb-4 border-l-4 border-l-green-500">
                                <CardContent className="pt-6">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-lg">
                                          Donation #{donation.id} - {camp?.name || 'Camp'}
                                        </h4>
                                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                                          ACCEPTED
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                        {donation.donatorName && (
                                          <div>
                                            <span className="font-medium">Donator:</span> {donation.donatorName}
                                          </div>
                                        )}
                                        {donation.createdAt && (
                                          <div>
                                            <span className="font-medium">Created:</span>{' '}
                                            {new Date(donation.createdAt).toLocaleDateString()}
                                          </div>
                                        )}
                                      </div>
                                      {Object.keys(donation.rationItems || {}).length > 0 && (
                                        <div className="mt-4">
                                          <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {Object.entries(donation.rationItems).map(([itemId, qty]) => (
                                              <div key={itemId} className="bg-gray-50 p-2 rounded text-sm">
                                                <span className="font-medium">{itemId}:</span> {qty}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Camp Donation Modal */}
      {showCreateDonationModal && (
        <CreateCampDonationModal
          camps={camps}
          isOpen={showCreateDonationModal}
          onClose={() => setShowCreateDonationModal(false)}
          currentUserId={user?.id}
          onDonationCreated={async () => {
            await loadDashboardData();
          }}
        />
      )}
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

