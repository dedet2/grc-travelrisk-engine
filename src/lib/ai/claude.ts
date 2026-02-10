import Anthropic from '@anthropic-ai/sdk';
import type { ControlMapping } from '../grc/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analyze a document using Claude API
 */
export async function analyzeDocument(
  content: string,
  prompt: string,
  maxTokens = 1024
): Promise<string> {
  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\nDocument content:\n${content}`,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    return textContent.text;
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to analyze document with Claude API');
  }
}

/**
 * Map controls between source and target taxonomies using Claude
 */
export async function mapControls(
  sourceControls: string[],
  targetTaxonomy: string
): Promise<ControlMapping[]> {
  const sourceList = sourceControls.join('\n- ');

  const prompt = `You are a GRC (Governance, Risk, and Compliance) expert.

I have the following source controls:
- ${sourceList}

Please map these controls to the ${targetTaxonomy} framework. For each source control, identify the best matching controls in ${targetTaxonomy}.

Return a JSON array with the following structure:
[
  {
    "sourceControlId": "source control ID",
    "sourceControlTitle": "source control title",
    "targetControlIds": ["target1", "target2"],
    "targetControlTitles": ["target control 1", "target control 2"],
    "confidenceScore": 0.85,
    "reasoning": "explanation of the mapping"
  }
]

Only return valid JSON, no other text.`;

  try {
    const response = await analyzeDocument('', prompt, 2048);

    // Parse JSON response
    try {
      const mappings = JSON.parse(response);
      return Array.isArray(mappings) ? mappings : [];
    } catch {
      console.error('Failed to parse Claude response as JSON');
      return [];
    }
  } catch (error) {
    console.error('Error mapping controls:', error);
    return [];
  }
}

/**
 * Extract insights from assessment data
 */
export async function extractAssessmentInsights(
  assessmentData: Record<string, unknown>,
  frameworkName: string
): Promise<string> {
  const prompt = `You are a cybersecurity and GRC consultant. Analyze this risk assessment data for the ${frameworkName} framework and provide key insights and recommendations.

Assessment data:
${JSON.stringify(assessmentData, null, 2)}

Provide:
1. Key risk areas
2. Quick wins (easy improvements)
3. Priority recommendations
4. Resource requirements

Keep the response concise and actionable.`;

  return analyzeDocument('', prompt, 1024);
}

/**
 * Generate a summary of travel risks
 */
export async function generateTravelRiskSummary(
  destination: string,
  grcScore: number,
  travelScore: number,
  additionalContext?: string
): Promise<string> {
  const prompt = `You are a travel risk assessment expert. Create a brief, professional summary of the travel risk for someone going to ${destination}.

GRC Assessment Score: ${grcScore}/100
Travel Risk Score: ${travelScore}/100
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Provide:
1. Overall risk assessment
2. Key concerns
3. Mitigation recommendations
4. Pre-travel preparations

Keep it under 500 characters.`;

  return analyzeDocument('', prompt, 512);
}

/**
 * Track API usage for cost monitoring
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export function calculateTokenCost(
  inputTokens: number,
  outputTokens: number
): TokenUsage {
  // Claude 3.5 Sonnet pricing (as of 2024)
  const inputCostPer1k = 0.003; // $0.003 per 1K input tokens
  const outputCostPer1k = 0.015; // $0.015 per 1K output tokens

  const inputCost = (inputTokens / 1000) * inputCostPer1k;
  const outputCost = (outputTokens / 1000) * outputCostPer1k;

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    estimatedCost: inputCost + outputCost,
  };
}
