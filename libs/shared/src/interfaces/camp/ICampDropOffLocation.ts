/**
 * Camp Drop-Off Location interface
 * Represents places where goods are accepted for a camp
 */
export interface ICampDropOffLocation {
  id?: number;
  campId: number;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  contactNumber?: string;
  notes?: string;
  dropOffStartDate?: Date; // Start date when this location accepts donations
  dropOffEndDate?: Date; // End date when this location accepts donations
  dropOffStartTime?: string; // Start time (e.g., "09:00" in 24-hour format)
  dropOffEndTime?: string; // End time (e.g., "17:00" in 24-hour format)
  createdAt?: Date;
  updatedAt?: Date;
}

