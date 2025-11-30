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
  createdAt?: Date;
  updatedAt?: Date;
}

