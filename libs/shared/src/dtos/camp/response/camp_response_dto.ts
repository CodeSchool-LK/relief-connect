import { ICamp } from '../../../interfaces/camp/ICamp';
import { CampType, PeopleRange, CampNeed, ContactType } from '../../../enums';

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
  needs: CampNeed[];
  shortNote: string;
  contactType: ContactType;
  contact?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(camp: ICamp) {
    this.id = camp.id!;
    this.lat = camp.lat;
    this.lng = camp.lng;
    this.campType = camp.campType;
    this.name = camp.name;
    this.peopleRange = camp.peopleRange;
    this.needs = camp.needs;
    this.shortNote = camp.shortNote;
    this.contactType = camp.contactType;
    this.contact = camp.contact;
    this.createdAt = camp.createdAt;
    this.updatedAt = camp.updatedAt;
  }
}

