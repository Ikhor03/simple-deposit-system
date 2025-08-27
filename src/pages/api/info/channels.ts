import { NextApiRequest, NextApiResponse } from 'next';
import ApiClient from '@/lib/api-client';
import { Environment } from '@/types';
import { getEnvironmentConfig } from '@/config/default-env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { environmentKey } = req.body;
    
    if (!environmentKey) {
      return res.status(400).json({ error: 'Environment key required' });
    }

    const environment = getEnvironmentConfig(environmentKey);
    
    if (!environment) {
      return res.status(400).json({ error: 'Invalid environment key' });
    }

    const apiClient = new ApiClient(environment);
    const channels = await apiClient.getChannels();
    
    res.status(200).json(channels);
  } catch (error: any) {
    console.error('Channels API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get channels',
      details: error.response?.data || error.message 
    });
  }
}
