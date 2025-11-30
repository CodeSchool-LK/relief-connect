import { IHelpRequest, ICreateHelpRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request';
import { Urgency, ContactType } from '@nx-mono-repo-deployment-test/shared/src/enums';

// Re-export types from shared library
export type { IHelpRequest, ICreateHelpRequest };
export { Urgency, ContactType };

// Frontend-specific types
export interface HelpRequestFilters {
  urgency?: Urgency;
  district?: string;
  bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  page?: number;
  limit?: number;
}

