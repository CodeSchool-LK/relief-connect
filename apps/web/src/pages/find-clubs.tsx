import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { volunteerClubService, campService } from '../services';
import { IVolunteerClub } from '../types/volunteer-club';
import { CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Search, 
  Loader2, 
  MapPin, 
  Users,
  Package,
  Phone,
  Mail,
  Map,
  ExternalLink,
  Filter
} from 'lucide-react';
import { ICampDropOffLocation } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampDropOffLocation';
import { CampStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';

// Dynamically import the map component to avoid SSR issues
const DropOffLocationsMap = dynamic(() => import('../components/DropOffLocationsMap'), { ssr: false });

interface ClubWithCamps extends IVolunteerClub {
  camps?: CampResponseDto[];
  allDropOffLocations?: Array<ICampDropOffLocation & { campName: string; campId: number }>;
}

export default function FindClubsPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<ClubWithCamps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClub, setSelectedClub] = useState<ClubWithCamps | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load clubs and camps in parallel
      const [clubsResponse, campsResponse] = await Promise.all([
        volunteerClubService.getAllVolunteerClubs(),
        campService.getAllCamps(),
      ]);
      
      if (clubsResponse.success && clubsResponse.data) {
        const allCamps = campsResponse.success && campsResponse.data ? campsResponse.data : [];
        
        // Process clubs and match with their camps
        const clubsWithCamps: ClubWithCamps[] = clubsResponse.data.map(club => {
          // Filter camps for this club
          const clubCamps = allCamps.filter(
            camp => camp.volunteerClubId === club.id && camp.status === CampStatus.ACTIVE
          );
          
          // Collect all drop-off locations from all camps
          const allDropOffLocations: Array<ICampDropOffLocation & { campName: string; campId: number }> = [];
          clubCamps.forEach(camp => {
            if (camp.dropOffLocations && camp.dropOffLocations.length > 0) {
              camp.dropOffLocations.forEach(loc => {
                allDropOffLocations.push({
                  ...loc,
                  campName: camp.name,
                  campId: camp.id!,
                });
              });
            }
          });
          
          return {
            ...club,
            camps: clubCamps,
            allDropOffLocations,
          };
        });
        
        setClubs(clubsWithCamps);
      } else {
        setError(clubsResponse.error || 'Failed to load volunteer clubs');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load volunteer clubs');
    } finally {
      setLoading(false);
    }
  };

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchesSearch = 
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Only show clubs that have drop-off locations
      const hasDropOffLocations = club.allDropOffLocations && club.allDropOffLocations.length > 0;
      
      return matchesSearch && hasDropOffLocations;
    });
  }, [clubs, searchTerm]);

  const handleViewDropOffLocations = (club: ClubWithCamps) => {
    setSelectedClub(club);
    setShowMap(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Find Volunteer Clubs - Drop-off Locations</title>
        <meta name="description" content="Find volunteer clubs and their drop-off locations near you" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Volunteer Clubs</h1>
            <p className="text-gray-600">
              Browse volunteer clubs and find nearby drop-off locations where you can donate goods
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search clubs by name, description, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {filteredClubs.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm 
                  ? 'No clubs found matching your search with available drop-off locations.' 
                  : 'No volunteer clubs with drop-off locations available at the moment.'}
              </p>
            </div>
          ) : (
            <>
              {/* Map View Toggle */}
              {selectedClub && showMap && (
                <div className="mb-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">
                          Drop-off Locations - {selectedClub.name}
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowMap(false)}
                        >
                          Close Map
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <DropOffLocationsMap 
                        dropOffLocations={selectedClub.allDropOffLocations || []}
                        camps={selectedClub.camps || []}
                      />
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-sm text-gray-700">Drop-off Locations ({selectedClub.allDropOffLocations?.length || 0}):</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedClub.allDropOffLocations?.map((location, index) => (
                            <div key={location.id || index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <div className="flex items-start justify-between mb-1">
                                <h5 className="font-medium text-sm">{location.name}</h5>
                                {location.lat && location.lng && (
                                  <a
                                    href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Maps
                                  </a>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-1">Camp: {location.campName}</p>
                              {location.address && (
                                <p className="text-xs text-gray-600">{location.address}</p>
                              )}
                              {location.contactNumber && (
                                <a
                                  href={`tel:${location.contactNumber}`}
                                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                                >
                                  <Phone className="w-3 h-3" />
                                  {location.contactNumber}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Clubs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubs.map((club) => (
                  <Card key={club.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{club.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {club.description && (
                        <p className="text-sm text-gray-600 line-clamp-3">{club.description}</p>
                      )}

                      <div className="space-y-2 text-sm">
                        {club.address && (
                          <div className="flex items-start gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{club.address}</span>
                          </div>
                        )}
                        {club.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{club.email}</span>
                          </div>
                        )}
                        {club.contactNumber && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <a href={`tel:${club.contactNumber}`} className="text-blue-600 hover:text-blue-800">
                              {club.contactNumber}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              <span>{club.camps?.length || 0} Active Camps</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{club.allDropOffLocations?.length || 0} Drop-off Points</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleViewDropOffLocations(club)}
                          className="w-full"
                          variant="default"
                        >
                          <Map className="w-4 h-4 mr-2" />
                          View Drop-off Locations
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
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

