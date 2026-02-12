-- Seed migration for GRC frameworks and controls
-- This migration populates the frameworks and controls tables with real data from:
-- 1. NIST Cybersecurity Framework (CSF) 2.0
-- 2. ISO 27001:2022
-- 3. SOC 2 Type II (2017)
-- 4. GDPR (2018)

BEGIN;

-- ============================================================================
-- 1. NIST CYBERSECURITY FRAMEWORK (CSF) 2.0
-- ============================================================================

INSERT INTO frameworks (id, name, version, description, source_url, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'NIST Cybersecurity Framework (CSF)',
  '2.0',
  'The NIST Cybersecurity Framework 2.0 provides a comprehensive set of guidance, standards, and practices to manage cybersecurity risk. It defines 6 key functions: Govern, Identify, Protect, Detect, Respond, and Recover.',
  'https://www.nist.gov/cyberframework',
  'published',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Get the NIST CSF framework ID for use in controls
WITH nist_fw AS (
  SELECT id FROM frameworks WHERE name = 'NIST Cybersecurity Framework (CSF)' AND version = '2.0'
)
INSERT INTO controls (id, framework_id, control_id_str, title, description, category, control_type, created_at)
SELECT
  gen_random_uuid(),
  nist_fw.id,
  control_data.control_id,
  control_data.title,
  control_data.description,
  control_data.category,
  control_data.control_type,
  NOW()
FROM (VALUES
  -- GOVERN Category
  ('GV.OC-01', 'Organizational Context', 'The organization understands its mission, objectives, and operating context.', 'GOVERN', 'management'),
  ('GV.OC-02', 'Governance Structure', 'The organization has established a structure for managing cybersecurity risk governance.', 'GOVERN', 'management'),
  ('GV.RG-01', 'Roles and Responsibilities', 'Cybersecurity roles and responsibilities are clearly defined and communicated.', 'GOVERN', 'management'),
  ('GV.RG-02', 'Supply Chain Risk Management', 'The organization manages supply chain risks related to cybersecurity.', 'GOVERN', 'operational'),
  ('GV.RM-01', 'Risk Management Process', 'The organization executes a comprehensive risk management process.', 'GOVERN', 'management'),
  ('GV.RM-02', 'Risk Monitoring', 'Risks are continuously monitored and reassessed.', 'GOVERN', 'operational'),

  -- IDENTIFY Category
  ('ID.AM-01', 'Asset Management', 'Physical, virtual, and information assets are inventoried and documented.', 'IDENTIFY', 'technical'),
  ('ID.AM-02', 'Software Management', 'Software and services are inventoried and managed.', 'IDENTIFY', 'technical'),
  ('ID.AM-03', 'Data Management', 'Data and its collection points are inventoried and documented.', 'IDENTIFY', 'management'),
  ('ID.GV-01', 'Business Environment', 'The business environment is understood and documented.', 'IDENTIFY', 'management'),
  ('ID.GV-02', 'Legal Requirements', 'Legal, regulatory, and contractual requirements are identified and documented.', 'IDENTIFY', 'management'),
  ('ID.RA-01', 'Risk Assessment', 'Risk assessment is performed and documented.', 'IDENTIFY', 'operational'),

  -- PROTECT Category
  ('PR.AC-01', 'Access Control', 'Access to physical and logical assets is managed and protected.', 'PROTECT', 'technical'),
  ('PR.AC-02', 'Authentication', 'User identity and authentication are managed and protected.', 'PROTECT', 'technical'),
  ('PR.AC-03', 'Access Points', 'Remote access is managed and protected.', 'PROTECT', 'technical'),
  ('PR.AT-01', 'Awareness and Training', 'Personnel are trained on cybersecurity awareness and policies.', 'PROTECT', 'operational'),
  ('PR.AT-02', 'Security Training', 'Cybersecurity and security training is provided to personnel.', 'PROTECT', 'operational'),
  ('PR.DS-01', 'Data Classification', 'Data is classified and documented.', 'PROTECT', 'management'),
  ('PR.DS-02', 'Data Protection', 'Data is protected based on its classification level.', 'PROTECT', 'technical'),
  ('PR.IP-01', 'Secure Development', 'New and updated software and systems are developed securely.', 'PROTECT', 'technical'),
  ('PR.IP-02', 'Configuration Management', 'System and configuration changes are managed securely.', 'PROTECT', 'technical'),
  ('PR.MA-01', 'Maintenance', 'Maintenance of physical and logical assets is performed.', 'PROTECT', 'operational'),
  ('PR.MA-02', 'Remote Maintenance', 'Remote maintenance is performed securely.', 'PROTECT', 'technical'),

  -- DETECT Category
  ('DE.AE-01', 'Anomalies and Events', 'Anomalies and events are detected and analyzed.', 'DETECT', 'technical'),
  ('DE.AE-02', 'Security Monitoring', 'Real-time monitoring is implemented to detect anomalies.', 'DETECT', 'technical'),
  ('DE.CM-01', 'Infrastructure Monitoring', 'The organization monitors systems and assets for anomalies.', 'DETECT', 'technical'),
  ('DE.CM-02', 'Configuration Monitoring', 'Configuration changes are monitored and detected.', 'DETECT', 'technical'),
  ('DE.CM-03', 'Performance and Availability', 'Performance and availability are monitored.', 'DETECT', 'technical'),
  ('DE.DP-01', 'Detection Processes', 'Detection processes are established and maintained.', 'DETECT', 'operational'),

  -- RESPOND Category
  ('RS.RP-01', 'Response Planning', 'Response processes and procedures are established and maintained.', 'RESPOND', 'management'),
  ('RS.RP-02', 'Communication', 'Incident communications and notifications are planned and executed.', 'RESPOND', 'operational'),
  ('RS.CO-01', 'Coordination', 'Incident response is coordinated and executed.', 'RESPOND', 'operational'),
  ('RS.CO-02', 'Analysis', 'Incidents are analyzed and evidence is preserved.', 'RESPOND', 'operational'),
  ('RS.AN-01', 'Investigations', 'Incident investigations are conducted.', 'RESPOND', 'operational'),
  ('RS.AN-02', 'Mitigation', 'Incident impacts are mitigated.', 'RESPOND', 'operational'),

  -- RECOVER Category
  ('RC.RP-01', 'Recovery Planning', 'Recovery processes and procedures are established and maintained.', 'RECOVER', 'management'),
  ('RC.RP-02', 'System Restoration', 'Systems and assets are restored to normal operations.', 'RECOVER', 'operational'),
  ('RC.IM-01', 'Improvements', 'Recovery and response procedures are improved and updated.', 'RECOVER', 'operational'),
  ('RC.CO-01', 'Communication', 'Recovery progress is communicated and coordinated.', 'RECOVER', 'operational'),
  ('RC.CO-02', 'Interim Operations', 'Interim operations are maintained during recovery.', 'RECOVER', 'operational')
) AS control_data(control_id, title, description, category, control_type)
CROSS JOIN nist_fw
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. ISO 27001:2022
-- ============================================================================

INSERT INTO frameworks (id, name, version, description, source_url, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ISO 27001:2022',
  '2022',
  'ISO/IEC 27001:2022 specifies an Information Security Management System (ISMS) standard. It provides a systematic approach to managing sensitive company information so that it remains secure.',
  'https://www.iso.org/standard/27001',
  'published',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Get the ISO 27001:2022 framework ID for use in controls
WITH iso_fw AS (
  SELECT id FROM frameworks WHERE name = 'ISO 27001:2022' AND version = '2022'
)
INSERT INTO controls (id, framework_id, control_id_str, title, description, category, control_type, created_at)
SELECT
  gen_random_uuid(),
  iso_fw.id,
  control_data.control_id,
  control_data.title,
  control_data.description,
  control_data.category,
  control_data.control_type,
  NOW()
FROM (VALUES
  -- Organizational Controls
  ('A.5.1', 'Policies for Information Security', 'The organization establishes comprehensive information security policies.', 'Organizational', 'management'),
  ('A.5.2', 'Information Security Roles and Responsibilities', 'Clear roles and responsibilities for information security are defined.', 'Organizational', 'management'),
  ('A.5.3', 'Segregation of Duties', 'Duties are segregated to prevent conflicts of interest.', 'Organizational', 'operational'),
  ('A.5.4', 'Management Responsibilities', 'Management is responsible for implementing security measures.', 'Organizational', 'management'),
  ('A.5.5', 'Contact with Authorities', 'Relationships with relevant authorities are established.', 'Organizational', 'operational'),
  ('A.5.6', 'Contact with Special Interest Groups', 'Relationships with special interest groups are maintained.', 'Organizational', 'operational'),

  -- People Controls
  ('A.6.1', 'Screening', 'Background checks are conducted for personnel in security-sensitive roles.', 'People', 'operational'),
  ('A.6.2', 'Terms and Conditions of Employment', 'Employment agreements include security obligations.', 'People', 'operational'),
  ('A.6.3', 'Information Security Awareness, Education and Training', 'Personnel receive security awareness and training.', 'People', 'operational'),
  ('A.6.4', 'Disciplinary Process', 'Disciplinary procedures for security violations are established.', 'People', 'operational'),
  ('A.6.5', 'Responsibilities after Termination or Change of Employment', 'Security measures are maintained after employment changes.', 'People', 'operational'),
  ('A.6.6', 'Confidentiality or Non-Disclosure Agreements', 'NDAs and confidentiality agreements are established.', 'People', 'management'),

  -- Physical Controls
  ('A.7.1', 'Physical Security Perimeters', 'Physical security perimeters protect assets from unauthorized access.', 'Physical', 'technical'),
  ('A.7.2', 'Physical Entry', 'Access to physical facilities is controlled and monitored.', 'Physical', 'technical'),
  ('A.7.3', 'Securing Facilities', 'Facilities are secured against threats and hazards.', 'Physical', 'technical'),
  ('A.7.4', 'Physical and Environmental Security', 'Equipment is protected from environmental damage and unauthorized access.', 'Physical', 'technical'),
  ('A.7.5', 'Access to Facilities', 'Visitor access and asset removal are controlled.', 'Physical', 'operational'),
  ('A.7.6', 'Asset Disposal', 'Assets are securely disposed of at end of life.', 'Physical', 'operational'),

  -- Technological Controls
  ('A.8.1', 'User Endpoint Devices', 'User endpoints are protected from security threats.', 'Technological', 'technical'),
  ('A.8.2', 'Privileged Access Rights', 'Privileged access is granted and monitored carefully.', 'Technological', 'technical'),
  ('A.8.3', 'Information Access Restriction', 'Access to information is restricted based on need-to-know.', 'Technological', 'technical'),
  ('A.8.4', 'Access to Cryptographic Keys', 'Cryptographic keys are protected and managed securely.', 'Technological', 'technical'),
  ('A.8.5', 'Authentication', 'Strong authentication mechanisms are implemented.', 'Technological', 'technical'),
  ('A.8.6', 'Capacity Management', 'System capacity and performance are monitored and managed.', 'Technological', 'technical')
) AS control_data(control_id, title, description, category, control_type)
CROSS JOIN iso_fw
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. SOC 2 TYPE II (2017)
-- ============================================================================

INSERT INTO frameworks (id, name, version, description, source_url, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'SOC 2 Type II',
  '2017',
  'SOC 2 Type II is a compliance standard that examines controls relevant to security, availability, processing integrity, confidentiality, and privacy of systems. It requires testing of controls over a period of time.',
  'https://www.aicpa.org/soc2',
  'published',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Get the SOC 2 Type II framework ID for use in controls
WITH soc2_fw AS (
  SELECT id FROM frameworks WHERE name = 'SOC 2 Type II' AND version = '2017'
)
INSERT INTO controls (id, framework_id, control_id_str, title, description, category, control_type, created_at)
SELECT
  gen_random_uuid(),
  soc2_fw.id,
  control_data.control_id,
  control_data.title,
  control_data.description,
  control_data.category,
  control_data.control_type,
  NOW()
FROM (VALUES
  -- Security (CC) Controls
  ('CC1.1', 'Control Environment', 'The entity demonstrates a commitment to competence and enforces responsibility for the performance of internal controls.', 'Security (CC)', 'management'),
  ('CC2.1', 'Fraud Risk Assessment', 'The entity assesses fraud risk as part of its risk assessment process.', 'Security (CC)', 'management'),
  ('CC3.1', 'Information System Performance', 'The entity obtains or generates, uses, and communicates information relevant to the functioning of internal controls.', 'Security (CC)', 'technical'),
  ('CC4.1', 'Risk Monitoring', 'The entity selects, develops, and performs ongoing and/or separate evaluations to ascertain whether components of internal control are present and functioning.', 'Security (CC)', 'operational'),
  ('CC5.1', 'Control Activities', 'The entity selects and develops control activities that contribute to the mitigation of risks to an acceptable level.', 'Security (CC)', 'operational'),
  ('CC6.1', 'Logical Access Controls', 'The entity restricts access to information system resources (files, programs, facilities, and equipment) to those users for whom access has been authorized.', 'Security (CC)', 'technical'),
  ('CC7.1', 'System Monitoring', 'The entity monitors system components and the operation of those components for anomalies that would indicate potential security incidents.', 'Security (CC)', 'technical'),

  -- Availability (A) Controls
  ('A1.1', 'Availability Commitment', 'The entity obtains or generates, uses, and communicates information to support the availability of systems.', 'Availability (A)', 'management'),
  ('A1.2', 'System Availability', 'The entity authorizes, designs, develops, configures, operates, maintains, and monitors information system resources (infrastructure, data, and platforms) over the system''s useful life.', 'Availability (A)', 'technical'),
  ('A2.1', 'Incident Response', 'The entity responds to incidents in a manner that prevents or mitigates disruption of services.', 'Availability (A)', 'operational'),
  ('A2.2', 'Disaster Recovery', 'The entity implements a disaster recovery plan to restore service following an incident.', 'Availability (A)', 'operational'),

  -- Processing Integrity (PI) Controls
  ('PI1.1', 'Processing Integrity', 'The entity obtains or generates, uses, and communicates information regarding the objectives related to processing completeness, accuracy, authorization, and timeliness.', 'Processing Integrity (PI)', 'management'),
  ('PI2.1', 'Data Accuracy and Completeness', 'The entity obtains or generates, uses, and communicates relevant, quality information regarding the objectives and responsibilities for processing.', 'Processing Integrity (PI)', 'technical'),
  ('PI3.1', 'Information System Performance', 'The entity authorizes, designs, develops, configures, operates, maintains, and monitors information system resources to process transactions accurately and timely.', 'Processing Integrity (PI)', 'technical'),
  ('PI4.1', 'Exception Handling', 'The entity responds to identified anomalies in the processing of transactions and corrects anomalies.', 'Processing Integrity (PI)', 'operational'),

  -- Confidentiality (C) Controls
  ('C1.1', 'Confidentiality Protection', 'The entity restricts access to information assets to those permitted to access information.', 'Confidentiality (C)', 'technical'),
  ('C1.2', 'Data Encryption', 'The entity implements encryption of sensitive information in transit and at rest.', 'Confidentiality (C)', 'technical'),
  ('C2.1', 'Classification', 'The entity classifies information and restricts access based on classification levels.', 'Confidentiality (C)', 'management'),

  -- Privacy (P) Controls
  ('P1.1', 'Privacy Governance', 'The entity provides notice to data subjects regarding the collection and use of personal information.', 'Privacy (P)', 'management'),
  ('P2.1', 'Privacy Rights', 'The entity provides choice to data subjects regarding the collection and use of their personal information.', 'Privacy (P)', 'operational'),
  ('P3.1', 'Data Subject Rights', 'The entity provides data subjects the ability to access, update, and correct their personal information.', 'Privacy (P)', 'operational'),
  ('P4.1', 'Privacy Compliance', 'The entity defines roles and responsibilities related to the privacy of personal information.', 'Privacy (P)', 'management')
) AS control_data(control_id, title, description, category, control_type)
CROSS JOIN soc2_fw
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. GDPR (2018)
-- ============================================================================

INSERT INTO frameworks (id, name, version, description, source_url, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'GDPR',
  '2018',
  'The General Data Protection Regulation (GDPR) is a regulation of the European Union on data protection and privacy for all individuals within the EU and European Economic Area. It took effect on May 25, 2018.',
  'https://gdpr-info.eu/',
  'published',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Get the GDPR framework ID for use in controls
WITH gdpr_fw AS (
  SELECT id FROM frameworks WHERE name = 'GDPR' AND version = '2018'
)
INSERT INTO controls (id, framework_id, control_id_str, title, description, category, control_type, created_at)
SELECT
  gen_random_uuid(),
  gdpr_fw.id,
  control_data.control_id,
  control_data.title,
  control_data.description,
  control_data.category,
  control_data.control_type,
  NOW()
FROM (VALUES
  -- Lawfulness
  ('Art.5-Lawfulness', 'Lawfulness of Processing', 'Processing must be lawful, fair, and transparent. One of six lawful bases must exist: consent, contract, legal obligation, vital interests, public task, or legitimate interests.', 'Lawfulness', 'management'),
  ('Art.6-Lawful Basis', 'Legal Basis for Processing', 'Processing is only permitted on one of the six lawful bases specified in Article 6.', 'Lawfulness', 'management'),
  ('Art.7-Consent', 'Consent Management', 'If consent is the lawful basis, consent must be freely given, specific, informed, and unambiguous.', 'Lawfulness', 'operational'),
  ('Art.9-Special Categories', 'Sensitive Data Processing', 'Processing of special categories of data (race, ethnicity, politics, religion, trade union, genetics, biometrics, health, sex life) is generally prohibited except in limited circumstances.', 'Lawfulness', 'management'),

  -- Data Subject Rights
  ('Art.12-Communication', 'Right to Information', 'Data subjects have the right to be informed about data processing in clear, transparent language.', 'Data Subject Rights', 'operational'),
  ('Art.13-Transparency', 'Privacy Notice - Direct Collection', 'Organizations must provide detailed privacy information when collecting data directly from data subjects.', 'Data Subject Rights', 'operational'),
  ('Art.14-Transparency', 'Privacy Notice - Indirect Collection', 'Organizations must provide detailed privacy information when collecting data from third parties.', 'Data Subject Rights', 'operational'),
  ('Art.15-Access', 'Right of Access', 'Data subjects have the right to obtain confirmation of whether data is being processed and to receive a copy of their personal data.', 'Data Subject Rights', 'operational'),
  ('Art.16-Rectification', 'Right to Rectification', 'Data subjects have the right to correct inaccurate personal data without undue delay.', 'Data Subject Rights', 'operational'),
  ('Art.17-Erasure', 'Right to be Forgotten', 'Data subjects have the right to erasure of personal data in specific circumstances.', 'Data Subject Rights', 'operational'),
  ('Art.18-Restriction', 'Right to Restrict Processing', 'Data subjects have the right to restrict processing of their personal data in certain situations.', 'Data Subject Rights', 'operational'),
  ('Art.20-Portability', 'Right to Data Portability', 'Data subjects have the right to receive their personal data in a structured, commonly used format and transmit it to another organization.', 'Data Subject Rights', 'technical'),
  ('Art.21-Objection', 'Right to Object', 'Data subjects have the right to object to processing based on legitimate interests or for marketing purposes.', 'Data Subject Rights', 'operational'),

  -- Controller Obligations
  ('Art.5-Accountability', 'Accountability Principle', 'Controllers are responsible for and must demonstrate compliance with data protection principles.', 'Controller Obligations', 'management'),
  ('Art.24-Responsibility', 'Responsibility of Controller', 'Controllers must implement appropriate technical and organizational measures to ensure compliance.', 'Controller Obligations', 'operational'),
  ('Art.28-Processor Contract', 'Data Processing Agreement', 'Processors must have a written contract with controllers specifying processing terms and conditions.', 'Controller Obligations', 'management'),
  ('Art.32-Security', 'Data Protection by Design and Default', 'Organizations must implement appropriate technical and organizational measures by default to ensure a level of security appropriate to the risk.', 'Controller Obligations', 'technical'),
  ('Art.35-DPIA', 'Data Protection Impact Assessment', 'A DPIA is required for high-risk processing such as large-scale processing, automated decision-making, or systematic monitoring.', 'Controller Obligations', 'management'),
  ('Art.37-DPO', 'Data Protection Officer', 'Organizations may appoint a Data Protection Officer to monitor compliance and serve as a contact point.', 'Controller Obligations', 'management'),

  -- Data Protection
  ('Art.32-Encryption', 'Encryption and Pseudonymization', 'Personal data must be encrypted or pseudonymized where appropriate to the risk level.', 'Data Protection', 'technical'),
  ('Art.32-Confidentiality', 'Confidentiality and Integrity', 'Processing systems must ensure the ongoing confidentiality and integrity of personal data.', 'Data Protection', 'technical'),
  ('Art.32-Availability', 'Resilience and Recovery', 'Processing systems must be able to restore availability and access to data in a timely manner in the event of an incident.', 'Data Protection', 'technical'),
  ('Art.33-Breach Notification', 'Breach Notification to Authority', 'Breaches must be notified to supervisory authorities without undue delay and no later than 72 hours after discovery.', 'Data Protection', 'operational'),
  ('Art.34-Breach Notification', 'Breach Notification to Data Subjects', 'Data subjects must be notified of breaches without undue delay when there is high risk to their rights and freedoms.', 'Data Protection', 'operational'),
  ('Art.5-Retention', 'Storage Limitation', 'Personal data must be kept only as long as necessary for the purposes for which it is processed.', 'Data Protection', 'management'),

  -- International Transfers
  ('Art.44-Transfer', 'International Transfers', 'Transfers of personal data outside the EU/EEA are only permitted to countries with adequate protection or with appropriate safeguards.', 'International Transfers', 'management'),
  ('Art.45-Adequacy', 'Adequacy Decisions', 'Personal data may be transferred to countries deemed to have adequate data protection by the European Commission.', 'International Transfers', 'management'),
  ('Art.46-Safeguards', 'Appropriate Safeguards', 'Personal data may be transferred using appropriate safeguards such as Standard Contractual Clauses (SCCs) or Binding Corporate Rules (BCRs).', 'International Transfers', 'operational'),
  ('Art.49-Exceptions', 'Transfer Exceptions', 'Certain limited exceptions to transfer restrictions exist, such as explicit data subject consent or necessity.', 'International Transfers', 'management')
) AS control_data(control_id, title, description, category, control_type)
CROSS JOIN gdpr_fw
ON CONFLICT DO NOTHING;

COMMIT;
