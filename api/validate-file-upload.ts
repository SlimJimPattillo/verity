/**
 * Server-side validation endpoint for file uploads
 * Provides additional security layer before database insertion
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
  ServerValidationRequestSchema,
  MetricSchema,
  type ValidatedMetric,
} from '../src/components/file-upload/lib/fileValidation';
import { sanitizeMetrics, removeDuplicates } from '../src/components/file-upload/lib/sanitization';

// Initialize Supabase client with service role key for RLS bypass
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validationResult = ServerValidationRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validationResult.error.errors,
      });
    }

    const { organizationId, metrics, fileName, userId } = validationResult.data;

    // 1. Verify user has access to organization
    const { data: userProfile, error: authError } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (authError || !userProfile) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (userProfile.organization_id !== organizationId) {
      return res.status(403).json({
        error: 'Forbidden - organization mismatch',
      });
    }

    // 2. Validate metrics count
    if (metrics.length === 0) {
      return res.status(400).json({ error: 'No valid metrics to import' });
    }

    if (metrics.length > 10000) {
      return res.status(400).json({
        error: 'Too many metrics. Maximum 10,000 per upload.',
      });
    }

    // 3. Sanitize data (XSS prevention)
    const sanitizedMetrics = sanitizeMetrics(
      metrics as unknown as Record<string, unknown>[]
    );

    // 4. Check for duplicates
    const { unique, duplicates } = removeDuplicates(sanitizedMetrics);

    if (duplicates.length > 0) {
      return res.status(400).json({
        error: 'Duplicate labels found',
        duplicates: [...new Set(duplicates)],
      });
    }

    // 5. Re-validate each metric with Zod
    const validationErrors: Array<{ row: number; errors: string[] }> = [];
    const validMetrics: ValidatedMetric[] = [];

    unique.forEach((metric, index) => {
      const result = MetricSchema.safeParse(metric);

      if (result.success) {
        validMetrics.push(result.data);
      } else {
        validationErrors.push({
          row: index,
          errors: result.error.errors.map((e) => e.message),
        });
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        validationErrors,
      });
    }

    // 6. Return validation success
    return res.status(200).json({
      success: true,
      validatedMetrics: validMetrics,
      count: validMetrics.length,
    });
  } catch (error) {
    console.error('Validation error:', error);

    return res.status(500).json({
      error: 'Server validation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Configure serverless function
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb', // Limit request size
    },
  },
};
