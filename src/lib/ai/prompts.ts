/**
 * System prompts and prompt templates for Claude API
 */

export const SYSTEM_PROMPTS = {
  GRC_ANALYST: `You are an expert GRC (Governance, Risk, and Compliance) consultant with deep knowledge of:
- ISO 27001 Information Security Management
- NIST Cybersecurity Framework
- CIS Controls
- SOC 2 Type II
- Risk assessment methodologies
- Compliance frameworks

You provide clear, actionable insights and recommendations for organizations.`,

  TRAVEL_RISK_EXPERT: `You are a travel risk assessment expert with knowledge of:
- Global security threats
- Health and pandemic risks
- Travel advisories from major governments
- Business continuity and contingency planning
- Travel insurance and protections

You provide balanced, practical advice for business travelers.`,

  CONTROL_MAPPER: `You are a control mapping specialist. Your task is to identify equivalent controls across different GRC frameworks.
- You understand the intent and scope of controls
- You provide confidence scores for mappings
- You explain your mapping rationale
- You identify where frameworks differ in scope`,

  POLICY_WRITER: `You are a cybersecurity and compliance policy writer. You create:
- Clear, enforceable policies
- Practical procedures and guidelines
- Risk-aware controls
- Compliance-focused documentation
- User-friendly training materials`,
};

export const PROMPT_TEMPLATES = {
  ANALYZE_FRAMEWORK: (frameworkName: string, content: string) => `
Analyze this ${frameworkName} framework document:

${content}

Identify:
1. Main control categories
2. Key requirements
3. Implementation complexity
4. Dependencies between controls
5. Common pitfalls in implementation

Format as structured JSON.`,

  ASSESS_CONTROL_IMPLEMENTATION: (controlTitle: string, evidence: string) => `
Assess the implementation of the following control:
Control: ${controlTitle}

Evidence provided:
${evidence}

Determine:
1. Implementation status (Not Implemented / Partially Implemented / Implemented)
2. Maturity level (1-5)
3. Gaps or weaknesses
4. Improvement recommendations
5. Compliance score (0-100)

Provide a detailed but concise assessment.`,

  COMPARE_FRAMEWORKS: (framework1: string, framework2: string) => `
Compare the ${framework1} and ${framework2} frameworks:

Identify:
1. Coverage overlap
2. Unique requirements in each
3. Scope differences
4. Implementation difficulty comparison
5. Which is more suitable for different organization types

Provide a comparison matrix.`,

  EXTRACT_TRAVEL_RISKS: (destination: string, context: string) => `
Assess travel risks for a business trip to ${destination}.

Context:
${context}

Consider:
1. Security threats
2. Health risks
3. Infrastructure reliability
4. Business continuity implications
5. Geopolitical factors

Provide a risk summary with mitigation strategies.`,

  GENERATE_COMPLIANCE_REPORT: (frameworkName: string, scores: Record<string, number>) => `
Generate a compliance report for ${frameworkName}.

Assessment scores by category:
${Object.entries(scores)
  .map(([category, score]) => `- ${category}: ${score}/100`)
  .join('\n')}

Include:
1. Executive summary
2. Key findings
3. Risk areas
4. Action items (prioritized)
5. Timeline for remediation

Format for board-level presentation.`,
};

/**
 * Get a system prompt by name
 */
export function getSystemPrompt(
  promptName: keyof typeof SYSTEM_PROMPTS
): string {
  return SYSTEM_PROMPTS[promptName];
}

/**
 * Format a prompt template with variables
 */
export function formatPrompt(
  template: string,
  variables: Record<string, string | number>
): string {
  return Object.entries(variables).reduce(
    (prompt, [key, value]) => prompt.replace(`{${key}}`, String(value)),
    template
  );
}

/**
 * Common instructions for Claude
 */
export const INSTRUCTIONS = {
  JSON_OUTPUT: 'Return only valid JSON, no other text.',
  BRIEF_RESPONSE: 'Keep your response under 500 characters.',
  DETAILED_RESPONSE: 'Provide a detailed, comprehensive response with examples.',
  STRUCTURED_FORMAT:
    'Use clear headers and bullet points for readability.',
  ACTIONABLE: 'Focus on practical, actionable recommendations.',
  RISK_FOCUS: 'Prioritize by risk level (critical, high, medium, low).',
  COMPLIANCE_FOCUS: 'Emphasize compliance and audit implications.',
};
