// Next.js Best Practice: Simple environment configuration
export function getEnvironmentConfig(environmentKey: string) {
//   console.log('=== Environment Debug ===');
//   console.log('NODE_ENV:', process.env.NODE_ENV);
//   console.log('Requested environment key:', environmentKey);
//   console.log('DEV_PRIVATE_KEY exists:', !!process.env.DEV_PRIVATE_KEY);
//   console.log('DEV_PRIVATE_KEY length:', process.env.DEV_PRIVATE_KEY?.length || 0);
//   console.log('LOCAL_PRIVATE_KEY exists:', !!process.env.LOCAL_PRIVATE_KEY);
//   console.log('STG_PRIVATE_KEY exists:', !!process.env.STG_PRIVATE_KEY);
  
  const config = {
    local: {
      name: 'local',
      baseUrl: process.env.LOCAL_BASE_URL || 'http://localhost:3001/api',
      partnerId: process.env.LOCAL_PARTNER_ID || 'ABG',
      privateKey: process.env.LOCAL_PRIVATE_KEY || '',
      merchantId: process.env.LOCAL_MERCHANT_ID || 'A4QZ',
    },
    dev: {
      name: 'development',
      baseUrl: process.env.DEV_BASE_URL || 'https://disb2c-dev.xpay378.uk/api',
      partnerId: process.env.DEV_PARTNER_ID || 'A00',
      privateKey: process.env.DEV_PRIVATE_KEY || '',
      merchantId: process.env.DEV_MERCHANT_ID || 'A001',
    },
    stg: {
      name: 'staging',
      baseUrl: process.env.STG_BASE_URL || 'https://disb2c-stg.xpay378.uk/api',
      partnerId: process.env.STG_PARTNER_ID || 'A01',
      privateKey: process.env.STG_PRIVATE_KEY || '',
      merchantId: process.env.STG_MERCHANT_ID || 'A001',
    },
    prd: {
      name: 'production',
      baseUrl: process.env.PRD_BASE_URL || 'https://disb2c.xpay378.uk/api',
      partnerId: process.env.PRD_PARTNER_ID || 'A01',
      privateKey: process.env.PRD_PRIVATE_KEY || '',
      merchantId: process.env.PRD_MERCHANT_ID || '',
    }
  };
  
  const selectedConfig = config[environmentKey as keyof typeof config];
  
  return selectedConfig;
}

// Client-side environment options (for UI selection only)
export const ENVIRONMENT_OPTIONS = {
  local: { name: 'Local', baseUrl: 'http://localhost:3001/api' },
  dev: { name: 'Development', baseUrl: 'https://disb2c-dev.xpay378.uk/api' },
  stg: { name: 'Staging', baseUrl: 'https://disb2c-stg.xpay378.uk/api' },
  prd: { name: 'Production', baseUrl: 'https://disb2c.xpay378.uk/api' }
};

// Debug function (server-side only)
export function debugEnvironment() {
  if (typeof window === 'undefined') {
    console.log('=== Environment Debug ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('LOCAL_BASE_URL:', process.env.LOCAL_BASE_URL);
    console.log('LOCAL_PARTNER_ID:', process.env.LOCAL_PARTNER_ID);
    console.log('DEV_BASE_URL:', process.env.DEV_BASE_URL);
    console.log('Environment Config:', JSON.stringify(getEnvironmentConfig('dev'), null, 2));
    console.log('========================');
  }
}
