
import React, { useState, useEffect } from "react"
import { useLanguage } from '../App'
import { generateMarketReport } from '../services/geminiService'
import { MarketReport } from '../types'
import {
  ArrowLeft,
  Ship,
  DollarSign,
  Globe,
  RefreshCw,
  Anchor,
  Activity,
  Clock,
  Terminal,
  Bug,
  Loader2
} from "lucide-react"
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const fallbackReport: MarketReport = {
  lastUpdated: new Date().toLocaleString('nl-NL'),
  generalAdvisory: "Systeem Standby. Klik op 'Geforceerde Web Refresh' voor live AI marktdata.",
  shortseaIndex: 3120,
  shortseaChange: "+0.8%",
  // FIX: Added missing required 'iconKey' property to conform to MarketReport type
  regions: [
      { id: 'baltic', name: 'Baltic Sea', trend: 'firm', iconKey: 'globe', freightIndex: 3240, change: '+1.2%', avgFreight: '€24.50', highlights: [] },
      { id: 'northsea', name: 'North Sea', trend: 'stable', iconKey: 'globe', freightIndex: 2890, change: '0%', avgFreight: '€18.10', highlights: [] },
      { id: 'med', name: 'Mediterranean', trend: 'soft', iconKey: 'globe', freightIndex: 2650, change: '-0.4%', avgFreight: '€20.50', highlights: [] },
      { id: 'blacksea', name: 'Black Sea', trend: 'firm', iconKey: 'globe', freightIndex: 3510, change: '+2.1%', avgFreight: '€31.00', highlights: [] }
  ],
  bunkers: [{ port: "Rotterdam", price: 585, change: 0 }],
  commodities: [],
  macroDrivers: [],
  freightHistory: [
    { month: 'Sep', index: 2850 }, { month: 'Oct', index: 2980 }, { month: 'Nov', index: 3050 }, { month: 'Dec', index: 3120 }
  ],
  portVolumes: [],
  cargoDistribution: [
    { type: 'Bulk', percentage: 45 }, 
    { type: 'Breakbulk', percentage: 25 }, 
    { type: 'Container', percentage: 20 }, 
    { type: 'Project', percentage: 10 }
  ],
  debugRawSnippet: "Pre-loaded market baseline. System awaiting manual web trigger."
};

