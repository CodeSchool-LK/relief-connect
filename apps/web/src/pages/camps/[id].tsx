import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { campService } from '../../services';
import { CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  Users,
  Package,
  Phone,
  MessageSquare,
  AlertCircle,
  Calendar,
  CheckCircle,
  XCircle,
  Edit
} from 'lucide-react';
import { CampType, PeopleRange, CampNeed, ContactType, CampStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';

export default function CampDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [camp, setCamp] = useState<CampResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (id) {
      loadCamp();
    }
  }, [id, isAuthenticated, authLoading, router]);

  const loadCamp = async () => {
    if (!id || typeof id !== 'string') {
      setError('Invalid camp ID');
      setLoading(false);
      return;
    }

    const campId = parseInt(id, 10);
    if (isNaN(campId)) {
      setError('Invalid camp ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await campService.getCampById(campId);
      if (response.success && response.data) {
        setCamp(response.data);
      } else {
        setError(response.error || 'Camp not found');
      }
    } catch (err) {
      console.error('Error loading camp:', err);
      setError(err instanceof Error ? err.message : 'Failed to load camp');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (error || !camp) {
    return (
      <>
        <Head>
          <title>Camp Not Found - Volunteer Club</title>
        </Head>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/clubs/dashboard">
              <Button variant="outline" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Camp Not Found</h2>
                  <p className="text-gray-600 mb-6">{error || 'The camp you are looking for does not exist or you do not have permission to view it.'}</p>
                  <Link href="/clubs/dashboard">
                    <Button>Go to Dashboard</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const getPeopleRangeLabel = (range: PeopleRange): string => {
    switch (range) {
      case PeopleRange.ONE_TO_TEN:
        return '1-10 people';
      case PeopleRange.TEN_TO_FIFTY:
        return '10-50 people';
      case PeopleRange.FIFTY_PLUS:
        return '50+ people';
      default:
        return range;
    }
  };

  const getStatusBadge = (status?: CampStatus) => {
    if (!status) return null;
    
    const statusConfig = {
      [CampStatus.ACTIVE]: { label: 'Active', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      [CampStatus.INACTIVE]: { label: 'Inactive', icon: XCircle, className: 'bg-gray-100 text-gray-800' },
      [CampStatus.COMPLETED]: { label: 'Completed', icon: CheckCircle, className: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <>
      <Head>
        <title>{camp.name} - Camp Details</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/clubs/dashboard">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{camp.name}</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-600">
                      {camp.campType === CampType.OFFICIAL ? '🏛️ Official' : '🏘️ Community'} Camp
                    </span>
                    {getStatusBadge(camp.status)}
                  </div>
                </div>
                <Link href={`/camps/${camp.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Camp
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Latitude:</span>
                      <span className="ml-2 font-mono">{camp.lat}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Longitude:</span>
                      <span className="ml-2 font-mono">{camp.lng}</span>
                    </div>
                  </div>
                  {camp.location && (
                    <div className="text-sm">
                      <span className="text-gray-600">Address:</span>
                      <span className="ml-2">{camp.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* People Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  People Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">People Range:</span>
                    <span className="ml-2 font-medium">{getPeopleRangeLabel(camp.peopleRange)}</span>
                  </div>
                  {camp.peopleCount && (
                    <div className="text-sm">
                      <span className="text-gray-600">Exact Count:</span>
                      <span className="ml-2 font-medium">{camp.peopleCount} people</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Needs */}
              {camp.needs && camp.needs.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Camp Needs
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {camp.needs.map((need, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {camp.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{camp.description}</p>
                </div>
              )}

              {/* Short Note */}
              {camp.shortNote && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Short Note</h3>
                  <p className="text-gray-700">{camp.shortNote}</p>
                </div>
              )}

              {/* Contact Information */}
              {camp.contactType !== ContactType.NONE && camp.contact && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    {camp.contactType === ContactType.PHONE ? (
                      <Phone className="w-5 h-5" />
                    ) : (
                      <MessageSquare className="w-5 h-5" />
                    )}
                    Contact Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      {camp.contactType === ContactType.PHONE ? (
                        <a
                          href={`tel:${camp.contact}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {camp.contact}
                        </a>
                      ) : (
                        <a
                          href={`https://wa.me/${camp.contact.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {camp.contact}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              {(camp.createdAt || camp.updatedAt) && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Timestamps
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    {camp.createdAt && (
                      <div>
                        <span className="text-gray-600">Created:</span>
                        <span className="ml-2">
                          {new Date(camp.createdAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {camp.updatedAt && (
                      <div>
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="ml-2">
                          {new Date(camp.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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

