import Anthropic from '@anthropic-ai/sdk';
import { Metric } from './mockData';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, API calls should go through your backend
});

interface GenerateGrantAnswerParams {
  question: string;
  metrics: Metric[];
  organizationName: string;
  tone: 'professional' | 'emotional' | 'urgent';
}

export async function generateGrantAnswer({
  question,
  metrics,
  organizationName,
  tone,
}: GenerateGrantAnswerParams): Promise<string> {
  // Build context from metrics
  const metricsContext = metrics
    .map((m) => {
      const valueStr = `${m.unit === '$' ? '$' : ''}${m.value.toLocaleString()}${m.unit === '%' ? '%' : ''}`;
      const typeLabel = m.type === 'outcome' ? '(OUTCOME)' : '(OUTPUT)';
      const comparison = m.comparison ? ` - ${m.comparison}` : '';
      return `- ${m.label}: ${valueStr} ${typeLabel}${comparison}`;
    })
    .join('\n');

  const toneInstructions = {
    professional:
      'Use a professional, factual tone. Focus on data and measurable results.',
    emotional:
      'Use storytelling and emotional appeal. Include specific examples of impact on individuals while still being data-driven.',
    urgent:
      'Use compelling, urgent language to demonstrate critical need and significant impact. Emphasize the stakes.',
  };

  const systemPrompt = `You are an expert grant writer helping ${organizationName} respond to grant application questions.

Your job is to:
1. Answer the grant question using the provided metrics and data
2. Be specific and data-driven - reference actual numbers from the metrics
3. Distinguish between outputs (activities, services delivered) and outcomes (actual impact, changes in people's lives)
4. ${toneInstructions[tone]}
5. Keep answers concise (2-3 paragraphs max unless the question requires more detail)
6. Write in the first person plural ("we", "our") as if you are ${organizationName}

CRITICAL: Only use data from the provided metrics. Do not make up numbers or facts.`;

  const userPrompt = `Here is our organization's data:

${metricsContext}

Grant Question: ${question}

Please write a response to this grant question using our actual metrics above. Ground your answer in our real data.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    return textContent.text;
  } catch (error) {
    console.error('Error calling Claude API:', error);

    // Provide helpful error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('Invalid API Key') || errorMessage.includes('invalid_api_key')) {
      throw new Error('Invalid Anthropic API key. Please check your .env.local file.');
    } else if (errorMessage.includes('insufficient_quota')) {
      throw new Error('Anthropic API quota exceeded. Please check your account.');
    } else if (errorMessage.includes('overloaded')) {
      throw new Error('Claude API is temporarily overloaded. Please try again in a moment.');
    }

    throw new Error(`Failed to generate answer: ${errorMessage}`);
  }
}
