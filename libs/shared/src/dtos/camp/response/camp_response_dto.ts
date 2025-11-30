import { ICamp } from '../../../interfaces/camp/ICamp';
import { ICampItem } from '../../../interfaces/camp/ICampItem';
import { ICampDropOffLocation } from '../../../interfaces/camp/ICampDropOffLocation';
import { CampType, PeopleRange, CampNeed, ContactType, CampStatus } from '../../../enums';

/**
 * DTO for camp response
 */
export class CampResponseDto implements ICamp {
  id: number;
  lat: number;
  lng: number;
  campType: CampType;
  name: string;
  peopleRange: PeopleRange;
  peopleCount?: number;
  needs: CampNeed[];
  shortNote: string;
  description?: string;
  location?: string;
  contactType: ContactType;
  contact?: string;
  volunteerClubId?: number;
  status?: CampStatus;
  createdAt?: Date;
  updatedAt?: Date;
  items?: ICampItem[];
  dropOffLocations?: ICampDropOffLocation[];
  helpRequestIds?: number[];
  donationIds?: number[];

  constructor(camp: ICamp, items?: ICampItem[], dropOffLocations?: ICampDropOffLocation[], helpRequestIds?: number[], donationIds?: number[]) {
    this.id = camp.id!;
    this.lat = camp.lat;
    this.lng = camp.lng;
    this.campType = camp.campType;
    this.name = camp.name;
    this.peopleRange = camp.peopleRange;
    this.peopleCount = camp.peopleCount;
    this.needs = camp.needs;
    this.shortNote = camp.shortNote;
    this.description = camp.description;
    this.location = camp.location;
    this.contactType = camp.contactType;
    this.contact = camp.contact;
    this.volunteerClubId = camp.volunteerClubId;
    this.status = camp.status;
    this.createdAt = camp.createdAt;
    this.updatedAt = camp.updatedAt;
    this.items = items;
    this.dropOffLocations = dropOffLocations;
    this.helpRequestIds = helpRequestIds;
    this.donationIds = donationIds;
  }
}

