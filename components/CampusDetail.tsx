
import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

// Supabase Configuration
const SUPABASE_URL = "https://cxgmcxhciyiksoelwlir.supabase.co";
const SUPABASE_KEY = "sb_publishable_RuufX8hLsBAfReUjGF-SEQ_p6Rq6MA-";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface SessionData {
  year: string;
  enquiries: number;
  registration: number;
  admission: number;
  target: number;
  achievement: number;
}

interface ClassData {
  className: string;
  sessions: SessionData[];
}

interface DetailedAdmissionData {
  classes: ClassData[];
  totals: SessionData[];
}

interface CampusDetailProps {
  campusName: string;
  activeTab: string;
  onBack: () => void;
}

const SESSION_COLORS = ['#3b82f6', '#f97316', '#94a3b8', '#eab308'];

const CampusDetail: React.FC<CampusDetailProps> = ({ campusName, activeTab, onBack }) => {
  const [activeYear, setActiveYear] = useState('2024-2025');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [importCategory, setImportCategory] = useState<'admissions' | 'initiatives' | 'expenses'>('admissions');
  const [detailedAdmissions, setDetailedAdmissions] = useState<DetailedAdmissionData | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual');
  const [isLoadingPersistence, setIsLoadingPersistence] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const years = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];

  // Load data from Supabase on campus selection
  useEffect(() => {
    fetchFromSupabase();
  }, [campusName]);

  const fetchFromSupabase = async () => {
    setIsLoadingPersistence(true);
    try {
      const { data, error } = await supabase
        .from('admissions_persistence')
        .select('*')
        .eq('campus_name', campusName);

      if (error) throw error;

      if (data && data.length > 0) {
        // Group data back into DetailedAdmissionData structure
        const groupedClasses: Record<string, SessionData[]> = {};
        const totals: SessionData[] = [];

        data.forEach((row: any) => {
          const session: SessionData = {
            year: row.session_year,
            enquiries: row.enquiries,
            registration: row.registration,
            admission: row.admission,
            target: row.target,
            achievement: Number(row.achievement)
          };

          if (row.class_name === 'TOTAL') {
            totals.push(session);
          } else {
            if (!groupedClasses[row.class_name]) groupedClasses[row.class_name] = [];
            groupedClasses[row.class_name].push(session);
          }
        });

        const formattedClasses = Object.keys(groupedClasses).map(name => ({
          className: name,
          sessions: groupedClasses[name].sort((a, b) => a.year.localeCompare(b.year))
        }));

        setDetailedAdmissions({
          classes: formattedClasses,
          totals: totals.sort((a, b) => a.year.localeCompare(b.year))
        });
      } else {
        setDetailedAdmissions(null);
      }
    } catch (err) {
      console.error("Supabase Fetch Error:", err);
    } finally {
      setIsLoadingPersistence(false);
    }
  };

  const saveToSupabase = async (newData: DetailedAdmissionData) => {
    try {
      const rowsToUpsert: any[] = [];

      // Flatten classes
      newData.classes.forEach(cls => {
        cls.sessions.forEach(s => {
          rowsToUpsert.push({
            campus_name: campusName,
            class_name: cls.className,
            session_year: s.year,
            enquiries: s.enquiries || 0,
            registration: s.registration || 0,
            admission: s.admission || 0,
            target: s.target || 0,
            achievement: s.achievement || 0
          });
        });
      });

      // Flatten totals
      newData.totals.forEach(s => {
        rowsToUpsert.push({
          campus_name: campusName,
          class_name: 'TOTAL',
          session_year: s.year,
          enquiries: s.enquiries || 0,
          registration: s.registration || 0,
          admission: s.admission || 0,
          target: s.target || 0,
          achievement: s.achievement || 0
        });
      });

      const { error } = await supabase
        .from('admissions_persistence')
        .upsert(rowsToUpsert, { onConflict: 'campus_name, class_name, session_year' });

      if (error) throw error;
      console.log("Persistence successful");
    } catch (err) {
      console.error("Supabase Save Error:", err);
      // alert("Extraction complete, but failed to save to database.");
    }
  };

  const handleCellEdit = async (
    classIdx: number,
    sessionIdx: number,
    field: keyof SessionData,
    value: string
  ) => {
    if (!detailedAdmissions) return;

    // Deep copy to prevent state mutation issues before setting
    const newData: DetailedAdmissionData = JSON.parse(JSON.stringify(detailedAdmissions));
    
    // Parse numeric value, stripping non-digit characters except decimal
    let numValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    
    // Update the specific session in classes
    const targetSession = newData.classes[classIdx].sessions[sessionIdx];
    (targetSession as any)[field] = numValue;

    // Auto-recalculate achievement for the modified row
    // We only recalculate if admission or target was changed
    if (field === 'admission' || field === 'target') {
      const adm = targetSession.admission;
      const tgt = targetSession.target;
      targetSession.achievement = tgt > 0 ? (adm / tgt) * 100 : 0;
    }

    // Recalculate global totals for all sessions to keep the funnel cards in sync
    const yearsToUpdate = Array.from(new Set(newData.classes.flatMap(c => c.sessions.map(s => s.year))));
    
    newData.totals = yearsToUpdate.map(yr => {
      let sumEnq = 0, sumReg = 0, sumAdm = 0, sumTgt = 0;
      newData.classes.forEach(c => {
        const s = c.sessions.find(sess => sess.year === yr);
        if (s) {
          sumEnq += Number(s.enquiries || 0);
          sumReg += Number(s.registration || 0);
          sumAdm += Number(s.admission || 0);
          sumTgt += Number(s.target || 0);
        }
      });
      return {
        year: yr,
        enquiries: sumEnq,
        registration: sumReg,
        admission: sumAdm,
        target: sumTgt,
        achievement: sumTgt > 0 ? (sumAdm / sumTgt) * 100 : 0
      };
    }).sort((a, b) => a.year.localeCompare(b.year));

    setDetailedAdmissions(newData);
    await saveToSupabase(newData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = (event.target?.result as string).split(',')[1];
      await performAIAnalysis(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const performAIAnalysis = async (base64Image: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `Extract table data from this Excel image for ${importCategory}. 
      Ensure you extract all rows including TOTAL rows.
      Return JSON strictly in this format:
      {
        "classes": [{ "className": "string", "sessions": [{ "year": "string", "enquiries": number, "registration": number, "admission": number, "target": number, "achievement": number }] }],
        "totals": [{ "year": "string", "enquiries": number, "registration": number, "admission": number, "target": number, "achievement": number }]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ inlineData: { data: base64Image, mimeType: 'image/png' } }, { text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      if (importCategory === 'admissions') {
        setDetailedAdmissions(result);
        await saveToSupabase(result);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze image. Please ensure it is a clear table of the expected format.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const transformClassDataForChart = (classData: ClassData) => {
    const metrics = ['ENQUIRIES', 'REGISTRATION', 'ADMISSION', 'TARGET', 'ACHIEVEMENT %'];
    return metrics.map(m => {
      const entry: any = { metric: m };
      classData.sessions.forEach(s => {
        let val = 0;
        if (m === 'ENQUIRIES') val = s.enquiries || 0;
        else if (m === 'REGISTRATION') val = s.registration || 0;
        else if (m === 'ADMISSION') val = s.admission || 0;
        else if (m === 'TARGET') val = s.target || 0;
        else if (m === 'ACHIEVEMENT %') val = s.achievement || 0;
        entry[s.year] = val;
      });
      return entry;
    });
  };

  const getMetricForYear = (metric: keyof SessionData): number => {
    if (!detailedAdmissions) return 0;
    const shortYear = activeYear.replace(/-20(\d\d)$/, '-$1');
    const totalRow = detailedAdmissions.totals.find(t => t.year === activeYear || t.year === shortYear);
    if (!totalRow) return 0;
    const val = totalRow[metric];
    return (val === null || val === undefined) ? 0 : Number(val);
  };

  return (
    <div className="p-12 max-w-[1400px] w-full mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
      <div className="bg-white p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200 w-fit">
        {years.map(year => (
          <button key={year} onClick={() => setActiveYear(year)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeYear === year ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-400 hover:text-slate-600'}`}>{year}</button>
        ))}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            {activeTab === 'initiatives' ? 'Admission Initiatives' : activeTab === 'expenses' ? 'Admission Expenses' : activeTab === 'import' ? 'Data Ingestion Center' : 'Admission Numbers'}
          </h2>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Persistence Active &bull; {activeYear}</p>
        </div>
        {activeTab !== 'import' && (
          <button className="bg-[#e11d48] hover:bg-red-700 text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_-5px_rgba(225,29,72,0.3)] transition-all active:scale-[0.98]">Run Session Diagnostic</button>
        )}
      </div>

      {activeTab === 'admissions' && (
        <div className="space-y-12">
          {isLoadingPersistence ? (
             <div className="py-24 text-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving stored records...</p>
             </div>
          ) : (
            <>
              <div className="bg-white rounded-[3rem] border border-slate-200 p-16 shadow-sm relative overflow-hidden">
                <div className="absolute top-12 left-12"><span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em]">Conversion Velocity: {activeYear}</span></div>
                <div className="absolute top-12 right-12 text-right">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Yield Ratio</span>
                  <p className="text-4xl font-black text-[#0070f3] tracking-tighter">
                    {`${getMetricForYear('achievement').toFixed(1)}%`}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                  <StageCard stage="STAGE 01" label="ENQUIRIES" value={getMetricForYear('enquiries').toString()} color="bg-[#0070f3]" shadow="shadow-[0_25px_50px_-12px_rgba(0,112,243,0.35)]" />
                  <StageCard stage="STAGE 02" label="REGISTRATIONS" value={getMetricForYear('registration').toString()} color="bg-[#8b5cf6]" shadow="shadow-[0_25px_50px_-12px_rgba(139,92,246,0.35)]" />
                  <StageCard stage="STAGE 03" label="ADMISSIONS" value={getMetricForYear('admission').toString()} color="bg-[#10b981]" shadow="shadow-[0_25px_50px_-12px_rgba(16,185,129,0.35)]" />
                  <StageCard stage="GOAL" label="SESSION TARGET" value={getMetricForYear('target').toString()} color="bg-[#fb923c]" shadow="shadow-[0_25px_50px_-12px_rgba(251,146,60,0.35)]" />
                </div>
              </div>

              {detailedAdmissions ? (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div><h3 className="text-xl font-black text-slate-900">Comparative Class Analysis</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Stored Historical Record (Editable)</p></div>
                    <div className="bg-white border border-slate-200 p-1 rounded-2xl flex gap-1">
                      <button onClick={() => setViewMode('visual')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'visual' ? 'bg-[#0070f3] text-white' : 'text-slate-400 hover:text-slate-600'}`}>Visual Chart</button>
                      <button onClick={() => setViewMode('table')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-[#0070f3] text-white' : 'text-slate-400 hover:text-slate-600'}`}>Data Table</button>
                    </div>
                  </div>
                  {viewMode === 'visual' ? (
                    <div className="grid grid-cols-1 gap-12">
                      {detailedAdmissions.classes.map((cls, idx) => (
                        <div key={idx} className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm">
                          <div className="flex items-center justify-between mb-12">
                            <h4 className="text-xl font-black text-slate-900">Class: {cls.className}</h4>
                            <div className="flex items-center gap-4">
                              {cls.sessions.map((s, sIdx) => (<div key={sIdx} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: SESSION_COLORS[sIdx % SESSION_COLORS.length] }} /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.year}</span></div>))}
                            </div>
                          </div>
                          <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={transformClassDataForChart(cls)}>
                                <CartesianGrid vertical={true} horizontal={false} stroke="#f1f5f9" /><XAxis dataKey="metric" axisLine={false} tickLine={false} fontSize={10} fontWeight={800} dy={15} stroke="#94a3b8" /><YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={700} stroke="#94a3b8" /><Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                                {cls.sessions.map((s, sIdx) => (<Bar key={s.year} dataKey={s.year} fill={SESSION_COLORS[sIdx % SESSION_COLORS.length]} radius={[4, 4, 0, 0]} barSize={20} label={{ position: 'top', fontSize: 9, fontWeight: 700, fill: '#64748b' }} />))}
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead><tr className="bg-slate-100/50"><th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r">Classes</th><th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r">Sessions</th><th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Enquiries</th><th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Reg</th><th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Adm</th><th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Target</th><th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Achv</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                          {detailedAdmissions.classes.map((cls, idx) => (
                            <React.Fragment key={idx}>
                              {cls.sessions.map((session, sIdx) => (
                                <tr key={`${idx}-${sIdx}`} className="hover:bg-slate-50/50 transition-colors">
                                  {sIdx === 0 && (<td className="px-8 py-4 font-black text-slate-900 text-sm border-r bg-white" rowSpan={cls.sessions.length}>{cls.className}</td>)}
                                  <td className="px-8 py-4 text-xs font-bold text-slate-500 border-r">{session.year}</td>
                                  <td className="px-4 py-3">
                                    <input 
                                      type="text" 
                                      className="w-full bg-transparent border-none p-2 text-sm font-semibold text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all"
                                      defaultValue={session.enquiries || 0}
                                      onBlur={(e) => handleCellEdit(idx, sIdx, 'enquiries', e.target.value)}
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <input 
                                      type="text" 
                                      className="w-full bg-transparent border-none p-2 text-sm font-semibold text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all"
                                      defaultValue={session.registration || 0}
                                      onBlur={(e) => handleCellEdit(idx, sIdx, 'registration', e.target.value)}
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <input 
                                      type="text" 
                                      className="w-full bg-transparent border-none p-2 text-sm font-semibold text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all"
                                      defaultValue={session.admission || 0}
                                      onBlur={(e) => handleCellEdit(idx, sIdx, 'admission', e.target.value)}
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <input 
                                      type="text" 
                                      className="w-full bg-transparent border-none p-2 text-sm font-semibold text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all"
                                      defaultValue={session.target || 0}
                                      onBlur={(e) => handleCellEdit(idx, sIdx, 'target', e.target.value)}
                                    />
                                  </td>
                                  <td className="px-8 py-4"><span className={`text-xs font-black ${(session.achievement || 0) >= 100 ? 'text-emerald-600' : 'text-slate-900'}`}>{(session.achievement || 0).toFixed(1)}%</span></td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-24 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
                  <p className="text-slate-400 font-bold uppercase tracking-widest">Awaiting Admission Data Ingest</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'initiatives' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight">Impact Monitor</h3>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No initiative data found. Import session data to visualize.</p>
            </div>
          </div>
          <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm sticky top-0">
            <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Mission 2026</h3>
            <blockquote className="border-l-[3px] border-blue-600 pl-6 mb-12 italic text-slate-500 font-medium leading-relaxed">"Strategic growth planning phase."</blockquote>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm flex-1 flex flex-col justify-center"><span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Gross Expenditure</span><h4 className="text-5xl font-black text-slate-900 tracking-tighter">₹0</h4></div>
            <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm flex-1 flex flex-col justify-center"><span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4">Revenue Attributed</span><h4 className="text-5xl font-black text-slate-900 tracking-tighter">₹0</h4></div>
          </div>
          <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm relative flex items-center justify-center">
             <p className="text-slate-400 font-bold uppercase tracking-widest">No ROI Data Ingested</p>
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="max-w-4xl mx-auto py-12 space-y-12">
          <div className="text-center"><h3 className="text-2xl font-black text-slate-900 tracking-tight">Visual Data Ingestion</h3><p className="text-sm font-medium text-slate-500 mt-2 italic">Upload Excel images to automatically extract academic data.</p></div>
          <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm space-y-8">
            <div className="flex items-center justify-center gap-4">{(['admissions', 'initiatives', 'expenses'] as const).map(cat => (<button key={cat} onClick={() => setImportCategory(cat)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${importCategory === cat ? 'bg-[#0070f3] text-white' : 'bg-slate-100 text-slate-400'}`}>{cat}</button>))}</div>
            <div onClick={() => fileInputRef.current?.click()} className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-16 flex flex-col items-center justify-center cursor-pointer hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              {isAnalyzing ? (<div className="flex flex-col items-center gap-6"><div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" /><p className="text-sm font-black text-blue-600 uppercase tracking-widest animate-pulse">Gemini Parsing...</p></div>) : (<><div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-all mb-6"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div><span className="text-lg font-black text-slate-900 tracking-tight">Drop Excel Image Here</span><div className="mt-8 px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Browse Files</div></>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StageCard: React.FC<{ stage: string, label: string, value: string, color: string, shadow: string }> = ({ stage, label, value, color, shadow }) => (
  <div className={`aspect-video ${color} ${shadow} rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-white transition-transform hover:scale-[1.02]`}>
    <span className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">{stage}</span>
    <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-4">{label}</p>
    <h4 className="text-5xl font-black tracking-tighter">{value || '0'}</h4>
  </div>
);

export default CampusDetail;
