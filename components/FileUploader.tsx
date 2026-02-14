
import React, { useState } from 'react';
import { AnalysisCategory, AdmissionFile } from '../types';
import { Icons } from '../constants';

interface FileUploaderProps {
  onUpload: (file: AdmissionFile) => void;
  existingFiles: AdmissionFile[];
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, existingFiles }) => {
  const [selectedCategory, setSelectedCategory] = useState<AnalysisCategory>(AnalysisCategory.FUNNEL);
  const [isHovering, setIsHovering] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onUpload({
        name: file.name,
        type: file.type || 'text/csv',
        content,
        category: selectedCategory
      });
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const templates: Record<AnalysisCategory, string> = {
      [AnalysisCategory.FUNNEL]: "Inquiry Date,Student Name,Referral Source,Zip Code,Feeder School,Stage (Inquiry/App/Decision/Deposit/Enroll),Decision Date,Deposit Amount",
      [AnalysisCategory.RETENTION]: "Student ID,Entry Year,Entry Grade,Current GPA,Attendance Rate (%),Discipline Incidents,Re-enrollment Status (Yes/No),Eligible to Return (Yes/No)",
      [AnalysisCategory.FINANCIAL]: "Month,Year,Gross Tuition Revenue,Financial Aid Distributed,Initiative Name,Initiative Cost,Target Audience,Enrolled Students Attributed",
      [AnalysisCategory.SENTIMENT]: "Date,Source (Survey/Exit Interview),Student/Parent ID,Sentiment Score (1-10),Push Factors (Internal Reason),Pull Factors (External Attraction),Raw Feedback Text",
      [AnalysisCategory.NETWORK]: "Branch ID,Branch Name,Operational Cost,Total Capacity,Current Enrollment,Marketing Spend,Local Competitor Count"
    };

    const content = templates[selectedCategory];
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `DAAP_${selectedCategory.toLowerCase()}_template.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Intelligence Import Center</h2>
        <p className="text-slate-400 max-w-xl mx-auto">Upload your admissions, financial, and feedback datasets to enable DAAP's diagnostic engine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Upload Card */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-semibold text-slate-300">Target Category</label>
              <button 
                onClick={downloadTemplate}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download Template
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(AnalysisCategory).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                    selectedCategory === cat 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <label 
            className={`block cursor-pointer border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
              isHovering ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
            onDragLeave={() => setIsHovering(false)}
            onDrop={(e) => { e.preventDefault(); setIsHovering(false); }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-500 mb-2">
                <Icons.Upload />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-100">Drop Dataset Here</span>
                <p className="text-sm text-slate-500 mt-1">Supports .csv, .xlsx, .txt, .pdf</p>
              </div>
              <input type="file" className="hidden" onChange={handleFileChange} accept=".csv,.xlsx,.txt,.pdf" />
              <div className="mt-4 px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-blue-500 transition-colors">Browse Files</div>
            </div>
          </label>
        </div>

        {/* Inventory Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col h-full">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="text-blue-500"><Icons.Dashboard /></span>
            Active Data Inventory
          </h3>
          
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {existingFiles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <p>Waiting for data ingest...</p>
              </div>
            ) : (
              existingFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl border border-slate-700 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center text-blue-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold truncate text-slate-100">{file.name}</p>
                      <p className="text-[10px] text-blue-500 uppercase font-bold tracking-tighter">{file.category}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">{(file.content.length / 1024).toFixed(1)} KB</div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Confidential Data Governance Applied</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
