
import React, { useState, useEffect } from 'react';
import { createClient } from "@supabase/supabase-js";

// Supabase Configuration
const SUPABASE_URL = "https://cxgmcxhciyiksoelwlir.supabase.co";
const SUPABASE_KEY = "sb_publishable_RuufX8hLsBAfReUjGF-SEQ_p6Rq6MA-";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface CampusData {
  name: string;
  region: string;
  admissionPercent: number;
  seats: string;
  performance: 'PENDING' | 'ACTIVE' | 'EXCEEDING' | 'UNDERPERFORMING';
}

const initialCampusList: CampusData[] = [
  { name: 'Darshan Academy 5th Mile', region: 'Region A', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Ambala', region: 'Region B', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Amritsar', region: 'Region C', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Basti Nau', region: 'Region D', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Bhubaneshwar', region: 'Region D', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Dasuya', region: 'Region A', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Delhi', region: 'Region E', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Devlali', region: 'Region B', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Ferozepur', region: 'Region C', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Guleria Bhat', region: 'Region D', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Hisar', region: 'Region E', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Jansath', region: 'Region E', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Kaithal', region: 'Region A', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Kala Singha', region: 'Region C', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Kalka', region: 'Region A', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Lucknow', region: 'Region D', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Ludhiana', region: 'Region B', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Meerut', region: 'Region E', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Modasa', region: 'Region A', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Pune', region: 'Region B', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Rathonda', region: 'Region B', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
  { name: 'Darshan Academy Sundargarh', region: 'Region C', admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' },
];

interface CampusNetworkProps {
  onSelectCampus: (name: string) => void;
}

const CampusNetwork: React.FC<CampusNetworkProps> = ({ onSelectCampus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeYear, setActiveYear] = useState('2024-2025');
  const [campuses, setCampuses] = useState<CampusData[]>(initialCampusList);
  const [isLoading, setIsLoading] = useState(true);
  
  const years = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];

  useEffect(() => {
    fetchNetworkMetrics();
  }, [activeYear]);

  const fetchNetworkMetrics = async () => {
    setIsLoading(true);
    try {
      const shortYear = activeYear.replace(/-20(\d\d)$/, '-$1');
      
      const { data, error } = await supabase
        .from('admissions_persistence')
        .select('*')
        .eq('class_name', 'TOTAL')
        .or(`session_year.eq.${activeYear},session_year.eq.${shortYear}`);

      if (error) throw error;

      if (data) {
        const updatedList: CampusData[] = initialCampusList.map((campus): CampusData => {
          const stats = data.find(d => d.campus_name === campus.name);
          if (stats) {
            const adm = Number(stats.admission || 0);
            const tgt = Number(stats.target || 0);
            const percent = tgt > 0 ? (adm / tgt) * 100 : 0;
            
            let perf: 'PENDING' | 'ACTIVE' | 'EXCEEDING' | 'UNDERPERFORMING' = 'PENDING';
            if (percent >= 80) perf = 'EXCEEDING';
            else if (percent >= 40) perf = 'ACTIVE';
            else if (percent > 0) perf = 'UNDERPERFORMING';

            return {
              ...campus,
              admissionPercent: parseFloat(percent.toFixed(1)),
              seats: `${adm} / ${tgt}`,
              performance: perf
            };
          }
          return { ...campus, admissionPercent: 0, seats: '0 / 0', performance: 'PENDING' };
        });
        setCampuses(updatedList);
      }
    } catch (err) {
      console.error("Network Metrics Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (perf: CampusData['performance'], percent: number) => {
    switch (perf) {
      case 'EXCEEDING':
        return { color: 'text-emerald-600', dot: 'bg-emerald-500', bar: 'bg-emerald-500', label: 'OPTIMAL' };
      case 'ACTIVE':
        return { color: 'text-amber-600', dot: 'bg-amber-500', bar: 'bg-amber-500', label: 'STABLE' };
      case 'UNDERPERFORMING':
        return { color: 'text-rose-600', dot: 'bg-rose-500', bar: 'bg-rose-500', label: 'CRITICAL' };
      default:
        return { color: 'text-slate-400', dot: 'bg-slate-300', bar: 'bg-slate-200', label: 'PENDING' };
    }
  };

  const filteredCampuses = campuses.filter(campus => 
    campus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campus.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Session Selection Pilled Toggle */}
      <div className="bg-white p-1 rounded-2xl flex flex-wrap items-center gap-1 border border-slate-200 w-fit">
        {years.map(year => (
          <button 
            key={year} 
            onClick={() => setActiveYear(year)} 
            className={`px-3 lg:px-5 py-2 lg:py-2.5 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${
              activeYear === year ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Header with Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Darshan Academy Directory</h2>
          <p className="text-xs lg:text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest"> Institutional Index &bull; {activeYear}</p>
        </div>
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search network nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-12 py-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
          />
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-3xl lg:rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 lg:px-10 py-5 lg:py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">DARSHAN ACADEMY</th>
                <th className="px-6 lg:px-10 py-5 lg:py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">REGION</th>
                <th className="px-6 lg:px-10 py-5 lg:py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ADMISSION (%)</th>
                <th className="px-6 lg:px-10 py-5 lg:py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SEATS (F/T)</th>
                <th className="px-6 lg:px-10 py-5 lg:py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">PERFORMANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCampuses.map((campus, idx) => {
                const status = getStatusConfig(campus.performance, campus.admissionPercent);
                return (
                  <tr 
                    key={idx} 
                    onClick={() => onSelectCampus(campus.name)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 lg:px-10 py-4 lg:py-5">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-all">
                          <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <span className="text-sm font-bold text-slate-900 truncate">{campus.name}</span>
                      </div>
                    </td>
                    <td className="px-6 lg:px-10 py-4 lg:py-5">
                      <span className="text-xs font-bold text-slate-500">{campus.region}</span>
                    </td>
                    <td className="px-6 lg:px-10 py-4 lg:py-5">
                      <div className="flex items-center gap-4 w-40 lg:w-48">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${status.bar}`} 
                            style={{ width: `${campus.admissionPercent}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-black tabular-nums ${status.color}`}>{campus.admissionPercent}%</span>
                      </div>
                    </td>
                    <td className="px-6 lg:px-10 py-4 lg:py-5 text-xs font-bold text-slate-700 whitespace-nowrap">
                      {campus.seats}
                    </td>
                    <td className="px-6 lg:px-10 py-4 lg:py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${status.dot} ${campus.performance !== 'PENDING' ? 'animate-pulse' : ''}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default CampusNetwork;
