import { ICamp, ICreateCamp } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp';
import { CampType, PeopleRange, CampNeed, ContactType } from '@nx-mono-repo-deployment-test/shared/src/enums';

// Re-export types from shared library
export type { ICamp, ICreateCamp };
export { CampType, PeopleRange, CampNeed, ContactType };

// Frontend-specific types
export interface CampFilters {
  campType?: CampType;
  needs?: CampNeed[];
  district?: string;
}

