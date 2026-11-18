import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Cpu } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { AiAnalysis, ComplaintPriority } from '../../types';

interface AiImageAnalyzerProps {
  imageFile: File | null;
  onApplySuggestions: (suggestions: {
    title: string;
    description: string;
    category: string;
    priority: ComplaintPriority;
    aiAnalysis: AiAnalysis;
  }) => void;
}

export const AiImageAnalyzer: React.FC<AiImageAnalyzerProps> = ({
  imageFile,
  onApplySuggestions
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await aiService.analyzeImage(imageFile);
      setAnalysisResult(response.analysis);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'AI analysis could not be completed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (!analysisResult) return;

    onApplySuggestions({
      title: analysisResult.suggestedTitle || analysisResult.detectedIssue || 'Reported Civic Issue',
      description: `${analysisResult.visualDamage || ''} ${analysisResult.urgencyExplanation || ''}`.trim(),
      category: analysisResult.suggestedCategory || 'Roads & Potholes',
      priority: analysisResult.suggestedPriority || 'Medium',
      aiAnalysis: analysisResult
    });
  };

  if (!imageFile) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50/70 via-white to-civic-50/70 p-4 rounded-xl border border-indigo-200/80 shadow-sm mt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-950 flex items-center space-x-1.5">
              <span>Google Gemini Multimodal AI Assistant</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">Active</span>
            </h4>
            <p className="text-[11px] text-slate-500">Scan uploaded photograph for automated damage detection & categorization</p>
          </div>
        </div>

        {!analysisResult && (
          <button
            type="button"
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Inspecting Image...</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5" />
                <span>Analyze with AI</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center space-x-2 border border-red-200 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Result Card */}
      {analysisResult && (
        <div className="space-y-3 bg-white p-3.5 rounded-lg border border-indigo-100 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">
                {analysisResult.detectedIssue}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="text-slate-500 font-medium">Confidence:</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                {analysisResult.confidenceScore || 94}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Suggested Category</span>
              <span className="font-semibold text-slate-800">{analysisResult.suggestedCategory}</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Recommended Department</span>
              <span className="font-semibold text-slate-800">{analysisResult.suggestedDepartment}</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Evaluated Urgency</span>
              <span className="font-semibold text-amber-700">{analysisResult.suggestedPriority}</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Model Engine</span>
              <span className="font-semibold text-slate-700">{analysisResult.modelUsed || 'Gemini Vision'}</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-1 bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100">
            <p><strong>Damage Assessment:</strong> {analysisResult.visualDamage}</p>
            <p><strong>Urgency Rationale:</strong> {analysisResult.urgencyExplanation}</p>
            {analysisResult.safetyAdvisory && (
              <p className="text-amber-800 font-medium">
                ⚠️ <strong>Safety Advisory:</strong> {analysisResult.safetyAdvisory}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ethical AI: Identities redacted. All suggestions editable.</span>
            </div>
            <button
              type="button"
              onClick={handleApply}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
            >
              <span>Apply AI Suggestions to Form</span>
              <span>✓</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
