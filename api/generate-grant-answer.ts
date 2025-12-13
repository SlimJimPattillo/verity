import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client (server-side - API key is safe here)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Metric {
  id: string;
  label: string;
  value: number;
  unit: '$' | '%' | 'People' | '#';
  type: 'output' | 'outcome';
  comparison?: string;
  previousValue?: number;
}

interface RequestBody {
  question: string;
  metrics: Metric[];
  organizationName: string;
  tone: 'professional' | 'emotional' | 'urgent';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, metrics, organizationName, tone }: RequestBody = req.body;

    // Validate input
    if (!question || !metrics || !organizationName || !tone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (metrics.length === 0) {
      return res.status(400).json({ error: 'At least one metric is required' });
    }

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

    // Call Claude API
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

    // Return successful response
    return res.status(200).json({
      answer: textContent.text,
      success: true,
    });

  } catch (error) {
    console.error('Error in generate-grant-answer API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Provide helpful error messages
    if (errorMessage.includes('Invalid API Key') || errorMessage.includes('invalid_api_key')) {
      return res.status(401).json({ error: 'Invalid Anthropic API key configuration' });
    } else if (errorMessage.includes('insufficient_quota')) {
      return res.status(429).json({ error: 'Anthropic API quota exceeded' });
    } else if (errorMessage.includes('overloaded')) {
      return res.status(503).json({ error: 'Claude API is temporarily overloaded. Please try again.' });
    }

    return res.status(500).json({ error: `Failed to generate answer: ${errorMessage}` });
  }
}
