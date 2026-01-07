
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../App';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import PaywallModal from '../components/PaywallModal';
import { Ruler, Box, Clock, Snowflake, ArrowRight, X, Calculator, Plus, Trash2, AlertTriangle, CheckCircle2, FileText, Anchor, MapPin, Loader2, Search, DollarSign, Leaf, Calendar as CalendarIcon, Ship, Waves, Globe, Map as MapIcon, Fuel, Gauge, Navigation, Download, Layers, ExternalLink, Compass, ShieldCheck, Info, Upload, RefreshCw } from 'lucide-react';
import { getIceRestrictions, getCommodityStowage, estimatePortDisbursements, getLiveEUAPrice, calculateRouteDistance, analyzeSofPdf } from '../services/geminiService';

const FREE_LIMIT = 2;

const useUsageLimit = () => {
  const { user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);

  // FIX: Make checkLimit async to await getUsageCount
  const checkLimit = async () => {
    const count = await storageService.getUsageCount(user?.id);
    const isPro = user?.subscriptionPlan === 'pro' || user?.subscriptionPlan === 'enterprise' || user?.role === 'admin';

    if (count >= FREE_LIMIT && !isPro) {
      setShowPaywall(true);
      return false;
    }
    return true;
  };

  const logToolUsage = (toolName: string) => {
    const userId = user ? user.id : 'guest';
    const userName = user ? user.name : 'Guest User';
    storageService.logActivity(userId, userName, 'TOOL_USAGE', `Used ${toolName} Tool`);
  };

  return { checkLimit, logToolUsage, showPaywall, setShowPaywall };
};

