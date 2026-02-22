
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area, Cell } from 'recharts';
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cxgmcxhciyiksoelwlir.supabase.co";
const SUPABASE_KEY = "sb_publishable_RuufX8hLsBAfReUjGF-SEQ_p6Rq6MA-";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface AggregatedTargetData {
  year: string;
  admission: number;
  target: number;
  achievement: number;
}

interface CampusPerformance {
  name: string;
  admission: number;
  target: number;
  achievement: number;
}

const TargetAnalysis: React.FC = () => {
  const [activeYear, setActiveYear] = useState('2024-2025');
  const [networkTrends, setNetworkTrends] = useState<AggregatedTargetData[]>([]);
  const [campusPerformance, setCampusPerformance] = useState<CampusPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const years = ['2023-2024', '2024-2025', '2025-2026', '2026-2027', 'Overall'];

  useEffect(() => {
    fetchTargetMetrics();
  }, [activeYear]);

  const fetchTargetMetrics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admissions_persistence')
        .select('*')
        .eq('class_name', 'TOTAL');

      if (error) throw error;

      if (data) {
        // Aggregate Global Trends
        const yearGroups: Record<string, { adm: number, tgt: number }> = {};
        data.forEach(row => {
          const yr = row.session_year.includes('20') ? row.session_year : `20${row.session_year.split('-')[0]}-20${row.session_year.split('-')[1]}`;
          if (!yearGroups[yr]) yearGroups[yr] = { adm: 0, tgt: 0 };
          yearGroups[yr].adm += (row.admission || 0);
          yearGroups[yr].tgt += (row.target || 0);
        });

        const formattedTrends = Object.keys(yearGroups).map(yr => ({
          year: yr,
          admission: yearGroups[yr].adm,
          target: yearGroups[yr].tgt,
          achievement: yearGroups[yr].tgt > 0 ? (yearGroups[yr].adm / yearGroups[yr].tgt) * 100 : 0
        })).sort((a, b) => a.year.localeCompare(b.year));
        setNetworkTrends(formattedTrends);

        // Campus-Specific Performance for active year
        if (activeYear !== 'Overall') {
          const shortYear = activeYear.replace(/-20(\d\d)$/, '-$1');
          const yearFiltered = data.filter(d => d.session_year === activeYear || d.session_year === shortYear);
          
          const formattedCampuses = yearFiltered.map(d => ({
            name: d.campus_name,
            admission: d.admission || 0,
            target: d.target || 0,
            achievement: d.target > 0 ? (d.admission / d.target) * 100 : 0
          })).sort((a, b) => b.achievement - a.achievement);
          setCampusPerformance(formattedCampuses);
        }
      }
    } catch (err) {
      console.error("Target Analysis Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getAchievementColor = (achievement: number) => {
    if (achievement >= 100) return '#10b981'; // Success
    if (achievement >= 75) return '#3b82f6';  // On track
    if (achievement >= 40) return '#fbbf24';  // Caution
    return '#f43f5e'; // Underperforming
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Strategic Target Audit</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Network-wide Enrollment Goal Compliance</p>
        </div>
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
      </div>

      {/* Network Overview Summary */}
      {activeYear !== 'Overall' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <MetricSummaryCard 
              label="Total Admissions" 
              value={campusPerformance.reduce((a, b) => a + b.admission, 0).toLocaleString()} 
              subLabel="Network Current"
          />
          <MetricSummaryCard 
              label="Global Target" 
              value={campusPerformance.reduce((a, b) => a + b.target, 0).toLocaleString()} 
              subLabel="Session Threshold"
          />
          <MetricSummaryCard 
              label="Deficit / Surplus" 
              value={(campusPerformance.reduce((a, b) => a + b.admission, 0) - campusPerformance.reduce((a, b) => a + b.target, 0)).toLocaleString()} 
              subLabel="Operational Gap"
              variant="highlight"
          />
          <MetricSummaryCard 
              label="Achievement" 
              value={`${(campusPerformance.reduce((a, b) => a + b.target, 0) > 0 ? (campusPerformance.reduce((a, b) => a + b.admission, 0) / campusPerformance.reduce((a, b) => a + b.target, 0)) * 100 : 0).toFixed(1)}%`} 
              subLabel="Strategic Velocity"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Analysis */}
        {activeYear === 'Overall' && (
          <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm">
            <div className="mb-10">
              <h3 className="text-xl font-black text-slate-900">Historical Target Trends</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Enrollment vs Projected Capacity</p>
            </div>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={networkTrends} margin={{ right: 50, top: 20, left: 10 }}>
                  <defs>
                    <linearGradient id="colorAdm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} fontSize={10} fontWeight={800} stroke="#94a3b8" dy={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={700} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 800 }}
                  />
                  <Area type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Projected Target" label={{ position: 'top', fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} />
                  <Area type="monotone" dataKey="admission" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAdm)" name="Actual Admissions" label={{ position: 'top', fontSize: 9, fontWeight: 800, fill: '#10b981' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Efficiency Chart - Transposed for multi-campus clarity */}
        {activeYear !== 'Overall' && (
          <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm">
            <div className="mb-10">
              <h3 className="text-xl font-black text-slate-900">Campus Benchmark Distribution</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Goal Achievement Ranking {activeYear}</p>
            </div>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={campusPerformance} margin={{ left: 140, right: 40 }}>
                  <CartesianGrid horizontal={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis type="number" axisLine={false} tickLine={false} fontSize={10} fontWeight={800} stroke="#94a3b8" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={10} 
                    fontWeight={800} 
                    stroke="#64748b" 
                    width={140}
                    tickFormatter={(value) => value.replace('Darshan Academy ', '')}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Achievement']}
                  />
                  <Bar dataKey="achievement" radius={[0, 4, 4, 0]} barSize={12} name="Achievement %" label={{ position: 'right', fontSize: 9, fontWeight: 800, fill: '#64748b', formatter: (val: number) => `${val.toFixed(1)}%` }}>
                    {campusPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getAchievementColor(entry.achievement)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Grid Table */}
      {activeYear !== 'Overall' && (
        <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-12 py-8 border-b border-slate-100 flex items-center justify-between">
            <div>
                <h3 className="text-lg font-black text-slate-900">Global Seat Utilization Audit</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Campus-Level Capacity Diagnostic</p>
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-12 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">INSTITUTION NODE</th>
                  <th className="px-12 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">TARGET LOAD</th>
                  <th className="px-12 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">ACTUAL YIELD</th>
                  <th className="px-12 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">STRATEGIC INDEX</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {campusPerformance.map((campus, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-12 py-5 font-bold text-sm text-slate-900">{campus.name.replace('Darshan Academy ', '')}</td>
                      <td className="px-12 py-5 text-sm font-semibold text-slate-400">{campus.target}</td>
                      <td className="px-12 py-5 text-sm font-black text-slate-700">{campus.admission}</td>
                      <td className="px-12 py-5">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-32">
                              <div 
                                  className="h-full rounded-full transition-all duration-1000" 
                                  style={{ width: `${Math.min(campus.achievement, 100)}%`, backgroundColor: getAchievementColor(campus.achievement) }}
                              />
                            </div>
                            <span className="text-[11px] font-black tabular-nums" style={{ color: getAchievementColor(campus.achievement) }}>
                              {campus.achievement.toFixed(1)}%
                            </span>
                        </div>
                      </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-slate-50/50 backdrop-blur-sm z-[100] flex items-center justify-center">
           <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-6" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auditing Global Targets...</p>
           </div>
        </div>
      )}
    </div>
  );
};

const MetricSummaryCard: React.FC<{ label: string, value: string, subLabel: string, variant?: 'default' | 'highlight' }> = ({ label, value, subLabel, variant = 'default' }) => (
   <div className={`bg-white rounded-3xl border border-slate-200 p-8 shadow-sm ${variant === 'highlight' ? 'bg-slate-900 border-slate-800' : ''}`}>
      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-4 ${variant === 'highlight' ? 'text-slate-400' : 'text-slate-400'}`}>{label}</p>
      <h4 className={`text-2xl font-black tracking-tighter ${variant === 'highlight' ? 'text-white' : 'text-slate-900'}`}>{value}</h4>
      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${variant === 'highlight' ? 'text-blue-400' : 'text-slate-400'}`}>{subLabel}</p>
   </div>
);

export default TargetAnalysis;
