
import React, { useState, useEffect } from 'react';
import { AdmissionFile } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { createClient } from "@supabase/supabase-js";

// Supabase Configuration
const SUPABASE_URL = "https://cxgmcxhciyiksoelwlir.supabase.co";
const SUPABASE_KEY = "sb_publishable_RuufX8hLsBAfReUjGF-SEQ_p6Rq6MA-";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface AggregatedMetrics {
  enquiries: number;
  registration: number;
  admission: number;
  target: number;
}

const Dashboard: React.FC<{ files: AdmissionFile[] }> = ({ files }) => {
  const [activeYear, setActiveYear] = useState('2024-2025');
  const [metrics, setMetrics] = useState<AggregatedMetrics>({
    enquiries: 0,
    registration: 0,
    admission: 0,
    target: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const years = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];

  useEffect(() => {
    fetchAndAggregateData();
  }, [activeYear]);

  const fetchAndAggregateData = async () => {
    setIsLoading(true);
    try {
      const shortYear = activeYear.replace(/-20(\d\d)$/, '-$1');
      
      // Fetch 'TOTAL' rows for all campuses for the selected year
      const { data, error } = await supabase
        .from('admissions_persistence')
        .select('*')
        .eq('class_name', 'TOTAL')
        .or(`session_year.eq.${activeYear},session_year.eq.${shortYear}`);

      if (error) throw error;

      if (data) {
        const totals = data.reduce((acc, row) => ({
          enquiries: acc.enquiries + (row.enquiries || 0),
          registration: acc.registration + (row.registration || 0),
          admission: acc.admission + (row.admission || 0),
          target: acc.target + (row.target || 0),
        }), { enquiries: 0, registration: 0, admission: 0, target: 0 });
        
        setMetrics(totals);
      }
    } catch (err) {
      console.error("Aggregation Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const funnelData = [
    { name: 'Total Enquiries', value: metrics.enquiries, fill: '#0070f3' },
    { name: 'Registrations', value: metrics.registration, fill: '#8b5cf6' },
    { name: 'Admissions', value: metrics.admission, fill: '#10b981' },
  ];

  const enquiryToRegRate = metrics.enquiries > 0 
    ? ((metrics.registration / metrics.enquiries) * 100).toFixed(1) 
    : "0.0";
    
  const regToAdmRate = metrics.registration > 0 
    ? ((metrics.admission / metrics.registration) * 100).toFixed(1) 
    : "0.0";

  const overallAchievement = metrics.target > 0 
    ? ((metrics.admission / metrics.target) * 100).toFixed(1) 
    : "0.0";

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Year Selector */}
      <div className="bg-white p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200 w-fit">
        {years.map(year => (
          <button 
            key={year} 
            onClick={() => setActiveYear(year)} 
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeYear === year ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Network Summary Banner */}
      <div className="bg-gradient-to-r from-[#fff7ed] to-white border border-[#fbd38d]/30 rounded-[2.5rem] p-10 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-[#fb923c] rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-500/20">
            22
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Darshan Academy Consolidated Network</h2>
            <p className="text-sm font-medium text-slate-500 mt-1 italic">
              "Be Good, Do Good, Be One" — Multi-Campus Strategic Intelligence
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-[#fb923c] uppercase tracking-[0.2em] mb-1">Sync Status</p>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-sm font-black text-slate-900">
              {isLoading ? 'Synchronizing Network...' : metrics.enquiries > 0 ? 'Consolidated Intelligence Active' : 'Waiting for Data Ingest'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Aggregated Enquiries" 
          value={metrics.enquiries.toLocaleString()} 
          change={0} 
          trend="neutral" 
          description={`${activeYear} Global Pool`} 
        />
        <MetricCard 
          label="Enquiry to Reg Rate" 
          value={`${enquiryToRegRate}%`} 
          change={0} 
          trend="neutral" 
          description="Global Conversion Velocity" 
        />
        <MetricCard 
          label="Overall Achievement" 
          value={`${overallAchievement}%`} 
          change={0} 
          trend="neutral" 
          description="vs Network Target" 
        />
        <MetricCard 
          label="Total Admissions" 
          value={metrics.admission.toLocaleString()} 
          change={0} 
          trend="neutral" 
          description="Consolidated Enrollment" 
        />
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h3 className="text-xl font-black text-slate-900">Global Conversion Funnel</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">
                {metrics.enquiries > 0 ? 'Real-time consolidated funnel dynamics' : 'Awaiting data ingestion for analysis'}
              </p>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funnelData} margin={{ left: 120, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight={800} 
                  tickLine={false} 
                  axisLine={false} 
                  width={120}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40} label={{ position: 'right', fontSize: 10, fontWeight: 800, fill: '#64748b' }}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm flex flex-col items-center justify-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${metrics.enquiries > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-300'}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-1">Registration Yield</h3>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">{regToAdmRate}%</p>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-relaxed">
            {metrics.registration > 0 ? `Out of ${metrics.registration} registrations, ${metrics.admission} students were successfully enrolled.` : 'No data available'}
          </p>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string, change: number, trend: 'up' | 'down' | 'neutral', description: string }> = ({ label, value, change, trend, description }) => (
  <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4">
      <div className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
        trend === 'up' ? 'bg-emerald-50 text-emerald-600' : trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
      }`}>
        {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '•'} {change}%
      </div>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">{label}</p>
    <h4 className="text-3xl font-black text-slate-900 tracking-tighter mb-1 group-hover:text-blue-600 transition-colors">{value}</h4>
    <p className="text-[10px] font-bold text-slate-400 mt-2">{description}</p>
  </div>
);

export default Dashboard;
