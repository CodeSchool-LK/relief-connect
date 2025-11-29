import { MembershipDao, VolunteerClubDao } from '../dao';
import { 
  RequestMembershipDto,
  ReviewMembershipDto,
  MembershipResponseDto,
  MembershipStatus,
  IApiResponse
} from '@nx-mono-repo-deployment-test/shared';

/**
 * Service layer for Membership business logic
 */
class MembershipService {
  private static instance: MembershipService;
  private membershipDao: MembershipDao;
  private volunteerClubDao: VolunteerClubDao;

  private constructor(membershipDao: MembershipDao, volunteerClubDao: VolunteerClubDao) {
    this.membershipDao = membershipDao;
    this.volunteerClubDao = volunteerClubDao;
  }

  /**
   * Get MembershipService singleton instance
   */
  public static getInstance(): MembershipService {
    if (!MembershipService.instance) {
      MembershipService.instance = new MembershipService(
        MembershipDao.getInstance(),
        VolunteerClubDao.getInstance()
      );
    }
    return MembershipService.instance;
  }

  /**
   * Request membership to a volunteer club
   */
  public async requestMembership(userId: number, requestDto: RequestMembershipDto): Promise<IApiResponse<MembershipResponseDto>> {
    try {
      // Check if volunteer club exists
      const club = await this.volunteerClubDao.findById(requestDto.volunteerClubId);
      if (!club) {
        return {
          success: false,
          error: 'Volunteer club not found',
        };
      }

      // Check if membership already exists
      const existingMembership = await this.membershipDao.findByUserAndClub(userId, requestDto.volunteerClubId);
      if (existingMembership) {
        if (existingMembership.status === MembershipStatus.PENDING) {
          return {
            success: false,
            error: 'Membership request already pending',
          };
        }
        if (existingMembership.status === MembershipStatus.APPROVED) {
          return {
            success: false,
            error: 'You are already a member of this club',
          };
        }
        // If rejected, allow new request
      }

      const membership = await this.membershipDao.create(userId, requestDto.volunteerClubId);
      return {
        success: true,
        data: new MembershipResponseDto(membership),
        message: 'Membership request submitted successfully',
      };
    } catch (error) {
      console.error('Error in MembershipService.requestMembership:', error);
      return {
        success: false,
        error: 'Failed to submit membership request',
      };
    }
  }

  /**
   * Get user's memberships
   */
  public async getMyMemberships(userId: number): Promise<IApiResponse<MembershipResponseDto[]>> {
    try {
      const memberships = await this.membershipDao.findByUserId(userId);
      return {
        success: true,
        data: memberships.map(membership => new MembershipResponseDto(membership)),
      };
    } catch (error) {
      console.error(`Error in MembershipService.getMyMemberships (${userId}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve memberships',
      };
    }
  }

  /**
   * Get all memberships for a volunteer club
   */
  public async getClubMemberships(volunteerClubId: number): Promise<IApiResponse<MembershipResponseDto[]>> {
    try {
      // Verify club exists
      const club = await this.volunteerClubDao.findById(volunteerClubId);
      if (!club) {
        return {
          success: false,
          error: 'Volunteer club not found',
        };
      }

      const memberships = await this.membershipDao.findByVolunteerClubId(volunteerClubId);
      return {
        success: true,
        data: memberships.map(membership => new MembershipResponseDto(membership)),
      };
    } catch (error) {
      console.error(`Error in MembershipService.getClubMemberships (${volunteerClubId}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve club memberships',
      };
    }
  }

  /**
   * Review (approve/reject) a membership request
   */
  public async reviewMembership(
    membershipId: number, 
    reviewDto: ReviewMembershipDto, 
    reviewerId: number
  ): Promise<IApiResponse<MembershipResponseDto>> {
    try {
      const membership = await this.membershipDao.findById(membershipId);
      if (!membership) {
        return {
          success: false,
          error: 'Membership not found',
        };
      }

      if (membership.status !== MembershipStatus.PENDING) {
        return {
          success: false,
          error: 'Membership request has already been reviewed',
        };
      }

      if (reviewDto.status !== MembershipStatus.APPROVED && reviewDto.status !== MembershipStatus.REJECTED) {
        return {
          success: false,
          error: 'Status must be APPROVED or REJECTED',
        };
      }

      const updatedMembership = await this.membershipDao.updateStatus(
        membershipId,
        reviewDto.status,
        reviewerId,
        reviewDto.notes
      );

      if (!updatedMembership) {
        return {
          success: false,
          error: 'Failed to update membership status',
        };
      }

      return {
        success: true,
        data: new MembershipResponseDto(updatedMembership),
        message: `Membership request ${reviewDto.status.toLowerCase()} successfully`,
      };
    } catch (error) {
      console.error(`Error in MembershipService.reviewMembership (${membershipId}):`, error);
      return {
        success: false,
        error: 'Failed to review membership request',
      };
    }
  }

  /**
   * Cancel a membership request (user cancels their own pending request)
   */
  public async cancelMembership(membershipId: number, userId: number): Promise<IApiResponse<void>> {
    try {
      const membership = await this.membershipDao.findById(membershipId);
      if (!membership) {
        return {
          success: false,
          error: 'Membership not found',
        };
      }

      if (membership.userId !== userId) {
        return {
          success: false,
          error: 'You can only cancel your own membership requests',
        };
      }

      if (membership.status !== MembershipStatus.PENDING) {
        return {
          success: false,
          error: 'Only pending membership requests can be cancelled',
        };
      }

      const deleted = await this.membershipDao.delete(membershipId);
      if (!deleted) {
        return {
          success: false,
          error: 'Failed to cancel membership request',
        };
      }

      return {
        success: true,
        message: 'Membership request cancelled successfully',
      };
    } catch (error) {
      console.error(`Error in MembershipService.cancelMembership (${membershipId}):`, error);
      return {
        success: false,
        error: 'Failed to cancel membership request',
      };
    }
  }

  /**
   * Get membership by ID (with authorization check)
   */
  public async getMembershipById(id: number, requesterId: number): Promise<IApiResponse<MembershipResponseDto>> {
    try {
      const membership = await this.membershipDao.findById(id);
      if (!membership) {
        return {
          success: false,
          error: 'Membership not found',
        };
      }

      // User can view their own membership, or if they're admin/club admin
      // For now, allow user to view their own membership
      // Authorization for club admins will be handled at controller level
      if (membership.userId !== requesterId) {
        // Check if requester is club admin or system admin (handled at controller level)
        // For now, return error - controller will check permissions
        return {
          success: false,
          error: 'Access denied',
        };
      }

      return {
        success: true,
        data: new MembershipResponseDto(membership),
      };
    } catch (error) {
      console.error(`Error in MembershipService.getMembershipById (${id}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve membership',
      };
    }
  }
}

export default MembershipService;
export { MembershipService };