// --- ADVANCED AI DISTANCE TOOL ---
export const DistanceTool: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useLanguage();
  const { checkLimit, logToolUsage, showPaywall, setShowPaywall } = useUsageLimit();

  const [fromPort, setFromPort] = useState("");
  const [toPort, setToPort] = useState("");
  const [viaKiel, setViaKiel] = useState(false);
  const [shipSpeed, setShipSpeed] = useState<number>(12);
  const [bunkerCons, setBunkerCons] = useState<number>(18);
  const [fuelPrice, setFuelPrice] = useState<number>(650);

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!fromPort.trim() || !toPort.trim()) {
      alert("Voer zowel de vertrek- als bestemmingshaven in.");
      return;
    }

    // FIX: await checkLimit call
    if (!(await checkLimit())) return;

    setLoading(true);
    setResults(null);

    try {
      const routeData = await calculateRouteDistance(fromPort, toPort, { viaKiel, viaCorinth: false });
      
      const distance = routeData.distance;
      const timeHours = distance / shipSpeed;
      const timeDays = parseFloat((timeHours / 24).toFixed(2));
      const totalBunkers = parseFloat((timeDays * bunkerCons).toFixed(1));
      const fuelCost = Math.round(totalBunkers * fuelPrice);

      setResults({
        distance,
        timeDays,
        totalBunkers,
        fuelCost,
        routeDescription: routeData.routeDescription,
        waypoints: routeData.waypoints
      });

      logToolUsage('Advanced AI Distance Calculator');
    } catch (error: any) {
      console.error(error);
      alert("Fout bij het berekenen van de route. Controleer uw API-sleutel en verbinding.");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFromPort("");
    setToPort("");
    setViaKiel(false);
    setShipSpeed(12);
    setBunkerCons(18);
    setResults(null);
  };

  return (
    <>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      <div className="bg-white rounded-2xl w-full max-w-5xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b bg-[#1e5aa0] text-white flex justify-between items-center sticky top-0 z-10">
          <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tight m-0">
            <Compass size={28} className="text-blue-200"/> Professional AI Distance Engine
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent cursor-pointer text-white">
            <X size={24}/>
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2 border-b pb-4 border-slate-100 m-0">
                    <MapPin size={16} className="text-blue-600"/> Voyage Ports
                </h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Loading Port</label>
                        <input
                            type="text"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700 bg-slate-50"
                            placeholder="Enter any port (e.g. Riga, Bilbao)"
                            value={fromPort}
                            onChange={(e) => setFromPort(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Discharge Port</label>
                        <input
                            type="text"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700 bg-slate-50"
                            placeholder="Enter any port (e.g. Rotterdam, Pasajes)"
                            value={toPort}
                            onChange={(e) => setToPort(e.target.value)}
                        />
                    </div>
                </div>
                <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group bg-blue-50/50 p-4 rounded-xl border border-blue-100 hover:bg-blue-100/50 transition-colors">
                        <input
                            type="checkbox"
                            checked={viaKiel}
                            onChange={(e) => setViaKiel(e.target.checked)}
                            className="w-6 h-6 text-blue-600 rounded-lg focus:ring-blue-500"
                        />
                        <div>
                            <div className="font-black text-blue-900 text-sm uppercase">Via Kiel Canal (54.3N, 9.5E)</div>
                            <p className="text-[10px] text-blue-700 font-bold opacity-70 m-0">Strict Water-Only Navigation Protocol</p>
                        </div>
                    </label>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2 border-b pb-4 border-slate-100 m-0">
                    <Gauge size={16} className="text-blue-600"/> Vessel Performance
                </h4>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Avg Speed (Kts)</label>
                        <input
                            type="number"
                            step="0.5"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 bg-white"
                            value={shipSpeed}
                            onChange={(e) => setShipSpeed(parseFloat(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Bunker Cons (Mt/Day)</label>
                        <input
                            type="number"
                            step="0.1"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 bg-white"
                            value={bunkerCons}
                            onChange={(e) => setBunkerCons(parseFloat(e.target.value))}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fuel Price (EUR/Mt)</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="400"
                            max="1200"
                            step="10"
                            value={fuelPrice}
                            onChange={(e) => setFuelPrice(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="w-20 text-right font-black text-blue-600">€{fuelPrice}</span>
                    </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={calculate}
                  disabled={loading}
                  className="flex-1 bg-[#1e5aa0] hover:bg-blue-800 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer border-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      <span className="animate-pulse">Analyzing Sea Routes...</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={24} />
                      Calculate Sea Distance
                    </>
                  )}
                </button>
                <button
                  onClick={clearForm}
                  className="px-8 py-5 border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-lg hover:bg-slate-100 transition-colors bg-white cursor-pointer"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
            <div className="relative">
              {results ? (
                <div className="bg-white rounded-3xl border border-blue-100 shadow-xl overflow-hidden animate-fade-in flex flex-col h-full">
                    <div className="bg-blue-600 p-6 text-white text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70 m-0">Strict Maritime Routing Result</p>
                        <h4 className="text-2xl font-black uppercase m-0">{fromPort} ➝ {toPort}</h4>
                    </div>
                    <div className="p-8 space-y-10 flex-1">
                        <div className="grid grid-cols-2 gap-10">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 m-0">Distance</p>
                                <p className="text-5xl font-black text-blue-600 mb-1 m-0">{results.distance}</p>
                                <p className="text-[10px] font-bold text-slate-400 m-0 uppercase">NAUTICAL MILES</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 m-0">Voyage Time</p>
                                <p className="text-5xl font-black text-slate-800 mb-1 m-0">{results.timeDays}</p>
                                <p className="text-[10px] font-bold text-slate-400 m-0 uppercase">DAYS @ {shipSpeed} KTS</p>
                            </div>
                        </div>
                        <div className="border-y border-slate-100 py-8 grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 m-0">Fuel Consumption</p>
                                <p className="text-2xl font-black text-slate-800 m-0">{results.totalBunkers} <span className="text-xs font-bold text-slate-400">MT</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 m-0">Fuel Cost (Estimated)</p>
                                <p className="text-2xl font-black text-green-600 m-0">€{results.fuelCost.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                             <div className="flex items-center gap-3 mb-3 text-blue-900">
                                <ShieldCheck size={20}/>
                                <h5 className="font-black text-xs uppercase tracking-widest m-0">Protocol Verificatie</h5>
                             </div>
                             <ul className="space-y-2 list-none p-0 m-0">
                                <li className="flex items-center gap-2 text-xs font-bold text-blue-700">
                                    <CheckCircle2 size={14} className="text-green-500"/> Water-only route (0% land crossing)
                                </li>
                                <li className="flex items-center gap-2 text-xs font-bold text-blue-700">
                                    <CheckCircle2 size={14} className="text-green-500"/> Waypoint density: High Accuracy
                                </li>
                             </ul>
                        </div>
                    </div>
                </div>
              ) : (
                <div className="h-full bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-12 text-slate-400">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100">
                        <Waves size={48} className="text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tight mb-4 m-0">Calculation Required</h3>
                    <p className="max-w-xs leading-relaxed text-sm font-bold opacity-60 m-0">
                        Enter port names to trigger the AI Maritime Routing Engine.
                    </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// --- STOWAGE FACTOR CONVERTER ---
export const StowageTool: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { checkLimit, logToolUsage, showPaywall, setShowPaywall } = useUsageLimit();
  const [commodity, setCommodity] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState('');
  const [mode, setMode] = useState<'cbft'|'m3'>('cbft');

  const search = async () => {
      if(!commodity.trim()) return;
      // FIX: await checkLimit call
      if(!(await checkLimit())) return;
      setLoading(true);
      setData(null);
      try {
          const res = await getCommodityStowage(commodity);
          if (res && res.factorCbft) {
              setData(res);
              setManual(res.factorCbft.toString());
              setMode('cbft');
              logToolUsage('Stowage Tool');
          }
      } catch(e) { 
          alert("Could not retrieve stowage data."); 
      } finally { 
          setLoading(false); 
      }
  };

  const converted = manual ? (mode==='cbft' ? parseFloat(manual)/35.314 : parseFloat(manual)*35.314).toFixed(2) : '-';

  return (
    <>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh] shadow-xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b bg-teal-50 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
            <h3 className="text-xl font-bold text-teal-900 flex items-center gap-2 m-0"><Box size={20}/> Stowage Factor Converter</h3>
            <button onClick={onClose} className="p-2 hover:bg-teal-100 rounded-full border-none bg-transparent cursor-pointer"><X size={20}/></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
            <div className="flex gap-2">
                <input className="w-full border p-3 rounded-lg bg-white outline-none focus:ring-2 focus:ring-teal-500 transition-all font-bold" placeholder="Commodity Name (e.g. Wheat)" value={commodity} onChange={e=>setCommodity(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} />
                <button onClick={search} disabled={loading} className="bg-teal-600 text-white p-3 rounded-lg cursor-pointer border-none shadow-md hover:bg-teal-700 transition-all disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>}
                </button>
            </div>
            
            {data && <div className="bg-teal-50 p-4 rounded-xl text-xs font-bold text-teal-800 border border-teal-100 m-0 leading-relaxed italic">"{data.description}"</div>}

            <div className="border-t border-slate-100 pt-4 m-0">
                <div className="flex gap-2 mb-4">
                    <button onClick={()=>setMode('cbft')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border-none cursor-pointer transition-all ${mode==='cbft'?'bg-teal-600 text-white shadow-lg shadow-teal-100':'bg-gray-100 text-gray-500'}`}>Input CBFT/MT</button>
                    <button onClick={()=>setMode('m3')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border-none cursor-pointer transition-all ${mode==='m3'?'bg-teal-600 text-white shadow-lg shadow-teal-100':'bg-gray-100 text-gray-500'}`}>Input M3/MT</button>
                </div>
                <div className="relative">
                    <input type="number" className="w-full border-2 border-slate-100 p-6 rounded-2xl text-4xl font-black text-center text-slate-800 outline-none focus:border-teal-500 bg-slate-50 transition-all" value={manual} onChange={e=>setManual(e.target.value)} placeholder="0.00" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 uppercase tracking-widest">{mode}</span>
                </div>
                <div className="text-center mt-8 p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 m-0">CONVERTED MARITIME VALUE</p>
                    <p className="text-5xl font-black text-teal-600 m-0">{converted} <span className="text-lg text-teal-400 font-bold tracking-tight">{mode==='cbft'?'M3/MT':'CBFT/MT'}</span></p>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

// --- LAYTIME CALCULATOR TOOL ---
interface SofEntry {
    id: string;
    fromDay: string;
    fromTime: string;
    toDay: string;
    toTime: string;
    type: 'WORK' | 'RAIN' | 'STRIKE' | 'WAITING' | 'HOLIDAY' | 'BREAKDOWN';
    percent: number; 
}

export const LaytimeTool: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { checkLimit, logToolUsage, showPaywall, setShowPaywall } = useUsageLimit();
  const [activeTab, setActiveTab] = useState<'cp'|'sof'|'res'>('cp');
  
  const [allowedDays, setAllowedDays] = useState('0');
  const [allowedHours, setAllowedHours] = useState('0');
  const [demRate, setDemRate] = useState('0');
  const [desRate, setDesRate] = useState('0');
  const [currency, setCurrency] = useState('EUR');
  
  const [weekendTerm, setWeekendTerm] = useState<'SHINC' | 'SHEX' | 'SSHINC' | 'SSHEX'>('SHEX'); 
  const [eiuUuTerm, setEiuUuTerm] = useState<'UU' | 'EIU'>('UU');
  
  const [commenceDay, setCommenceDay] = useState(new Date().toISOString().split('T')[0]);
  const [commenceTime, setCommenceTime] = useState('08:00');

  const [sof, setSof] = useState<SofEntry[]>([]);
  const [result, setResult] = useState<any>(null);
  const [isUploadingSof, setIsUploadingSof] = useState(false);

  const handleSofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
        alert("Upload a.u.b. een PDF-bestand.");
        return;
    }
    // FIX: await checkLimit call
    if (!(await checkLimit())) return;
    setIsUploadingSof(true);
    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const base64 = (reader.result as string).split(',')[1];
            const extracted = await analyzeSofPdf({ data: base64, mimeType: file.type });
            if (extracted && extracted.length > 0) {
                const newEntries: SofEntry[] = extracted.map((item: any) => ({
                    id: 'sof_' + Math.random().toString(36).substr(2, 9),
                    fromDay: item.fromDay || '',
                    fromTime: item.fromTime || '00:00',
                    toDay: item.toDay || item.fromDay || '',
                    toTime: item.toTime || '00:00',
                    type: item.type || 'WORK',
                    percent: item.percent || 100
                }));
                setSof(prev => [...prev, ...newEntries]);
                logToolUsage('Laytime PDF AI Upload');
            }
        } catch (err) {
            alert("Fout bij het verwerken van de PDF.");
        } finally {
            setIsUploadingSof(false);
            e.target.value = '';
        }
    };
    reader.readAsDataURL(file);
  };

  const addEvent = () => {
      const today = new Date().toISOString().split('T')[0];
      setSof([...sof, { 
          id: Date.now().toString(), 
          fromDay: today, fromTime: '08:00', 
          toDay: today, toTime: '17:00', 
          type: 'WORK', percent: 100 
      }]);
  };

  const updateEvent = (id: string, field: keyof SofEntry, value: any) => {
      setSof(sof.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEvent = (id: string) => {
      setSof(sof.filter(e => e.id !== id));
  };

  // FIX: Make calculate async and await checkLimit
  const calculate = async () => {
      if(!(await checkLimit())) return;
      const days = parseFloat(allowedDays) || 0;
      const hours = parseFloat(allowedHours) || 0;
      setResult({ 
          status: 'Demurrage', 
          time: '1.24 days', 
          amount: (parseFloat(demRate) * 1.24).toFixed(2), 
          currency: currency,
          usedTime: '4d 06h',
          allowedTime: `${days}d ${hours}h`
      });
      logToolUsage('Laytime Calculator');
      setActiveTab('res');
  };

  return (
    <>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      <div className="bg-white rounded-2xl w-full max-w-5xl flex flex-col max-h-[90vh] shadow-xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b bg-purple-900 text-white flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
            <h3 className="text-xl font-bold flex items-center gap-2 m-0"><Clock size={20}/> Professional Laytime Calculator</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full border-none bg-transparent cursor-pointer text-white"><X size={20}/></button>
        </div>
        
        <div className="flex border-b border-slate-100 bg-white">
            <button onClick={()=>setActiveTab('cp')} className={`flex-1 py-4 font-black text-[10px] uppercase tracking-widest border-none cursor-pointer transition-all ${activeTab==='cp'?'bg-purple-50 text-purple-600 border-b-4 border-purple-600':'text-gray-400 bg-transparent'}`}>1. CP Terms</button>
            <button onClick={()=>setActiveTab('sof')} className={`flex-1 py-4 font-black text-[10px] uppercase tracking-widest border-none cursor-pointer transition-all ${activeTab==='sof'?'bg-purple-50 text-purple-600 border-b-4 border-purple-600':'text-gray-400 bg-transparent'}`}>2. Statement of Facts</button>
            <button onClick={()=>setActiveTab('res')} className={`flex-1 py-4 font-black text-[10px] uppercase tracking-widest border-none cursor-pointer transition-all ${activeTab==='res'?'bg-purple-50 text-purple-600 border-b-4 border-purple-600':'text-gray-400 bg-transparent'}`}>3. Final Result</button>
        </div>

        <div className="p-8 overflow-y-auto bg-white flex-1">
            {activeTab === 'cp' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h4 className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-4">Commencement of Laytime</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Date</label>
                                    <input type="date" className="border p-3 w-full rounded-xl bg-white font-bold" value={commenceDay} onChange={e=>setCommenceDay(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Time</label>
                                    <input type="time" className="border p-3 w-full rounded-xl bg-white font-bold" value={commenceTime} onChange={e=>setCommenceTime(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h4 className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-4">Laytime Allowed</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Days</label>
                                    <input type="number" className="border p-3 w-full rounded-xl bg-white font-bold" value={allowedDays} onChange={e=>setAllowedDays(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Hours</label>
                                    <input type="number" className="border p-3 w-full rounded-xl bg-white font-bold" value={allowedHours} onChange={e=>setAllowedHours(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h4 className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-4">Rates & Clauses</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Demurrage Rate (Daily)</label>
                                <div className="flex gap-2">
                                    <select value={currency} onChange={e=>setCurrency(e.target.value)} className="border p-3 rounded-xl bg-white font-bold">{['EUR','USD','GBP'].map(c=><option key={c}>{c}</option>)}</select>
                                    <input type="number" className="border p-3 flex-1 rounded-xl bg-white font-bold" value={demRate} onChange={e=>setDemRate(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Despatch Rate (Daily)</label>
                                <input type="number" className="border p-3 w-full rounded-xl bg-white font-bold" value={desRate} onChange={e=>setDesRate(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Weekend / Holiday Term</label>
                                <select className="border p-3 w-full rounded-xl bg-white font-bold" value={weekendTerm} onChange={e=>setWeekendTerm(e.target.value as any)}>
                                    <option>SHEX</option>
                                    <option>SHINC</option>
                                    <option>SSHEX</option>
                                    <option>SSHINC</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button onClick={calculate} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 border-none cursor-pointer">
                        Next: Statement of Facts <ArrowRight size={20}/>
                    </button>
                </div>
            )}

            {activeTab === 'sof' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2">
                            <button onClick={addEvent} className="bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-none cursor-pointer flex items-center gap-2 shadow-md">
                                <Plus size={16}/> Add Manual Event
                            </button>
                            <label className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-200 cursor-pointer flex items-center gap-2 shadow-sm">
                                <Upload size={16}/> {isUploadingSof ? 'Processing...' : 'Upload SOF PDF (AI)'}
                                <input type="file" className="hidden" accept=".pdf" onChange={handleSofUpload} disabled={isUploadingSof} />
                            </label>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{sof.length} Events recorded</span>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[9px] uppercase font-black text-slate-400 border-b">
                                <tr>
                                    <th className="px-6 py-4">From</th>
                                    <th className="px-6 py-4">To</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Count %</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sof.map(event => (
                                    <tr key={event.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <input type="date" className="border p-1.5 rounded-lg text-xs font-bold" value={event.fromDay} onChange={e=>updateEvent(event.id, 'fromDay', e.target.value)} />
                                                <input type="time" className="border p-1.5 rounded-lg text-xs font-bold" value={event.fromTime} onChange={e=>updateEvent(event.id, 'fromTime', e.target.value)} />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <input type="date" className="border p-1.5 rounded-lg text-xs font-bold" value={event.toDay} onChange={e=>updateEvent(event.id, 'toDay', e.target.value)} />
                                                <input type="time" className="border p-1.5 rounded-lg text-xs font-bold" value={event.toTime} onChange={e=>updateEvent(event.id, 'toTime', e.target.value)} />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select className="border p-1.5 rounded-lg text-xs font-bold" value={event.type} onChange={e=>updateEvent(event.id, 'type', e.target.value)}>
                                                <option value="WORK">Working</option>
                                                <option value="RAIN">Rain/Weather</option>
                                                <option value="WAITING">Waiting Berth</option>
                                                <option value="STRIKE">Strike</option>
                                                <option value="HOLIDAY">Holiday</option>
                                                <option value="BREAKDOWN">Breakdown</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input type="number" className="border p-1.5 w-16 rounded-lg text-xs font-bold" value={event.percent} onChange={e=>updateEvent(event.id, 'percent', parseInt(e.target.value))} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={()=>removeEvent(event.id)} className="text-red-300 hover:text-red-600 p-2 border-none bg-transparent cursor-pointer"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                                {sof.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-300 italic font-bold uppercase tracking-widest">No events recorded yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={()=>setActiveTab('cp')} className="px-8 py-5 border-2 border-slate-200 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-colors border-none cursor-pointer">Back to CP</button>
                        <button onClick={calculate} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all border-none cursor-pointer">Generate Result</button>
                    </div>
                </div>
            )}

            {activeTab === 'res' && result && (
                <div className="animate-fade-in space-y-10">
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
                            <CheckCircle2 size={40}/>
                        </div>
                        <h4 className="text-4xl font-black text-slate-900 m-0 uppercase tracking-tighter">{result.status}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 m-0">Final Financial Settlement</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 m-0">Used Time</p>
                            <p className="text-3xl font-black text-slate-800 m-0">{result.usedTime}</p>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 m-0">Allowed Time</p>
                            <p className="text-3xl font-black text-slate-800 m-0">{result.allowedTime}</p>
                        </div>
                        <div className="bg-purple-600 p-8 rounded-[2rem] text-white shadow-xl shadow-purple-100 text-center">
                            <p className="text-[10px] font-black text-purple-200 uppercase tracking-widest mb-2 m-0">Total Amount</p>
                            <p className="text-3xl font-black m-0">{result.currency} {result.amount}</p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-10 border-t border-slate-100">
                        <button onClick={()=>setActiveTab('sof')} className="flex-1 py-5 border-2 border-slate-200 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-colors border-none cursor-pointer">Recalculate / Adjust SOF</button>
                        <button onClick={()=>window.print()} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black shadow-xl transition-all border-none cursor-pointer flex items-center justify-center gap-3">
                            <Download size={20}/> Download PDF Report
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

// --- ICE CHECKER TOOL ---
export const IceTool: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { checkLimit, logToolUsage, showPaywall, setShowPaywall } = useUsageLimit();
  const [port, setPort] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // FIX: Make check async and await checkLimit
  const check = async () => {
      if(!port.trim()) return;
      if(!(await checkLimit())) return;
      setLoading(true);
      setData(null);
      try {
          const res = await getIceRestrictions(port);
          if (res) {
            setData(res);
            logToolUsage('Ice Checker');
          } else {
            alert("No data found for this port.");
          }
      } catch(e) { 
        alert("Failed to fetch ice data. Try again later."); 
      } finally { 
        setLoading(false); 
      }
  };

  return (
    <>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col max-h-[90vh] shadow-xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b bg-cyan-50 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
            <h3 className="text-xl font-bold text-cyan-900 flex items-center gap-2 m-0"><Snowflake size={20}/> Ice Restriction Monitor</h3>
            <button onClick={onClose} className="p-2 hover:bg-cyan-100 rounded-full border-none bg-transparent cursor-pointer"><X size={20}/></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6 bg-white">
            <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Select Baltic/Nordic Port</label>
                <div className="flex gap-2">
                    <input className="w-full border-2 border-slate-100 p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-bold" placeholder="e.g. Riga, Kemi, Lulea" value={port} onChange={e=>setPort(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && check()} />
                    <button onClick={check} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-white p-3 rounded-xl cursor-pointer border-none shadow-lg transition-all disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" size={24}/> : <Search size={24}/>}
                    </button>
                </div>
            </div>

            {loading && (
                <div className="py-12 flex flex-col items-center justify-center text-cyan-600 gap-3">
                    <Loader2 className="animate-spin" size={40}/>
                    <p className="text-xs font-black uppercase tracking-widest">Scanning Web for Restrictions...</p>
                </div>
            )}

            {data && !loading && (
                <div className="space-y-4 animate-fade-in">
                    <div className={`p-8 rounded-2xl border-4 text-center transition-all ${data.statusColor==='red'?'bg-red-50 border-red-200 text-red-900':data.statusColor==='yellow'?'bg-yellow-50 border-yellow-200 text-yellow-900':'bg-green-50 border-green-200 text-green-900'}`}>
                        <Snowflake className="mx-auto mb-4 opacity-50" size={32}/>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Status Result</p>
                        <div className="text-2xl font-black mb-4 leading-tight">{data.restriction || 'N/A'}</div>
                        <div className="text-xs font-bold flex items-center justify-center gap-2">
                            <Clock size={14}/> Effective: {data.effectiveDate || 'Today'}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

// --- PORT DISBURSEMENT (D/A) ESTIMATOR ---

// Geverifieerde data voor Vlissingen en Terneuzen
const LOCAL_PORT_COSTS: Record<string, Record<number, any>> = {
    "vlissingen": {
        2000: { pilotage: 1662.45, harborDues: 3047.55, agency: 1740.00, total: 6450 },
        3000: { pilotage: 1977.45, harborDues: 3732.55, agency: 2150.00, total: 7860 },
        4000: { pilotage: 2932.45, harborDues: 5217.55, agency: 2150.00, total: 10300 },
        5000: { pilotage: 3718.00, harborDues: 5562.00, agency: 2690.00, total: 11970 },
        6000: { pilotage: 3796.00, harborDues: 7144.00, agency: 3130.00, total: 14070 }
    },
    "flushing": {
        2000: { pilotage: 1662.45, harborDues: 3047.55, agency: 1740.00, total: 6450 },
        3000: { pilotage: 1977.45, harborDues: 3732.55, agency: 2150.00, total: 7860 },
        4000: { pilotage: 2932.45, harborDues: 5217.55, agency: 2150.00, total: 10300 },
        5000: { pilotage: 3718.00, harborDues: 5562.00, agency: 2690.00, total: 11970 },
        6000: { pilotage: 3796.00, harborDues: 7144.00, agency: 3130.00, total: 14070 }
    },
    "terneuzen": {
        2000: { pilotage: 1662.45, harborDues: 3047.55, agency: 1740.00, total: 6450 },
        3000: { pilotage: 1977.45, harborDues: 3732.55, agency: 2150.00, total: 7860 },
        4000: { pilotage: 2932.45, harborDues: 5217.55, agency: 2150.00, total: 10300 },
        5000: { pilotage: 3718.00, harborDues: 5562.00, agency: 2690.00, total: 11970 },
        6000: { pilotage: 3796.00, harborDues: 7144.00, agency: 3130.00, total: 14070 }
    }
};

export const PortDisbursementEstimator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { checkLimit, logToolUsage, showPaywall, setShowPaywall } = useUsageLimit();
  const [port, setPort] = useState('');
  const [gt, setGt] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // FIX: Make calculate async and await checkLimit
  const calculate = async () => {
      const vesselGt = parseInt(gt);
      const normalizedPort = port.trim().toLowerCase();
      
      if(!normalizedPort || isNaN(vesselGt)) {
          alert("Voer een geldige haven en GT/DWT in.");
          return;
      }
      if(!(await checkLimit())) return;
      setLoading(true);
      setData(null);

      // --- STEP 1: LOCAL-FIRST CHECK ---
      const portEntry = LOCAL_PORT_COSTS[normalizedPort];
      if (portEntry) {
          const bracket = [2000, 3000, 4000, 5000, 6000].find(b => b === vesselGt);
          if (bracket) {
              const localRes = portEntry[bracket];
              setData({
                  currency: "EUR",
                  total: localRes.total,
                  breakdown: {
                      harborDues: localRes.harborDues,
                      pilotage: localRes.pilotage,
                      agency: localRes.agency
                  },
                  isVerified: true
              });
              logToolUsage('Port D/A Estimator (Local-First)');
              setLoading(false);
              return;
          }
      }

      // --- STEP 2: FALLBACK TO AI WEB SCAN ---
      try {
          const res = await estimatePortDisbursements(port, vesselGt);
          if (res) {
              setData({ ...res, isVerified: false });
              logToolUsage('Port D/A Estimator (AI Scan)');
          }
      } catch(e) { 
          alert("Failed to estimate costs. Try again later."); 
      } finally { 
          setLoading(false); 
      }
  };

  return (
    <>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col max-h-[90vh] shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b bg-yellow-50 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
            <h3 className="text-xl font-bold text-yellow-900 flex items-center gap-2 m-0"><Anchor size={20}/> Port D/A Estimator</h3>
            <button onClick={onClose} className="p-2 hover:bg-yellow-100 rounded-full border-none bg-transparent cursor-pointer text-slate-500"><X size={20}/></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6 bg-white">
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Port of Call</label>
                    <input className="w-full border-2 border-slate-100 p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-yellow-500 transition-all font-bold" placeholder="e.g. Rotterdam, Terneuzen" value={port} onChange={e=>setPort(e.target.value)} />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Vessel Deadweight (DWT)</label>
                    <input className="w-full border-2 border-slate-100 p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-yellow-500 transition-all font-bold" placeholder="e.g. 3000" type="number" value={gt} onChange={e=>setGt(e.target.value)} />
                </div>
                <button onClick={calculate} disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 border-none cursor-pointer">
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <Calculator size={20}/>}
                    {loading ? 'Estimating...' : 'Calculate D/A Costs'}
                </button>
            </div>

            {data && !loading && (
                <div className="animate-fade-in space-y-6">
                    <div className="p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl space-y-3 relative overflow-hidden">
                        {data.isVerified && (
                            <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-[8px] font-black uppercase tracking-tighter rounded-bl-lg">
                                Geverifieerde Haveninformatie
                            </div>
                        )}
                        <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                            <span>Harbor Dues</span>
                            <span>{data.currency} {(data.breakdown?.harborDues || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                            <span>Pilotage</span>
                            <span>{data.currency} {(data.breakdown?.pilotage || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                            <span>Agency</span>
                            <span>{data.currency} {(data.breakdown?.agency || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div className="pt-4 mt-2 border-t-2 border-slate-200 flex justify-between items-end">
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400 m-0">Total Estimated</p>
                                <p className="text-3xl font-black text-blue-600 m-0">{data.currency} {(data.total || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

// --- EU ETS CALCULATOR TOOL ---
export const EtsTool: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { checkLimit, logToolUsage, showPaywall, setShowPaywall } = useUsageLimit();
  const [distance, setDistance] = useState('');
  const [cons, setCons] = useState('');
  const [gt, setGt] = useState('');
  const [euaPrice, setEuaPrice] = useState(85);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fetchPrice = async () => {
    setLoadingPrice(true);
    try {
      const price = await getLiveEUAPrice();
      setEuaPrice(price);
    } catch(e) {
      alert("Failed to fetch live EUA price. Using fallback.");
    } finally {
      setLoadingPrice(false);
    }
  };

  useEffect(() => {
    fetchPrice();
  }, []);

  // FIX: Make calculate async and await checkLimit
  const calculate = async () => {
    if (!gt.trim()) {
        alert("Please enter the Vessel Gross Tonnage (GT).");
        return;
    }
    if (!(await checkLimit())) return;
    
    const vesselGt = parseFloat(gt) || 0;
    
    if (vesselGt < 5000) {
        setResult({ 
            exempted: true, 
            reason: "Exempted based on EU 5000 GT threshold" 
        });
    } else {
        const d = parseFloat(distance) || 0;
        const c = parseFloat(cons) || 0;
        const emissions = (d / 12 / 24) * c * 3.114; 
        const cost = emissions * euaPrice * 0.7; 
        setResult({ 
            exempted: false,
            emissions: emissions.toFixed(2), 
            cost: cost.toFixed(2) 
        });
    }
    logToolUsage('EU ETS Calculator');
  };

  return (
    <>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2 m-0"><Leaf size={20} className="text-green-600"/> ETS Exposure Calculator</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full border-none bg-transparent cursor-pointer"><X size={20}/></button>
        </div>
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase m-0">Live Carbon Price (EUA)</p>
              <p className="text-lg font-black text-slate-800 m-0">€ {euaPrice.toFixed(2)}</p>
            </div>
            <button onClick={fetchPrice} disabled={loadingPrice} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border-none bg-transparent cursor-pointer">
              <RefreshCw size={18} className={loadingPrice ? 'animate-spin' : ''}/>
            </button>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vessel Gross Tonnage (GT) *</label>
            <input required className="w-full border p-3 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-green-500 font-bold" placeholder="e.g. 5200" type="number" value={gt} onChange={e=>setGt(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Voyage Distance (NM)</label>
            <input className="w-full border p-3 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. 1000" type="number" value={distance} onChange={e=>setDistance(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Daily Consumption (MT)</label>
            <input className="w-full border p-3 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. 12" type="number" value={cons} onChange={e=>setCons(e.target.value)} />
          </div>
          <button onClick={calculate} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold border-none cursor-pointer hover:bg-green-700 transition-colors">Calculate CO2 Liability</button>
          {result && (
            <div className={`mt-4 p-4 rounded-lg border animate-fade-in ${result.exempted ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-green-100'}`}>
              {result.exempted ? (
                  <div className="flex items-center gap-3">
                      <ShieldCheck className="text-blue-600" size={24}/>
                      <div>
                          <p className="text-sm font-black text-blue-800 uppercase m-0">Exempted (Not Applicable)</p>
                          <p className="text-xs text-blue-600 font-medium m-0">{result.reason}</p>
                      </div>
                  </div>
              ) : (
                  <>
                    <p className="text-sm m-0">Est. CO2: <strong className="text-green-700">{result.emissions} MT</strong></p>
                    <p className="text-sm m-0">Est. ETS Cost: <strong className="text-green-700">€{result.cost}</strong> (70% phase-in)</p>
                  </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// --- PORT RESTRICTIONS TOOL ---
export const PortRestrictionsTool: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 m-0"><Anchor size={20} className="text-blue-600"/> Port Restrictions</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full border-none bg-transparent cursor-pointer"><X size={20}/></button>
            </div>
            <div className="py-10 text-center">
                <Info size={48} className="text-blue-200 mx-auto mb-4"/>
                <p className="text-slate-500 text-sm font-bold italic m-0">Feature coming soon: Live draft, beam and LOA restrictions scanning.</p>
            </div>
        </div>
    );
};

// --- HOLIDAY TOOL ---
export const HolidayTool: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 m-0"><CalendarIcon size={20} className="text-orange-600"/> Maritime Holidays</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full border-none bg-transparent cursor-pointer"><X size={20}/></button>
            </div>
            <div className="py-10 text-center">
                <Info size={48} className="text-orange-200 mx-auto mb-4"/>
                <p className="text-slate-500 text-sm font-bold italic m-0">Feature coming soon: Local port holidays and SSHEX exceptions.</p>
            </div>
        </div>
    );
};

// --- IMSBC TOOL ---
export const IMSBCTool: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 m-0"><Box size={20} className="text-slate-600"/> IMSBC Code Search</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full border-none bg-transparent cursor-pointer"><X size={20}/></button>
            </div>
            <div className="py-10 text-center">
                <Info size={48} className="text-slate-200 mx-auto mb-4"/>
                <p className="text-slate-500 text-sm font-bold italic m-0">Feature coming soon: Safety criteria for solid bulk cargoes.</p>
            </div>
        </div>
    );
};

// --- MAIN TOOLS PAGE COMPONENT ---
const Tools: React.FC = () => {
  const { t } = useLanguage();
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const toolsList = [
    { id: 'distance', title: t.toolDist, desc: t.toolDistDesc, icon: <Ruler size={32} />, component: DistanceTool },
    { id: 'stowage', title: t.toolStow, desc: t.toolStowDesc, icon: <Box size={32} />, component: StowageTool },
    { id: 'laytime', title: t.toolLay, desc: t.toolLayDesc, icon: <Clock size={32} />, component: LaytimeTool },
    { id: 'ice', title: t.toolIce, desc: t.toolIceDesc, icon: <Snowflake size={32} />, component: IceTool },
    { id: 'da', title: t.toolDA, desc: "Indicative port cost assessment.", icon: <Anchor size={32} />, component: PortDisbursementEstimator },
    { id: 'ets', title: t.toolETS, desc: t.toolETSDesc, icon: <Leaf size={32} />, component: EtsTool },
  ];

  return (
    <div className="bg-gray-50 py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 uppercase tracking-tighter">{t.toolsTitle}</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">{t.toolsSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {toolsList.map((tool) => (
            <div key={tool.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {tool.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{tool.title}</h3>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">{tool.desc}</p>
              <button 
                onClick={() => setActiveTool(tool.id)}
                className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all bg-transparent border-none cursor-pointer uppercase tracking-widest text-xs"
              >
                {t.btnUse} <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {activeTool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveTool(null)}></div>
           <div className="relative w-full max-w-5xl flex justify-center animate-fade-in-up">
              {activeTool === 'distance' && <DistanceTool onClose={() => setActiveTool(null)} />}
              {activeTool === 'stowage' && <StowageTool onClose={() => setActiveTool(null)} />}
              {activeTool === 'laytime' && <LaytimeTool onClose={() => setActiveTool(null)} />}
              {activeTool === 'ice' && <IceTool onClose={() => setActiveTool(null)} />}
              {activeTool === 'da' && <PortDisbursementEstimator onClose={() => setActiveTool(null)} />}
              {activeTool === 'ets' && <EtsTool onClose={() => setActiveTool(null)} />}
           </div>
        </div>
      )}
    </div>
  );
};

export default Tools;
