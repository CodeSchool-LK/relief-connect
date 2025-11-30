import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { useAuth } from '../hooks/useAuth';
import { campService } from '../services';
import { ICampDropOffLocation } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampDropOffLocation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Search, 
  Loader2, 
  MapPin, 
  Clock,
  Calendar,
  Phone,
  Building2,
  Filter,
  X
} from 'lucide-react';

// Dynamically import the map component to avoid SSR issues
const DropOffLocationsMap = dynamic(() => import('../components/DropOffLocationsMap'), { ssr: false });

interface DropOffLocationWithCamp extends Omit<ICampDropOffLocation, 'campId'> {
  campName?: string;
  campId?: number;
}

export default function DropOffLocationsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [locations, setLocations] = useState<DropOffLocationWithCamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadData();
  }, [isAuthenticated, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await campService.getAllDropOffLocations();
      if (response.success && response.data) {
        setLocations(response.data);
      } else {
        setError(response.error || 'Failed to load drop-off locations');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load drop-off locations');
    } finally {
      setLoading(false);
    }
  };

  const isLocationAvailable = (location: DropOffLocationWithCamp, date?: string, time?: string): boolean => {
    // If no date/time filters, show all locations
    if (!date && !time) return true;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check date range
    if (location.dropOffStartDate || location.dropOffEndDate) {
      const startDate = location.dropOffStartDate ? new Date(location.dropOffStartDate) : null;
      const endDate = location.dropOffEndDate ? new Date(location.dropOffEndDate) : null;

      if (date) {
        const selectedDateObj = new Date(date);
        if (startDate && selectedDateObj < startDate) return false;
        if (endDate && selectedDateObj > endDate) return false;
      } else {
        // If no date selected, check if current date is within range
        if (startDate && today < startDate) return false;
        if (endDate && today > endDate) return false;
      }
    }

    // Check time range
    if (time && location.dropOffStartTime && location.dropOffEndTime) {
      const [selectedHour, selectedMinute] = time.split(':').map(Number);
      const [startHour, startMinute] = location.dropOffStartTime.split(':').map(Number);
      const [endHour, endMinute] = location.dropOffEndTime.split(':').map(Number);

      const selectedTimeMinutes = selectedHour * 60 + selectedMinute;
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;

      if (selectedTimeMinutes < startTimeMinutes || selectedTimeMinutes > endTimeMinutes) {
        return false;
      }
    }

    return true;
  };

  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      // Search filter
      const matchesSearch = 
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.campName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.contactNumber?.includes(searchTerm);

      // Date/time availability filter
      const isAvailable = isLocationAvailable(location, selectedDate, selectedTime);

      return matchesSearch && isAvailable;
    });
  }, [locations, searchTerm, selectedDate, selectedTime]);

  const formatTimeRange = (location: DropOffLocationWithCamp): string => {
    if (location.dropOffStartTime && location.dropOffEndTime) {
      return `${location.dropOffStartTime} - ${location.dropOffEndTime}`;
    }
    return 'All day';
  };

  const formatDateRange = (location: DropOffLocationWithCamp): string => {
    if (location.dropOffStartDate || location.dropOffEndDate) {
      const start = location.dropOffStartDate 
        ? new Date(location.dropOffStartDate).toLocaleDateString()
        : 'Now';
      const end = location.dropOffEndDate
        ? new Date(location.dropOffEndDate).toLocaleDateString()
        : 'Ongoing';
      return `${start} - ${end}`;
    }
    return 'Always available';
  };

  const getTodayDateString = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>Loading Drop-off Locations</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      </>
    );
  }

  if (!isAuthenticated) return null; // Redirect handled by useEffect

  return (
    <>
      <Head>
        <title>Drop-off Locations - Find Where to Donate</title>
        <meta name="description" content="Find drop-off locations for active camps and see when they accept donations" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Drop-off Locations</h1>
            <p className="text-gray-600">
              Find drop-off locations for active camps and see when they&apos;re accepting donations
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by name, address, or camp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="date"
                  placeholder="Filter by date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getTodayDateString()}
                  className="pl-10"
                />
              </div>

              {/* Time Filter */}
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="time"
                  placeholder="Filter by time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Clear Filters */}
              {(selectedDate || selectedTime || searchTerm) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDate('');
                    setSelectedTime('');
                  }}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Map Toggle */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="mb-4"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>

            {showMap && filteredLocations.length > 0 && (
              <Card className="mb-6">
                <CardContent className="p-0">
                  <div style={{ height: '400px', width: '100%' }}>
                    <DropOffLocationsMap
                      dropOffLocations={filteredLocations.map(loc => ({
                        ...loc,
                        campName: loc.campName || 'Unknown Camp',
                        campId: loc.campId || 0,
                      }))}
                      camps={[]}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Locations List */}
          {filteredLocations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm || selectedDate || selectedTime
                  ? 'No drop-off locations found matching your filters.'
                  : 'No drop-off locations available at the moment.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLocations.map((location) => (
                <Card key={location.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{location.name}</CardTitle>
                        {location.campName && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <Building2 className="w-4 h-4" />
                            <span>{location.campName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {location.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{location.address}</span>
                      </div>
                    )}

                    {/* Date Range */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-700">Available:</span>{' '}
                        <span className="text-gray-600">{formatDateRange(location)}</span>
                      </div>
                    </div>

                    {/* Time Range */}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-700">Hours:</span>{' '}
                        <span className="text-gray-600">{formatTimeRange(location)}</span>
                      </div>
                    </div>

                    {location.contactNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <a
                          href={`tel:${location.contactNumber}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {location.contactNumber}
                        </a>
                      </div>
                    )}

                    {location.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500">{location.notes}</p>
                      </div>
                    )}

                    {location.lat && location.lng && (
                      <div className="pt-2 border-t">
                        <a
                          href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          <MapPin className="w-4 h-4" />
                          Open in Google Maps
                        </a>
                      </div>
                    )}
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

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}

