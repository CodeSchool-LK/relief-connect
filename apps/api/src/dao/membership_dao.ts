import UserVolunteerClubMembershipModel from '../models/user-volunteer-club-membership.model';
import { 
  IUserVolunteerClubMembership, 
  MembershipStatus
} from '@nx-mono-repo-deployment-test/shared';

class MembershipDao {
  private static instance: MembershipDao;

  private constructor() {}

  public static getInstance(): MembershipDao {
    if (!MembershipDao.instance) {
      MembershipDao.instance = new MembershipDao();
    }
    return MembershipDao.instance;
  }

  /**
   * Find membership by ID
   */
  public async findById(id: number): Promise<IUserVolunteerClubMembership | null> {
    try {
      const membership = await UserVolunteerClubMembershipModel.findByPk(id);
      return membership ? (membership.toJSON() as IUserVolunteerClubMembership) : null;
    } catch (error) {
      console.error(`Error in MembershipDao.findById (${id}):`, error);
      throw error;
    }
  }

  /**
   * Find all memberships for a user
   */
  public async findByUserId(userId: number): Promise<IUserVolunteerClubMembership[]> {
    try {
      const memberships = await UserVolunteerClubMembershipModel.findAll({
        where: {
          [UserVolunteerClubMembershipModel.MEMBERSHIP_USER_ID]: userId,
        },
        order: [['createdAt', 'DESC']],
      });
      return memberships.map(membership => membership.toJSON() as IUserVolunteerClubMembership);
    } catch (error) {
      console.error(`Error in MembershipDao.findByUserId (${userId}):`, error);
      throw error;
    }
  }

  /**
   * Find all memberships for a volunteer club
   */
  public async findByVolunteerClubId(volunteerClubId: number): Promise<IUserVolunteerClubMembership[]> {
    try {
      const memberships = await UserVolunteerClubMembershipModel.findAll({
        where: {
          [UserVolunteerClubMembershipModel.MEMBERSHIP_VOLUNTEER_CLUB_ID]: volunteerClubId,
        },
        order: [['createdAt', 'DESC']],
      });
      return memberships.map(membership => membership.toJSON() as IUserVolunteerClubMembership);
    } catch (error) {
      console.error(`Error in MembershipDao.findByVolunteerClubId (${volunteerClubId}):`, error);
      throw error;
    }
  }

  /**
   * Find specific membership by user and club
   */
  public async findByUserAndClub(userId: number, volunteerClubId: number): Promise<IUserVolunteerClubMembership | null> {
    try {
      const membership = await UserVolunteerClubMembershipModel.findOne({
        where: {
          [UserVolunteerClubMembershipModel.MEMBERSHIP_USER_ID]: userId,
          [UserVolunteerClubMembershipModel.MEMBERSHIP_VOLUNTEER_CLUB_ID]: volunteerClubId,
        },
      });
      return membership ? (membership.toJSON() as IUserVolunteerClubMembership) : null;
    } catch (error) {
      console.error(`Error in MembershipDao.findByUserAndClub (${userId}, ${volunteerClubId}):`, error);
      throw error;
    }
  }

  /**
   * Find pending memberships for a club
   */
  public async findPendingByClub(volunteerClubId: number): Promise<IUserVolunteerClubMembership[]> {
    try {
      const memberships = await UserVolunteerClubMembershipModel.findAll({
        where: {
          [UserVolunteerClubMembershipModel.MEMBERSHIP_VOLUNTEER_CLUB_ID]: volunteerClubId,
          [UserVolunteerClubMembershipModel.MEMBERSHIP_STATUS]: MembershipStatus.PENDING,
        },
        order: [['requestedAt', 'ASC']],
      });
      return memberships.map(membership => membership.toJSON() as IUserVolunteerClubMembership);
    } catch (error) {
      console.error(`Error in MembershipDao.findPendingByClub (${volunteerClubId}):`, error);
      throw error;
    }
  }

  /**
   * Create a new membership request
   */
  public async create(userId: number, volunteerClubId: number): Promise<IUserVolunteerClubMembership> {
    try {
      const membership = await UserVolunteerClubMembershipModel.create({
        [UserVolunteerClubMembershipModel.MEMBERSHIP_USER_ID]: userId,
        [UserVolunteerClubMembershipModel.MEMBERSHIP_VOLUNTEER_CLUB_ID]: volunteerClubId,
        [UserVolunteerClubMembershipModel.MEMBERSHIP_STATUS]: MembershipStatus.PENDING,
        [UserVolunteerClubMembershipModel.MEMBERSHIP_REQUESTED_AT]: new Date(),
      });
      return membership.toJSON() as IUserVolunteerClubMembership;
    } catch (error) {
      console.error('Error in MembershipDao.create:', error);
      throw error;
    }
  }

  /**
   * Update membership status (approve/reject)
   */
  public async updateStatus(
    id: number, 
    status: MembershipStatus, 
    reviewedBy: number,
    notes?: string
  ): Promise<IUserVolunteerClubMembership | null> {
    try {
      const membership = await UserVolunteerClubMembershipModel.findByPk(id);
      if (!membership) {
        return null;
      }

      await membership.update({
        [UserVolunteerClubMembershipModel.MEMBERSHIP_STATUS]: status,
        [UserVolunteerClubMembershipModel.MEMBERSHIP_REVIEWED_AT]: new Date(),
        [UserVolunteerClubMembershipModel.MEMBERSHIP_REVIEWED_BY]: reviewedBy,
        [UserVolunteerClubMembershipModel.MEMBERSHIP_NOTES]: notes,
      });

      return membership.toJSON() as IUserVolunteerClubMembership;
    } catch (error) {
      console.error(`Error in MembershipDao.updateStatus (${id}):`, error);
      throw error;
    }
  }

  /**
   * Delete a membership (cancel request)
   */
  public async delete(id: number): Promise<boolean> {
    try {
      const membership = await UserVolunteerClubMembershipModel.findByPk(id);
      if (!membership) {
        return false;
      }
      await membership.destroy();
      return true;
    } catch (error) {
      console.error(`Error in MembershipDao.delete (${id}):`, error);
      throw error;
    }
  }
}

export default MembershipDao;

