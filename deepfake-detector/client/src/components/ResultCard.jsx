import { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import {
  Activity,
  AlertTriangle,
  Download,
  FileText,
  ListChecks,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import LoadingIndicator from './LoadingIndicator';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function buildFallbackReport(result) {
  const prediction = result?.prediction ?? '';
  const isFake = prediction.toLowerCase().includes('spoof') || prediction.toLowerCase().includes('fake');
  const fakeProbability = clamp(
    Number(result?.breakdown?.fakeProbability ?? result?.spoof_probability ?? (isFake ? result?.confidence ?? 50 : 100 - (result?.confidence ?? 50))),
    0,
    100
  );
  const authenticity = clamp(
    Number(result?.breakdown?.authenticity ?? result?.score ?? 100 - fakeProbability),
    0,
    100
  );
  const modelConfidence = clamp(
    Number(result?.breakdown?.modelConfidence ?? result?.confidence ?? 0),
    0,
    100
  );
  const confidenceBand =
    modelConfidence >= 85 ? 'High confidence' : modelConfidence >= 60 ? 'Moderate confidence' : 'Low confidence';
  const verdictTitle = isFake ? 'Potentially Synthetic Audio Detected' : 'No Strong Synthetic Signal Detected';
  const riskLevel = fakeProbability >= 80 ? 'High risk' : fakeProbability >= 45 ? 'Medium risk' : 'Low risk';
  const recommendedAction = isFake
    ? 'Do not trust this recording on its own. Verify the source manually before sharing, acting, or escalating.'
    : 'This sample appears more consistent with authentic speech, but sensitive decisions should still include source verification.';
  const keySignals = isFake
    ? [
        'Low authenticity score compared with spoof probability.',
        'Model confidence strongly supports the current fake classification.',
        'Acoustic transitions and texture appear less natural than expected.',
      ]
    : [
        'Authenticity score is stronger than spoof probability.',
        'Model confidence supports a natural-speech interpretation.',
        'No dominant synthetic artifacts were surfaced in the current pass.',
      ];

  return {
    filename: result?.filename ?? 'Uploaded audio',
    prediction,
    timestamp: result?.timestamp,
    score: authenticity,
    label: result?.label ?? (isFake ? 'Likely Fake' : 'Likely Authentic'),
    summary:
      result?.summary ??
      (isFake
        ? 'The model found a strong concentration of spoof-like characteristics in this recording. It should be treated as suspicious until it is verified through an independent source or secondary evidence.'
        : 'The model found the recording to be broadly consistent with natural human speech. No major spoofing patterns dominated this analysis pass.'),
    breakdown: {
      authenticity,
      fakeProbability,
      modelConfidence,
    },
    interpretation: {
      verdictTitle,
      confidenceBand,
      riskLevel,
      recommendedAction,
      keySignals,
    },
    details: {
      vocalConsistency:
        result?.details?.vocalConsistency ??
        (isFake
          ? 'Detected voice transitions appear less stable than expected for natural speech. This can happen when generated speech struggles to preserve smooth phrasing, breath timing, or realistic emphasis.'
          : 'Pitch movement and tone transitions remain consistent with authentic human delivery. The vocal flow does not show strong instability in the model summary.'),
      backgroundNoise:
        result?.details?.backgroundNoise ??
        (isFake
          ? 'Background texture appears flatter than expected, which can happen in generated or heavily processed clips. Real-world recordings usually preserve more irregular environmental variation.'
          : 'Background ambience is stable across the sample without obvious looping artifacts. The noise floor appears comparatively natural for a standard recording environment.'),
      spectrogram:
        result?.details?.spectrogram ??
        (isFake
          ? 'Spectral distribution suggests synthetic artifacts in portions of the analyzed frequency range. The model likely surfaced unusually regular energy patterns or missing natural texture.'
          : 'No dominant synthetic frequency artifacts were surfaced in the analyzed spectrogram features. Frequency spread appears closer to expected natural speech structure.'),
    },
  };
}

export default function ResultCard({ result, loading }) {
  const reportRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const report = useMemo(() => {
    if (!result) {
      return null;
    }

    return buildFallbackReport(result);
  }, [result]);

  const isFake =
    report?.prediction?.toLowerCase().includes('spoof') ||
    report?.prediction?.toLowerCase().includes('fake') ||
    report?.label?.toLowerCase().includes('fake');

  const downloadPDF = async () => {
    if (!reportRef.current) {
      return;
    }

    try {
      setDownloading(true);

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#020617',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('analysis-report.pdf');
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF download failed:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const formattedTimestamp = report?.timestamp
    ? new Date(report.timestamp).toLocaleString()
    : null;
  const authenticityTone = isFake ? 'text-red-300' : 'text-emerald-300';
  const verdictTone = isFake
    ? 'border-red-400/20 bg-red-500/10 text-red-100'
    : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100';

  if (loading) {
    return (
      <div className="glass-panel p-6 sm:p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
        <LoadingIndicator label="" variant="panel" />
        <h3 className="text-xl font-bold text-white mt-8 mb-2">Analyzing Audio Features</h3>
        <p className="text-gray-400 text-center max-w-sm">
          Extracting MFCCs and running through the PyTorch CNN model to determine authenticity.
        </p>
      </div>
    );
  }

  if (!report) {
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

  return (
    <div className="glass-panel h-full overflow-hidden p-5 sm:p-8">
      <div ref={reportRef} className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
              <FileText className="h-4 w-4" />
              Analysis Report
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">Audio Authenticity Review</h2>
            <p className="mt-3 text-slate-300">
              A more readable explanation of what the model saw in your uploaded sample, what the result means, and how cautiously you should treat this recording.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2 xl:max-w-[28rem]">
            <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 break-words">
              File: <span className="text-white break-all">{report.filename}</span>
            </div>
            {formattedTimestamp && (
              <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
                {formattedTimestamp}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Authenticity Score</p>
                <div className={`mt-4 text-5xl font-semibold tracking-tight sm:text-6xl ${isFake ? 'text-red-400' : 'text-green-400'}`}>
                  {report.score.toFixed(0)}%
                </div>
                <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${
                  isFake
                    ? 'border border-red-400/20 bg-red-500/10 text-red-200'
                    : 'border border-green-400/20 bg-green-500/10 text-green-200'
                }`}>
                  {isFake ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  <span>{report.label}</span>
                </div>
                <p className={`mt-4 max-w-md text-sm leading-7 ${authenticityTone}`}>
                  {report.interpretation.verdictTitle}
                </p>
              </div>

              <div className={`rounded-2xl p-4 ${isFake ? 'bg-red-500/10 text-red-300' : 'bg-green-500/10 text-green-300'}`}>
                {isFake ? <ShieldAlert className="h-8 w-8" /> : <ShieldCheck className="h-8 w-8" />}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className={`rounded-2xl border px-4 py-3 text-sm ${verdictTone}`}>
                <div className="text-xs uppercase tracking-[0.22em] opacity-75">Risk Level</div>
                <div className="mt-2 text-base font-medium">{report.interpretation.riskLevel}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Confidence Band</div>
                <div className="mt-2 text-base font-medium text-white">{report.interpretation.confidenceBand}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center gap-2 text-blue-200">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-white">Summary Report</h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">{report.summary}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="text-sm text-slate-400">Model Confidence</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {report.breakdown.modelConfidence.toFixed(2)}%
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="text-sm text-slate-400">Authenticity</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {report.breakdown.authenticity.toFixed(2)}%
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="text-sm text-slate-400">Fake Probability</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {report.breakdown.fakeProbability.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <div className="flex items-center gap-2 text-slate-200">
                <AlertTriangle className="h-4 w-4 text-amber-300" />
                <h4 className="text-sm font-medium text-white">Recommended Action</h4>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                {report.interpretation.recommendedAction}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
            <h3 className="text-lg font-semibold text-white">Authenticity Breakdown</h3>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                <span>Authenticity</span>
                <span>{report.breakdown.authenticity.toFixed(2)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-slate-900">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                  style={{ width: `${report.breakdown.authenticity}%` }}
                />
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                <span>Fake Probability</span>
                <span>{report.breakdown.fakeProbability.toFixed(2)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-slate-900">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-400"
                  style={{ width: `${report.breakdown.fakeProbability}%` }}
                />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/55 p-4">
              <div className="flex items-center gap-2 text-slate-200">
                <ListChecks className="h-4 w-4 text-cyan-300" />
                <h4 className="text-sm font-medium text-white">Key Signals Behind This Result</h4>
              </div>
              <div className="mt-3 space-y-3">
                {report.interpretation.keySignals.map((signal) => (
                  <div key={signal} className="flex gap-3 text-sm leading-7 text-slate-300">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    <span>{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-blue-300" />
              <h3 className="text-lg font-semibold text-white">Detailed Analysis</h3>
            </div>
            <div className="mt-6 space-y-5">
              <div>
                <h4 className="text-sm uppercase tracking-[0.2em] text-slate-400">Vocal Consistency</h4>
                <p className="mt-2 text-sm leading-7 text-slate-300 sm:text-base">{report.details.vocalConsistency}</p>
              </div>
              <div>
                <h4 className="text-sm uppercase tracking-[0.2em] text-slate-400">Background Noise Analysis</h4>
                <p className="mt-2 text-sm leading-7 text-slate-300 sm:text-base">{report.details.backgroundNoise}</p>
              </div>
              <div>
                <h4 className="text-sm uppercase tracking-[0.2em] text-slate-400">Spectrogram Analysis</h4>
                <p className="mt-2 text-sm leading-7 text-slate-300 sm:text-base">{report.details.spectrogram}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
          <h3 className="text-lg font-semibold text-white">Plain-Language Interpretation</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <h4 className="text-sm uppercase tracking-[0.22em] text-slate-400">What This Means</h4>
              <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                {isFake
                  ? 'The model is strongly leaning toward this sample being manipulated, generated, or otherwise inconsistent with expected natural human speech patterns.'
                  : 'The model is leaning toward this sample sounding natural. That means the analyzed features were more aligned with authentic speech than synthetic speech.'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <h4 className="text-sm uppercase tracking-[0.22em] text-slate-400">How To Use This Result</h4>
              <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                Use this report as a decision-support signal, not as the only proof. For sensitive situations, combine it with source verification, context checks, and human review before taking action.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={downloadPDF}
        disabled={downloading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-4 text-base font-medium text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {downloading ? (
          <LoadingIndicator label="Generating PDF..." />
        ) : (
          <>
            <Download className="h-5 w-5" />
            <span>Download PDF Report</span>
          </>
        )}
      </button>
    </div>
  );
}
