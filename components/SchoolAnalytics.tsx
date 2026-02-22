
import React, { useState } from 'react';
import { SchoolBranch, AdmissionFile, AnalysisCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { gemini } from '../services/geminiService';

interface SchoolAnalyticsProps {
  selectedBranch: SchoolBranch | null;
  files: AdmissionFile[];
}

const mockComparisonData = [
  { metric: 'Yield Rate', North: 45, South: 38, Global: 41 },
  { metric: 'Retention', North: 96, South: 92, Global: 94 },
  { metric: 'ROI (%)', North: 18, South: 12, Global: 15 },
  { metric: 'CPA ($)', North: 1100, South: 1450, Global: 1250 },
];

const mockGrowthData = [
  { year: '2020', enrollment: 850 },
  { year: '2021', enrollment: 920 },
  { year: '2022', enrollment: 1050 },
  { year: '2023', enrollment: 1180 },
  { year: '2024', enrollment: 1350 },
];

const SchoolAnalytics: React.FC<SchoolAnalyticsProps> = ({ selectedBranch, files }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [strategicInsight, setStrategicInsight] = useState<string | null>(null);

  const handleStrategicAudit = async () => {
    setIsAnalyzing(true);
    try {
      const branchName = selectedBranch ? selectedBranch.name : "Global Network";
      const prompt = `Perform a high-level strategic enrollment audit for the ${branchName} campus. Focus on operational efficiency, geographical demand, and competitive positioning within the network.`;
      const result = await gemini.analyzeAdmissions(prompt);
      setStrategicInsight(result || "Audit complete. No critical anomalies detected.");
    } catch (err) {
      setStrategicInsight("Operational interruption during intelligence fetch.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            {selectedBranch ? `${selectedBranch.name} Analytics` : 'Network Global Overview'}
          </h2>
          <p className="text-slate-400 text-sm">
            {selectedBranch 
              ? `Operational metrics for ${selectedBranch.location} facility.` 
              : 'Consolidated performance across all 12 operational branches.'}
          </p>
        </div>
        <button
          onClick={handleStrategicAudit}
          disabled={isAnalyzing}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
          Generate Campus Audit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Comparative Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Network Benchmarking</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="metric" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="North" fill="#3b82f6" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fontWeight: 800, fill: '#3b82f6' }} />
                <Bar dataKey="South" fill="#f59e0b" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fontWeight: 800, fill: '#f59e0b' }} />
                <Bar dataKey="Global" fill="#10b981" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fontWeight: 800, fill: '#10b981' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollment Growth */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Historical Enrollment Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="enrollment" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6' }} activeDot={{ r: 8 }} label={{ position: 'top', fontSize: 10, fontWeight: 800, fill: '#3b82f6', dy: -10 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {strategicInsight && (
        <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-8 animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600 rounded-lg text-white font-bold text-xs uppercase tracking-widest">Audit</div>
            <h4 className="font-bold text-slate-100">Executive Campus Review</h4>
          </div>
          <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
            {strategicInsight}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolAnalytics;
