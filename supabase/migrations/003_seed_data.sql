-- Seed demo organization
INSERT INTO public.organizations (id, name, slug, plan, billing_email, created_at)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Incluu Global',
  'incluu-global',
  'enterprise',
  'dede@incluu.us',
  NOW()
);

-- Seed demo admin user
INSERT INTO public.users (id, clerk_id, email, name, role, created_at)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'clerk_dede_001',
  'dede@incluu.us',
  'Dr. Dédé',
  'admin',
  NOW()
);

-- Add user to organization
INSERT INTO public.org_members (org_id, user_id, role, joined_at)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'owner',
  NOW()
);

-- Seed frameworks
INSERT INTO public.frameworks (id, org_id, name, version, description, category, control_count, status, created_at)
VALUES
(
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'NIST CSF 2.0',
  '2.0',
  'National Institute of Standards and Technology Cybersecurity Framework',
  'Cybersecurity',
  4,
  'published',
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'ISO 27001:2022',
  '2022',
  'Information Security Management System',
  'Information Security',
  4,
  'published',
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'SOC 2 Type II',
  '2023',
  'Service Organization Control Framework',
  'Audit & Compliance',
  4,
  'published',
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'GDPR',
  '2018',
  'General Data Protection Regulation',
  'Data Privacy',
  4,
  'published',
  NOW()
);

-- Seed controls for NIST CSF 2.0
INSERT INTO public.controls (id, framework_id, org_id, control_number, title, description, status, owner_id, created_at)
VALUES
(
  '660e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'GV-01',
  'Governance Policy',
  'Establish and maintain governance policies for information security',
  'compliant',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440002'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'CR-01',
  'Risk Assessment',
  'Conduct and document cybersecurity risk assessments',
  'compliant',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440003'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'DE-01',
  'Vulnerability Management',
  'Manage and remediate identified vulnerabilities',
  'partial',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440004'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'RC-01',
  'Recovery Planning',
  'Establish incident recovery procedures and test recovery capabilities',
  'not-assessed',
  NULL,
  NOW()
);

-- Seed controls for ISO 27001:2022
INSERT INTO public.controls (id, framework_id, org_id, control_number, title, description, status, owner_id, created_at)
VALUES
(
  '660e8400-e29b-41d4-a716-446655440005'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'A.5.1',
  'Access Control Policy',
  'Establish information security roles and responsibilities',
  'compliant',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440006'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'A.6.1',
  'Personnel Security',
  'Manage employee access and security clearances',
  'compliant',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440007'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'A.7.1',
  'Cryptography',
  'Use cryptography to protect sensitive information',
  'partial',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440008'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'A.12.1',
  'Change Management',
  'Control and manage all system changes',
  'not-assessed',
  NULL,
  NOW()
);

-- Seed controls for SOC 2 Type II
INSERT INTO public.controls (id, framework_id, org_id, control_number, title, description, status, owner_id, created_at)
VALUES
(
  '660e8400-e29b-41d4-a716-446655440009'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'CC1.1',
  'Control Environment',
  'Establish and maintain a control environment',
  'compliant',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440010'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'CC2.1',
  'Risk Assessment',
  'Identify and analyze risks',
  'compliant',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440011'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'A1.1',
  'Availability',
  'System is available and operational',
  'partial',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440012'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'S1.1',
  'Security Control Implementation',
  'Implement controls to protect systems',
  'not-assessed',
  NULL,
  NOW()
);

-- Seed controls for GDPR
INSERT INTO public.controls (id, framework_id, org_id, control_number, title, description, status, owner_id, created_at)
VALUES
(
  '660e8400-e29b-41d4-a716-446655440013'::uuid,
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Art.5',
  'Data Minimization',
  'Process only necessary personal data',
  'compliant',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440014'::uuid,
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Art.6',
  'Lawful Basis',
  'Establish lawful basis for data processing',
  'compliant',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440015'::uuid,
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Art.32',
  'Data Protection by Design',
  'Implement privacy by design and default',
  'partial',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440016'::uuid,
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Art.33',
  'Breach Notification',
  'Notify supervisory authority of data breaches',
  'not-assessed',
  NULL,
  NOW()
);

