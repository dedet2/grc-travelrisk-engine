# AI GRC & TravelRisk Engine

An advanced, AI-powered platform for comprehensive Governance, Risk, and Compliance (GRC) assessment combined with travel risk analysis. Built with Next.js 14, Supabase, Clerk, and Claude AI.

## Overview

This application enables organizations to:
- **GRC Assessments**: Evaluate organizational risk against major compliance frameworks (ISO 27001, NIST CSF, CIS Controls, SOC 2)
- **Travel Risk Analysis**: Assess security and health risks for business travelers
- **Combined Reporting**: Generate comprehensive reports combining GRC and travel risk scores
- **AI-Powered Analysis**: Leverage Claude AI for framework analysis, control mapping, and insights
- **Automated Agents**: Monitor autonomous agents performing complex GRC tasks

## Tech Stack

### Frontend
- **Next.js 14+** with App Router
- **React 18+**
- **Tailwind CSS** for styling
- **TypeScript** for type safety

### Backend & Database
- **Supabase** (PostgreSQL) for data persistence
- **Clerk** for authentication and user management
- **Vercel** for deployment

### AI & Integration
- **Anthropic Claude API** for AI features
- **Travel Advisory APIs** for real-time travel data

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd grc-travelrisk-engine
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in the following variables in `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_key
```

4. **Set up Supabase**
```bash
# Connect to your Supabase project
npm run db:migrate
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
grc-travelrisk-engine/
├── src/
│   ├── app/                    # Next.js app router pages
│   ├── components/             # Reusable React components
│   ├── lib/                    # Utility functions and clients
│   │   ├── scoring/           # Risk scoring engine
│   │   ├── travel-risk/       # Travel risk assessment
│   │   ├── grc/               # GRC framework tools
│   │   ├── ai/                # Claude API integration
│   │   ├── audit/             # Audit logging
│   │   └── supabase/          # Database clients
│   ├── types/                  # TypeScript type definitions
│   └── middleware.ts           # Clerk authentication middleware
├── supabase/
│   └── migrations/            # Database schema migrations
├── tests/                      # Unit and integration tests
├── .github/                    # GitHub workflows and templates
└── public/                     # Static assets
```

## Key Features

### GRC Framework Assessment
- Support for multiple frameworks (ISO 27001, NIST, CIS, SOC 2)
- Control-level implementation tracking
- Automated risk scoring
- Category-based analysis

### Travel Risk Assessment
- Integration with travel advisory services
- Health and security risk evaluation
- Country-level risk scoring
- Travel recommendation generation

### AI Features
- Framework document parsing (CSV, JSON)
- Automatic control mapping across frameworks
- Compliance insights and recommendations
- Travel risk summarization

### Audit & Compliance
- Comprehensive audit logging
- User activity tracking
- Data provenance
- Compliance reporting

## API Endpoints

### Frameworks
- `GET /api/frameworks` - List published frameworks
- `POST /api/frameworks` - Create new framework

### Scoring
- `POST /api/scoring` - Calculate risk score for assessment

### Travel Risk
- `POST /api/travel-risk` - Calculate travel risk score

### Reports
- `GET /api/reports` - List user's trip risk reports
- `POST /api/reports` - Create new trip risk report

### Webhooks
- `POST /api/webhooks/clerk` - Clerk authentication events

## Development

### Running Tests
```bash
npm run test              # Run all tests
npm run test:ui          # Run tests with UI
```

### Code Quality
```bash
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript type checking
npm run format          # Format code with Prettier
```

### Building for Production
```bash
npm run build           # Build production bundle
npm start               # Start production server
```

## Deployment

### Deploy to Vercel
```bash
vercel deploy
```

Set required environment variables in Vercel project settings:
- All variables from `.env.local` (without `NEXT_PUBLIC_` prefix for secret values)

## Database Schema

The application uses PostgreSQL with the following main tables:

- **frameworks** - GRC framework definitions
- **controls** - Control definitions within frameworks
- **assessments** - User assessments against frameworks
- **assessment_responses** - Individual control responses
- **travel_advisories** - Cached travel advisory data
- **trip_risk_reports** - Combined GRC + travel risk reports
- **agent_runs** - Autonomous agent execution logs
- **audit_logs** - User action audit trail

## Security

- All sensitive data is encrypted at rest in Supabase
- Row-Level Security (RLS) policies enforce user data isolation
- Clerk handles secure authentication
- API endpoints require Clerk authentication
- Comprehensive audit logging for compliance

## Configuration

### Risk Scoring Weights
Customize risk scoring weights in `src/lib/scoring/weights.ts`:
- Category weights (0-1 scale)
- Control type weights
- Risk level thresholds

### Travel Risk Factors
Adjust travel risk calculation in `src/lib/travel-risk/scorer.ts`:
- Advisory level base scores
- Health and security risk impacts
- Travel recommendations

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

Please ensure:
- Code is linted and formatted
- Tests pass
- TypeScript types are correct
- No breaking changes to public APIs

## Issue Templates

Use the following issue templates for bug reports, feature requests, or security concerns:
- [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)
- [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
- [Security Task](.github/ISSUE_TEMPLATE/security_task.md)

## License

This project is proprietary and confidential.

## Support

For issues, questions, or suggestions, please:
1. Check existing issues and documentation
2. Create a new issue with appropriate template
3. Contact the development team

## Roadmap

- [ ] Enhanced framework import from PDF documents
- [ ] Real-time risk alerts and notifications
- [ ] Advanced reporting with charts and dashboards
- [ ] Mobile application
- [ ] Multi-tenancy support
- [ ] Custom framework creation UI
- [ ] Integration with SIEM systems

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database by [Supabase](https://supabase.com/)
- Auth by [Clerk](https://clerk.com/)
- AI by [Anthropic](https://anthropic.com/)
