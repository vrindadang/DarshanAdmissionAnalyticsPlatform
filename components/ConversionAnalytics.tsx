
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cxgmcxhciyiksoelwlir.supabase.co";
const SUPABASE_KEY = "sb_publishable_RuufX8hLsBAfReUjGF-SEQ_p6Rq6MA-";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface AggregatedData {
  year: string;
  enquiries: number;
  registration: number;
  conversionRate: number;
}

interface CampusConversion {
  name: string;
  enquiries: number;
  registration: number;
  conversionRate: number;
}

const ConversionAnalytics: React.FC = () => {
  const [activeYear, setActiveYear] = useState('Overall');
  const [trendData, setTrendData] = useState<AggregatedData[]>([]);
  const [campusData, setCampusData] = useState<CampusConversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const years = ['2023-2024', '2024-2025', '2025-2026', '2026-2027', 'Overall'];

  useEffect(() => {
    fetchHolisticConversionData();
  }, [activeYear]);

  const fetchHolisticConversionData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admissions_persistence')
        .select('*')
        .eq('class_name', 'TOTAL');

      if (error) throw error;

      if (data) {
        // Process Trend Data (All years)
        const yearGroups: Record<string, { enq: number, reg: number }> = {};
        data.forEach(row => {
          const yr = row.session_year.includes('20') ? row.session_year : `20${row.session_year.split('-')[0]}-20${row.session_year.split('-')[1]}`;
          if (!yearGroups[yr]) yearGroups[yr] = { enq: 0, reg: 0 };
          yearGroups[yr].enq += (row.enquiries || 0);
          yearGroups[yr].reg += (row.registration || 0);
        });

        const formattedTrend = Object.keys(yearGroups).map(yr => ({
          year: yr,
          enquiries: yearGroups[yr].enq,
          registration: yearGroups[yr].reg,
          conversionRate: yearGroups[yr].enq > 0 ? (yearGroups[yr].reg / yearGroups[yr].enq) * 100 : 0
        })).sort((a, b) => a.year.localeCompare(b.year));
        setTrendData(formattedTrend);

        // Process Campus Data (Selected year)
        if (activeYear !== 'Overall') {
          const shortYear = activeYear.replace(/-20(\d\d)$/, '-$1');
          const yearFiltered = data.filter(d => d.session_year === activeYear || d.session_year === shortYear);
          
          const formattedCampus = yearFiltered.map(d => ({
            name: d.campus_name,
            enquiries: d.enquiries || 0,
            registration: d.registration || 0,
            conversionRate: d.enquiries > 0 ? (d.registration / d.enquiries) * 100 : 0
          })).sort((a, b) => b.conversionRate - a.conversionRate);
          setCampusData(formattedCampus);
        }
      }
    } catch (err) {
      console.error("Conversion Analytics Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalEnquiries = trendData.reduce((sum, d) => sum + d.enquiries, 0);
  const totalRegistrations = trendData.reduce((sum, d) => sum + d.registration, 0);
  const totalYield = totalEnquiries > 0 ? (totalRegistrations / totalEnquiries) * 100 : 0;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Conversion Intelligence</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Network-wide Enquiry to Registration Diagnostics</p>
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

      {/* Network Overview Trends */}
      {activeYear === 'Overall' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-xl font-black text-slate-900">Aggregate Conversion Trend</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Multi-Session Longitudinal Performance</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enquiries</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registrations</span>
                </div>
              </div>
            </div>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorEnq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="enquiries" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEnq)" />
                  <Area type="monotone" dataKey="registration" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-8 border border-blue-100 shadow-inner">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Network Yield Ratio</h3>
            <p className="text-4xl font-black text-blue-600 tracking-tighter mb-4">
              {totalYield.toFixed(1)}%
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
              Consolidated enquiry to registration <br/> velocity across all sessions.
            </p>
            <div className="mt-8 pt-8 border-t border-slate-100 w-full flex justify-between px-4">
              <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enquiries</p>
                  <p className="text-lg font-black text-slate-900">{totalEnquiries.toLocaleString()}</p>
              </div>
              <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registrations</p>
                  <p className="text-lg font-black text-slate-900">{totalRegistrations.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campus Comparison Grid - Transposed to Horizontal for clarity */}
      {activeYear !== 'Overall' && (
        <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h3 className="text-xl font-black text-slate-900">Campus Funnel Ranking</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cross-Campus conversion efficiency {activeYear}</p>
            </div>
          </div>
          <div className="h-[700px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={campusData} margin={{ left: 140, right: 40 }}>
                <CartesianGrid horizontal={false} vertical={true} stroke="#f1f5f9" strokeDasharray="3 3" />
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
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Yield']}
                />
                <Bar dataKey="conversionRate" radius={[0, 6, 6, 0]} barSize={20} name="Yield %">
                  {campusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.conversionRate > 50 ? '#10b981' : entry.conversionRate > 25 ? '#3b82f6' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-slate-50/50 backdrop-blur-sm z-[100] flex items-center justify-center">
           <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-6" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generating Holistic Insights...</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default ConversionAnalytics;
