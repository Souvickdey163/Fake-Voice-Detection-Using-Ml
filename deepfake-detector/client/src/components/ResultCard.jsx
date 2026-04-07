import { ShieldAlert, ShieldCheck, Activity } from 'lucide-react';

export default function ResultCard({ result, loading }) {
  if (loading) {
    return (
      <div className="glass-panel p-6 sm:p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-8 h-8 text-blue-500 animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mt-8 mb-2">Analyzing Audio Features</h3>
        <p className="text-gray-400 text-center max-w-sm">
          Extracting MFCCs and running through the PyTorch CNN model to determine authenticity.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-panel p-6 sm:p-8 flex flex-col items-center justify-center h-full min-h-[400px] border-dashed">
        <div className="bg-gray-800/50 p-6 rounded-full border border-gray-700 mb-6">
          <Activity className="w-12 h-12 text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-400">Awaiting Analysis</h3>
        <p className="text-gray-500 text-center max-w-xs mt-2">
          Upload an audio file and click run to see the prediction results here.
        </p>
      </div>
    );
  }

  const isFake = result.prediction.toLowerCase().includes('spoof') || result.prediction.toLowerCase().includes('fake');
  
  return (
    <div className="glass-panel p-6 sm:p-8 flex flex-col h-full relative overflow-hidden group">
      {/* Decorative large icon background */}
      <div className="absolute -right-10 -bottom-10 opacity-[0.03] transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
        {isFake ? <ShieldAlert className="w-96 h-96" /> : <ShieldCheck className="w-96 h-96" />}
      </div>

      <h2 className="text-xl font-bold text-white mb-6">Analysis Results</h2>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`
          w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-2xl relative
          ${isFake ? 'bg-red-500/10 shadow-red-500/20' : 'bg-green-500/10 shadow-green-500/20'}
        `}>
          <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isFake ? 'bg-red-500' : 'bg-green-500'}`}></div>
          {isFake ? <ShieldAlert className="w-16 h-16 text-red-500 relative z-10" /> : <ShieldCheck className="w-16 h-16 text-green-500 relative z-10" />}
        </div>
        
        <h3 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
          {result.prediction}
        </h3>
        
        <p className="text-gray-400 bg-gray-900 border border-gray-700 rounded-full px-4 py-1.5 text-sm font-mono mt-2 mb-8 inline-flex items-center space-x-2">
          <span>File:</span>
          <span className="text-gray-200 truncate max-w-[200px]">{result.filename}</span>
        </p>
      </div>

      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6 mt-auto">
        <div className="flex justify-between items-end mb-2">
          <span className="text-gray-400 font-medium">Confidence Score</span>
          <span className={`text-2xl font-bold font-mono ${isFake ? 'text-red-400' : 'text-green-400'}`}>
            {result.confidence.toFixed(2)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-700">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${isFake ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-green-600 to-green-400'}`}
            style={{ width: `${result.confidence}%` }}
          ></div>
        </div>
        
        <p className="text-gray-500 text-xs mt-4 text-center">
          Analysis processed via CNN deep learning model across 40 MFCC features
        </p>
      </div>
    </div>
  );
}
