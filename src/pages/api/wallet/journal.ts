import { NextApiRequest, NextApiResponse } from 'next';
import ApiClient from '@/lib/api-client';
import { getEnvironmentConfig } from '@/config/default-env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { environmentKey, ...params } = req.body;
    
    if (!environmentKey) {
      return res.status(400).json({ error: 'Environment key is required' });
    }

    const environment = getEnvironmentConfig(environmentKey);
    console.log(`Journal API - Loading environment for key: ${environmentKey}`, environment);
    
    if (!environment) {
      return res.status(400).json({ error: 'Invalid environment key' });
    }

    const apiClient = new ApiClient(environment);
    const result = await apiClient.getJournal(params);
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Journal API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get journal',
      details: error.response?.data || error.message 
    });
  }
}
