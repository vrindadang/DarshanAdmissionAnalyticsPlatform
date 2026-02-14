
import React, { useState, useEffect, useRef } from 'react';
import { AdmissionFile } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import Login from './components/Login.tsx';
import AIAgent from './components/AIAgent.tsx';
import CampusNetwork from './components/CampusNetwork.tsx';
import CampusDetail from './components/CampusDetail.tsx';
import ConversionAnalytics from './components/ConversionAnalytics.tsx';
import TargetAnalysis from './components/TargetAnalysis.tsx';

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
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('daap_logged_in') === 'true';
  });
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [files] = useState<AdmissionFile[]>([]);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('daap_logged_in', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('daap_logged_in');
    setIsLoggedIn(false);
  };

  const selectCampus = (campus: string | null) => {
    if (campus === null || campus === 'holistic') {
      setSelectedCampus(null);
      setActiveTab('summary');
    } else {
      setSelectedCampus(campus);
      setActiveTab('admissions');
    }
    setIsPickerOpen(false);
    setPickerSearch('');
    setIsMobileMenuOpen(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const filteredCampuses = CAMPUS_LIST.filter(c => 
    c.toLowerCase().includes(pickerSearch.toLowerCase())
  );

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

    if (activeTab === 'conversion') {
      return <ConversionAnalytics />;
    }

    if (activeTab === 'target') {
      return <TargetAnalysis />;
    }

    return <CampusNetwork onSelectCampus={(name) => { setSelectedCampus(name); setActiveTab('admissions'); }} />;
  };

  const NavItems = () => (
    <>
      {selectedCampus ? (
        <>
          <div className="px-4 py-2 mb-2 hidden lg:block">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {!isSidebarCollapsed && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campus Mode</span>}
            </div>
          </div>
          <SidebarItem collapsed={isSidebarCollapsed} active={activeTab === 'admissions'} onClick={() => { setActiveTab('admissions'); setIsMobileMenuOpen(false); }} icon={<FunnelIcon />} label="ADMISSIONS" sub="Funnel Intel" />
          <SidebarItem collapsed={isSidebarCollapsed} active={activeTab === 'initiatives'} onClick={() => { setActiveTab('initiatives'); setIsMobileMenuOpen(false); }} icon={<TargetIcon />} label="INITIATIVES" sub="Impact Strategy" />
          <SidebarItem collapsed={isSidebarCollapsed} active={activeTab === 'expenses'} onClick={() => { setActiveTab('expenses'); setIsMobileMenuOpen(false); }} icon={<DollarIcon />} label="EXPENSES" sub="ROI Analytics" />
          <div className="lg:pt-6 lg:mt-6 lg:border-t border-slate-100">
            <SidebarItem collapsed={isSidebarCollapsed} active={activeTab === 'import'} onClick={() => { setActiveTab('import'); setIsMobileMenuOpen(false); }} icon={<ImportIcon />} label="IMPORT DATA" sub="Session Ingest" />
          </div>
        </>
      ) : (
        <>
           <div className="px-4 py-2 mb-2 hidden lg:block">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              {!isSidebarCollapsed && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Mode</span>}
            </div>
          </div>
          <SidebarItem collapsed={isSidebarCollapsed} active={activeTab === 'summary'} onClick={() => { setActiveTab('summary'); setIsMobileMenuOpen(false); }} icon={<ChartIcon />} label="NETWORK SUMMARY" sub="Executive Overview" />
          <SidebarItem collapsed={isSidebarCollapsed} active={activeTab === 'conversion'} onClick={() => { setActiveTab('conversion'); setIsMobileMenuOpen(false); }} icon={<FunnelIcon />} label="CONVERSION ANALYSIS" sub="Enquiry vs Reg Intel" />
          <SidebarItem collapsed={isSidebarCollapsed} active={activeTab === 'target'} onClick={() => { setActiveTab('target'); setIsMobileMenuOpen(false); }} icon={<TargetIcon />} label="TARGET ANALYSIS" sub="Admissions vs Goals" />
          <SidebarItem collapsed={isSidebarCollapsed} active={activeTab === 'directory'} onClick={() => { setActiveTab('directory'); setIsMobileMenuOpen(false); }} icon={<NetworkIcon />} label="CAMPUS NETWORK" sub="Directory View" />
        </>
      )}
    </>
  );

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-[#f1f5f9] font-sans overflow-hidden">
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0066cc] rounded-xl flex items-center justify-center text-white font-black text-xl">D</div>
          <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">DAAP</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-slate-100 rounded-xl text-slate-600"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-white z-[45] flex flex-col p-6 animate-in slide-in-from-top duration-300">
          <div className="mb-6" ref={pickerRef}>
            <button 
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-bold text-slate-900"
            >
              <span className="truncate">{selectedCampus || 'Holistic Network'}</span>
              <svg className={`w-3.5 h-3.5 text-slate-400 ${isPickerOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isPickerOpen && (
              <div className="absolute left-6 right-6 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[60] max-h-[300px] overflow-y-auto p-2">
                <button onClick={() => selectCampus(null)} className="w-full text-left px-4 py-3 rounded-xl text-xs font-black">Holistic (All Academies)</button>
                {CAMPUS_LIST.map(c => (
                  <button key={c} onClick={() => selectCampus(c)} className="w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold">{c}</button>
                ))}
              </div>
            )}
          </div>
          <nav className="flex-1 space-y-2 overflow-y-auto">
            <NavItems />
          </nav>
          <div className="mt-6 pt-6 border-t border-slate-100">
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 font-black text-xs">Logout</button>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden lg:flex flex-col bg-white border-r border-slate-200 pt-10 flex-shrink-0 z-40 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 ${isSidebarCollapsed ? 'w-24' : 'w-72'}`}>
        <div className="px-6 mb-10 flex flex-col items-center">
          <div className={`flex items-center gap-3 mb-8 w-full ${isSidebarCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className="w-10 h-10 bg-[#0066cc] rounded-xl flex-shrink-0 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">D</div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">DAAP</h1>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Intelligence Core</p>
              </div>
            )}
          </div>

          <div className="w-full relative" ref={pickerRef}>
            {!isSidebarCollapsed && <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Strategic Selection</label>}
            <button 
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className={`w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-bold text-slate-900 transition-all hover:bg-slate-100 group ${isSidebarCollapsed ? 'justify-center px-0 h-14' : ''}`}
            >
              {isSidebarCollapsed ? (
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              ) : (
                <>
                  <span className="truncate max-w-[160px]">{selectedCampus || 'Holistic Network'}</span>
                  <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isPickerOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                </>
              )}
            </button>

            {isPickerOpen && (
              <div className={`absolute left-0 right-0 mt-3 bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300 ${isSidebarCollapsed ? 'w-64 left-24 -top-20' : 'top-full'}`}>
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                  <input type="text" autoFocus placeholder="Search Academy..." value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-10 py-2.5 text-xs font-bold text-slate-900 outline-none" />
                </div>
                <div className="max-h-[360px] overflow-y-auto p-2 custom-scrollbar">
                  <button onClick={() => selectCampus(null)} className="w-full text-left px-4 py-3 rounded-xl text-xs font-black hover:bg-slate-50 transition-colors">Holistic (All Academies)</button>
                  {filteredCampuses.map(c => (
                    <button key={c} onClick={() => selectCampus(c)} className="w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all">{c}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 overflow-y-auto custom-scrollbar">
          <NavItems />
        </nav>

        <div className="p-4 border-t border-slate-100 flex flex-col gap-4">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center py-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className={`w-5 h-5 transition-transform duration-500 ${isSidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          </button>
          
          <div className={`flex items-center gap-4 ${isSidebarCollapsed ? 'justify-center' : 'px-4'}`}>
            <div className="w-10 h-10 bg-[#fde6d2] flex-shrink-0 rounded-full flex items-center justify-center text-[#9a3412] text-xs font-bold border border-[#fbd38d]">DA</div>
            {!isSidebarCollapsed && (
              <div>
                <p className="text-[11px] font-black text-slate-900 leading-tight">Admin User</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Controller</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {!isSidebarCollapsed && "Logout Session"}
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="hidden lg:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-12 z-10 flex-shrink-0">
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

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
          <div className={`p-6 lg:p-12 w-full mx-auto ${!selectedCampus ? 'max-w-[1600px]' : ''}`}>
            {renderContent()}
          </div>
        </main>
      </div>

      <AIAgent files={files} />
    </div>
  );
};

const SidebarItem: React.FC<{ collapsed?: boolean, active: boolean, onClick: () => void, icon: React.ReactNode, label: string, sub: string }> = ({ collapsed, active, onClick, icon, label, sub }) => (
  <button
    onClick={onClick}
    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 group ${
      active ? 'bg-[#0070f3] text-white shadow-xl shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-50'
    } ${collapsed ? 'justify-center px-0' : ''}`}
    title={collapsed ? label : undefined}
  >
    <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-colors ${active ? 'bg-white/10' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
      {icon}
    </div>
    {!collapsed && (
      <div className="text-left overflow-hidden">
        <p className={`text-[10px] font-black tracking-widest leading-tight truncate ${active ? 'text-white' : 'text-slate-900'}`}>{label}</p>
        <p className={`text-[8px] font-black uppercase tracking-tighter opacity-60 mt-0.5 truncate`}>{sub}</p>
      </div>
    )}
  </button>
);

const ChartIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const NetworkIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const FunnelIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const TargetIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 12m-3 0a3 3 0 106 0 3 3 0 00-6 0" /></svg>;
const DollarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>;
const ImportIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;

export default App;
