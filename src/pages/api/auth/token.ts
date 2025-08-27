import { NextApiRequest, NextApiResponse } from 'next';
import ApiClient from '@/lib/api-client';
import { Environment } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { environment } = req.body;
    
    if (!environment) {
      return res.status(400).json({ error: '1. Environment configuration required' });
    }

    const apiClient = new ApiClient(environment as Environment);
    const token = await apiClient.getAccessToken();
    
    res.status(200).json({ success: true, token });
  } catch (error: any) {
    console.error('Token API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get access token',
      details: error.response?.data || error.message 
    });
  }
}
