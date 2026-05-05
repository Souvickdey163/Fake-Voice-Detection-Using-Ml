import { useState, useEffect } from 'react';
import {
  BadgeIndianRupee,
  History as HistoryIcon,
  Clock,
  HardDrive,
  Receipt,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function History() {
  const [history, setHistory] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      const [historyResponse, paymentsResponse] = await Promise.all([
        api.get('/api/history/'),
        api.get('/api/payments/history'),
      ]);
      console.log('History response:', historyResponse.data);
      setHistory(historyResponse.data);
      setPayments(paymentsResponse.data);
    } catch (error) {
      console.error('History load error:', error);
      console.error('History backend response:', error.response?.data);

      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          'Failed to load history'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Pending';
    }

    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatAmount = (amount, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0) / 100);

  return (
    <div className="mx-auto max-w-6xl animate-fade-in-up px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-8 flex items-start gap-4 sm:items-center">
        <div className="rounded-xl border border-blue-500/30 bg-blue-600/20 p-3 text-blue-400">
          <HistoryIcon className="w-8 h-8" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Prediction History</h1>
          <p className="text-gray-400 mt-1">
            Review your previously analyzed audio files.
          </p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-gray-700/40 bg-gray-900/20 px-6 py-5">
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-blue-300" />
            <div>
              <h2 className="text-lg font-semibold text-white">Payment History</h2>
              <p className="mt-1 text-sm text-gray-400">Recent plan upgrades and checkout attempts.</p>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="p-10 flex justify-center items-center h-48">
            <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center h-48">
            <BadgeIndianRupee className="w-12 h-12 text-gray-500 mb-4" />
            <p className="text-xl font-medium text-gray-300">No payment history yet</p>
            <p className="text-gray-500 mt-2">Completed checkouts will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-b border-gray-700/30">
            <table className="min-w-full divide-y divide-gray-700/50 text-left">
              <thead className="bg-gray-800/40">
                <tr>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30 bg-gray-900/10">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium capitalize text-white">{payment.plan}</div>
                      <div className="mt-1 text-xs text-gray-500">{payment.payment_id || payment.order_id}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-white">
                      {formatAmount(payment.amount, payment.currency)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                          payment.status === 'paid'
                            ? 'border-green-500/20 bg-green-500/10 text-green-300'
                            : 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(payment.paid_at || payment.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-panel mt-8 overflow-hidden">
        <div className="border-b border-gray-700/40 bg-gray-900/20 px-6 py-5">
          <div className="flex items-center gap-3">
            <HistoryIcon className="h-5 w-5 text-blue-300" />
            <div>
              <h2 className="text-lg font-semibold text-white">Prediction History</h2>
              <p className="mt-1 text-sm text-gray-400">Review your previously analyzed audio files.</p>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="p-10 flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center h-64">
            <HardDrive className="w-12 h-12 text-gray-500 mb-4" />
            <p className="text-xl font-medium text-gray-300">No history found</p>
            <p className="text-gray-500 mt-2">
              Upload and analyze audio to see results here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50 text-left">
              <thead className="bg-gray-800/40">
                <tr>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    File Details
                  </th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Prediction
                  </th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30 bg-gray-900/10">
                {history.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-800/20 transition-colors"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <HardDrive className="w-5 h-5 text-gray-400 mr-3 hidden sm:block" />
                        <div
                          className="text-sm font-medium text-white max-w-[200px] sm:max-w-xs truncate"
                          title={record.filename}
                        >
                          {record.filename}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                          record.prediction === 'Bonafide (Real)'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        {record.prediction === 'Bonafide (Real)' ? (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        )}
                        <span>{record.prediction.split(' ')[0]}</span>
                      </span>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center max-w-[120px]">
                        <div className="w-full bg-gray-700 rounded-full h-2 mr-3">
                          <div
                            className={`h-2 rounded-full ${
                              record.prediction === 'Bonafide (Real)'
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${record.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-300 font-mono">
                          {record.confidence.toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      {formatDate(record.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
