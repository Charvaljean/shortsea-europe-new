

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../App';
import { useAuth } from '../context/AuthContext';
import { MarketReport, AdvisoryRequest } from '../types';
import { analyzeBrokerQuote, generateDeepDiveAnalysis } from '../services/geminiService';
import { storageService } from '../services/storageService';
import PaywallModal from '../components/PaywallModal';
import { 
  TrendingUp, TrendingDown, Minus, Anchor, Wind, Droplet, Map, 
  BarChart3, AlertTriangle, Ship, X, Loader2, Zap, Clock, 
  FileSearch, Scale, FileText, Send, CheckCircle, ShieldCheck, Download, FileSpreadsheet,
  ChevronRight, ArrowRight, Info, Globe, Maximize2, Lock, Crown
} from 'lucide-react';

const LAST_FREE_SCAN_KEY = 'shortsea_last_free_full_scan';

// PROFESSIONELE PLACEHOLDER TIJDENS SYNC
const initialBaseline: MarketReport = {
  lastUpdated: new Date().toLocaleDateString('nl-NL'),
  generalAdvisory: "Market Intelligence Desk - Active",
  generalAdvisoryEn: "Market Intelligence Desk - Strategic Insights Active",
  generalAdvisoryNl: "Market Intelligence Desk - Strategische Inzichten Actief",
  shortseaIndex: 3100,
  shortseaChange: "0.0%",
  regions: [
    { id: 'baltic', name: 'Baltic Sea', trend: 'stable', iconKey: 'globe', freightIndex: 3150, change: '0%', vesselsAvailable: 'Syncing...', avgFreight: '€--.--', highlights: [] },
    { id: 'northsea', name: 'North Sea / UKC', trend: 'stable', iconKey: 'globe', freightIndex: 2900, change: '0%', vesselsAvailable: 'Syncing...', avgFreight: '€--.--', highlights: [] },
    { id: 'med', name: 'Mediterranean Sea', trend: 'stable', iconKey: 'globe', freightIndex: 2750, change: '0%', vesselsAvailable: 'Syncing...', avgFreight: '€--.--', highlights: [] },
    { id: 'blacksea', name: 'Black Sea', trend: 'stable', iconKey: 'globe', freightIndex: 3400, change: '0%', vesselsAvailable: 'Syncing...', avgFreight: '€--.--', highlights: [] }
  ],
  bunkers: [],
  commodities: [],
  macroDrivers: [],
  freightHistory: [],
  portVolumes: [],
  cargoDistribution: []
};

