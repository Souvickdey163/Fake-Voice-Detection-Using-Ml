import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import UploadCard from '../components/UploadCard';
import ResultCard from '../components/ResultCard';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Fetch profile on load
    api.get('/api/users/me')
      .then(res => setUser(res.data))
      .catch((err) => {
        console.error(err);
        toast.error('Session expired, please login again.');
      });
  }, []);

  const handlePredict = async () => {
    if (!file) {
      toast.error('Please upload an audio file first.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Prediction response:", response.data);
      setResult(response.data);
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
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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