-- Seed vendors
INSERT INTO public.vendors (id, org_id, name, category, risk_tier, risk_score, contract_value, contract_expiry, status, data_access_level, created_at)
VALUES
(
  '770e8400-e29b-41d4-a716-446655440001'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Amazon Web Services (AWS)',
  'Cloud Infrastructure',
  'high',
  75.5,
  500000.00,
  '2025-12-31'::date,
  'active',
  'full',
  NOW()
),
(
  '770e8400-e29b-41d4-a716-446655440002'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Salesforce',
  'CRM',
  'high',
  68.0,
  150000.00,
  '2025-06-30'::date,
  'active',
  'standard',
  NOW()
),
(
  '770e8400-e29b-41d4-a716-446655440003'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Okta',
  'Identity Management',
  'critical',
  82.3,
  200000.00,
  '2026-03-31'::date,
  'active',
  'full',
  NOW()
),
(
  '770e8400-e29b-41d4-a716-446655440004'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Microsoft 365',
  'Productivity',
  'high',
  70.0,
  120000.00,
  '2025-08-31'::date,
  'active',
  'standard',
  NOW()
),
(
  '770e8400-e29b-41d4-a716-446655440005'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Datadog',
  'Monitoring',
  'medium',
  45.0,
  80000.00,
  '2025-10-31'::date,
  'active',
  'limited',
  NOW()
),
(
  '770e8400-e29b-41d4-a716-446655440006'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Slack',
  'Communication',
  'medium',
  38.5,
  50000.00,
  '2025-11-30'::date,
  'active',
  'standard',
  NOW()
),
(
  '770e8400-e29b-41d4-a716-446655440007'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Twilio',
  'Communications API',
  'high',
  62.0,
  100000.00,
  '2025-12-31'::date,
  'active',
  'standard',
  NOW()
),
(
  '770e8400-e29b-41d4-a716-446655440008'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Auth0',
  'Identity Management',
  'critical',
  79.0,
  120000.00,
  '2026-01-31'::date,
  'active',
  'full',
  NOW()
),
(
  '770e8400-e29b-41d4-a716-446655440009'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'PagerDuty',
  'Incident Management',
  'medium',
  52.0,
  75000.00,
  '2025-09-30'::date,
  'active',
  'limited',
  NOW()
),
(
  '770e8400-e29b-41d4-a716-446655440010'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'HashiCorp Consul',
  'Service Mesh',
  'medium',
  48.0,
  60000.00,
  '2025-07-31'::date,
  'active',
  'standard',
  NOW()
);

-- Seed incidents
INSERT INTO public.incidents (id, org_id, title, description, severity, status, reported_by, assigned_to, reported_at, created_at)
VALUES
(
  '880e8400-e29b-41d4-a716-446655440001'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Unauthorized API Access',
  'Suspicious API requests detected from unknown IP address',
  'high',
  'resolved',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days'
),
(
  '880e8400-e29b-41d4-a716-446655440002'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Database Credentials Exposure',
  'Database credentials found in code repository',
  'critical',
  'resolved',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days'
),
(
  '880e8400-e29b-41d4-a716-446655440003'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'SSL Certificate Expiration',
  'SSL certificate will expire in 30 days',
  'medium',
  'in-progress',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),
(
  '880e8400-e29b-41d4-a716-446655440004'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Phishing Campaign Detected',
  'Email phishing campaign targeting employees detected',
  'high',
  'resolved',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days'
),
(
  '880e8400-e29b-41d4-a716-446655440005'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Ransomware Threat',
  'Potential ransomware activity detected in development network',
  'critical',
  'in-progress',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),
