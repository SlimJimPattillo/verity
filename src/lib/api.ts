import { Metric } from './mockData';

interface GenerateGrantAnswerParams {
  question: string;
  metrics: Metric[];
  organizationName: string;
  tone: 'professional' | 'emotional' | 'urgent';
}

interface GenerateGrantAnswerResponse {
  answer: string;
  success: boolean;
}

/**
 * Call the serverless function to generate a grant answer using Claude AI
 * This keeps the API key secure on the server side
 */
export async function generateGrantAnswer({
  question,
  metrics,
  organizationName,
  tone,
}: GenerateGrantAnswerParams): Promise<string> {
  try {
    const response = await fetch('/api/generate-grant-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        metrics,
        organizationName,
        tone,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }

    const data: GenerateGrantAnswerResponse = await response.json();
    return data.answer;

  } catch (error) {
    console.error('Error calling API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Provide helpful error messages
    if (errorMessage.includes('Invalid API Key') || errorMessage.includes('invalid_api_key')) {
      throw new Error('Invalid Anthropic API key. Please contact support.');
    } else if (errorMessage.includes('quota')) {
      throw new Error('Service temporarily unavailable. Please try again later.');
    } else if (errorMessage.includes('overloaded')) {
      throw new Error('AI service is busy. Please try again in a moment.');
    }

    throw new Error(`Failed to generate answer: ${errorMessage}`);
  }
}
