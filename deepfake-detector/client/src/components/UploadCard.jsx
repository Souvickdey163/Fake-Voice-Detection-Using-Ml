import { useRef } from 'react';
import { UploadCloud, X, Play, Loader2 } from 'lucide-react';

export default function UploadCard({ file, setFile, handlePredict, loading, handleReset }) {
  const fileInputRef = useRef(null);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="glass-panel flex h-full flex-col p-5 sm:p-8">
      <h2 className="text-xl font-bold text-white mb-6">Upload Audio Segment</h2>

      {!file ? (
        <div 
          className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 p-6 text-center transition-all hover:border-blue-500 hover:bg-gray-800/50 sm:p-10"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <div className="mb-4 rounded-full bg-gray-800 p-4 shadow-lg transition-transform group-hover:scale-110">
            <UploadCloud className="w-10 h-10 text-blue-500" />
          </div>
          <p className="mb-2 text-base font-medium text-gray-300 sm:text-lg">Click or drag audio file here</p>
          <p className="text-sm text-gray-500">Supports .wav, .mp3, .ogg (Max 10MB)</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileChange} 
            accept="audio/*" 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-700 bg-gray-900/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center space-x-4 overflow-hidden">
              <div className="bg-blue-600/20 p-3 rounded-lg flex-shrink-0">
                <Play className="w-6 h-6 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{file.name}</p>
                <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            
            {!loading && (
              <button 
                onClick={handleReset}
                className="self-end rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400 sm:self-auto"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Simple HTML5 Audio Player for preview */}
          <div className="w-full">
            <audio controls src={URL.createObjectURL(file)} className="w-full h-12 rounded-lg outline-none" />
          </div>

          <button 
            onClick={handlePredict} 
            disabled={loading}
            className="btn-primary mt-auto w-full px-4 py-4 text-base shadow-lg shadow-blue-500/20 sm:text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running Deep Learning Analysis...</span>
              </>
            ) : (
              <span>Detect Deepfake</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