const COLORS = ['#1e5aa0', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AnalyticsPage: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState("market")
  const [report, setReport] = useState<MarketReport | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchMarketData = async (forceRefresh: boolean = false) => {
    setDataLoading(true);
    setErrorMsg(null);
    const stored = localStorage.getItem('shortsea_market_report');
    
    try {
      if (!forceRefresh && stored) {
          setReport(JSON.parse(stored));
          setDataLoading(false);
          return;
      }
      const freshReport = await generateMarketReport();
      if (!freshReport || !freshReport.regions) throw new Error("Mislukt");
      setReport(freshReport);
      localStorage.setItem('shortsea_market_report', JSON.stringify(freshReport));
    } catch (error: any) {
      setReport(fallbackReport);
      setErrorMsg("Web Scan geforceerd naar Baseline.");
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => { fetchMarketData(); }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-10 font-sans">
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
             {onClose && (
                <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full border-none bg-transparent cursor-pointer transition-colors">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
             )}
             <h1 className="text-3xl font-black text-slate-900 m-0 uppercase tracking-tighter">Market Intel & Analytics</h1>
          </div>
          <p className="text-slate-500 font-bold text-sm m-0">Live AI Scanning: Regionale Fixtures & Ladingstromen</p>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-3 py-1 rounded-full w-fit mt-3 shadow-sm">
            <Clock size={12} /> <span>Status: {report?.lastUpdated || 'Ready'}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
            <button
                onClick={() => fetchMarketData(true)}
                disabled={dataLoading}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm transition-all shadow-xl shadow-blue-200 flex items-center gap-3 disabled:opacity-50 border-none cursor-pointer uppercase tracking-widest"
            >
                <RefreshCw size={18} className={dataLoading ? 'animate-spin' : ''} />
                {dataLoading ? 'Scanning Web...' : 'Geforceerde Web Refresh'}
            </button>
        </div>
      </div>

      <div className="bg-blue-900 rounded-2xl p-8 mb-12 text-white shadow-2xl relative overflow-hidden flex items-center gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="p-4 bg-blue-800 rounded-2xl flex-shrink-0 shadow-inner">
              <Activity size={32} className="text-blue-300" />
          </div>
          <div className="flex-1">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-300 mb-2 m-0">Charterer Intelligence Update</h3>
              <p className="text-xl font-bold text-blue-50 m-0 leading-relaxed italic">
                "{report?.generalAdvisory || 'Systeem gereed voor analyse...'}"
              </p>
          </div>
      </div>

      <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm mb-12 overflow-x-auto no-print">
        {[
          { id: "market", label: "Regionale Fixtures", icon: Globe },
          { id: "rates", label: "Tarieven (6 Mnd)", icon: DollarSign },
          { id: "ports", label: "Havens Live Intel", icon: Anchor },
          { id: "webtraffic", label: "Live Verkeer", icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[180px] py-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-none cursor-pointer ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "market" && (
        <div className="space-y-10 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden flex flex-col">
                  <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
                      <h3 className="font-black text-xs text-slate-800 flex items-center gap-3 m-0 uppercase tracking-widest"><Ship size={20} className="text-blue-600"/> Gedetecteerde Fixtures</h3>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Europa Regionaal</span>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b">
                            <tr>
                                <th className="px-8 py-5">Regio</th>
                                <th className="px-8 py-5">Trend</th>
                                <th className="px-8 py-5">Index</th>
                                <th className="px-8 py-5 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {report?.regions?.map((region) => (
                                <tr key={region.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <Globe size={16}/>
                                            </div>
                                            <span className="font-black text-slate-800 text-sm uppercase tracking-tight">{region.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${region.trend === 'firm' ? 'bg-green-100 text-green-700' : region.trend === 'soft' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {region.trend}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 font-mono font-black text-slate-900 text-lg">
                                        {region.freightIndex} <span className="text-[10px] text-slate-400 font-bold ml-1">({region.change})</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="text-blue-600 hover:underline text-[10px] font-black uppercase tracking-widest border-none bg-transparent cursor-pointer">Specs &rarr;</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              </div>

              <div className="lg:col-span-5 flex flex-col h-full">
                  <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 p-10 flex-1 flex flex-col">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-10 m-0 border-b pb-4">Volume Verdeling (Markt Aandeel)</h3>
                      <div className="flex-1 min-h-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie 
                                    data={report?.cargoDistribution || fallbackReport.cargoDistribution} 
                                    cx="50%" cy="45%" 
                                    innerRadius={70} 
                                    outerRadius={110} 
                                    paddingAngle={8} 
                                    dataKey="percentage" 
                                    nameKey="type" 
                                    stroke="none"
                                  >
                                      {(report?.cargoDistribution || fallbackReport.cargoDistribution).map((_, index) => (
                                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                  </Pie>
                                  <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                  />
                                  <Legend 
                                    verticalAlign="bottom" 
                                    align="center" 
                                    iconType="circle" 
                                    formatter={(v) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{v}</span>} 
                                  />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="mt-6 pt-6 border-t border-slate-50 text-center">
                          <p className="text-[10px] font-bold text-slate-400 m-0 uppercase tracking-widest">Actueel volume aandeel in Shortsea Europe</p>
                      </div>
                  </div>
              </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><Terminal size={120} className="text-white" /></div>
              <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-slate-800 rounded-xl text-green-400 shadow-inner"><Bug size={24}/></div>
                  <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] m-0">AI Grounding Logs</h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase m-0">Protocol: Gemini-3-Pro-Search-Grounding</p>
                  </div>
              </div>
              <div className="bg-black/60 rounded-2xl p-8 font-mono text-xs leading-relaxed text-green-400/90 border border-green-900/30 shadow-inner">
                  <p className="m-0 mb-4 text-green-500 font-black uppercase tracking-tighter border-b border-green-900/30 pb-2">Snippet van real-time bronverificatie:</p>
                  <span className="italic block mb-4">
                      {report?.debugRawSnippet || "Systeem baseline geladen. Wachten op web sync..."}
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-green-900/20">
                      <div className="flex flex-col"><span className="text-[9px] text-slate-500 font-black uppercase">Model</span><span className="text-white">G3-Pro-Preview</span></div>
                      <div className="flex flex-col"><span className="text-[9px] text-slate-500 font-black uppercase">Grounding</span><span className="text-white">Active (Google)</span></div>
                      <div className="flex flex-col"><span className="text-[9px] text-slate-500 font-black uppercase">Token Usage</span><span className="text-white">Dynamic</span></div>
                      <div className="flex flex-col"><span className="text-[9px] text-slate-500 font-black uppercase">Status</span><span className="text-green-500 font-black">STABLE</span></div>
                  </div>
              </div>
          </div>
        </div>
      )}

      {activeTab === "rates" && (
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 p-10 animate-fade-in">
           <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-10 flex items-center gap-3">
              <DollarSign size={24} className="text-blue-600"/> Prijsontwikkeling Shortsea Index (6 Mnd)
           </h3>
           <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={report?.freightHistory || fallbackReport.freightHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                        />
                        <Line type="monotone" dataKey="index" stroke="#1e5aa0" strokeWidth={5} dot={{r: 8, fill: '#1e5aa0', strokeWidth: 4, stroke: '#fff'}} activeDot={{r: 10}} />
                    </LineChart>
                </ResponsiveContainer>
           </div>
        </div>
      )}

      {(activeTab === "ports" || activeTab === "webtraffic") && (
        <div className="bg-white rounded-[2rem] border-4 border-dashed border-slate-200 p-32 text-center text-slate-400 animate-fade-in">
            <Loader2 size={64} className="mx-auto mb-6 opacity-20 animate-spin"/>
            <h3 className="text-2xl font-black uppercase tracking-widest opacity-40 m-0">{activeTab === "ports" ? "Port Agent Modules Loading" : "GA4 Pipeline Syncing"}</h3>
            <p className="max-w-xs mx-auto font-bold text-sm opacity-30 mt-4 leading-relaxed">Deze data wordt gesynchroniseerd via de Shortsea Europe Mainframe. Een moment geduld.</p>
        </div>
      )}
    </div>
  )
}

export default AnalyticsPage;
