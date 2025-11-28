import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import MapFilters from '../components/MapFilters';
import SafetyBanner from '../components/SafetyBanner';
import { helpRequestService, campService } from '../services';
import { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto';
import { CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto';
import { HelpRequestFilters } from '../types/help-request';
import { CampFilters } from '../types/camp';
import styles from '../styles/Page.module.css';

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Help() {
  const [helpRequests, setHelpRequests] = useState<HelpRequestResponseDto[]>([]);
  const [camps, setCamps] = useState<CampResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<'all' | 'individuals' | 'camps'>('all');
  const [helpRequestFilters, setHelpRequestFilters] = useState<HelpRequestFilters>({});
  const [campFilters, setCampFilters] = useState<CampFilters>({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = type === 'all' || type === 'individuals' ? helpRequestFilters : undefined;
      const campFiltersData = type === 'all' || type === 'camps' ? campFilters : undefined;

      const [helpRequestsResponse, campsResponse] = await Promise.all([
        type === 'all' || type === 'individuals'
          ? helpRequestService.getAllHelpRequests(filters)
          : Promise.resolve({ success: true, data: [] }),
        type === 'all' || type === 'camps'
          ? campService.getAllCamps(campFiltersData)
          : Promise.resolve({ success: true, data: [] }),
      ]);

      if (helpRequestsResponse.success && helpRequestsResponse.data) {
        setHelpRequests(helpRequestsResponse.data);
      }
      if (campsResponse.success && campsResponse.data) {
        setCamps(campsResponse.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, helpRequestFilters, campFilters]);

  return (
    <div className={styles.container}>
      <Head>
        <title>I Can Help - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.main}>
        <SafetyBanner />
        <div className={styles.mapPage}>
          <div className={styles.filtersSidebar}>
            <MapFilters
              type={type}
              onTypeChange={setType}
              helpRequestFilters={helpRequestFilters}
              campFilters={campFilters}
              onHelpRequestFiltersChange={setHelpRequestFilters}
              onCampFiltersChange={setCampFilters}
            />
          </div>
          <div className={styles.mapArea}>
            {loading && <div className={styles.loading}>Loading map...</div>}
            {error && <div className={styles.error}>Error: {error}</div>}
            {!loading && !error && (
              <Map
                helpRequests={type === 'all' || type === 'individuals' ? helpRequests : []}
                camps={type === 'all' || type === 'camps' ? camps : []}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

