import { Request } from 'express';
import { IUser } from '@nx-mono-repo-deployment-test/shared/src/interfaces/user/IUser';

/**
 * AuthenticatedRequest type
 * Use this type in controllers that require authentication.
 * The user property is guaranteed to exist (non-nullable) after authentication middleware runs.
 * 
 * Usage:
 * import { AuthenticatedRequest } from '../types/express';
 * 
 * createSystemAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
 *   // req.user is guaranteed to exist, no need for null checks
 *   const userId = req.user.id;
 * }
 */
export interface AuthenticatedRequest extends Request {
  user: IUser; // Required (non-nullable) - guaranteed by authentication middleware
}

