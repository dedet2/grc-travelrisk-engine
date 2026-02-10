import {
  TravelDestination,
  AdvisoryLevel,
  SecurityThreat,
  HealthRisk,
  NaturalDisasterRisk,
} from '@/types/index';

/**
 * Hard-coded travel advisory data for 30+ key destinations
 * Based on US State Department Travel Advisories and real-world conditions
 * Advisory Levels: 1=Exercise Normal Precautions, 2=Exercise Increased Caution,
 *                  3=Reconsider Travel, 4=Do Not Travel
 */
const TRAVEL_ADVISORY_DATA: Record<string, TravelDestination> = {
  US: {
    countryCode: 'US',
    countryName: 'United States',
    advisoryLevel: 1,
    riskScore: 15,
    securityThreats: [
      {
        type: 'Petty crime',
        severity: 'low',
        description: 'Shoplifting and pickpocketing in urban areas',
      },
      {
        type: 'Gang violence',
        severity: 'low',
        description: 'Isolated incidents in specific urban neighborhoods',
      },
    ],
    healthRisks: [
      {
        disease: 'No significant endemic diseases',
        severity: 'low',
        description: 'Healthcare is world-class and widely available',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Hurricanes',
        probability: 'medium',
        season: 'June-November',
        description: 'Atlantic and Gulf Coast hurricane season',
      },
      {
        type: 'Earthquakes',
        probability: 'low',
        description: 'Minor earthquakes possible in West Coast states',
      },
    ],
    infrastructureScore: 95,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Exercise normal precautions. Most areas are safe for travel.',
  },

  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    advisoryLevel: 1,
    riskScore: 12,
    securityThreats: [
      {
        type: 'Petty theft',
        severity: 'low',
        description: 'Minor theft in tourist areas',
      },
    ],
    healthRisks: [
      {
        disease: 'No significant health risks',
        severity: 'low',
        description: 'Excellent healthcare system',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Winter storms',
        probability: 'high',
        season: 'November-March',
        description: 'Severe winter weather in northern regions',
      },
    ],
    infrastructureScore: 94,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Exercise normal precautions.',
  },

  GB: {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    advisoryLevel: 1,
    riskScore: 14,
    securityThreats: [
      {
        type: 'Petty crime',
        severity: 'low',
        description: 'Pickpocketing and theft in London and major cities',
      },
    ],
    healthRisks: [
      {
        disease: 'No significant endemic diseases',
        severity: 'low',
        description: 'World-class healthcare system',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Flooding',
        probability: 'low',
        season: 'Winter',
        description: 'Occasional flooding in southern regions',
      },
    ],
    infrastructureScore: 94,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Exercise normal precautions.',
  },

  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    advisoryLevel: 1,
    riskScore: 13,
    securityThreats: [
      {
        type: 'Petty theft',
        severity: 'low',
        description: 'Pickpocketing in Berlin and tourist areas',
      },
    ],
    healthRisks: [
      {
        disease: 'No significant health risks',
        severity: 'low',
        description: 'Excellent healthcare available',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Flooding',
        probability: 'low',
        description: 'Rare flooding events',
      },
    ],
    infrastructureScore: 96,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Exercise normal precautions.',
  },

  FR: {
    countryCode: 'FR',
    countryName: 'France',
    advisoryLevel: 1,
    riskScore: 16,
    securityThreats: [
      {
        type: 'Petty theft',
        severity: 'low',
        description: 'Pickpocketing and theft in Paris, Nice, and tourist areas',
      },
    ],
    healthRisks: [
      {
        disease: 'No significant endemic diseases',
        severity: 'low',
        description: 'Excellent healthcare system',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Flooding',
        probability: 'low',
        description: 'Occasional flooding in coastal areas',
      },
    ],
    infrastructureScore: 95,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Exercise normal precautions.',
  },

  JP: {
    countryCode: 'JP',
    countryName: 'Japan',
    advisoryLevel: 1,
    riskScore: 11,
    securityThreats: [
      {
        type: 'Petty theft',
        severity: 'low',
        description: 'Very rare in Tokyo and major cities',
      },
    ],
    healthRisks: [
      {
        disease: 'No significant health risks',
        severity: 'low',
        description: 'Excellent healthcare available',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Earthquakes',
        probability: 'high',
        description: 'Frequent minor earthquakes, infrastructure well-prepared',
      },
      {
        type: 'Typhoons',
        probability: 'medium',
        season: 'June-November',
        description: 'Tropical storms during typhoon season',
      },
    ],
    infrastructureScore: 98,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Exercise normal precautions.',
  },

  AU: {
    countryCode: 'AU',
    countryName: 'Australia',
    advisoryLevel: 1,
    riskScore: 13,
    securityThreats: [
      {
        type: 'Petty crime',
        severity: 'low',
        description: 'Minor theft in Sydney and Melbourne',
      },
    ],
    healthRisks: [
      {
        disease: 'No endemic diseases',
        severity: 'low',
        description: 'Excellent healthcare system',
      },
      {
        disease: 'Dangerous wildlife',
        severity: 'low',
        description: 'Snakes, spiders, and sharks in remote areas',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Bushfires',
        probability: 'medium',
        season: 'September-May',
        description: 'Severe bushfires in dry season',
      },
      {
        type: 'Flooding',
        probability: 'low',
        description: 'Regional flooding possible',
      },
    ],
    infrastructureScore: 93,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Exercise normal precautions.',
  },

  SG: {
    countryCode: 'SG',
    countryName: 'Singapore',
    advisoryLevel: 1,
    riskScore: 10,
    securityThreats: [
      {
        type: 'Very low crime',
        severity: 'low',
        description: 'One of the safest countries in the world',
      },
    ],
    healthRisks: [
      {
        disease: 'No significant health risks',
        severity: 'low',
        description: 'World-class healthcare',
      },
      {
        disease: 'Dengue fever',
        severity: 'low',
        recommended_vaccines: ['Dengue vaccine'],
        description: 'Rare cases possible',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Monsoons',
        probability: 'low',
        season: 'December-March',
        description: 'Heavy rains during monsoon season',
      },
    ],
    infrastructureScore: 99,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Exercise normal precautions.',
  },

  AE: {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    advisoryLevel: 1,
    riskScore: 17,
    securityThreats: [
      {
        type: 'Petty theft',
        severity: 'low',
        description: 'Minimal crime in Dubai and Abu Dhabi',
      },
      {
        type: 'Terrorism',
        severity: 'low',
        description: 'Low risk but increased security measures in place',
      },
    ],
    healthRisks: [
      {
        disease: 'No endemic diseases',
        severity: 'low',
        description: 'Excellent healthcare system',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Extreme heat',
        probability: 'high',
        season: 'May-September',
        description: 'Extreme temperatures reach 50°C (122°F)',
      },
    ],
    infrastructureScore: 97,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Exercise normal precautions.',
  },

  BR: {
    countryCode: 'BR',
    countryName: 'Brazil',
    advisoryLevel: 2,
    riskScore: 38,
    securityThreats: [
      {
        type: 'Armed robbery',
        severity: 'medium',
        description: 'Violent crime in Rio de Janeiro and São Paulo favelas',
      },
      {
        type: 'Organized crime',
        severity: 'medium',
        description: 'Drug trafficking and gang violence in urban areas',
      },
      {
        type: 'Carjacking',
        severity: 'medium',
        description: 'Vehicle theft at traffic lights in major cities',
      },
    ],
    healthRisks: [
      {
        disease: 'Dengue fever',
        severity: 'medium',
        recommended_vaccines: ['Dengue vaccine'],
        description: 'Endemic in tropical areas, seasonal spikes',
      },
      {
        disease: 'Yellow fever',
        severity: 'medium',
        recommended_vaccines: ['Yellow fever vaccine'],
        description: 'Endemic in Amazon region, vaccination recommended',
      },
      {
        disease: 'Zika virus',
        severity: 'medium',
        description: 'Sporadic cases reported',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Flooding',
        probability: 'high',
        season: 'December-March',
        description: 'Severe flooding in rainy season',
      },
      {
        type: 'Landslides',
        probability: 'medium',
        season: 'December-March',
        description: 'Associated with heavy rains',
      },
    ],
    infrastructureScore: 72,
    lastUpdated: new Date('2025-02-01'),
    advisoryText:
      'Exercise increased caution. Violent crime and gang activity present in major cities.',
  },

  MX: {
    countryCode: 'MX',
    countryName: 'Mexico',
    advisoryLevel: 2,
    riskScore: 42,
    securityThreats: [
      {
        type: 'Drug cartel violence',
        severity: 'high',
        description: 'Ongoing cartel-related conflicts in border regions',
      },
      {
        type: 'Armed robbery',
        severity: 'medium',
        description: 'Violent crime in Mexico City and Guadalajara',
      },
      {
        type: 'Kidnapping',
        severity: 'medium',
        description: 'Risk in certain regions, particularly along northern border',
      },
    ],
    healthRisks: [
      {
        disease: 'Dengue fever',
        severity: 'medium',
        recommended_vaccines: ['Dengue vaccine'],
        description: 'Endemic in tropical coastal areas',
      },
      {
        disease: 'Typhoid',
        severity: 'low',
        recommended_vaccines: ['Typhoid vaccine'],
        description: 'Low risk with proper precautions',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Hurricanes',
        probability: 'medium',
        season: 'June-November',
        description: 'Atlantic and Pacific hurricane seasons',
      },
      {
        type: 'Earthquakes',
        probability: 'medium',
        description: 'Frequent seismic activity',
      },
    ],
    infrastructureScore: 74,
    lastUpdated: new Date('2025-02-01'),
    advisoryText:
      'Exercise increased caution. Drug cartel violence in border regions and certain cities.',
  },

  CO: {
    countryCode: 'CO',
    countryName: 'Colombia',
    advisoryLevel: 2,
    riskScore: 45,
    securityThreats: [
      {
        type: 'Drug trafficking violence',
        severity: 'high',
        description: 'Cartel-related violence, particularly in rural areas',
      },
      {
        type: 'Armed robbery',
        severity: 'medium',
        description: 'Urban crime in Bogotá and Medellín',
      },
      {
        type: 'Kidnapping',
        severity: 'medium',
        description: 'Risk in remote areas',
      },
    ],
    healthRisks: [
      {
        disease: 'Dengue fever',
        severity: 'medium',
        recommended_vaccines: ['Dengue vaccine'],
        description: 'Endemic in tropical regions',
      },
      {
        disease: 'Yellow fever',
        severity: 'medium',
        recommended_vaccines: ['Yellow fever vaccine'],
        description: 'Risk in Amazon region',
      },
      {
        disease: 'Malaria',
        severity: 'medium',
        recommended_vaccines: ['Antimalarial prophylaxis'],
        description: 'Endemic in lowland areas',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Flooding',
        probability: 'high',
        season: 'March-May, September-November',
        description: 'Heavy rains cause flooding',
      },
      {
        type: 'Earthquakes',
        probability: 'medium',
        description: 'Seismic activity possible',
      },
    ],
    infrastructureScore: 68,
    lastUpdated: new Date('2025-02-01'),
    advisoryText:
      'Exercise increased caution. Significant cartel violence in rural and remote areas.',
  },

  IN: {
    countryCode: 'IN',
    countryName: 'India',
    advisoryLevel: 2,
    riskScore: 40,
    securityThreats: [
      {
        type: 'Petty theft',
        severity: 'medium',
        description: 'Pickpocketing and theft in tourist areas',
      },
      {
        type: 'Sexual assault',
        severity: 'medium',
        description: 'Risks increased for female travelers',
      },
      {
        type: 'Communal violence',
        severity: 'low',
        description: 'Rare incidents in specific regions',
      },
    ],
    healthRisks: [
      {
        disease: 'Dengue fever',
        severity: 'medium',
        recommended_vaccines: ['Dengue vaccine'],
        description: 'Endemic, seasonal peaks',
      },
      {
        disease: 'Typhoid',
        severity: 'medium',
        recommended_vaccines: ['Typhoid vaccine'],
        description: 'Waterborne disease, vaccination recommended',
      },
      {
        disease: 'Hepatitis A',
        severity: 'medium',
        recommended_vaccines: ['Hepatitis A vaccine'],
        description: 'Foodborne disease risk',
      },
      {
        disease: 'Malaria',
        severity: 'medium',
        recommended_vaccines: ['Antimalarial prophylaxis'],
        description: 'Risk in certain regions and seasons',
      },
      {
        disease: 'Tuberculosis',
        severity: 'low',
        description: 'Present in population',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Monsoons',
        probability: 'high',
        season: 'June-September',
        description: 'Heavy rains and flooding',
      },
      {
        type: 'Heat waves',
        probability: 'high',
        season: 'April-June',
        description: 'Extreme heat in summer months',
      },
    ],
    infrastructureScore: 65,
    lastUpdated: new Date('2025-02-01'),
    advisoryText:
      'Exercise increased caution. Criminal activity and significant health risks present.',
  },

  CN: {
    countryCode: 'CN',
    countryName: 'China',
    advisoryLevel: 2,
    riskScore: 35,
    securityThreats: [
      {
        type: 'Petty theft',
        severity: 'low',
        description: 'Minor pickpocketing in major cities',
      },
      {
        type: 'Restricted areas',
        severity: 'medium',
        description: 'Travel restrictions in Xinjiang, Tibet, and Hong Kong',
      },
      {
        type: 'Surveillance',
        severity: 'medium',
        description: 'Extensive government monitoring',
      },
    ],
    healthRisks: [
      {
        disease: 'Air pollution',
        severity: 'medium',
        description: 'Severe air quality issues in major cities',
      },
      {
        disease: 'Food safety',
        severity: 'low',
        description: 'Risk of foodborne illness in some areas',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Earthquakes',
        probability: 'medium',
        description: 'Seismic activity in western regions',
      },
      {
        type: 'Flooding',
        probability: 'medium',
        season: 'May-September',
        description: 'Monsoon-related flooding',
      },
    ],
    infrastructureScore: 82,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Exercise increased caution. Restricted travel areas and surveillance present.',
  },

  RU: {
    countryCode: 'RU',
    countryName: 'Russia',
    advisoryLevel: 3,
    riskScore: 72,
    securityThreats: [
      {
        type: 'Military conflict',
        severity: 'critical',
        description: 'Ongoing conflict in Ukraine affecting travel security',
      },
      {
        type: 'Terrorism',
        severity: 'high',
        description: 'Risk of terrorist attacks, especially in Caucasus region',
      },
      {
        type: 'Political tensions',
        severity: 'high',
        description: 'International relations impact on travelers',
      },
    ],
    healthRisks: [
      {
        disease: 'No significant endemic diseases',
        severity: 'low',
        description: 'Standard healthcare available',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Extreme cold',
        probability: 'high',
        season: 'November-March',
        description: 'Severe winter conditions',
      },
    ],
    infrastructureScore: 75,
    lastUpdated: new Date('2025-02-01'),
    advisoryText:
      'Reconsider travel. Military conflict, terrorism risk, and political tensions present.',
  },

  UA: {
    countryCode: 'UA',
    countryName: 'Ukraine',
    advisoryLevel: 4,
    riskScore: 95,
    securityThreats: [
      {
        type: 'Active armed conflict',
        severity: 'critical',
        description: 'Ongoing military operations and combat zones',
      },
      {
        type: 'Missiles and artillery',
        severity: 'critical',
        description: 'Risk throughout the country',
      },
      {
        type: 'Mines',
        severity: 'critical',
        description: 'Landmines in conflict areas',
      },
    ],
    healthRisks: [
      {
        disease: 'Limited medical facilities',
        severity: 'high',
        description: 'Healthcare system affected by conflict',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'None',
        probability: 'low',
        description: 'Conflict is primary concern',
      },
    ],
    infrastructureScore: 40,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Do not travel. Active armed conflict and critical security situation.',
  },

  SY: {
    countryCode: 'SY',
    countryName: 'Syria',
    advisoryLevel: 4,
    riskScore: 98,
    securityThreats: [
      {
        type: 'Armed conflict',
        severity: 'critical',
        description: 'Ongoing civil war and combat operations',
      },
      {
        type: 'Terrorism',
        severity: 'critical',
        description: 'ISIS and other terrorist groups active',
      },
      {
        type: 'Kidnapping',
        severity: 'critical',
        description: 'High risk for foreigners',
      },
    ],
    healthRisks: [
      {
        disease: 'Limited healthcare',
        severity: 'high',
        description: 'Medical infrastructure severely damaged',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'None',
        probability: 'low',
        description: 'Conflict is primary concern',
      },
    ],
    infrastructureScore: 25,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Do not travel. Active civil war, terrorism, and critical security risks.',
  },

  AF: {
    countryCode: 'AF',
    countryName: 'Afghanistan',
    advisoryLevel: 4,
    riskScore: 96,
    securityThreats: [
      {
        type: 'Terrorism',
        severity: 'critical',
        description: 'Taliban and ISIS-K active throughout country',
      },
      {
        type: 'Military operations',
        severity: 'critical',
        description: 'Ongoing armed conflict',
      },
      {
        type: 'Kidnapping',
        severity: 'critical',
        description: 'High risk for foreigners',
      },
    ],
    healthRisks: [
      {
        disease: 'Limited healthcare',
        severity: 'high',
        description: 'Healthcare system severely limited',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Earthquakes',
        probability: 'medium',
        description: 'Seismic activity in some regions',
      },
    ],
    infrastructureScore: 30,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Do not travel. Critical terrorism and security situation.',
  },

  IQ: {
    countryCode: 'IQ',
    countryName: 'Iraq',
    advisoryLevel: 3,
    riskScore: 68,
    securityThreats: [
      {
        type: 'Terrorism',
        severity: 'critical',
        description: 'ISIS and other terrorist groups',
      },
      {
        type: 'Armed conflict',
        severity: 'high',
        description: 'Regional instability',
      },
      {
        type: 'Kidnapping',
        severity: 'high',
        description: 'Targeting of foreigners',
      },
    ],
    healthRisks: [
      {
        disease: 'Healthcare access',
        severity: 'high',
        description: 'Limited medical services',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Dust storms',
        probability: 'high',
        season: 'June-August',
        description: 'Severe sandstorms during summer',
      },
    ],
    infrastructureScore: 45,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Reconsider travel. Terrorism, armed conflict, and security risks.',
  },

  SO: {
    countryCode: 'SO',
    countryName: 'Somalia',
    advisoryLevel: 4,
    riskScore: 94,
    securityThreats: [
      {
        type: 'Terrorism',
        severity: 'critical',
        description: 'Al-Shabaab and ISIS active',
      },
      {
        type: 'Armed robbery',
        severity: 'critical',
        description: 'Highway robbery and piracy',
      },
      {
        type: 'Kidnapping',
        severity: 'critical',
        description: 'High risk for all foreigners',
      },
    ],
    healthRisks: [
      {
        disease: 'Limited healthcare',
        severity: 'high',
        description: 'Minimal medical infrastructure',
      },
      {
        disease: 'Cholera',
        severity: 'medium',
        description: 'Outbreaks possible',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Drought',
        probability: 'high',
        description: 'Recurring droughts and famine',
      },
    ],
    infrastructureScore: 20,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Do not travel. Critical terrorism, armed conflict, and security risks.',
  },

  ZA: {
    countryCode: 'ZA',
    countryName: 'South Africa',
    advisoryLevel: 2,
    riskScore: 44,
    securityThreats: [
      {
        type: 'Violent crime',
        severity: 'high',
        description: 'Armed robbery and assault in major cities',
      },
      {
        type: 'Carjacking',
        severity: 'medium',
        description: 'Vehicle theft risk',
      },
      {
        type: 'Home invasion',
        severity: 'medium',
        description: 'Risk in certain areas',
      },
    ],
    healthRisks: [
      {
        disease: 'Malaria',
        severity: 'medium',
        recommended_vaccines: ['Antimalarial prophylaxis'],
        description: 'Risk in northern regions',
      },
      {
        disease: 'Tuberculosis',
        severity: 'low',
        description: 'Present in population',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Flooding',
        probability: 'low',
        description: 'Occasional regional flooding',
      },
    ],
    infrastructureScore: 78,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Exercise increased caution. Violent crime present, especially in major cities.',
  },

  NG: {
    countryCode: 'NG',
    countryName: 'Nigeria',
    advisoryLevel: 3,
    riskScore: 65,
    securityThreats: [
      {
        type: 'Terrorism',
        severity: 'critical',
        description: 'Boko Haram and ISIS-West Africa active',
      },
      {
        type: 'Armed robbery',
        severity: 'high',
        description: 'Violent crime in major cities',
      },
      {
        type: 'Kidnapping',
        severity: 'high',
        description: 'Targeting of foreigners',
      },
    ],
    healthRisks: [
      {
        disease: 'Malaria',
        severity: 'high',
        recommended_vaccines: ['Antimalarial prophylaxis'],
        description: 'Endemic throughout country',
      },
      {
        disease: 'Yellow fever',
        severity: 'medium',
        recommended_vaccines: ['Yellow fever vaccine'],
        description: 'Risk in most areas',
      },
      {
        disease: 'Typhoid',
        severity: 'medium',
        recommended_vaccines: ['Typhoid vaccine'],
        description: 'Waterborne disease',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Flooding',
        probability: 'high',
        season: 'June-October',
        description: 'Seasonal flooding',
      },
    ],
    infrastructureScore: 55,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Reconsider travel. Terrorism, violent crime, and health risks.',
  },

  KE: {
    countryCode: 'KE',
    countryName: 'Kenya',
    advisoryLevel: 2,
    riskScore: 41,
    securityThreats: [
      {
        type: 'Terrorism',
        severity: 'medium',
        description: 'Al-Shabaab attacks possible',
      },
      {
        type: 'Armed robbery',
        severity: 'medium',
        description: 'Crime in Nairobi and border areas',
      },
      {
        type: 'Carjacking',
        severity: 'low',
        description: 'Vehicle theft possible',
      },
    ],
    healthRisks: [
      {
        disease: 'Malaria',
        severity: 'high',
        recommended_vaccines: ['Antimalarial prophylaxis'],
        description: 'Endemic in coastal and lower altitude areas',
      },
      {
        disease: 'Dengue fever',
        severity: 'medium',
        recommended_vaccines: ['Dengue vaccine'],
        description: 'Sporadic cases',
      },
      {
        disease: 'Yellow fever',
        severity: 'medium',
        recommended_vaccines: ['Yellow fever vaccine'],
        description: 'Risk in certain regions',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Drought',
        probability: 'medium',
        description: 'Periodic droughts',
      },
      {
        type: 'Flooding',
        probability: 'low',
        description: 'Seasonal flooding possible',
      },
    ],
    infrastructureScore: 70,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Exercise increased caution. Terrorism risk and endemic diseases present.',
  },

  IL: {
    countryCode: 'IL',
    countryName: 'Israel',
    advisoryLevel: 2,
    riskScore: 46,
    securityThreats: [
      {
        type: 'Military operations',
        severity: 'high',
        description: 'Ongoing conflict with Gaza and regional tensions',
      },
      {
        type: 'Rocket attacks',
        severity: 'medium',
        description: 'Risk in southern regions near Gaza border',
      },
      {
        type: 'Terrorism',
        severity: 'medium',
        description: 'Sporadic attacks',
      },
    ],
    healthRisks: [
      {
        disease: 'No significant endemic diseases',
        severity: 'low',
        description: 'Good healthcare available',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'None',
        probability: 'low',
        description: 'No natural disaster risk',
      },
    ],
    infrastructureScore: 88,
    lastUpdated: new Date('2025-02-01'),
    advisoryText:
      'Exercise increased caution. Military operations, rocket attacks, and terrorism risk.',
  },

  TR: {
    countryCode: 'TR',
    countryName: 'Turkey',
    advisoryLevel: 2,
    riskScore: 37,
    securityThreats: [
      {
        type: 'Terrorism',
        severity: 'medium',
        description: 'PKK and ISIS-related attacks possible',
      },
      {
        type: 'Petty crime',
        severity: 'low',
        description: 'Pickpocketing in tourist areas',
      },
      {
        type: 'Political tensions',
        severity: 'low',
        description: 'Occasional protests',
      },
    ],
    healthRisks: [
      {
        disease: 'No significant endemic diseases',
        severity: 'low',
        description: 'Good healthcare available',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Earthquakes',
        probability: 'high',
        description: 'Seismic activity, recent major earthquakes',
      },
    ],
    infrastructureScore: 80,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Exercise increased caution. Terrorism risk and seismic activity.',
  },

  TH: {
    countryCode: 'TH',
    countryName: 'Thailand',
    advisoryLevel: 2,
    riskScore: 39,
    securityThreats: [
      {
        type: 'Petty theft',
        severity: 'medium',
        description: 'Pickpocketing and theft in tourist areas',
      },
      {
        type: 'Terrorism',
        severity: 'low',
        description: 'Low risk but incidents possible in southern regions',
      },
      {
        type: 'Scams',
        severity: 'medium',
        description: 'Tourist scams and fraud',
      },
    ],
    healthRisks: [
      {
        disease: 'Dengue fever',
        severity: 'high',
        recommended_vaccines: ['Dengue vaccine'],
        description: 'Endemic, seasonal spikes',
      },
      {
        disease: 'Malaria',
        severity: 'medium',
        recommended_vaccines: ['Antimalarial prophylaxis'],
        description: 'Risk in border regions',
      },
      {
        disease: 'Typhoid',
        severity: 'low',
        recommended_vaccines: ['Typhoid vaccine'],
        description: 'Waterborne disease risk',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Flooding',
        probability: 'high',
        season: 'May-November',
        description: 'Monsoon season flooding',
      },
      {
        type: 'Tsunami',
        probability: 'low',
        description: 'Indian Ocean risk',
      },
    ],
    infrastructureScore: 81,
    lastUpdated: new Date('2025-02-01'),
    advisoryText:
      'Exercise increased caution. Petty theft, endemic diseases, and flooding risk.',
  },

  PH: {
    countryCode: 'PH',
    countryName: 'Philippines',
    advisoryLevel: 2,
    riskScore: 43,
    securityThreats: [
      {
        type: 'Terrorism',
        severity: 'medium',
        description: 'ISIS-linked groups in Mindanao',
      },
      {
        type: 'Armed crime',
        severity: 'medium',
        description: 'Crime in Manila and port cities',
      },
      {
        type: 'Petty theft',
        severity: 'medium',
        description: 'Common in tourist areas',
      },
    ],
    healthRisks: [
      {
        disease: 'Dengue fever',
        severity: 'high',
        recommended_vaccines: ['Dengue vaccine'],
        description: 'Endemic throughout islands',
      },
      {
        disease: 'Typhoid',
        severity: 'medium',
        recommended_vaccines: ['Typhoid vaccine'],
        description: 'Waterborne disease',
      },
      {
        disease: 'Japanese encephalitis',
        severity: 'low',
        recommended_vaccines: ['Japanese encephalitis vaccine'],
        description: 'Risk in rural areas',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Typhoons',
        probability: 'high',
        season: 'June-November',
        description: 'Severe tropical storms',
      },
      {
        type: 'Earthquakes',
        probability: 'high',
        description: 'Ring of Fire seismic activity',
      },
      {
        type: 'Flooding',
        probability: 'high',
        description: 'During typhoon season',
      },
    ],
    infrastructureScore: 72,
    lastUpdated: new Date('2025-02-01'),
    advisoryText:
      'Exercise increased caution. Terrorism, endemic diseases, and natural disasters.',
  },

  EG: {
    countryCode: 'EG',
    countryName: 'Egypt',
    advisoryLevel: 2,
    riskScore: 48,
    securityThreats: [
      {
        type: 'Terrorism',
        severity: 'high',
        description: 'ISIS and other terrorist groups in Sinai',
      },
      {
        type: 'Armed robbery',
        severity: 'medium',
        description: 'Crime in Cairo and tourist areas',
      },
      {
        type: 'Petty theft',
        severity: 'medium',
        description: 'Pickpocketing in tourist areas',
      },
    ],
    healthRisks: [
      {
        disease: 'No endemic diseases',
        severity: 'low',
        description: 'Standard vaccines recommended',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Flooding',
        probability: 'low',
        description: 'Nile flooding rare but possible',
      },
      {
        type: 'Heat waves',
        probability: 'high',
        season: 'May-September',
        description: 'Extreme heat',
      },
    ],
    infrastructureScore: 72,
    lastUpdated: new Date('2025-02-01'),
    advisoryText:
      'Exercise increased caution. Terrorism risk in Sinai and crime in urban areas.',
  },

  PK: {
    countryCode: 'PK',
    countryName: 'Pakistan',
    advisoryLevel: 3,
    riskScore: 62,
    securityThreats: [
      {
        type: 'Terrorism',
        severity: 'high',
        description: 'Taliban and ISIS-K active',
      },
      {
        type: 'Armed conflict',
        severity: 'high',
        description: 'Regional instability',
      },
      {
        type: 'Kidnapping',
        severity: 'medium',
        description: 'Risk for foreigners in certain areas',
      },
    ],
    healthRisks: [
      {
        disease: 'Malaria',
        severity: 'medium',
        recommended_vaccines: ['Antimalarial prophylaxis'],
        description: 'Risk in southern regions',
      },
      {
        disease: 'Dengue fever',
        severity: 'medium',
        recommended_vaccines: ['Dengue vaccine'],
        description: 'Seasonal spikes',
      },
      {
        disease: 'Typhoid',
        severity: 'medium',
        recommended_vaccines: ['Typhoid vaccine'],
        description: 'Waterborne disease',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Flooding',
        probability: 'high',
        season: 'June-September',
        description: 'Monsoon flooding',
      },
      {
        type: 'Earthquakes',
        probability: 'medium',
        description: 'Seismic activity',
      },
    ],
    infrastructureScore: 58,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Reconsider travel. Terrorism, armed conflict, and health risks present.',
  },

  VE: {
    countryCode: 'VE',
    countryName: 'Venezuela',
    advisoryLevel: 3,
    riskScore: 70,
    securityThreats: [
      {
        type: 'Armed robbery',
        severity: 'critical',
        description: 'Extremely high rates of violent crime',
      },
      {
        type: 'Murder',
        severity: 'critical',
        description: 'High murder rate',
      },
      {
        type: 'Kidnapping',
        severity: 'high',
        description: 'Targeting of affluent individuals',
      },
    ],
    healthRisks: [
      {
        disease: 'Limited healthcare',
        severity: 'high',
        description: 'Medication shortages and limited services',
      },
      {
        disease: 'Malaria',
        severity: 'high',
        recommended_vaccines: ['Antimalarial prophylaxis'],
        description: 'Risk in certain regions',
      },
    ],
    naturalDisasterRisk: [
      {
        type: 'Flooding',
        probability: 'medium',
        season: 'May-November',
        description: 'Rainy season flooding',
      },
    ],
    infrastructureScore: 48,
    lastUpdated: new Date('2025-02-01'),
    advisoryText: 'Reconsider travel. Extreme violent crime and limited healthcare.',
  },
};

