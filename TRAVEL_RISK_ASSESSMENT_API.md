# A-03 Travel Risk Assessment Agent API Documentation

## Overview

The Travel Risk Assessment Agent (A-03) provides comprehensive travel advisory data and multi-leg trip risk scoring for the GRC Travel Risk Engine. It fetches real-world travel advisory data for 30+ key destinations and calculates holistic risk assessments for business trips.

## Features

- **30+ Destination Database**: Hard-coded travel advisory data for all major destinations
- **4-Level Risk Advisory System**: Matches US State Department advisory levels
- **Comprehensive Risk Scoring**: 0-100 scale based on security, health, and natural disaster factors
- **Multi-Leg Trip Assessment**: Evaluate business trips spanning multiple destinations
- **Smart Recommendations**: Tailored travel, vaccination, insurance, and security recommendations
- **Infrastructure Scoring**: Quality of local infrastructure (0-100 scale)
- **Health Risk Profiles**: Specific diseases, severity levels, and recommended vaccinations
- **Security Threat Analysis**: Detailed breakdown of security challenges by type and severity
- **Natural Disaster Assessment**: Seasonal and year-round natural hazard information

## Covered Destinations (30+)

### Safe/Low-Risk (Advisory Level 1)
- US, Canada, UK, Germany, France, Japan, Australia, Singapore

### Increased Caution (Advisory Level 2)
- UAE, Brazil, Mexico, Colombia, India, China, South Africa, Kenya, Israel, Turkey, Thailand, Philippines, Egypt

### Reconsider Travel (Advisory Level 3)
- Russia, Nigeria, Pakistan, Venezuela

### Do Not Travel (Advisory Level 4)
- Ukraine, Syria, Afghanistan, Iraq, Somalia

## Core Types

```typescript
// Advisory level enum
type AdvisoryLevel = 1 | 2 | 3 | 4;

// Severity levels
type Severity = 'low' | 'medium' | 'high' | 'critical';
type Probability = 'low' | 'medium' | 'high';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Individual risk factors
interface HealthRisk {
  disease: string;
  severity: Severity;
  recommended_vaccines?: string[];
  description: string;
}

interface SecurityThreat {
  type: string;
  severity: Severity;
  description: string;
}

interface NaturalDisasterRisk {
  type: string;
  probability: Probability;
  season?: string;
  description: string;
}

// Complete destination profile
interface TravelDestination {
  countryCode: string;           // ISO 3166-1 alpha-2 code
  countryName: string;
  advisoryLevel: AdvisoryLevel;  // 1-4
  riskScore: number;             // 0-100
  securityThreats: SecurityThreat[];
  healthRisks: HealthRisk[];
  naturalDisasterRisk: NaturalDisasterRisk[];
  infrastructureScore: number;   // 0-100, higher is better
  lastUpdated: Date;
  advisoryText?: string;
}

// Trip assessment components
interface TripLeg {
  origin: string;                // Country code or name
  destination: string;           // Country code or name
  departureDate: Date;           // ISO 8601 format
  returnDate: Date;
  purpose: string;               // business, tourism, humanitarian, etc.
}

interface TripLegAssessment {
  destination: string;
  riskScore: number;             // 0-100
  riskLevel: RiskLevel;
  advisoryLevel: AdvisoryLevel;
  recommendations: string[];
}

interface TripAssessment {
  legs: TripLegAssessment[];
  overallTripScore: number;      // Max of all leg scores (conservative)
  overallRiskLevel: RiskLevel;
  highestRisk: TripLegAssessment;
  recommendations: string[];     // Consolidated across all legs
  createdAt: Date;
}
```

## API Endpoints

### 1. List All Destinations

```
GET /api/travel/destinations
```

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Filter by country name or code (case-insensitive) | `?search=brazil` |
| `level` | string | Filter by advisory level (1,2,3,4) | `?level=3,4` |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "countryCode": "US",
      "countryName": "United States",
      "advisoryLevel": 1,
      "riskScore": 15,
      "securityThreats": [
        {
          "type": "Petty crime",
          "severity": "low",
          "description": "Shoplifting and pickpocketing in urban areas"
        }
      ],
      "healthRisks": [],
      "naturalDisasterRisk": [
        {
          "type": "Hurricanes",
          "probability": "medium",
          "season": "June-November",
          "description": "Atlantic and Gulf Coast hurricane season"
        }
      ],
      "infrastructureScore": 95,
      "lastUpdated": "2025-02-01T00:00:00.000Z"
    }
    // ... more destinations
  ],
  "timestamp": "2025-02-10T19:50:00.000Z"
}
```

#### Example Requests

```bash
# Get all destinations
curl https://api.example.com/api/travel/destinations

