import { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Clock,
  HardDrive,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/api/history/');
      console.log('History response:', response.data);
      setHistory(response.data);
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
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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
