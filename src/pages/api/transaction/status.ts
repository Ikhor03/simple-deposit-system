import { NextApiRequest, NextApiResponse } from 'next';
import ApiClient from '@/lib/api-client';
import { getEnvironmentConfig } from '@/config/default-env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { environmentKey, transactionId } = req.body;
    
    if (!environmentKey || !transactionId) {
      return res.status(400).json({ error: 'Environment key and transaction ID required' });
    }

    const environment = getEnvironmentConfig(environmentKey);
    
    if (!environment) {
      return res.status(400).json({ error: 'Invalid environment key' });
    }

    const apiClient = new ApiClient(environment);
    const result = await apiClient.getTransactionStatus(transactionId);
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Transaction Status API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get transaction status',
      details: error.response?.data || error.message 
    });
  }
}
