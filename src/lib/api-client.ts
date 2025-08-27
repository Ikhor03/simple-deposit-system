import axios, { AxiosInstance } from 'axios';
import {
  generateAccessTokenSignature,
  generateTransferInquirySignature,
  generateTransferOutSignature,
  generateTimestamp,
  generateReferenceNo
} from './signature';
import { Environment } from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private environment: Environment;
  private accessToken: string | null = null;

  constructor(environment: Environment) {
    this.environment = environment;
    this.client = axios.create({
      baseURL: environment.baseUrl,
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use((config) => {
      // Add common headers
      config.headers['Content-Type'] = 'application/json';
      config.headers['X-CLIENT-KEY'] = this.environment.partnerId;
      
      // Add x-forwarded-for header for local environment
      if (this.environment.name === 'local') {
        config.headers['x-forwarded-for'] = '104.28.213.125';
      }
      
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Get access token
  async getAccessToken(): Promise<string> {
    const timestamp = generateTimestamp();
    
    const signature = generateAccessTokenSignature(
      timestamp,
      this.environment.partnerId,
      this.environment.privateKey,
      'GET',
      '/api/auth/access-token'
    );

    const response = await this.client.get('/auth/access-token', {
      headers: {
        'X-SIGNATURE': signature,
        'X-TIMESTAMP': timestamp,
      },
    });

    this.accessToken = response.data.result.token;
    return this.accessToken as string;
  }

  // Get channels
  async getChannels() {
    if (!this.accessToken) await this.getAccessToken();
    
    const response = await this.client.get('/info/channels', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    return response.data;
  }

  // Get banks
  async getBanks() {
    if (!this.accessToken) await this.getAccessToken();
    
    const response = await this.client.get('/info/banks', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    return response.data;
  }

  // Transfer inquiry
  async transferInquiry(data: {
    destinationAccountNumber: string;
    destinationBankCode: string;
    amount: number;
    channelId: string;
    partnerReferenceNo?: string;
  }) {
    if (!this.accessToken) await this.getAccessToken();

    const timestamp = generateTimestamp();
    const partnerReferenceNo = data.partnerReferenceNo || generateReferenceNo();
    
    const requestBody = {
      ...data,
      merchantId: this.environment.merchantId,
      partnerReferenceNo,
    };

    const signature = generateTransferInquirySignature(
      this.environment.partnerId,
      timestamp,
      requestBody,
      'POST',
      '/api/transaction/transfer-inquiry',
      this.environment.privateKey
    );

    const response = await this.client.post('/transaction/transfer-inquiry', requestBody, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-TIMESTAMP': timestamp,
        'X-SIGNATURE': signature,
      },
    });

    return { ...response.data, partnerReferenceNo };
  }

  // Transfer out
  async transferOut(data: {
    destinationAccountNumber: string;
    destinationAccountName: string;
    destinationBankCode: string;
    amount: number;
    channelId: string;
    inquiryId: string;
    partnerReferenceNo: string;
  }) {
    if (!this.accessToken) await this.getAccessToken();

    const timestamp = generateTimestamp();
    
    const requestBody = {
      ...data,
      merchantId: this.environment.merchantId,
      partnerReferenceNo: data.partnerReferenceNo,
    };

    // console.log("requestBody ==> ", requestBody)

    const signature = generateTransferOutSignature(
      this.environment.partnerId,
      timestamp,
      requestBody,
      'POST',
      '/api/transaction/transfer-out',
      this.environment.privateKey
    );

    const response = await this.client.post('/transaction/transfer-out', requestBody, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-TIMESTAMP': timestamp,
        'X-SIGNATURE': signature,
      },
    });

    return response.data;
  }

  // Get transaction status
  async getTransactionStatus(transactionId: string) {
    if (!this.accessToken) await this.getAccessToken();
    
    const response = await this.client.get(`/transaction/status/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    return response.data;
  }

  // Get balance
  async getBalance() {
    if (!this.accessToken) await this.getAccessToken();
    
    const response = await this.client.get('/wallet/balance', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
      params: {
        merchantId: this.environment.merchantId,
      },
    });

    return response.data;
  }

  // Get journal
  async getJournal(params: {
    limit?: number;
    page?: number;
    walletId?: string;
    entryType?: string;
    startDate?: string;
    endDate?: string;
    order?: string;
  } = {}) {
    if (!this.accessToken) await this.getAccessToken();
    
    const response = await this.client.get('/wallet/journal', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
      params: {
        limit: params.limit || 10,
        page: params.page || 1,
        ...params,
      },
    });

    return response.data;
  }
}

export default ApiClient;