(
  '880e8400-e29b-41d4-a716-446655440006'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Vendor Data Breach',
  'Third-party vendor experienced a data breach affecting customer data',
  'high',
  'resolved',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days'
),
(
  '880e8400-e29b-41d4-a716-446655440007'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Backup System Failure',
  'Primary backup system failed to complete nightly backup',
  'medium',
  'resolved',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
),
(
  '880e8400-e29b-41d4-a716-446655440008'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Privilege Escalation Vulnerability',
  'Critical privilege escalation vulnerability discovered in web application',
  'critical',
  'in-progress',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
),
(
  '880e8400-e29b-41d4-a716-446655440009'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Unauthorized Data Access',
  'Employee accessing data outside job scope',
  'high',
  'resolved',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '12 days'
),
(
  '880e8400-e29b-41d4-a716-446655440010'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'API Rate Limiting Bypass',
  'API rate limiting controls can be bypassed',
  'medium',
  'open',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NULL,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
(
  '880e8400-e29b-41d4-a716-446655440011'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'DDoS Attack Attempt',
  'Large-scale DDoS attack attempt detected and blocked',
  'high',
  'resolved',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days'
),
(
  '880e8400-e29b-41d4-a716-446655440012'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Compliance Audit Finding',
  'Internal audit identified non-compliant security configuration',
  'medium',
  'in-progress',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days'
);

-- Seed travel advisories
INSERT INTO public.travel_advisories (id, country_code, country_name, risk_level, risk_score, advisory_text, source, created_at)
VALUES
(
  '990e8400-e29b-41d4-a716-446655440001'::uuid,
  'US',
  'United States',
  'low',
  15.0,
  'General safety recommendations apply. Monitor local news.',
  'US State Department',
  NOW()
),
(
  '990e8400-e29b-41d4-a716-446655440002'::uuid,
  'GB',
  'United Kingdom',
  'low',
  12.0,
  'Standard travel precautions recommended.',
  'UK Foreign Office',
  NOW()
),
(
  '990e8400-e29b-41d4-a716-446655440003'::uuid,
  'DE',
  'Germany',
  'low',
  14.0,
  'Maintain normal security awareness.',
  'German Government',
  NOW()
),
(
  '990e8400-e29b-41d4-a716-446655440004'::uuid,
  'JP',
  'Japan',
  'low',
  10.0,
  'Very safe destination. Exercise normal precautions.',
  'Japanese Government',
  NOW()
),
(
  '990e8400-e29b-41d4-a716-446655440005'::uuid,
  'BR',
  'Brazil',
  'high',
  65.0,
  'Exercise increased caution. Avoid certain areas after dark.',
  'US State Department',
  NOW()
);

-- Seed policies
INSERT INTO public.policies (id, org_id, title, description, version, status, owner_id, effective_date, review_date, created_at)
VALUES
(
  'aa0e8400-e29b-41d4-a716-446655440001'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Information Security Policy',
  'Comprehensive policy covering all information security aspects',
  '3.2',
  'active',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  '2024-01-01'::date,
  '2025-01-01'::date,
  NOW()
),
(
  'aa0e8400-e29b-41d4-a716-446655440002'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Access Control Policy',
  'Policy for managing user access to systems and data',
  '2.1',
  'active',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  '2024-02-01'::date,
  '2025-02-01'::date,
  NOW()
),
(
  'aa0e8400-e29b-41d4-a716-446655440003'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Password Policy',
  'Requirements and standards for password management',
  '1.5',
  'active',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  '2024-03-01'::date,
  '2025-03-01'::date,
  NOW()
),
(
  'aa0e8400-e29b-41d4-a716-446655440004'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Incident Response Policy',
  'Procedures for detecting, responding to and recovering from incidents',
  '2.0',
  'active',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  '2024-01-15'::date,
  '2025-01-15'::date,
  NOW()
),
(
  'aa0e8400-e29b-41d4-a716-446655440005'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Data Protection Policy',
  'Policy for protecting personal and sensitive data',
  '1.8',
  'active',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  '2024-04-01'::date,
  '2025-04-01'::date,
  NOW()
),
(
  'aa0e8400-e29b-41d4-a716-446655440006'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Vendor Management Policy',
  'Policy for managing and monitoring third-party vendors',
  '2.3',
  'active',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  '2024-02-15'::date,
  '2025-02-15'::date,
  NOW()
),
(
  'aa0e8400-e29b-41d4-a716-446655440007'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Business Continuity Policy',
  'Policy for maintaining business operations during disruptions',
  '1.9',
  'active',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  '2024-03-15'::date,
  '2025-03-15'::date,
  NOW()
),
(
  'aa0e8400-e29b-41d4-a716-446655440008'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Acceptable Use Policy',
  'Policy for appropriate use of company IT resources',
  '3.0',
  'active',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  '2024-01-20'::date,
  '2025-01-20'::date,
  NOW()
),
(
  'aa0e8400-e29b-41d4-a716-446655440009'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Privacy Policy',
  'Policy for privacy and data handling practices',
  '2.5',
  'active',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  '2024-02-20'::date,
  '2025-02-20'::date,
  NOW()
),
(
  'aa0e8400-e29b-41d4-a716-446655440010'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Travel Security Policy',
  'Policy for travel risk management and traveler security',
  '1.3',
  'active',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  '2024-05-01'::date,
  '2025-05-01'::date,
  NOW()
),
(
  'aa0e8400-e29b-41d4-a716-446655440011'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Risk Management Policy',
  'Policy for identifying, assessing, and mitigating organizational risks',
  '2.2',
  'active',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  '2024-03-10'::date,
  '2025-03-10'::date,
  NOW()
),
(
  'aa0e8400-e29b-41d4-a716-446655440012'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Audit and Compliance Policy',
  'Policy for audit activities and compliance verification',
  '1.7',
  'active',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  '2024-04-15'::date,
  '2025-04-15'::date,
  NOW()
);

-- Seed compliance gaps
INSERT INTO public.compliance_gaps (id, org_id, framework_id, control_id, gap_description, severity, status, remediation_plan, due_date, assigned_to, created_at)
VALUES
(
  'bb0e8400-e29b-41d4-a716-446655440001'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  '660e8400-e29b-41d4-a716-446655440003'::uuid,
  'Vulnerability scanning not performed regularly',
  'high',
  'in-progress',
  'Implement automated weekly vulnerability scans',
  '2025-03-31'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440002'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  '660e8400-e29b-41d4-a716-446655440007'::uuid,
  'Encryption key management missing formal procedures',
  'critical',
  'open',
  'Develop and implement encryption key management policy',
  '2025-02-28'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440003'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  '660e8400-e29b-41d4-a716-446655440012'::uuid,
  'Recovery procedures not tested in past 12 months',
  'high',
  'open',
  'Conduct quarterly disaster recovery drills',
  '2025-04-30'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440004'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  '660e8400-e29b-41d4-a716-446655440016'::uuid,
  'Data breach notification procedures incomplete',
  'critical',
  'in-progress',
  'Complete data breach notification procedures and communicate to team',
  '2025-03-15'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440005'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  NULL,
  'Log retention policy not defined',
  'medium',
  'open',
  'Establish and document log retention policy',
  '2025-04-15'::date,
  NULL,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440006'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  NULL,
  'Vendor security assessments incomplete',
  'high',
  'in-progress',
  'Complete security assessments for all critical vendors',
  '2025-05-31'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440007'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  NULL,
  'Security awareness training not completed by all staff',
  'medium',
  'open',
  'Schedule and complete mandatory security training for all employees',
  '2025-03-31'::date,
  NULL,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440008'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  NULL,
  'Data classification matrix not implemented',
  'high',
  'in-progress',
  'Define and implement data classification scheme',
  '2025-04-30'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440009'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  NULL,
  'Penetration testing not performed in current year',
  'high',
  'open',
  'Schedule and conduct annual penetration testing',
  '2025-06-30'::date,
  NULL,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440010'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  NULL,
  'Multi-factor authentication not enforced for all users',
  'critical',
  'in-progress',
  'Deploy MFA for all users, make mandatory by deadline',
  '2025-03-31'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440011'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  NULL,
  'Configuration management baseline not documented',
  'medium',
  'open',
  'Document and baseline all system configurations',
  '2025-05-15'::date,
  NULL,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440012'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  NULL,
  'Third-party risk assessments not current',
  'high',
  'in-progress',
  'Update all third-party risk assessments',
  '2025-04-30'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440013'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  NULL,
  'Incident response plan not tested',
  'high',
  'open',
  'Conduct incident response plan tabletop exercise',
  '2025-03-30'::date,
  NULL,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440014'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  NULL,
  'Asset inventory incomplete',
  'medium',
  'in-progress',
  'Complete comprehensive IT asset inventory',
  '2025-04-15'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440015'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  NULL,
  'Change management process not formalized',
  'high',
  'open',
  'Implement formal change management process',
  '2025-05-31'::date,
  NULL,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440016'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  NULL,
  'Data retention periods not defined per regulation',
  'high',
  'in-progress',
  'Define data retention periods aligned with regulations',
  '2025-04-30'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440017'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  NULL,
  'Security metrics and monitoring not established',
  'medium',
  'open',
  'Develop and monitor key security metrics',
  '2025-05-15'::date,
  NULL,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440018'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  NULL,
  'Access review process not performed quarterly',
  'high',
  'open',
  'Implement quarterly access reviews and attestation',
  '2025-04-15'::date,
  NULL,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440019'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  NULL,
  'Supply chain risk assessment incomplete',
  'high',
  'in-progress',
  'Complete supply chain risk assessment and develop mitigation plans',
  '2025-05-30'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440020'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  NULL,
  'Incident tracking system not implemented',
  'medium',
  'open',
  'Implement incident tracking and management system',
  '2025-05-31'::date,
  NULL,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440021'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  NULL,
  'Security patch management cycle not optimized',
  'high',
  'in-progress',
  'Optimize patch management for faster critical patch deployment',
  '2025-04-30'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'bb0e8400-e29b-41d4-a716-446655440022'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  NULL,
  'Code security review process missing',
  'high',
  'open',
  'Implement secure code review process and training',
  '2025-04-15'::date,
  NULL,
  NOW()
);

-- Seed CISO leads
INSERT INTO public.leads (id, org_id, name, email, company, title, source, status, score, assigned_to, notes, created_at)
VALUES
(
  'cc0e8400-e29b-41d4-a716-446655440001'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Scott Kennedy',
  'scott.kennedy@appviewx.com',
  'AppViewX',
  'Chief Information Security Officer',
  'LinkedIn',
  'qualified',
  85.0,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Interested in automated certificate and identity governance solutions',
  NOW()
),
(
  'cc0e8400-e29b-41d4-a716-446655440002'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'John Wilson',
  'john.wilson@haystackid.com',
  'HaystackID',
  'Chief Information Security Officer',
  'Conference',
  'qualified',
  80.0,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Seeking cloud security and data governance platform',
  NOW()
),
(
  'cc0e8400-e29b-41d4-a716-446655440003'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Radhika Bajpai',
  'radhika.bajpai@russellinvestments.com',
  'Russell Investments',
  'Chief Information Security Officer',
  'Referral',
  'proposal',
  90.0,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Advanced GRC platform with AI-powered risk assessment',
  NOW()
),
(
  'cc0e8400-e29b-41d4-a716-446655440004'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Rodrigo Jorge',
  'rodrigo.jorge@cerc.es',
  'CERC',
  'Director of Information Security',
  'Trade Show',
  'contacted',
  70.0,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Interest in risk management and compliance automation',
  NOW()
),
(
  'cc0e8400-e29b-41d4-a716-446655440005'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'David Ulloa',
  'david.ulloa@imclogistics.com',
  'IMC Logistics',
  'Chief Information Security Officer',
  'Email Campaign',
  'contacted',
  75.0,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Looking for travel risk and vendor management tools',
  NOW()
),
(
  'cc0e8400-e29b-41d4-a716-446655440006'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Michael Block',
  'michael.block@lereta.com',
  'LERETA LLC',
  'Chief Information Security Officer',
  'LinkedIn',
  'qualified',
  82.0,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Needs comprehensive compliance framework management',
  NOW()
),
(
  'cc0e8400-e29b-41d4-a716-446655440007'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Ray Taft',
  'ray.taft@metadataio.com',
  'Metadata',
  'Chief Information Security Officer',
  'Referral',
  'contacted',
  78.0,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Enterprise GRC solution with automation focus',
  NOW()
),
(
  'cc0e8400-e29b-41d4-a716-446655440008'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Nilanjan Ghatak',
  'nilanjan.ghatak@tatasteeleu.com',
  'Tata Steel',
  'Chief Information Security Officer',
  'Conference',
  'proposal',
  88.0,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Interest in enterprise-scale GRC and travel risk solutions',
  NOW()
),
(
  'cc0e8400-e29b-41d4-a716-446655440009'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Donna Ross',
  'donna.ross@radian.com',
  'Radian',
  'Vice President, Information Security',
  'Trade Show',
  'qualified',
  81.0,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Seeking integrated GRC platform for financial services',
  NOW()
);

-- Seed deals
INSERT INTO public.deals (id, org_id, lead_id, title, value, stage, probability, expected_close, assigned_to, created_at)
VALUES
(
  'dd0e8400-e29b-41d4-a716-446655440001'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'cc0e8400-e29b-41d4-a716-446655440003'::uuid,
  'Russell Investments - GRC Platform Enterprise',
  250000.00,
  'proposal',
  75.0,
  '2025-04-30'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'dd0e8400-e29b-41d4-a716-446655440002'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'cc0e8400-e29b-41d4-a716-446655440008'::uuid,
  'Tata Steel - Global GRC and Travel Risk Suite',
  300000.00,
  'proposal',
  70.0,
  '2025-05-15'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'dd0e8400-e29b-41d4-a716-446655440003'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'cc0e8400-e29b-41d4-a716-446655440001'::uuid,
  'AppViewX - Certificate Management Integration',
  125000.00,
  'negotiation',
  50.0,
  '2025-03-31'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'dd0e8400-e29b-41d4-a716-446655440004'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'cc0e8400-e29b-41d4-a716-446655440006'::uuid,
  'LERETA - Compliance Framework Management',
  175000.00,
  'negotiation',
  55.0,
  '2025-04-15'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
),
(
  'dd0e8400-e29b-41d4-a716-446655440005'::uuid,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'cc0e8400-e29b-41d4-a716-446655440009'::uuid,
  'Radian - Financial Services GRC Solution',
  200000.00,
  'qualification',
  40.0,
  '2025-05-30'::date,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  NOW()
);
