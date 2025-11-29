/**
 * Barrel export for all middleware
 */
export { 
  validateBody, 
  validateParams, 
  validateQuery,
  ValidationMiddleware,
  ValidatedRequest 
} from './validation';
export { normalizeResponse } from './responseHandler';
export { authenticate, optionalAuthenticate } from './authentication';
export { errorHandler, AppError } from './errorHandler';
export { authorize, requireAdmin, requireVolunteerClub, requireAdminOrVolunteerClub, requireAuthenticated } from './authorization';

