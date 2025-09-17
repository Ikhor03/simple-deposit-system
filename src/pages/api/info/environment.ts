import { NextApiRequest, NextApiResponse } from 'next';
import { getEnvironmentConfig } from '@/config/default-env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { environmentKey } = req.body;

    if (!environmentKey) {
      return res.status(400).json({ error: 'Environment key is required' });
    }

    const config = getEnvironmentConfig(environmentKey);
    
    if (!config) {
      return res.status(400).json({ error: 'Invalid environment key' });
    }

    // Return only the partnerId and merchantId for security
    const result = {
      partnerId: config.partnerId,
      merchantId: config.merchantId,
      environment: config.name
    };

    res.status(200).json({
      success: true,
      result
    });

  } catch (error: any) {
    console.error('Environment info error:', error);
    res.status(500).json({
      error: 'Failed to get environment information',
      details: { message: error.message }
    });
  }
}
