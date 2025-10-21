'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  Send, 
  Search, 
  History, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import axios from 'axios';
import { Bank, Channel, Balance, JournalEntry, TransactionStatus } from '@/types';
import { ENVIRONMENT_OPTIONS } from '@/config/default-env';

export default function Home() {
  const [currentEnv, setCurrentEnv] = useState<keyof typeof ENVIRONMENT_OPTIONS>('dev');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [envConfig, setEnvConfig] = useState<{partnerId?: string, merchantId?: string} | null>(null);
  
  // Data states
  const [balance, setBalance] = useState<Balance[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [journalMeta, setJournalMeta] = useState({ currentPage: 1, limit: 5 });
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  
  // Form states
  const [transferForm, setTransferForm] = useState({
    destinationAccountNumber: '',
    destinationBankCode: '',
    amount: '',
    channelId: '',
  });
  const [statusSearchId, setStatusSearchId] = useState('');
  const [inquiryResult, setInquiryResult] = useState<any>(null);

  // Function to get current environment info
  const getCurrentEnvInfo = async () => {
    try {
      const response = await axios.post('/api/info/environment', { environmentKey: currentEnv });
      setEnvConfig(response.data.result);
    } catch (err) {
      console.error('Failed to get environment info:', err);
    }
  };

  // Environment is now handled server-side, no need for client-side environment state

  const handleApiCall = async (endpoint: string, data: any = {}) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post(endpoint, { environmentKey: currentEnv, ...data });
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.details?.message || err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      const [balanceRes, banksRes, channelsRes, journalRes] = await Promise.all([
        handleApiCall('/api/wallet/balance'),
        handleApiCall('/api/info/banks'),
        handleApiCall('/api/info/channels'),
        handleApiCall('/api/wallet/journal', { page: 1, limit: 5 })
      ]);
      
      setBalance(balanceRes.result || []);
      setBanks(banksRes.result);
      setChannels(channelsRes.result);
      setJournal(journalRes.result || []);
      if (journalRes.meta) {
        setJournalMeta(journalRes.meta);
      }
      
      // Also load environment info
      await getCurrentEnvInfo();
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const loadJournalPage = async (page: number) => {
    try {
      const journalRes = await handleApiCall('/api/wallet/journal', { page, limit: journalMeta.limit });
      setJournal(journalRes.result || []);
      if (journalRes.meta) {
        setJournalMeta(journalRes.meta);
      }
    } catch (err) {
      console.error('Failed to load journal page:', err);
    }
  };

  const handleTransferInquiry = async () => {
    try {
      const result = await handleApiCall('/api/transaction/inquiry', {
        destinationAccountNumber: transferForm.destinationAccountNumber,
        destinationBankCode: transferForm.destinationBankCode,
        amount: parseInt(transferForm.amount),
        channelId: transferForm.channelId,
      });
      setInquiryResult(result.result);
    } catch (err) {
      console.error('Transfer inquiry failed:', err);
    }
  };

  const handleTransferOut = async () => {
    if (!inquiryResult) return;
    
    try {
      const result = await handleApiCall('/api/transaction/transfer', {
        destinationAccountNumber: transferForm.destinationAccountNumber,
        destinationAccountName: inquiryResult.destinationAccName,
        destinationBankCode: transferForm.destinationBankCode,
        amount: parseInt(transferForm.amount),
        channelId: transferForm.channelId,
        inquiryId: inquiryResult.inquiryId,
        partnerReferenceNo: inquiryResult.partnerReferenceNo,
      });
      
      alert(`Transfer successful! Transaction ID: ${result.result.transactionId}`);
      setTransferForm({ destinationAccountNumber: '', destinationBankCode: '', amount: '', channelId: '' });
      setInquiryResult(null);
      loadInitialData(); // Refresh data
    } catch (err) {
      console.error('Transfer failed:', err);
    }
  };

  const handleStatusSearch = async () => {
    try {
      const result = await handleApiCall('/api/transaction/status', { transactionId: statusSearchId });
      setTransactionStatus(result.result);
    } catch (err) {
      console.error('Status search failed:', err);
    }
  };

  const handleTransactionIdClick = (transactionId: string) => {
    setStatusSearchId(transactionId);
    setActiveTab('status');
    // Automatically trigger the status search
    setTimeout(() => {
      handleApiCall('/api/transaction/status', { transactionId })
        .then(result => setTransactionStatus(result.result))
        .catch(err => console.error('Status search failed:', err));
    }, 100);
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(Number(amount));
  };

  const getStatusIcon = (status: string) => {
    console.log(status)
    switch (status.toLowerCase()) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  // Load environment info when environment changes
  useEffect(() => {
    getCurrentEnvInfo();
  }, [currentEnv]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">B2C Deposit Demo</h1>
            
            {/* Environment Selector and Info */}
            <div className="flex items-center space-x-4">
              {/* Environment Info Display */}
              {envConfig && (
                <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm">
                  <div className="flex items-center space-x-4 text-gray-700">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">Partner ID:</span>
                      <span className="font-mono text-blue-600">{envConfig.partnerId}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">Merchant ID:</span>
                      <span className="font-mono text-green-600">{envConfig.merchantId}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <select
                value={currentEnv}
                onChange={(e) => setCurrentEnv(e.target.value as keyof typeof ENVIRONMENT_OPTIONS)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="dev">Development</option>
                <option value="stg">Staging</option>
                <option value="prd">Production</option>
                <option value="local">Local</option>
              </select>
              
              <button
                onClick={loadInitialData}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Load Data</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <XCircle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: Wallet },
              { id: 'transfer', name: 'Transfer Out', icon: Send },
              { id: 'status', name: 'Check Status', icon: Search },
              { id: 'journal', name: 'Transaction History', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Balance Cards */}
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Wallet Balances</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {balance.length > 0 ? balance.map((wallet) => (
                  <div key={wallet.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{wallet.name}</h4>
                      <span className="text-xs text-gray-500">{wallet.channelId}</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(wallet.balance)}
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center text-gray-500">Loading balances...</div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                <button
                  onClick={() => setActiveTab('journal')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View More →
                </button>
              </div>
              <div className="space-y-3">
                {journal.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${entry.type === 'debit' ? 'bg-red-400' : 'bg-green-400'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{entry.description} ({entry.channelId})</p>
                        <p className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${entry.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                      {entry.type === 'debit' ? '' : '+'}{formatCurrency(entry.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transfer Tab */}
        {activeTab === 'transfer' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Transfer Out</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank</label>
                  <select
                    value={transferForm.destinationBankCode}
                    onChange={(e) => setTransferForm({ ...transferForm, destinationBankCode: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Bank</option>
                    {banks.map((bank) => (
                      <option key={bank.bankCode} value={bank.bankCode}>
                        {bank.bankName} ({bank.bankCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Channel</label>
                  <select
                    value={transferForm.channelId}
                    onChange={(e) => setTransferForm({ ...transferForm, channelId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Channel</option>
                    {channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Number</label>
                  <input
                    type="text"
                    value={transferForm.destinationAccountNumber}
                    onChange={(e) => setTransferForm({ ...transferForm, destinationAccountNumber: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter account number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter amount"
                  />
                </div>

                {!inquiryResult ? (
                  <button
                    onClick={handleTransferInquiry}
                    disabled={loading || !transferForm.destinationAccountNumber || !transferForm.destinationBankCode || !transferForm.amount || !transferForm.channelId}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Check Transfer Details'}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <h4 className="font-medium text-green-800">Transfer Details Confirmed</h4>
                      {/* <p className="text-sm text-green-700">
                        Channel: {transferForm.channelId}
                      </p> */}
                      <p className="text-sm text-green-700 mt-1">
                        Account Name: {inquiryResult.destinationAccName}
                      </p>
                      <p className="text-sm text-green-700">
                        Account Number: {transferForm.destinationAccountNumber}
                      </p>
                      <p className="text-sm text-green-700">
                        Amount: {formatCurrency(transferForm.amount)}
                      </p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setInquiryResult(null)}
                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleTransferOut}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'Confirm Transfer'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Check Transaction Status</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <input
                    type="text"
                    value={statusSearchId}
                    onChange={(e) => setStatusSearchId(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter transaction ID"
                  />
                </div>

                <button
                  onClick={handleStatusSearch}
                  disabled={loading || !statusSearchId}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Check Status'}
                </button>

                {transactionStatus && (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      {getStatusIcon(transactionStatus.statusTrx)}
                      <h4 className="font-medium text-gray-900">Transaction Details</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className="font-medium">{transactionStatus.statusTrx || 'Pending'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-medium">{formatCurrency(transactionStatus.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type:</span>
                        <span className="font-medium capitalize">{transactionStatus.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account:</span>
                        <span className="font-medium">{transactionStatus.destinationAccountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reference:</span>
                        <span className="font-medium">{transactionStatus.partnerReferenceNo}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Journal Tab */}
        {activeTab === 'journal' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance After</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {journal.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.merchantId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.channelId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.type === 'debit' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        entry.type === 'debit' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {entry.type === 'debit' ? '' : '+'}{formatCurrency(entry.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(entry.balanceAfter)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.type === 'credit' || entry.referenceNo.startsWith('FEE') ? entry.transactionId : 
                        <button
                          onClick={() => handleTransactionIdClick(entry.transactionId)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          {entry.transactionId}
                        </button>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.referenceNo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <span>
                  Showing {((journalMeta.currentPage - 1) * journalMeta.limit) + 1} to {Math.min(journalMeta.currentPage * journalMeta.limit)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadJournalPage(1)}
                  disabled={journalMeta.currentPage <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                
                <button
                  onClick={() => loadJournalPage(journalMeta.currentPage - 1)}
                  disabled={journalMeta.currentPage <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, journal.length < journalMeta.limit ? 2 : 3) }, (_, i) => {
                    const startPage = Math.max(1, journalMeta.currentPage - 1);
                    // if (journal.length < journalMeta.limit) startPage = journalMeta.currentPage - 4;
                    const pageNum = startPage + i;
                    if (journal.length < journalMeta.limit && journalMeta.currentPage === 1) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => loadJournalPage(pageNum)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          pageNum === journalMeta.currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => loadJournalPage(journalMeta.currentPage + 1)}
                  disabled={journal.length < journalMeta.limit}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
