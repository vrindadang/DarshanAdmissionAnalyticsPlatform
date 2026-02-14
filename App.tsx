
import React, { useState, useEffect } from 'react';
import { AdmissionFile } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import Login from './components/Login.tsx';
import AIAgent from './components/AIAgent.tsx';
import CampusNetwork from './components/CampusNetwork.tsx';
import CampusDetail from './components/CampusDetail.tsx';

const CAMPUS_LIST = [
  'Darshan Academy 5th Mile',
  'Darshan Academy Ambala',
  'Darshan Academy Amritsar',
  'Darshan Academy Basti Nau',
  'Darshan Academy Bhubaneshwar',
  'Darshan Academy Dasuya',
  'Darshan Academy Delhi',
  'Darshan Academy Devlali',
  'Darshan Academy Ferozepur',
  'Darshan Academy Guleria Bhat',
  'Darshan Academy Hisar',
  'Darshan Academy Jansath',
  'Darshan Academy Kaithal',
  'Darshan Academy Kala Singha',
  'Darshan Academy Kalka',
  'Darshan Academy Lucknow',
  'Darshan Academy Ludhiana',
  'Darshan Academy Meerut',
  'Darshan Academy Modasa',
  'Darshan Academy Pune',
  'Darshan Academy Rathonda',
  'Darshan Academy Sundargarh',
];

const App: React.FC = () => {
  // Initialize state from localStorage if available
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('daap_logged_in') === 'true';
  });
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null); // null = Holistic
  const [activeTab, setActiveTab] = useState<string>('summary'); // 'summary', 'directory' for Holistic; 'admissions', etc for Campus
  const [files] = useState<AdmissionFile[]>([]);

  const handleLogin = () => {
    localStorage.setItem('daap_logged_in', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('daap_logged_in');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const handleCampusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'holistic') {
      setSelectedCampus(null);
      setActiveTab('summary');
    } else {
      setSelectedCampus(val);
      setActiveTab('admissions');
    }
  };

  const renderContent = () => {
    if (selectedCampus) {
      return (
        <CampusDetail 
          campusName={selectedCampus} 
          activeTab={activeTab} 
          onBack={() => { setSelectedCampus(null); setActiveTab('summary'); }} 
        />
      );
    }

    if (activeTab === 'summary') {
      return <Dashboard files={files} />;
    }

    return <CampusNetwork onSelectCampus={(name) => { setSelectedCampus(name); setActiveTab('admissions'); }} />;
  };

  return (
    <div className="h-screen flex bg-[#f1f5f9] font-sans overflow-hidden">
      {/* PERSISTENT SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col pt-10 flex-shrink-0 z-40 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)]">
        <div className="px-8 mb-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#0066cc] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">D</div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-900">DAAP</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">Intelligence Core</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Academy</label>
            <div className="relative group">
              <select 
                value={selectedCampus || 'holistic'}
                onChange={handleCampusChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all hover:bg-slate-100"
              >
                <option value="holistic">Holistic (All Academies)</option>
                <optgroup label="Network Branches">
                  {CAMPUS_LIST.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 overflow-y-auto custom-scrollbar">
          {selectedCampus ? (
            <>
              <div className="px-4 py-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campus Mode</span>
                </div>
              </div>
              <SidebarItem active={activeTab === 'admissions'} onClick={() => setActiveTab('admissions')} icon={<FunnelIcon />} label="ADMISSIONS" sub="Funnel Intel" />
              <SidebarItem active={activeTab === 'initiatives'} onClick={() => setActiveTab('initiatives')} icon={<TargetIcon />} label="INITIATIVES" sub="Impact Strategy" />
              <SidebarItem active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<DollarIcon />} label="EXPENSES" sub="ROI Analytics" />
              <div className="pt-6 mt-6 border-t border-slate-100">
                <SidebarItem active={activeTab === 'import'} onClick={() => setActiveTab('import')} icon={<ImportIcon />} label="IMPORT DATA" sub="Session Ingest" />
              </div>
            </>
          ) : (
            <>
               <div className="px-4 py-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Mode</span>
                </div>
              </div>
              <SidebarItem active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} icon={<ChartIcon />} label="NETWORK SUMMARY" sub="Executive Overview" />
              <SidebarItem active={activeTab === 'directory'} onClick={() => setActiveTab('directory')} icon={<NetworkIcon />} label="CAMPUS NETWORK" sub="Directory View" />
            </>
          )}
        </nav>

        <div className="p-8 border-t border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-[#fde6d2] rounded-full flex items-center justify-center text-[#9a3412] text-xs font-bold border border-[#fbd38d]">DA</div>
            <div>
              <p className="text-[11px] font-black text-slate-900 leading-tight">Admin User</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Controller</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout Session
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-12 z-10 flex-shrink-0">
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
              {selectedCampus ? selectedCampus : 'CONSOLIDATED NETWORK VIEW'}
            </h2>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[9px] font-black text-[#fb923c] uppercase tracking-[0.2em] mb-1">Session Protocol</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Live Diagnostic Ready</span>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col bg-[#f8fafc]">
          <div className={`flex-1 flex flex-col overflow-y-auto custom-scrollbar ${!selectedCampus ? 'p-12 max-w-[1600px] mx-auto w-full' : ''}`}>
            {renderContent()}
          </div>
        </main>
      </div>

      <AIAgent files={files} />
    </div>
  );
};

const SidebarItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, sub: string }> = ({ active, onClick, icon, label, sub }) => (
  <button
    onClick={onClick}
    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 group ${
      active ? 'bg-[#0070f3] text-white shadow-xl shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-50'
    }`}
  >
    <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${active ? 'bg-white/10' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
      {icon}
    </div>
    <div className="text-left">
      <p className={`text-[10px] font-black tracking-widest leading-tight ${active ? 'text-white' : 'text-slate-900'}`}>{label}</p>
      <p className={`text-[8px] font-black uppercase tracking-tighter opacity-60 mt-0.5`}>{sub}</p>
    </div>
  </button>
);

// Icons
const ChartIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const NetworkIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const FunnelIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const TargetIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 12m-3 0a3 3 0 106 0 3 3 0 00-6 0" /></svg>;
const DollarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>;
const ImportIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;

export default App;