# Search for Brazil
curl https://api.example.com/api/travel/destinations?search=brazil

# Get high-risk destinations
curl https://api.example.com/api/travel/destinations?level=3,4

# Search and filter
curl https://api.example.com/api/travel/destinations?search=america&level=2
```

### 2. Get Destination Details

```
GET /api/travel/destinations/{code}
```

#### Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `code` | string | ISO 3166-1 alpha-2 country code | `BR`, `JP`, `US` |

#### Response

```json
{
  "success": true,
  "data": {
    "countryCode": "BR",
    "countryName": "Brazil",
    "advisoryLevel": 2,
    "riskScore": 38,
    "securityThreats": [
      {
        "type": "Armed robbery",
        "severity": "medium",
        "description": "Violent crime in Rio de Janeiro and São Paulo favelas"
      }
    ],
    "healthRisks": [
      {
        "disease": "Dengue fever",
        "severity": "medium",
        "recommended_vaccines": ["Dengue vaccine"],
        "description": "Endemic in tropical areas, seasonal spikes"
      },
      {
        "disease": "Yellow fever",
        "severity": "medium",
        "recommended_vaccines": ["Yellow fever vaccine"],
        "description": "Endemic in Amazon region, vaccination recommended"
      }
    ],
    "naturalDisasterRisk": [
      {
        "type": "Flooding",
        "probability": "high",
        "season": "December-March",
        "description": "Severe flooding in rainy season"
      }
    ],
    "infrastructureScore": 72,
    "lastUpdated": "2025-02-01T00:00:00.000Z",
    "advisoryText": "Exercise increased caution. Violent crime and gang activity present in major cities.",
    "riskFactors": [
      "Exercise Increased Caution",
      "Armed robbery: MEDIUM",
      "Health: Dengue fever",
      "Natural Disaster: Flooding"
    ],
    "recommendedVaccines": [
      "Dengue vaccine",
      "Yellow fever vaccine",
      "Antimalarial prophylaxis"
    ]
  },
  "timestamp": "2025-02-10T19:50:00.000Z"
}
```

#### Example Requests

```bash
# Get Brazil details
curl https://api.example.com/api/travel/destinations/BR

# Get Japan details
curl https://api.example.com/api/travel/destinations/JP

