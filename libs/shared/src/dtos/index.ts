/**
 * Domain-based hierarchical barrel export for all DTOs
 * 
 * Structure:
 * - common/    - Base classes and utilities (BaseDto, ValidationFailedError)
 * - params/    - URL parameter and query validation DTOs (IdParamDto)
 * - item/      - Item domain DTOs
 *   - request/ - Item request DTOs (CreateItemDto, UpdateItemDto)
 *   - response/- Item response DTOs (ItemResponseDto)
 * 
 * Future domains can follow the same pattern:
 * - user/
 *   - request/
 *   - response/
 * - order/
 *   - request/
 *   - response/
 */

// Export all DTOs from their respective categories
export * from './common';
export * from './params';
export * from './item';
export * from './help-request';
export * from './camp';
export * from './user';
export * from './auth';
export * from './donation';
export * from './inventory';
export * from './volunteer-club';
export * from './membership';
export * from './admin';

// Re-export commonly used types for convenience
export { BaseDto, ValidationFailedError } from './common/base_dto';
export { IdParamDto } from './params';
export { CreateItemDto, UpdateItemDto, ItemResponseDto } from './item';
export { CreateHelpRequestDto, HelpRequestResponseDto } from './help-request';
export { CreateCampDto, CampResponseDto } from './camp';
export { CreateUserDto, UserResponseDto } from './user';
export { LoginDto, LoginResponseDto, RefreshTokenDto } from './auth';
export { CreateDonationDto, DonationResponseDto } from './donation';
export { InventoryItemResponseDto } from './inventory';
export { CreateVolunteerClubDto, UpdateVolunteerClubDto, VolunteerClubResponseDto } from './volunteer-club';
export { RequestMembershipDto, ReviewMembershipDto, MembershipResponseDto } from './membership';
export { CreateAdminDto, CreateVolunteerClubUserDto, GeneratePasswordResponseDto } from './admin';

