import DonationModel from '../models/donation.model';
import HelpRequestModel from '../models/help-request.model';
import CampModel from '../models/camp.model';
import UserModel from '../models/user.model';
import { IDonation } from '@nx-mono-repo-deployment-test/shared/src/interfaces/donation/IDonation';

class DonationDao {
  private static instance: DonationDao;

  private constructor() {}

  public static getInstance(): DonationDao {
    if (!DonationDao.instance) {
      DonationDao.instance = new DonationDao();
    }
    return DonationDao.instance;
  }

  /**
   * Find all donations for a help request with donator information
   */
  public async findByHelpRequestId(helpRequestId: number): Promise<Array<IDonation & { donator?: { id: number; username: string; contactNumber?: string } }>> {
    try {
      const donations = await DonationModel.findAll({
        where: {
          [DonationModel.DONATION_HELP_REQUEST_ID]: helpRequestId,
        },
        include: [{
          model: UserModel,
          as: 'donator',
          attributes: ['id', 'username', 'contactNumber'],
        }],
        order: [[DonationModel.DONATION_CREATED_AT, 'DESC']],
      });
      return donations.map(d => {
        const donation = d.toJSON() as IDonation & { donator?: { id: number; username: string; contactNumber?: string } };
        return donation;
      });
    } catch (error) {
      console.error(`Error in DonationDao.findByHelpRequestId (${helpRequestId}):`, error);
      throw error;
    }
  }

  /**
   * Find donation by ID
   */
  public async findById(id: number): Promise<IDonation | null> {
    try {
      const donation = await DonationModel.findByPk(id);
      return donation ? (donation.toJSON() as IDonation) : null;
    } catch (error) {
      console.error(`Error in DonationDao.findById (${id}):`, error);
      throw error;
    }
  }

  /**
   * Find all donations made by a specific donator
   * Includes help request information
   */
  public async findByDonatorId(donatorId: number): Promise<Array<IDonation & { helpRequest?: any }>> {
    try {
      const donations = await DonationModel.findAll({
        where: {
          [DonationModel.DONATION_DONATOR_ID]: donatorId,
        },
        include: [{
          model: HelpRequestModel,
          as: 'helpRequest',
          attributes: ['id', 'lat', 'lng', 'urgency', 'shortNote', 'approxArea', 'contactType', 'contact', 'name', 'totalPeople', 'elders', 'children', 'pets', 'rationItems', 'status', 'createdAt', 'updatedAt'],
        }],
        order: [[DonationModel.DONATION_CREATED_AT, 'DESC']],
      });
      return donations.map(d => {
        const donation = d.toJSON() as IDonation & { helpRequest?: any };
        return donation;
      });
    } catch (error) {
      console.error(`Error in DonationDao.findByDonatorId (${donatorId}):`, error);
      throw error;
    }
  }

  /**
   * Create a new donation
   */
  public async create(
    helpRequestId: number | undefined,
    donatorId: number,
    donatorName: string,
    donatorMobileNumber: string,
    rationItems: Record<string, number>,
    campId?: number
  ): Promise<IDonation> {
    try {
      const donationData: any = {
        [DonationModel.DONATION_DONATOR_ID]: donatorId,
        [DonationModel.DONATION_DONATOR_NAME]: donatorName,
        [DonationModel.DONATION_DONATOR_MOBILE_NUMBER]: donatorMobileNumber,
        [DonationModel.DONATION_RATION_ITEMS]: rationItems,
        [DonationModel.DONATION_DONATOR_MARKED_SCHEDULED]: false,
        [DonationModel.DONATION_DONATOR_MARKED_COMPLETED]: false,
        [DonationModel.DONATION_OWNER_MARKED_COMPLETED]: false,
      };

      if (helpRequestId) {
        donationData[DonationModel.DONATION_HELP_REQUEST_ID] = helpRequestId;
      }
      if (campId) {
        donationData[DonationModel.DONATION_CAMP_ID] = campId;
      }

      const donation = await DonationModel.create(donationData);
      return donation.toJSON() as IDonation;
    } catch (error) {
      console.error('Error in DonationDao.create:', error);
      throw error;
    }
  }

  /**
   * Find all donations for a camp with donator information
   */
  public async findByCampId(campId: number): Promise<Array<IDonation & { donator?: { id: number; username: string; contactNumber?: string } }>> {
    try {
      const donations = await DonationModel.findAll({
        where: {
          [DonationModel.DONATION_CAMP_ID]: campId,
        },
        include: [{
          model: UserModel,
          as: 'donator',
          attributes: ['id', 'username', 'contactNumber'],
        }],
        order: [[DonationModel.DONATION_CREATED_AT, 'DESC']],
      });
      return donations.map(d => {
        const donation = d.toJSON() as IDonation & { donator?: { id: number; username: string; contactNumber?: string } };
        return donation;
      });
    } catch (error) {
      console.error(`Error in DonationDao.findByCampId (${campId}):`, error);
      throw error;
    }
  }

  /**
   * Update donation - mark as scheduled by donator
   */
  public async markAsScheduled(id: number): Promise<IDonation | null> {
    try {
      const donation = await DonationModel.findByPk(id);
      if (!donation) {
        return null;
      }

      donation[DonationModel.DONATION_DONATOR_MARKED_SCHEDULED] = true;
      await donation.save();

      return donation.toJSON() as IDonation;
    } catch (error) {
      console.error(`Error in DonationDao.markAsScheduled (${id}):`, error);
      throw error;
    }
  }

  /**
   * Update donation - mark as completed by donator
   */
  public async markAsCompletedByDonator(id: number): Promise<IDonation | null> {
    try {
      const donation = await DonationModel.findByPk(id);
      if (!donation) {
        return null;
      }

      donation[DonationModel.DONATION_DONATOR_MARKED_COMPLETED] = true;
      await donation.save();

      return donation.toJSON() as IDonation;
    } catch (error) {
      console.error(`Error in DonationDao.markAsCompletedByDonator (${id}):`, error);
      throw error;
    }
  }

  /**
   * Update donation - mark as completed by owner
   */
  public async markAsCompletedByOwner(id: number): Promise<IDonation | null> {
    try {
      const donation = await DonationModel.findByPk(id);
      if (!donation) {
        return null;
      }

      donation[DonationModel.DONATION_OWNER_MARKED_COMPLETED] = true;
      await donation.save();

      return donation.toJSON() as IDonation;
    } catch (error) {
      console.error(`Error in DonationDao.markAsCompletedByOwner (${id}):`, error);
      throw error;
    }
  }
}

export default DonationDao;

