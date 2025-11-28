// Sri Lanka Provinces and Districts data
export const SRI_LANKA_PROVINCES = [
  'Western Province',
  'Central Province',
  'Southern Province',
  'Northern Province',
  'Eastern Province',
  'North Western Province',
  'North Central Province',
  'Uva Province',
  'Sabaragamuwa Province',
]

export const SRI_LANKA_DISTRICTS: Record<string, string[]> = {
  'Western Province': [
    'Colombo',
    'Gampaha',
    'Kalutara',
  ],
  'Central Province': [
    'Kandy',
    'Matale',
    'Nuwara Eliya',
  ],
  'Southern Province': [
    'Galle',
    'Matara',
    'Hambantota',
  ],
  'Northern Province': [
    'Jaffna',
    'Kilinochchi',
    'Mannar',
    'Mullaitivu',
    'Vavuniya',
  ],
  'Eastern Province': [
    'Batticaloa',
    'Ampara',
    'Trincomalee',
  ],
  'North Western Province': [
    'Kurunegala',
    'Puttalam',
  ],
  'North Central Province': [
    'Anuradhapura',
    'Polonnaruwa',
  ],
  'Uva Province': [
    'Badulla',
    'Monaragala',
  ],
  'Sabaragamuwa Province': [
    'Ratnapura',
    'Kegalle',
  ],
}

// District coordinates (approximate centers)
export const DISTRICT_COORDINATES: Record<string, [number, number]> = {
  'Colombo': [6.9271, 79.8612],
  'Gampaha': [7.0847, 80.0097],
  'Kalutara': [6.5854, 79.9607],
  'Kandy': [7.2906, 80.6337],
  'Matale': [7.4675, 80.6234],
  'Nuwara Eliya': [6.9497, 80.7891],
  'Galle': [6.0329, 80.2170],
  'Matara': [5.9549, 80.5550],
  'Hambantota': [6.1244, 81.1185],
  'Jaffna': [9.6615, 80.0255],
  'Kilinochchi': [9.4001, 80.3999],
  'Mannar': [8.9776, 79.9118],
  'Mullaitivu': [9.2673, 80.8123],
  'Vavuniya': [8.7514, 80.4971],
  'Batticaloa': [7.7172, 81.7004],
  'Ampara': [7.2975, 81.6820],
  'Trincomalee': [8.5874, 81.2152],
  'Kurunegala': [7.4863, 80.3658],
  'Puttalam': [8.0362, 79.8283],
  'Anuradhapura': [8.3114, 80.4037],
  'Polonnaruwa': [7.9329, 81.0081],
  'Badulla': [6.9934, 81.0550],
  'Monaragala': [6.8728, 81.3508],
  'Ratnapura': [6.6828, 80.4012],
  'Kegalle': [7.2523, 80.3436],
}

// Generate mock coordinates for a district
export function getMockCoordinates(district?: string): [number, number] {
  if (district && DISTRICT_COORDINATES[district]) {
    const [lat, lng] = DISTRICT_COORDINATES[district]
    // Add small random offset to simulate different locations within district
    return [
      lat + (Math.random() - 0.5) * 0.1,
      lng + (Math.random() - 0.5) * 0.1,
    ]
  }
  // Default to Sri Lanka center with random offset
  return [
    7.8731 + (Math.random() - 0.5) * 2,
    80.7718 + (Math.random() - 0.5) * 2,
  ]
}
