
import React, { useState } from 'react';

interface CampusData {
  name: string;
  region: string;
  admissionPercent: number;
  seats: string;
  performance: 'PENDING' | 'ACTIVE' | 'EXCEEDING' | 'UNDERPERFORMING';
}

const campusList: CampusData[] = [
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

  const filteredCampuses = campusList.filter(campus => 
    campus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campus.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Darshan Academy Directory</h2>
          <p className="text-sm font-bold text-slate-400 mt-1">Institutional index across 22 campus nodes.</p>
        </div>
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search campus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-12 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          />
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">DARSHAN ACADEMY</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">REGION</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ADMISSION (%)</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SEATS (F/T)</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">PERFORMANCE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCampuses.map((campus, idx) => (
              <tr 
                key={idx} 
                onClick={() => onSelectCampus(campus.name)}
                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
              >
                <td className="px-10 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{campus.name}</span>
                  </div>
                </td>
                <td className="px-10 py-5">
                  <span className="text-xs font-bold text-slate-500">{campus.region}</span>
                </td>
                <td className="px-10 py-5">
                  <div className="flex items-center gap-4 w-48">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-slate-300" 
                        style={{ width: `${campus.admissionPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-black text-slate-400">{campus.admissionPercent}%</span>
                  </div>
                </td>
                <td className="px-10 py-5 text-xs font-bold text-slate-700">
                  {campus.seats}
                </td>
                <td className="px-10 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {campus.performance}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampusNetwork;