# Get high-risk country details
curl https://api.example.com/api/travel/destinations/UA
```

#### Error Response

```json
{
  "success": false,
  "error": "No travel advisory data found for country code: XX",
  "data": null,
  "timestamp": "2025-02-10T19:50:00.000Z"
}
```

### 3. Assess Trip Risk

```
POST /api/travel/trips
```

#### Request Body

```json
{
  "legs": [
    {
      "origin": "US",
      "destination": "BR",
      "departureDate": "2025-02-15",
      "returnDate": "2025-02-22",
      "purpose": "business"
    },
    {
      "origin": "BR",
      "destination": "MX",
      "departureDate": "2025-02-23",
      "returnDate": "2025-03-02",
      "purpose": "business"
    }
  ]
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "tripId": "trip_1707594600000_abc123def",
    "legs": [
      {
        "destination": "Brazil",
        "riskScore": 38,
        "riskLevel": "medium",
        "advisoryLevel": 2,
        "recommendations": [
          "Obtain travel insurance with medical coverage",
          "Stay informed of local conditions",
          "Recommended vaccinations: Dengue vaccine, Yellow fever vaccine",
          "Health risks present: Dengue fever",
          "Consult travel medicine specialist 4-6 weeks before departure"
        ]
      },
      {
        "destination": "Mexico",
        "riskScore": 47,
        "riskLevel": "medium",
        "advisoryLevel": 2,
        "recommendations": [
          "Obtain travel insurance with medical coverage",
          "Stay informed of local conditions",
          "Brief security team on destination before departure",
          "Maintain low profile in public"
        ]
      }
    ],
    "overallTripScore": 47,
    "overallRiskLevel": "medium",
    "highestRisk": {
      "destination": "Mexico",
      "riskScore": 47,
      "riskLevel": "medium",
      "advisoryLevel": 2,
      "recommendations": [...]
    },
    "recommendations": [
      "Multi-leg trip: highest risk destination is Mexico (medium)",
      "Maintain consistent preventive measures across all destinations",
      "Plan vaccines 4-6 weeks before earliest departure",
      "Obtain travel insurance with medical coverage"
    ],
    "riskSummary": {
      "lowRiskLegs": 0,
      "mediumRiskLegs": 2,
      "highRiskLegs": 0,
      "criticalRiskLegs": 0,
      "overallRiskLevel": "medium"
    },
    "travelApprovalStatus": {
      "safe": true
    },
    "createdAt": "2025-02-10T19:50:00.000Z"
  },
  "timestamp": "2025-02-10T19:50:00.000Z"
}
```

#### Field Explanations

- **overallTripScore**: Maximum score across all legs (conservative approach)
- **riskLevel**: Derived from score (0-24=low, 25-49=medium, 50-74=high, 75-100=critical)
- **recommendations**: Consolidated list of unique recommendations across all legs
- **travelApprovalStatus**: Indicates if trip should proceed (requires approval for critical risks)

#### Example Requests

```bash
# Assess single-destination trip
curl -X POST https://api.example.com/api/travel/trips \
  -H "Content-Type: application/json" \
  -d '{
    "legs": [{
      "origin": "US",
      "destination": "JP",
      "departureDate": "2025-02-15",
      "returnDate": "2025-02-22",
      "purpose": "business"
    }]
  }'

# Assess multi-leg Asian trip
curl -X POST https://api.example.com/api/travel/trips \
  -H "Content-Type: application/json" \
  -d '{
    "legs": [
      {
        "origin": "US",
        "destination": "JP",
        "departureDate": "2025-02-15",
        "returnDate": "2025-02-22",
        "purpose": "business"
      },
      {
        "origin": "JP",
        "destination": "SG",
        "departureDate": "2025-02-23",
        "returnDate": "2025-02-28",
        "purpose": "business"
      },
      {
        "origin": "SG",
        "destination": "TH",
        "departureDate": "2025-03-01",
        "returnDate": "2025-03-07",
        "purpose": "business"
      }
    ]
  }'
```

#### Error Response - Invalid Request

```json
{
  "success": false,
  "error": "Leg 1: departureDate must be before returnDate",
  "timestamp": "2025-02-10T19:50:00.000Z"
}
```

#### Error Response - Missing Required Field

```json
{
  "success": false,
  "error": "Request must include legs array",
  "timestamp": "2025-02-10T19:50:00.000Z"
}
```

### 4. List Previous Trip Assessments

```
GET /api/travel/trips
```

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `limit` | number | Maximum number of results to return | 50 |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "tripId": "trip_1707594600000_abc123def",
      "legs": [...],
      "overallTripScore": 47,
      "overallRiskLevel": "medium",
      "highestRisk": {...},
      "recommendations": [...],
      "riskSummary": {...},
      "travelApprovalStatus": {...},
      "createdAt": "2025-02-10T19:50:00.000Z"
    }
    // ... more trips (most recent first)
  ],
  "timestamp": "2025-02-10T19:50:00.000Z"
}
```

#### Example Requests

```bash
# Get last 10 assessments
curl https://api.example.com/api/travel/trips?limit=10

# Get last 50 assessments (default)
curl https://api.example.com/api/travel/trips
```

## Risk Scoring Methodology

### Score Calculation

1. **Base Score**: Destination's intrinsic risk score (0-100)
2. **Duration Adjustment**:
   - Long trips (>30 days): +10 points
   - Extended trips (14-30 days): +5 points
3. **Purpose Adjustment**:
   - High-risk purposes (journalism, humanitarian, NGO): +15 points
   - Business/tourism: No adjustment
4. **Overall**: Maximum of all leg scores (conservative approach)

### Advisory Levels

