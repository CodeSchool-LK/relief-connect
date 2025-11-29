import { Urgency, HelpRequestStatus } from '../../enums';

/**
 * People summary statistics
 */
export interface IHelpRequestPeopleSummary {
  totalPeople: number;
  elders: number;
  children: number;
  pets: number;
}

/**
 * Ration item inventory statistics
 * Calculated from inventory items for accurate tracking
 */
export interface IRationItemInventorySummary {
  quantityNeeded: number; // Total quantity needed across all help requests
  quantityDonated: number; // Total confirmed donated quantity
  quantityPending: number; // Total pending donation quantity
  quantityRemaining: number; // Calculated: quantityNeeded - quantityDonated
  requestCount: number; // Number of help requests requesting this item
}

/**
 * Comprehensive summary statistics for help requests
 * Used for dashboard and analytics endpoints
 * Now uses inventory data for accurate ration item statistics
 */
export interface IHelpRequestSummary {
  total: number;
  byUrgency: Record<Urgency, number>;
  byStatus: Record<HelpRequestStatus, number>;
  byDistrict: Record<string, number>;
  people: IHelpRequestPeopleSummary;
  rationItems: Record<string, IRationItemInventorySummary>; // Now includes detailed inventory stats
}