const MarketInsights: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'trends' | 'analyzer'>('trends');
  const [isUpdating, setIsUpdating] = useState(false);

  // CACHE-FIRST INITIALIZATION - SURVIVES RELOADS AND UPDATES
  const [report, setReport] = useState<MarketReport>(initialBaseline);

  useEffect(() => {
    const loadCachedReport = async () => {
      const cached = await storageService.getGlobalMarketReport();
      if (cached) setReport(cached);
    };
    loadCachedReport();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'analyzer') {
        setActiveTab('analyzer');
        window.scrollTo(0, 0);
    } else if (tab === 'trends') {
        setActiveTab('trends');
    }
  }, [searchParams]);

  const [selectedRegion, setSelectedRegion] = useState<any | null>(null);
  const [deepDiveText, setDeepDiveText] = useState<string | null>(null);
  const [isLoadingDeepDive, setIsLoadingDeepDive] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const [quoteInput, setQuoteInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<{data: string, name: string, mimeType: string} | null>(null);
  const [serviceType, setServiceType] = useState<'AI_INSTANT' | 'EXPERT_PREMIUM'>('AI_INSTANT');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [canViewFull, setCanViewFull] = useState(false);

  // REAL-TIME SYNC POLL - UPDATES STATE IF ADMIN CHANGES DATA
  useEffect(() => {
      const checkUpdate = async () => {
          const latest = await storageService.getGlobalMarketReport();
          if (latest) {
              setReport(latest);
          }
      };
      checkUpdate();
      const interval = setInterval(checkUpdate, 10000); 
      return () => clearInterval(interval);
  }, []);

  const isPro = user?.subscriptionPlan === 'pro' || user?.subscriptionPlan === 'enterprise' || user?.role === 'admin';

  const checkScanEligibility = () => {
    if (isPro) return true;
    if (!user) return false;
    const lastScan = localStorage.getItem(LAST_FREE_SCAN_KEY);
    const monthInMs = 30 * 24 * 60 * 60 * 1000;
    if (!lastScan || (Date.now() - parseInt(lastScan)) > monthInMs) return true;
    return false;
  };

  const getTranslatedRegionName = (region: any) => {
      const id = region.id;
      if (id === 'baltic') return t.regionBaltic;
      if (id === 'northsea') return t.regionNorthSea;
      if (id === 'med') return t.regionMed;
      if (id === 'blacksea') return t.regionBlackSea;
      return region.name;
  };

  const getTranslatedTrend = (trend: string) => {
      if (trend === 'firm') return t.trendFirm;
      if (trend === 'soft') return t.trendSoft;
      return t.trendStable;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
        alert(language === 'nl' ? "Alleen PDF bestanden zijn toegestaan." : "Only PDF files are allowed.");
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setSelectedFile({ data: base64, name: file.name, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleTileClick = async (region: any) => {
    if (!isPro) {
      setShowPaywall(true);
      return;
    }
    setSelectedRegion(region);
    setIsLoadingDeepDive(true);
    setDeepDiveText(null);
    try {
      const analysis = await generateDeepDiveAnalysis(region.name);
      setDeepDiveText(analysis);
    } catch (e) {
      setDeepDiveText(language === 'nl' ? "Analyse momenteel niet beschikbaar." : "Analysis currently unavailable.");
    } finally {
      setIsLoadingDeepDive(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!quoteInput.trim() && !selectedFile) return;
    const eligible = checkScanEligibility();
    setCanViewFull(eligible);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
        const filePart = selectedFile ? { data: selectedFile.data, mimeType: selectedFile.mimeType } : undefined;
        const manualRates = await storageService.getMarketRates();
        if (serviceType === 'AI_INSTANT') {
            const result = await analyzeBrokerQuote(quoteInput, report, manualRates, filePart);
            setAnalysisResult(result || (language === 'nl' ? "Analyse mislukt." : "Analysis failed."));
            await storageService.saveQuickScan({
                userId: user?.id || 'guest',
                userName: user?.name || 'Guest',
                userCompany: user?.company || 'N/A',
                quote: selectedFile ? `[PDF: ${selectedFile.name}] ${quoteInput}` : quoteInput,
                result: result
            });
            await storageService.logActivity(user?.id || 'guest', user?.name || 'Guest', 'AI_QUOTE_SCAN', 'Instant AI Analysis performed');
            if (user && !isPro && eligible) {
                localStorage.setItem(LAST_FREE_SCAN_KEY, Date.now().toString());
            }
        } else {
            const draft = await analyzeBrokerQuote(quoteInput, report, manualRates, filePart);
            const newReq: AdvisoryRequest = {
                id: 'adv_' + Date.now(), userId: user?.id || 'guest', userName: user?.name || 'Guest',
                userCompany: user?.company || 'N/A', quoteText: selectedFile ? `[PDF: ${selectedFile.name}] ${quoteInput}` : quoteInput, serviceType: 'EXPERT_PREMIUM',
                status: 'PENDING', aiDraft: draft, timestamp: new Date().toISOString()
            };
            await storageService.saveAdvisory(newReq);
            setAnalysisResult('PENDING_EXPERTS');
        }
    } catch (e) { 
      alert(language === 'nl' ? "Fout bij analyse." : "Error during analysis."); 
    } finally { 
      setIsAnalyzing(false); 
    }
  };

  const renderAnalysisContent = (text: string) => {
    if (canViewFull) {
      return <div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-lg pt-4 print:text-black">{text}</div>;
    }
    const lines = text.split('\n');
    return (
      <div className="pt-4 space-y-6">
        {!user && (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3"><Lock size={20} className="text-blue-600"/><p className="text-blue-900 font-bold m-0">{t.advRegisterToView}</p></div>
            <Link to="/register" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest no-underline">Register Free</Link>
          </div>
        )}
        {user && !isPro && !canViewFull && (
          <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl mb-8 flex items-center gap-3"><AlertTriangle size={20} className="text-orange-600"/><p className="text-orange-900 font-bold m-0">{t.advMonthlyLimit}</p></div>
        )}
        {lines.map((line, i) => {
          const isTitle = line.trim().startsWith('#') || line.trim().startsWith('**') || (line.toUpperCase() === line && line.length > 5);
          if (isTitle) return <h4 key={i} className="text-lg font-black text-slate-900 uppercase tracking-tight m-0 mt-4">{line.replace(/[#*]/g, '')}</h4>;
          if (line.trim().length === 0) return null;
          return (
            <div key={i} className="relative">
              <div className="select-none blur-[6px] opacity-40 leading-relaxed font-medium text-slate-400">Strategic content restricted. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      <div className="bg-white border-b sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 m-0 uppercase tracking-tighter">{t.insightsTitle}</h1>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Shortsea Chartering Support Portal</p>
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button onClick={()=>setActiveTab('trends')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest border-none cursor-pointer transition-all ${activeTab==='trends'?'bg-blue-50 text-blue-600 shadow-sm':'text-slate-400 hover:text-slate-900'}`}><Zap size={16}/> {t.advTabTrends}</button>
                <button onClick={()=>setActiveTab('analyzer')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest border-none cursor-pointer transition-all ${activeTab==='analyzer'?'bg-blue-900 text-white shadow-sm':'text-slate-400 hover:text-slate-900'}`}><FileSearch size={16}/> {t.advTabAnalyzer}</button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'trends' && (
           <div className="space-y-12 no-print animate-fade-in">
              <div className="bg-blue-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="p-4 bg-blue-800 rounded-2xl flex-shrink-0 shadow-inner">
                    {isUpdating ? <Loader2 size={32} className="animate-spin text-blue-300" /> : <AlertTriangle size={32} className="text-yellow-400" />}
                </div>
                <div className="relative z-10 flex-1">
                    <h3 className="font-black text-sm uppercase tracking-[0.2em] text-blue-300 mb-2">{t.miDriver}</h3>
                    <p className="text-xl md:text-2xl font-bold text-blue-50 m-0 leading-snug">
                        {isUpdating 
                          ? (language === 'nl' ? "Scannen van live markt feeds..." : "Scanning live market feeds...") 
                          : (language === 'nl' ? (report?.generalAdvisoryNl || report?.generalAdvisory) : (report?.generalAdvisoryEn || report?.generalAdvisory))
                        }
                    </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                   {report?.regions?.map(r => (
                      <div key={r.id} onClick={() => handleTileClick(r)} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 group-hover:bg-blue-100 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all"><Globe size={24}/></div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${r.trend==='firm'?'bg-green-100 text-green-700':r.trend==='soft'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>{getTranslatedTrend(r.trend)}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter m-0">{getTranslatedRegionName(r)}</h3>
                            <div className="grid grid-cols-2 gap-4 mt-6 mb-6">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 m-0">{t.tileAvgFreight}</p><p className="text-sm font-black text-blue-600 m-0">{r.avgFreight || '€--.--'}</p></div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 m-0">{t.tileAvailability}</p><p className="text-sm font-black text-slate-700 m-0">{r.vesselsAvailable || '-- Ships'}</p></div>
                            </div>
                            <div className="space-y-3 mb-8">
                                {r.highlights && r.highlights.length > 0 ? r.highlights.map((h,i)=>(<div key={i} className="flex gap-2 text-[11px] text-slate-600 font-bold leading-relaxed"><ChevronRight size={14} className="text-blue-500 mt-0.5 flex-shrink-0"/><span>{h}</span></div>)) : <div className="text-[10px] text-slate-400 italic">No warnings active</div>}
                            </div>
                            <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">{t.tileDeepDive} <ArrowRight size={14}/></span>
                                {!isPro && <Lock size={14} className="text-slate-300"/>}
                            </div>
                        </div>
                      </div>
                   ))}
                </div>
                <div className="space-y-8">
                   <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-4 opacity-5"><Droplet size={80}/></div>
                      <h4 className="font-black text-xs uppercase text-slate-400 tracking-widest border-b pb-4 mb-6 m-0">{t.miBunkers}</h4>
                      <div className="space-y-5">
                         {report?.bunkers && report.bunkers.length > 0 ? report.bunkers.map((b,i)=>(<div key={i} className="flex justify-between items-center group"><div className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div><span className="font-bold text-slate-700">{b.port} (LSMGO)</span></div><span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg group-hover:bg-blue-600 group-hover:text-white">${b.price}</span></div>)) : <div className="text-[11px] text-slate-400 italic">Syncing live benchmarks...</div>}
                      </div>
                   </div>
                   <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                      <h4 className="font-black text-xs uppercase text-slate-400 tracking-widest border-b pb-4 mb-6 m-0">{t.miCargo}</h4>
                      <div className="space-y-4">
                         {report?.commodities && report.commodities.length > 0 ? report.commodities.map((c,i)=>(<div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><div className="flex justify-between mb-2"><span className="font-black text-slate-800 text-xs uppercase tracking-tight">{c.name}</span><span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${c.status==='HIGH'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{c.status}</span></div><p className="text-[10px] text-slate-500 leading-normal m-0 font-bold">{c.desc}</p></div>)) : <div className="text-[11px] text-slate-400 italic">Identifying commodity flows...</div>}
                      </div>
                   </div>
                </div>
              </div>
           </div>
        )}

        {selectedRegion && activeTab === 'trends' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                    <div className="p-8 border-b bg-slate-900 text-white flex justify-between items-center">
                        <div className="flex items-center gap-4"><div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/50"><Maximize2 size={24}/></div><div><h2 className="text-2xl font-black m-0 uppercase tracking-tighter">{getTranslatedRegionName(selectedRegion)} {language === 'nl' ? 'Analyse' : 'Analysis'}</h2><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest m-0">Strategic Independent Intel</p></div></div>
                        <button onClick={() => setSelectedRegion(null)} className="p-2 hover:bg-white/10 rounded-full border-none bg-transparent cursor-pointer text-white transition-colors"><X size={28}/></button>
                    </div>
                    <div className="p-10 overflow-y-auto flex-1 bg-slate-50">
                        {isLoadingDeepDive ? (<div className="py-20 text-center flex flex-col items-center gap-6"><Loader2 size={48} className="animate-spin text-blue-600"/><p className="font-black text-slate-800 uppercase tracking-widest text-sm">Synthesizing Regional Intelligence...</p></div>) : (
                            <div className="space-y-8 animate-fade-in-up">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Index</p><p className="text-3xl font-black text-slate-900 m-0">{selectedRegion.freightIndex}</p></div>
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.tileAvailability}</p><p className="text-3xl font-black text-slate-900 m-0">{selectedRegion.vesselsAvailable || 'Balanced'}</p></div>
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.tileAvgFreight}</p><p className="text-3xl font-black text-blue-600 m-0">{selectedRegion.avgFreight || 'Stable'}</p></div>
                                </div>
                                <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-200">
                                    <div className="flex items-center gap-2 mb-6 border-b pb-4"><ShieldCheck className="text-blue-600" size={24}/><h4 className="font-black text-xs uppercase tracking-[0.2em] m-0">Charterer-Focused Validation</h4></div>
                                    <div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-lg">{deepDiveText}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
        
        {activeTab === 'analyzer' && (
          <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
             <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-2xl relative overflow-hidden no-print">
                <div className="absolute top-0 right-0 p-4 opacity-5"><FileSearch size={150}/></div>
                <div className="relative z-10">
                   <h2 className="text-3xl font-black text-slate-900 m-0 tracking-tighter">{t.advAnalyzerTitle}</h2>
                   <p className="text-slate-500 font-bold text-sm mt-2">{t.advAnalyzerSubtitle}</p>
                </div>
                <div className="mt-8 space-y-6">
                   <textarea className="w-full h-48 p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-mono text-sm shadow-inner" placeholder={t.advAnalyzerPlaceholder} value={quoteInput} onChange={e=>setQuoteInput(e.target.value)} />
                   <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer border border-slate-200 transition-all shadow-sm">
                              <FileText size={18} className="text-blue-600"/>
                              {selectedFile ? `${t.advFileSelected} ${selectedFile.name}` : t.advUploadPdf}
                              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                          </label>
                          {selectedFile && (<button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-red-50 text-red-500 rounded-xl border-none bg-transparent cursor-pointer transition-colors"><X size={20}/></button>)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={()=>setServiceType('AI_INSTANT')} className={`p-6 rounded-2xl border-2 text-left transition-all ${serviceType==='AI_INSTANT'?'border-blue-600 bg-blue-50/50 shadow-md':'border-slate-100 bg-white hover:border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-4"><Zap className={serviceType==='AI_INSTANT'?'text-blue-600':'text-slate-400'} size={24}/><span className="bg-slate-100 text-[10px] font-black px-2 py-0.5 rounded text-slate-500 uppercase tracking-widest">{language === 'nl' ? 'Vast Tarief' : 'Fixed Fee'}</span></div>
                            <h4 className="font-black text-slate-900 m-0 uppercase tracking-wide">{t.advOptionA}</h4>
                            <p className="text-[11px] text-slate-500 mt-2 font-bold leading-relaxed">{t.advOptionADesc}</p>
                        </button>
                        <button onClick={()=>setServiceType('EXPERT_PREMIUM')} className={`p-6 rounded-2xl border-2 text-left transition-all ${serviceType==='EXPERT_PREMIUM'?'border-blue-600 bg-blue-50/50 shadow-md':'border-slate-100 bg-white hover:border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-4"><ShieldCheck className={serviceType==='EXPERT_PREMIUM'?'text-blue-600':'text-slate-400'} size={24}/><span className="bg-blue-600 text-[10px] font-black px-2 py-0.5 rounded text-white uppercase tracking-widest">Premium Service</span></div>
                            <h4 className="font-black text-slate-900 m-0 uppercase tracking-wide">{t.advOptionB}</h4>
                            <p className="text-[11px] text-slate-500 mt-2 font-bold leading-relaxed">{t.advOptionBDesc}</p>
                        </button>
                      </div>
                   </div>
                   <div className="space-y-4">
                     <button onClick={handleStartAnalysis} disabled={isAnalyzing || (!quoteInput && !selectedFile)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl shadow-blue-200 flex justify-center items-center gap-3 disabled:opacity-50 border-none cursor-pointer">
                        {isAnalyzing ? (<><Loader2 className="animate-spin" size={24}/><span>Analyzing...</span></>) : (<><Send size={24}/>{serviceType === 'AI_INSTANT' ? t.advBtnAnalyze : t.advBtnExpert}</>)}
                     </button>
                   </div>
                </div>
             </div>
             {analysisResult && (
                <div className="animate-fade-in-up">
                   {analysisResult === 'PENDING_EXPERTS' ? (
                      <div className="bg-green-50 border-2 border-green-100 p-10 rounded-3xl text-center space-y-4 no-print">
                         <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-100"><CheckCircle size={32}/></div>
                         <h3 className="text-2xl font-black text-green-900 uppercase">Validation Registered</h3>
                         <p className="text-green-800 font-bold max-w-lg mx-auto leading-relaxed">{t.advSuccessPending}</p>
                      </div>
                   ) : (
                      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden print:shadow-none print:border-none">
                         <div className="absolute top-0 right-10 bg-blue-600 text-white px-6 py-2 rounded-b-xl text-[10px] font-black uppercase tracking-widest shadow-md no-print">Independent Decision Support</div>
                         <div className="flex justify-between items-center mb-10 border-b pb-6 border-slate-100 no-print">
                            <div className="flex items-center gap-4"><div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><ShieldCheck size={28}/></div><div><h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter m-0">Commercial Risk Assessment</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref ID: VALIDATE-{Date.now().toString().slice(-6)}</p></div></div>
                            <div className="flex gap-2">
                               <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black shadow-lg border-none cursor-pointer"><Download size={16}/> PDF Report</button>
                               <button onClick={() => {}} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 shadow-lg border-none cursor-pointer"><FileSpreadsheet size={16}/> Excel Sheet</button>
                            </div>
                         </div>
                         <div className="relative pb-24">{renderAnalysisContent(analysisResult)}</div>
                      </div>
                   )}
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketInsights;