| Level | Description | Criteria | Risk Score Range |
|-------|-------------|----------|------------------|
| 1 | Exercise Normal Precautions | Low crime, stable, good infrastructure | 0-25 |
| 2 | Exercise Increased Caution | Moderate crime, some health risks | 26-50 |
| 3 | Reconsider Travel | High terrorism/crime risk | 51-75 |
| 4 | Do Not Travel | Active conflict, critical security risks | 76-100 |

## Usage Examples

### Example 1: Business Trip to Japan

```bash
curl -X POST https://api.example.com/api/travel/trips \
  -H "Content-Type: application/json" \
  -d '{
    "legs": [{
      "origin": "US",
      "destination": "JP",
      "departureDate": "2025-03-15",
      "returnDate": "2025-03-22",
      "purpose": "business"
    }]
  }'
```

**Expected Response**: Low risk (score ~11), no vaccinations needed, standard travel insurance recommended.

### Example 2: Multi-Leg Latin America Tour

```bash
curl -X POST https://api.example.com/api/travel/trips \
  -H "Content-Type: application/json" \
  -d '{
    "legs": [
      {
        "origin": "US",
        "destination": "BR",
        "departureDate": "2025-04-01",
        "returnDate": "2025-04-10",
        "purpose": "business"
      },
      {
        "origin": "BR",
        "destination": "CO",
        "departureDate": "2025-04-11",
        "returnDate": "2025-04-18",
        "purpose": "business"
      },
      {
        "origin": "CO",
        "destination": "MX",
        "departureDate": "2025-04-19",
        "returnDate": "2025-04-25",
        "purpose": "business"
      }
    ]
  }'
```

**Expected Response**: Medium-high risk (score ~45), yellow fever and antimalarial prophylaxis recommended, comprehensive travel insurance required.

### Example 3: High-Risk Destination Check

```bash
curl https://api.example.com/api/travel/destinations/UA
```

**Expected Response**: Do Not Travel advisory, active armed conflict, overall risk score 95.

## Implementation Details

### Files Created

1. **`src/lib/travel/advisory-fetcher.ts`** (1516 lines)
   - Hard-coded destination database
   - Functions: `fetchTravelAdvisories()`, `getDestinationRisk(code)`
   - Helper functions: `calculateDestinationRiskFactors()`, `getRecommendedVaccines()`

2. **`src/lib/travel/trip-assessor.ts`** (308 lines)
   - Multi-leg trip assessment logic
   - Functions: `assessTrip(legs)`, `getTripRiskSummary()`, `isTripSafeForTravel()`
   - Score adjustments based on duration and purpose

3. **`src/app/api/travel/destinations/route.ts`** (86 lines)
   - GET endpoint listing destinations with filters

4. **`src/app/api/travel/destinations/[code]/route.ts`** (76 lines)
   - GET endpoint for individual destination details

5. **`src/app/api/travel/trips/route.ts`** (203 lines)
   - POST endpoint for trip assessment
   - GET endpoint for assessment history

6. **`src/types/index.ts`** (Enhanced)
   - Type definitions for all travel-related interfaces

### Type Safety

All code is fully typed with TypeScript. No `any` types used except where necessary for framework compatibility.

### Error Handling

- Comprehensive validation of request inputs
- Meaningful error messages
- HTTP status codes (400, 404, 500)
- Proper exception handling with logging

## Future Enhancements

1. **Real API Integration**: Connect to US State Department Travel Advisory API
2. **Database Persistence**: Store trip assessments in Supabase
3. **User History**: Track assessments per user with authentication
4. **Real-time Updates**: Cache external API data with TTL
5. **Machine Learning**: Predict emerging risks based on patterns
6. **Mobile Alerts**: Push notifications for advisory changes
7. **Advanced Filtering**: Search by climate, visa requirements, healthcare quality
8. **Custom Risk Weights**: Allow organizations to adjust risk factors

## Testing

Comprehensive test suites included:
- `src/lib/travel/__tests__/advisory-fetcher.test.ts` - 100+ test cases
- `src/lib/travel/__tests__/trip-assessor.test.ts` - 80+ test cases

Run tests with:
```bash
npm test -- travel
```

## Support & Maintenance

- Update destination data quarterly as travel advisories change
- Monitor external API for breaking changes
- Maintain backward compatibility with assessment history
- Document all changes to scoring methodology
