import { IHelpRequest, ICreateHelpRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request';
import { HelpRequestCategory, Urgency, ContactType } from '@nx-mono-repo-deployment-test/shared/src/enums';

// Re-export types from shared library
export type { IHelpRequest, ICreateHelpRequest };
export { HelpRequestCategory, Urgency, ContactType };

// Frontend-specific types
export interface HelpRequestFilters {
  category?: HelpRequestCategory;
  urgency?: Urgency;
  district?: string;
}

