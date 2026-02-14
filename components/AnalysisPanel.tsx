
import React, { useState } from 'react';
import { AnalysisCategory, AdmissionFile } from '../types';
import { gemini } from '../services/geminiService';

const AnalysisPanel: React.FC<{ category: AnalysisCategory, files: AdmissionFile[] }> = ({ category, files }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const categoryFiles = files.filter(f => f.category === category);

  const triggerAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const dataBlob = categoryFiles.map(f => `${f.name}:\n${f.content}`).join('\n---\n');
      const result = await gemini.generateStrategicReport(category, dataBlob);
      setAnalysisResult(result || "No response received.");
    } catch (error) {
      console.error(error);
      setAnalysisResult("An error occurred during high-level strategic analysis. Verify API key and connectivity.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5">
        <div>
          <div className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] mb-2">Category Diagnostic</div>
          <h3 className="text-3xl font-extrabold text-white font-display">Intelligence Focus: {category.replace('_', ' ')}</h3>
          <p className="text-slate-500 text-sm mt-1">Deploying diagnostic routines on current {category.toLowerCase()} data clusters.</p>
        </div>
        <button
          onClick={triggerAnalysis}
          disabled={isAnalyzing || categoryFiles.length === 0}
          className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${
            isAnalyzing || categoryFiles.length === 0
              ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:-translate-y-0.5'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Synthesizing Strategy...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              <span>Execute Diagnostic</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryFiles.length > 0 ? (
          categoryFiles.map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center gap-5 hover:border-blue-500/30 transition-all group">
              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-extrabold text-white truncate">{f.name}</p>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">Verified Node</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-slate-900/20 border-2 border-dashed border-white/5 rounded-[3rem]">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.268 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <p className="text-slate-400 font-medium">No diagnostic input detected. Visit Ingest Center to upload data.</p>
          </div>
        )}
      </div>

      {analysisResult && (
        <div className="mt-8 bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 shadow-2xl animate-in slide-in-from-bottom-8 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
             <div className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-500 uppercase tracking-widest">Auditable Response</div>
          </div>
          <div className="flex items-center gap-3 mb-10 text-blue-400 font-extrabold text-sm uppercase tracking-[0.4em]">
             <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,1)]" />
             Strategic Output Vector
          </div>
          <div className="whitespace-pre-wrap font-light leading-relaxed text-slate-200 text-lg">
            {analysisResult}
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <span>Auth: Core Intelligence Model</span>
            <span>Checksum: OK-7412-V2</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;
