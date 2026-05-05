import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api, { ML_REQUEST_TIMEOUT_MS } from '../services/api';
import { startPlanCheckout } from '../services/payments';
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

  const submitPrediction = async (selectedFile) => {
    const formData = new FormData();
    formData.append('file', selectedFile);

    return api.post('/api/predict', formData, {
      timeout: ML_REQUEST_TIMEOUT_MS,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const handlePredict = async () => {
    if (!file) {
      toast.error('Please upload an audio file first.');
      return;
    }

    try {
      setLoading(true);
      const response = await submitPrediction(file);

      console.log("Prediction response:", response.data);
      setResult(response.data);
      await refreshUser();
      toast.success('Prediction complete!');
    } catch (error) {
      console.error("Prediction failed full error:", error);
      console.error("Backend response:", error.response?.data);

      const detail = error.response?.data?.detail || '';
      const creditsExhausted = error.response?.status === 403 && detail.includes('used all');

      if (creditsExhausted) {
        try {
          toast.error('Your credits are finished. Complete payment to continue detection.');
          await startPlanCheckout({
            plan: 'pro',
            onSuccess: async () => {
              await refreshUser();
              toast.success('Payment successful! Credits added and retrying detection.');
            },
          });

          const retryResponse = await submitPrediction(file);
          console.log("Prediction response after payment:", retryResponse.data);
          setResult(retryResponse.data);
          await refreshUser();
          toast.success('Payment successful and prediction complete!');
          return;
        } catch (paymentError) {
          const paymentMessage =
            paymentError.response?.data?.detail || paymentError.message || 'Payment failed.';
          toast.error(paymentMessage);
          return;
        }
      }

      toast.error(detail || 'Error running prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {user && (
        <div className="mb-8 text-center animate-fade-in-up sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome back, <span className="text-blue-400">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="mt-4 text-base text-gray-400 sm:text-lg">
            Upload an audio sample to analyze its authenticity using our powerful Deep Learning Model.
          </p>
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 sm:rounded-full sm:px-5 sm:py-2">
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
