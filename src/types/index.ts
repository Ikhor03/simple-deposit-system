export interface ApiResponse<T> {
  success: boolean;
  message: string;
  result: T;
}

export interface Channel {
  id: string;
  name: string;
  label: string;
  type: string;
  createdAt: string;
  availablePayMethod?: string[];
}

export interface Bank {
  id: number;
  bankName: string;
  bankCode: string;
}

export interface AccessToken {
  token: string;
  expiresIn: number;
}

export interface TransferInquiry {
  destinationAccountNumber: string;
  destinationBankCode: string;
  amount: number;
  merchantId: string;
  channelId: string;
  partnerReferenceNo: string;
}

export interface TransferInquiryResult {
  inquiryId: string;
  destinationAccNumber: string;
  destinationAccName: string;
  desc: string;
}

export interface TransferOut extends TransferInquiry {
  destinationAccountName: string;
  inquiryId: string;
}

export interface TransferOutResult {
  destinationAccountNumber: string;
  destinationAccountName: string;
  destinationBankCode: string;
  amount: number;
  merchantId: string;
  channelId: string;
  inquiryId: string;
  partnerReferenceNo: string;
  transactionId: string;
}

export interface TransactionStatus {
  statusTrx: string;
  id: string;
  merchantId: string;
  amount: string;
  type: string;
  destinationAccountNumber: string;
  destinationBankCode: string;
  partnerReferenceNo: string;
  channelId: string;
  walletId: string;
}

export interface Balance {
  id: string;
  merchantId: string;
  balance: string;
  name: string;
  channelId: string;
}

export interface JournalEntry {
  id: string;
  type: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  referenceNo: string;
  createdAt: string;
  merchantId: string;
  channelId: string;
  transactionId: string;
}

export interface JournalResponse {
  result: JournalEntry[];
  meta?: {
    currentPage: number;
    limit: number;
  };
}

export interface Environment {
  name: string;
  baseUrl: string;
  partnerId: string;
  privateKey: string;
  merchantId: string;
}
