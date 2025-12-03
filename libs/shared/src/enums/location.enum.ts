/**
 * Enums for Sri Lanka Provinces and Districts
 * Using numeric values for better database query performance
 */

/**
 * Sri Lanka Provinces (9 provinces)
 */
export enum Province {
  WESTERN = 1,
  CENTRAL = 2,
  SOUTHERN = 3,
  NORTHERN = 4,
  EASTERN = 5,
  NORTH_WESTERN = 6,
  NORTH_CENTRAL = 7,
  UVA = 8,
  SABARAGAMUWA = 9,
}

/**
 * Sri Lanka Districts (25 districts)
 */
export enum District {
  // Western Province (1)
  COLOMBO = 1,
  GAMPAHA = 2,
  KALUTARA = 3,
  
  // Central Province (2)
  KANDY = 4,
  MATALE = 5,
  NUWARA_ELIYA = 6,
  
  // Southern Province (3)
  GALLE = 7,
  MATARA = 8,
  HAMBANTOTA = 9,
  
  // Northern Province (4)
  JAFFNA = 10,
  KILINOCHCHI = 11,
  MANNAR = 12,
  MULLAITIVU = 13,
  VAVUNIYA = 14,
  
  // Eastern Province (5)
  BATTICALOA = 15,
  AMPARA = 16,
  TRINCOMALEE = 17,
  
  // North Western Province (6)
  KURUNEGALA = 18,
  PUTTALAM = 19,
  
  // North Central Province (7)
  ANURADHAPURA = 20,
  POLONNARUWA = 21,
  
  // Uva Province (8)
  BADULLA = 22,
  MONARAGALA = 23,
  
  // Sabaragamuwa Province (9)
  RATNAPURA = 24,
  KEGALLE = 25,
}

/**
 * Mapping of Province enum to display name
 */
export const PROVINCE_NAMES: Record<Province, string> = {
  [Province.WESTERN]: 'Western Province',
  [Province.CENTRAL]: 'Central Province',
  [Province.SOUTHERN]: 'Southern Province',
  [Province.NORTHERN]: 'Northern Province',
  [Province.EASTERN]: 'Eastern Province',
  [Province.NORTH_WESTERN]: 'North Western Province',
  [Province.NORTH_CENTRAL]: 'North Central Province',
  [Province.UVA]: 'Uva Province',
  [Province.SABARAGAMUWA]: 'Sabaragamuwa Province',
};

/**
 * Mapping of District enum to display name
 */
export const DISTRICT_NAMES: Record<District, string> = {
  [District.COLOMBO]: 'Colombo',
  [District.GAMPAHA]: 'Gampaha',
  [District.KALUTARA]: 'Kalutara',
  [District.KANDY]: 'Kandy',
  [District.MATALE]: 'Matale',
  [District.NUWARA_ELIYA]: 'Nuwara Eliya',
  [District.GALLE]: 'Galle',
  [District.MATARA]: 'Matara',
  [District.HAMBANTOTA]: 'Hambantota',
  [District.JAFFNA]: 'Jaffna',
  [District.KILINOCHCHI]: 'Kilinochchi',
  [District.MANNAR]: 'Mannar',
  [District.MULLAITIVU]: 'Mullaitivu',
  [District.VAVUNIYA]: 'Vavuniya',
  [District.BATTICALOA]: 'Batticaloa',
  [District.AMPARA]: 'Ampara',
  [District.TRINCOMALEE]: 'Trincomalee',
  [District.KURUNEGALA]: 'Kurunegala',
  [District.PUTTALAM]: 'Puttalam',
  [District.ANURADHAPURA]: 'Anuradhapura',
  [District.POLONNARUWA]: 'Polonnaruwa',
  [District.BADULLA]: 'Badulla',
  [District.MONARAGALA]: 'Monaragala',
  [District.RATNAPURA]: 'Ratnapura',
  [District.KEGALLE]: 'Kegalle',
};

/**
 * Mapping of Province to its Districts
 */
export const PROVINCE_DISTRICTS: Record<Province, District[]> = {
  [Province.WESTERN]: [District.COLOMBO, District.GAMPAHA, District.KALUTARA],
  [Province.CENTRAL]: [District.KANDY, District.MATALE, District.NUWARA_ELIYA],
  [Province.SOUTHERN]: [District.GALLE, District.MATARA, District.HAMBANTOTA],
  [Province.NORTHERN]: [District.JAFFNA, District.KILINOCHCHI, District.MANNAR, District.MULLAITIVU, District.VAVUNIYA],
  [Province.EASTERN]: [District.BATTICALOA, District.AMPARA, District.TRINCOMALEE],
  [Province.NORTH_WESTERN]: [District.KURUNEGALA, District.PUTTALAM],
  [Province.NORTH_CENTRAL]: [District.ANURADHAPURA, District.POLONNARUWA],
  [Province.UVA]: [District.BADULLA, District.MONARAGALA],
  [Province.SABARAGAMUWA]: [District.RATNAPURA, District.KEGALLE],
};

/**
 * Get province name from enum value
 */
export function getProvinceName(province: Province): string {
  return PROVINCE_NAMES[province] || 'Unknown';
}

/**
 * Get district name from enum value
 */
export function getDistrictName(district: District): string {
  return DISTRICT_NAMES[district] || 'Unknown';
}

/**
 * Get districts for a province
 */
export function getDistrictsForProvince(province: Province): District[] {
  return PROVINCE_DISTRICTS[province] || [];
}

/**
 * Get province for a district
 */
export function getProvinceForDistrict(district: District): Province | null {
  for (const [province, districts] of Object.entries(PROVINCE_DISTRICTS)) {
    if (districts.includes(district)) {
      return Number(province) as Province;
    }
  }
  return null;
}

