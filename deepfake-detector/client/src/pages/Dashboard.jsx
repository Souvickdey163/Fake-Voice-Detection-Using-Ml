import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import UploadCard from '../components/UploadCard';
import ResultCard from '../components/ResultCard';
import { useUser } from '../hooks/useUser';

export default function Dashboard() {
  const { user, refreshUser } = useUser();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    refreshUser().catch((err) => {
      console.error(err);
      toast.error('Session expired, please login again.');
    });
  }, [refreshUser]);

  const handlePredict = async () => {
    if (!file) {
      toast.error('Please upload an audio file first.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Prediction response:", response.data);
      setResult(response.data);
      await refreshUser();
      toast.success('Prediction complete!');
    } catch (error) {
      console.error("Prediction failed full error:", error);
      console.error("Backend response:", error.response?.data);
      toast.error(error.response?.data?.detail || 'Error running prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {user && (
        <div className="mb-10 text-center animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome back, <span className="text-blue-400">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Upload an audio sample to analyze its authenticity using our powerful Deep Learning Model.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-sm text-slate-200">
            <span>{user.credits.left} credits left</span>
            <span className="h-1 w-1 rounded-full bg-slate-500" />
            <span>
              {user.credits.used} / {user.credits.total} used on {user.plan}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div className="animate-fade-in-left">
          <UploadCard 
            file={file} 
            setFile={setFile} 
            handlePredict={handlePredict} 
            loading={loading}
            handleReset={handleReset}
          />
        </div>
        
        <div className="animate-fade-in-right">
          <ResultCard result={result} loading={loading} />
        </div>
      </div>
    </div>
  );
}