/**
 * Fetch travel advisories for all destinations or from external API
 * For MVP, returns hard-coded data
 * In production, would fetch from US State Department API
 */
export async function fetchTravelAdvisories(): Promise<TravelDestination[]> {
  try {
    // In production, this would call: https://www.state.gov/travel/

    return Object.values(TRAVEL_ADVISORY_DATA);
  } catch (error) {
    console.error('Error fetching travel advisories:', error);
    throw new Error('Failed to fetch travel advisories');
  }
}

/**
 * Get detailed risk profile for a specific destination by country code
 * @param countryCode ISO 3166-1 alpha-2 country code (e.g., 'US', 'BR')
 * @returns Full risk profile or null if not found
 */
export function getDestinationRisk(countryCode: string): TravelDestination | null {
  const code = countryCode.toUpperCase();
  const destination = TRAVEL_ADVISORY_DATA[code];

  if (!destination) {
    return null;
  }

  return destination;
}

/**
 * Get all destinations as a map for efficient lookups
 */
export function getAllDestinationsMap(): Record<string, TravelDestination> {
  return TRAVEL_ADVISORY_DATA;
}

/**
 * Calculate overall risk factors for a destination
 */
export function calculateDestinationRiskFactors(
  destination: TravelDestination,
): string[] {
  const factors: string[] = [];

  // Advisory level descriptions
  const advisoryDescriptions: Record<AdvisoryLevel, string> = {
    1: 'Exercise Normal Precautions',
    2: 'Exercise Increased Caution',
    3: 'Reconsider Travel',
    4: 'Do Not Travel',
  };

  factors.push(advisoryDescriptions[destination.advisoryLevel]);

  // Add critical threats
  destination.securityThreats.forEach((threat) => {
    if (threat.severity === 'critical' || threat.severity === 'high') {
      factors.push(`${threat.type}: ${threat.severity.toUpperCase()}`);
    }
  });

  // Add significant health risks
  destination.healthRisks.forEach((risk) => {
    if (risk.severity === 'high') {
      factors.push(`Health: ${risk.disease}`);
    }
  });

  // Add natural disaster risks
  destination.naturalDisasterRisk.forEach((disaster) => {
    if (disaster.probability === 'high') {
      factors.push(`Natural Disaster: ${disaster.type}`);
    }
  });

  return factors;
}

/**
 * Get recommended vaccinations for a destination
 */
export function getRecommendedVaccines(destination: TravelDestination): string[] {
  const vaccines = new Set<string>();

  destination.healthRisks.forEach((risk) => {
    if (risk.recommended_vaccines) {
      risk.recommended_vaccines.forEach((vaccine) => vaccines.add(vaccine));
    }
  });

  return Array.from(vaccines);
}
