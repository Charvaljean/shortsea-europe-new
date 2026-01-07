
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { LaytimeTool, IceTool, StowageTool, DistanceTool, PortDisbursementEstimator, EtsTool, PortRestrictionsTool, HolidayTool, IMSBCTool } from './Tools';
import BunkerPricesPage from './BunkerPrices';
import AnalyticsPage from './Analytics';
import ContractsPage from './Contracts';
import PriceCalculationPage from './PriceCalculation';
import { generateMarketReport, findRealTimeShips, analyzeBrokerQuote } from '../services/geminiService';
import { 
  X, BarChart3, Users, Ship, Box, 
  TrendingUp, DollarSign, Anchor, Calculator, Plus, Trash2, 
  Database, Edit2, LayoutDashboard, FileText, Map as MapIcon, 
  MessageSquare, Briefcase, Zap, Loader2, Search, Download, Copy, RefreshCw,
  CheckCircle, ShieldCheck, ClipboardCheck, Info, Navigation, Snowflake, FileSignature, Gauge, ListChecks, Clock, ChevronRight, Leaf, History, Minus, ArrowUpDown, Mail, Phone, Printer, FileDown, Upload, ExternalLink,
  Globe, Sparkles, ChevronDown, ChevronUp, FileSearch
} from 'lucide-react';
import { Offer, MarketRateEntry, AdvisoryRequest, Shipowner } from "../types";

// Main Admin Dashboard Component
export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, isAdmin, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showVesselModal, setShowVesselModal] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allMessages, setAllMessages] = useState<any[]>([]); 
  const [allShips, setAllShips] = useState<any[]>([]);
  const [marketRates, setMarketRates] = useState<MarketRateEntry[]>([]);
  const [advisories, setAdvisories] = useState<AdvisoryRequest[]>([]);
  const [quickScans, setQuickScans] = useState<any[]>([]);
  const [shipowners, setShipowners] = useState<Shipowner[]>([]);

  // Selection States for Advisories
  const [selectedAdv, setSelectedAdv] = useState<AdvisoryRequest | null>(null);
  const [expertText, setExpertText] = useState("");
  const [proInsightText, setProInsightText] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  
  // UI States for toggles
  const [showQuickScan, setShowQuickScan] = useState(true);
  const [showProInsight, setShowProInsight] = useState(false);

  // FIX: Make refreshData async to await storageService calls
  const refreshData = async () => {
      const realUsers = await storageService.getUsers();
      const mappedUsers = realUsers.map(u => ({
        id: u.id, type: u.role === 'admin' ? 'admin' : 'cargoowner', firstName: u.name?.split(' ')[0] || 'User', lastName: u.name?.split(' ').slice(1).join(' ') || '',
        email: u.email, company: u.company, status: u.status || 'active', joined: u.joinedAt || new Date().toISOString()
      }));
      setAllUsers(mappedUsers);
      setAllOffers(await storageService.getOffers());
      setAllMessages(await storageService.getMessages());
      setAllShips(await storageService.getFleet() || []);
      setMarketRates(await storageService.getMarketRates());
      setAdvisories(await storageService.getAdvisories());
      setQuickScans(await storageService.getQuickScans());
      setShipowners(await storageService.getShipowners());
      setIsLoading(false);
  };

  useEffect(() => { refreshData(); }, [activeTab]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      const timer = setTimeout(() => { if (!isAuthenticated) navigate("/login"); else if (!isAdmin) navigate("/dashboard"); }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const sendSystemMessage = (data: any) => {
    storageService.sendMessage(true, 'all', data.message, { subject: data.title, type: 'system' });
    refreshData(); setShowMessageModal(false);
  };

  const deleteMessage = (id: string) => {
    if (window.confirm('Verwijderen?')) { storageService.deleteMessage(id); refreshData(); }
  };

  const toggleUserStatus = (id: string) => { storageService.toggleUserStatus(id); refreshData(); };
  const handleAddVessel = (v: any) => { storageService.addVessel(v); refreshData(); setShowVesselModal(false); };
  const handleDeleteVessel = (id: string) => { if(confirm('Delete?')) { storageService.deleteVessel(id); refreshData(); } };

  const handleAddMarketRate = (rate: any) => { storageService.addMarketRate(rate); refreshData(); };
  const handleUpdateMarketRate = (id: string, data: any) => { storageService.updateMarketRate(id, data); refreshData(); };
  const handleDeleteMarketRate = (id: string) => { if(confirm('Remove?')) { storageService.deleteMarketRate(id); refreshData(); } };
  
  const handleDeleteQuickScan = (id: string) => {
    if (window.confirm('Deze scan verwijderen uit de historie?')) {
        storageService.deleteQuickScan(id);
        refreshData();
    }
  };

  const handleRestoreMarketRates = (newData: any[]) => { 
    storageService.restoreMarketRates(newData); 
    refreshData(); 
    setActiveTab("overview"); 
  };

  const handleAiAssist = async () => {
    if (!selectedAdv) return;
    setIsAiGenerating(true);
    try {
        // FIX: await getGlobalMarketReport and getMarketRates
        const report = await storageService.getGlobalMarketReport();
        const manualRates = await storageService.getMarketRates();
        
        const aiAdvice = await analyzeBrokerQuote(
            selectedAdv.quoteText, 
            report, 
            manualRates, 
            undefined, 
            selectedAdv.aiDraft 
        );
        
        // PERSISTENCE FIX: Save to storage immediately
        storageService.updateAdvisoryDraft(selectedAdv.id, aiAdvice);
        
        setProInsightText(aiAdvice);
        setShowProInsight(true); 
        
        // Update local selected state and trigger UI refresh
        const updatedAdv = {...selectedAdv, proAiDraft: aiAdvice};
        setSelectedAdv(updatedAdv);
        
        // Force refresh the list from storage so sidebar updates
        refreshData();
    } catch (error) {
        console.error("AI Assistant Error:", error);
        alert("Kon geen AI advies genereren op dit moment.");
    } finally {
        setIsAiGenerating(false);
    }
  };

  const handleReleaseAdvice = () => {
    if (!selectedAdv) return;
    storageService.updateAdvisory(selectedAdv.id, expertText);
    storageService.sendMessage(true, selectedAdv.userId, 
        `Your expert advisory for dossier ${selectedAdv.id} has been released.`,
        { subject: `Strategic Advisory Released: ${selectedAdv.id}`, type: 'system' }
    );
    alert("Advies vrijgegeven!");
    setSelectedAdv(null);
    refreshData();
    setActiveTab("overview");
  };

  const handleDeleteAdvisory = (id: string) => {
    if (window.confirm('Verwijderen?')) {
        storageService.deleteAdvisory(id);
        if (selectedAdv?.id === id) setSelectedAdv(null);
        refreshData();
    }
  };

  if (isLoading || !authUser) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" size={48}/></div>;

  const renderOverlay = () => {
    if (selectedOffer) return <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-24 bg-slate-900/60 backdrop-blur-sm"><div className="relative w-full max-w-5xl max-h-[85vh] overflow-hidden bg-white rounded-xl shadow-2xl"><OfferDossierView offer={selectedOffer} onClose={() => { setSelectedOffer(null); refreshData(); }} /></div></div>;
    if (!activeOverlay) return null;
    const components: any = { distance: DistanceTool, stowage: StowageTool, laytime: LaytimeTool, ice: IceTool, da: PortDisbursementEstimator, ets: EtsTool, restrictions: PortRestrictionsTool, holiday: HolidayTool, imsbc: IMSBCTool };
    const Comp = components[activeOverlay];
    if (Comp) return <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-24 bg-slate-900/60 backdrop-blur-sm"><Comp onClose={() => setActiveOverlay(null)} /></div>;
    if (activeOverlay === 'bunkers') return <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-24 bg-slate-900/60 backdrop-blur-sm"><div className="relative w-full max-w-7xl max-h-[85vh] overflow-auto bg-white rounded-xl shadow-2xl"><BunkerPricesPage onClose={() => setActiveOverlay(null)} /></div></div>;
    if (activeOverlay === 'analytics') return <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-24 bg-slate-900/60 backdrop-blur-sm"><div className="relative w-full max-w-7xl max-h-[85vh] overflow-auto bg-white rounded-xl shadow-2xl"><AnalyticsPage onClose={() => setActiveOverlay(null)} /></div></div>;
    if (activeOverlay === 'contracts') return <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-24 bg-slate-900/60 backdrop-blur-sm"><div className="relative w-full max-w-7xl max-h-[85vh] overflow-auto bg-white rounded-xl shadow-2xl"><ContractsPage onClose={() => setActiveOverlay(null)} /></div></div>;
    if (activeOverlay === 'pricing') return <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-24 bg-slate-900/60 backdrop-blur-sm"><div className="relative w-full max-w-7xl max-h-[85vh] overflow-auto bg-white rounded-xl shadow-2xl"><PriceCalculationPage onClose={() => setActiveOverlay(null)} /></div></div>;
    return null;
  };

  const tabs = [
    { id: "overview", label: "Home (Overzicht)" },
    { id: "users", label: "Gebruikers" },
    { id: "cargo", label: "Ladingen / Offers" },
    { id: "ships", label: "Schepen" },
    { id: "shipowners", label: "Shortsea Shipowners" },
    { id: "market_rates", label: "Markt Data" },
    { id: "advisories", label: "Expert Broker Workspace", badge: advisories.filter(a => a.status === 'PENDING').length },
    { id: "quick_scans", label: "AI Quick Scans Log", badge: quickScans.length },
    { id: "documents", label: "Chartering Bescheiden" },
    { id: "messages", label: "Systeem Berichten" },
    { id: "tools", label: "Tools" }
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 pb-20 max-w-[1700px] mx-auto font-sans relative z-10">
      {renderOverlay()}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4"><div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200"><Ship size={32}/></div><div><h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter m-0">Shortsea Europe <span className="text-blue-600">HQ</span></h1><p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Admin Control & Brokerage Desk</p></div></div>
        <div className="flex gap-3"><button onClick={() => navigate('/')} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm">Main Website</button><button onClick={() => { logout(); navigate("/login"); }} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg">Sign Out</button></div>
      </div>
      <div className="flex gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-x-auto">{tabs.map(t => (<button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex-1 min-w-[150px] px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === t.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>{t.label}{t.badge > 0 && (<span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">{t.badge}</span>)}</button>))}</div>

      <div className="animate-fade-in relative">
        {activeTab === "overview" && <AdminOverviewTab allOffers={allOffers} allUsers={allUsers} onTileClick={(k: string) => setActiveOverlay(k)} />}
        {activeTab === "users" && <AdminUsersTab allUsers={allUsers} onToggleUserStatus={toggleUserStatus} />}
        {activeTab === "cargo" && <AdminCargoTab allOffers={allOffers} onSelectOffer={setSelectedOffer} />}
        {activeTab === "ships" && <AdminShipsTab allShips={allShips} onAddVessel={() => setShowVesselModal(true)} onDeleteVessel={handleDeleteVessel} />}
        {activeTab === "market_rates" && <AdminMarketRatesTab rates={marketRates} onAdd={handleAddMarketRate} onUpdate={handleUpdateMarketRate} onDelete={handleDeleteMarketRate} onRestore={handleRestoreMarketRates} onUpdateMarket={() => { refreshData(); setActiveTab("overview"); }} />}
        {activeTab === "shipowners" && <AdminShipownersTab shipowners={shipowners} onDelete={(id) => { storageService.deleteShipowner(id); refreshData(); setActiveTab("overview"); }} />}
        
        {activeTab === "advisories" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[800px] mb-12 animate-fade-in relative z-20">
             <div className="lg:col-span-3 bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[800px]">
                <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                   <h3 className="font-black uppercase text-[10px] text-slate-400 tracking-[0.2em] m-0">Incoming Advisory Queue</h3>
                   <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{advisories.length}</span>
                </div>
                <div className="divide-y overflow-y-auto flex-1">
                   {advisories.map(adv => (
                      <div key={adv.id} onClick={() => { setSelectedAdv(adv); setExpertText(adv.finalAdvice || ""); setProInsightText(adv.proAiDraft || ""); setShowProInsight(!!adv.proAiDraft); }} className={`p-6 cursor-pointer hover:bg-blue-50 transition-all border-l-0 relative group ${selectedAdv?.id === adv.id ? 'bg-blue-50 border-l-[10px] border-blue-600' : ''}`}>
                         <div className="flex justify-between items-center mb-3">
                            <span className="font-black text-slate-800 uppercase tracking-tight text-xs">{adv.userCompany}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteAdvisory(adv.id); }} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 border-none bg-transparent cursor-pointer"><Trash2 size={14}/></button>
                                {adv.proAiDraft && <Sparkles size={12} className="text-blue-600 animate-pulse" />}
                                <span className={`text-[8px] font-black px-2 py-1 rounded uppercase tracking-tighter ${adv.status === 'RELEASED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700 shadow-sm'}`}>{adv.status}</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 text-slate-400 mb-2"><Users size={12}/><span className="text-[10px] font-bold">{adv.userName}</span></div>
                         <div className="space-y-2">
                            <p className="text-[11px] text-slate-500 line-clamp-2 font-mono bg-slate-100 p-3 rounded-xl border border-slate-200 m-0">"{adv.quoteText}"</p>
                            {adv.proAiDraft && <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest m-0 flex items-center gap-1"><ShieldCheck size={10}/> AI Insight Generated</p>}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
             <div className="lg:col-span-9 flex flex-col h-[800px] gap-6 overflow-y-auto pr-2">
                {selectedAdv ? (
                  <div className="flex flex-col gap-6">
                     <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl flex flex-col overflow-hidden relative z-30">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-900 text-white">
                            <div className="flex items-center gap-4"><div className="p-2 bg-blue-600 rounded-lg"><Edit2 size={16}/></div><div><h3 className="font-black text-xs uppercase tracking-widest m-0">Expert Analysis Workspace</h3><p className="text-[9px] font-bold text-slate-400 m-0 uppercase">Dossier #{selectedAdv.id.slice(-6)}</p></div></div>
                            <div className="flex gap-2"><button onClick={handleAiAssist} disabled={isAiGenerating} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-[9px] font-black uppercase rounded-lg transition-all border-none cursor-pointer text-white flex items-center gap-2 disabled:opacity-50">{isAiGenerating ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>} Professional AI Insight</button><button onClick={() => setSelectedAdv(null)} className="p-1.5 hover:bg-white/10 rounded-lg border-none bg-transparent cursor-pointer text-white transition-all"><X size={18}/></button></div>
                        </div>
                        <div className="p-8 space-y-8 bg-white">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner"><div className="flex items-center gap-2 mb-4 text-slate-400 font-black text-[9px] uppercase tracking-widest"><Info size={12}/> Original Broker Quote</div><p className="text-sm font-mono text-slate-600 leading-relaxed m-0 italic">"{selectedAdv.quoteText}"</p></div>
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                <button onClick={() => setShowQuickScan(!showQuickScan)} className="w-full flex justify-between items-center p-4 bg-slate-50 border-none cursor-pointer hover:bg-blue-50 transition-all"><div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-500"><FileSearch size={14} className="text-blue-500"/> AI Quick Scan Advies</div>{showQuickScan ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}</button>
                                {showQuickScan && (<div className="p-6 bg-white whitespace-pre-wrap text-sm font-medium text-slate-600 leading-relaxed italic border-t border-slate-100 animate-fade-in">{selectedAdv.aiDraft || "Geen Quick Scan data gevonden."}</div>)}
                            </div>
                            {proInsightText && (
                                <div className="space-y-4 animate-fade-in">
                                    <button onClick={() => setShowProInsight(!showProInsight)} className="w-full flex justify-between items-center p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl border-none cursor-pointer shadow-lg transform hover:scale-[1.01] transition-all"><div className="flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em]"><Sparkles size={18}/> AI Insight advies</div>{showProInsight ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}</button>
                                    {showProInsight && (<div className="p-10 bg-gradient-to-br from-white to-blue-50 rounded-[2rem] border-2 border-blue-200 shadow-2xl relative overflow-hidden animate-fade-in-up"><div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Globe size={200}/></div><div className="relative z-10 prose prose-slate max-w-none"><div className="flex items-center gap-2 mb-8 border-b border-blue-100 pb-4"><ShieldCheck size={24} className="text-blue-600"/><h4 className="text-xl font-black text-slate-900 m-0 uppercase tracking-tighter">Strategic Intelligence Report</h4></div><div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-lg">{proInsightText}</div><div className="mt-10 pt-6 border-t border-blue-100 flex justify-between items-center"><p className="text-[10px] font-black text-blue-400 uppercase tracking-widest m-0">Protocol: Gemini-3-Pro-Auditor</p><button onClick={() => { navigator.clipboard.writeText(proInsightText); alert('Gekopieerd!'); }} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border-none cursor-pointer hover:bg-blue-200"><Copy size={12}/> Kopieer Inzichten</button></div></div></div>)}
                                </div>
                            )}
                            <div className="relative group mt-6"><div className="absolute -top-3 left-6 px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase rounded-full shadow-lg z-10">Live Expert Response (Final Advice)</div><textarea className="w-full h-[300px] p-8 pt-10 border-2 border-slate-100 rounded-[2rem] font-mono text-sm focus:ring-8 focus:ring-blue-100 focus:border-blue-600 outline-none shadow-inner transition-all resize-none bg-slate-50" value={expertText} onChange={e => setExpertText(e.target.value)} placeholder="Combineer de Quick Scan en AI Insights hier tot een professioneel eindadvies voor de klant..." /></div>
                        </div>
                        <div className="p-8 border-t bg-slate-50 flex justify-end gap-6"><button onClick={handleReleaseAdvice} className="px-10 py-5 bg-green-600 text-white rounded-2xl font-black shadow-2xl hover:bg-green-700 transition-all flex items-center gap-3 border-none cursor-pointer uppercase tracking-widest text-sm transform hover:scale-[1.02]"><CheckCircle size={24}/> Release Final Advice</button></div>
                     </div>
                  </div>
                ) : (<div className="bg-white rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-20 h-full text-center relative shadow-inner"><div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-xl"><Briefcase size={64} className="text-slate-200"/></div><h3 className="text-3xl font-black uppercase tracking-tighter text-slate-400 m-0">Expert Broker Workspace</h3><p className="max-w-md font-bold text-sm opacity-50 mt-4 leading-relaxed m-0">Selecteer een aanvraag uit de wachtrij om te beginnen. U kunt de AI Quick Scan inzien en een Professional Insight genereren voor een Canva-stijl rapport.</p></div>)}
             </div>
          </div>
        )}
        {/* Other tabs remain the same as in your existing file */}
        {activeTab === "quick_scans" && <AdminQuickScansTab scans={quickScans} onDeleteScan={handleDeleteQuickScan} />}
        {activeTab === "documents" && <AdminDocumentsTab onUpdateMarket={() => { refreshData(); setActiveTab("overview"); }} />}
        {activeTab === "messages" && <AdminMessagesTab allMessages={allMessages} onSendMessage={() => setShowMessageModal(true)} onDeleteMessage={deleteMessage} />}
        {activeTab === "tools" && (<div className="space-y-8 relative z-20"><ShipSearchTool /><div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Calculator size={24}/> Tools</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{["distance","stowage","laytime","ice","da","ets"].map(k => (<div key={k} onClick={() => setActiveOverlay(k)} className="p-6 bg-slate-50 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors border border-gray-100 font-bold uppercase text-xs">{k} Tool</div>))}</div></div></div>)}
      </div>
      {showMessageModal && <MessageModal onClose={() => setShowMessageModal(false)} onSendMessage={sendSystemMessage} />}
      {showVesselModal && <AddVesselModal onClose={() => setShowVesselModal(false)} onAdd={handleAddVessel} />}
    </div>
  );
}

// Sub-components as provided in your original AdminDashboard.tsx
function AdminOverviewTab({ allOffers, allUsers, onTileClick }: any) {
  const activeUsersCount = allUsers.filter((u: any) => u.status === 'active').length;
  const openOffersCount = allOffers.filter((o: any) => o.status === 'OPEN').length;
  return (
    <div className="space-y-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start"><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Market Analytics</p><h3 className="text-3xl font-extrabold text-slate-900">Live</h3></div><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BarChart3 size={20}/></div></div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start"><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bunker Prices</p><h3 className="text-3xl font-extrabold text-slate-900">Live</h3></div><div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={20}/></div></div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start"><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Open Offers</p><h3 className="text-3xl font-extrabold text-slate-900">{openOffersCount}</h3></div><div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Zap size={20}/></div></div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start"><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Users</p><h3 className="text-3xl font-extrabold text-slate-900">{activeUsersCount}</h3></div><div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={20}/></div></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Tile icon="🤖" title="AI Matching" desc="Smart matching tussen ladingen en schepen" />
            <Tile icon="📝" title="Contracten" desc="BIMCO-compliant contract generator" onClick={() => onTileClick('contracts')} />
            <Tile icon="📅" title="Prijsberekening" desc="Vrachtprijs calculatie tool" onClick={() => onTileClick('pricing')} />
            <Tile icon="📍" title="Afstandscalculator" desc="Zeeroute en afstand berekening" onClick={() => onTileClick('distance')} />
            <Tile icon="⛽" title="Bunkerprijzen" desc="Live brandstofprijzen en trends" onClick={() => onTileClick('bunkers')} />
            <Tile icon="📊" title="Analytics" desc="Marktinzichten en rapportages" onClick={() => onTileClick('analytics')} />
        </div>
    </div>
  );
}

function AdminUsersTab({ allUsers, onToggleUserStatus }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative z-20">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500"><tr><th className="px-6 py-4">Naam</th><th className="px-6 py-4">Bedrijf</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Acties</th></tr></thead>
        <tbody className="divide-y">{allUsers.map((u:any)=>(<tr key={u.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-bold">{u.firstName} {u.lastName}</td><td className="px-6 py-4">{u.company}</td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${u.status==='suspended'?'bg-red-100 text-red-700':'bg-green-100 text-green-700'}`}>{u.status}</span></td><td className="px-6 py-4 text-right">{u.type!=='admin' && <button onClick={()=>onToggleUserStatus(u.id)} className="text-xs font-bold underline text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer">{u.status==='active'?'Blokkeer':'Deblokkeer'}</button>}</td></tr>))}</tbody>
      </table>
    </div>
  );
}

function AdminCargoTab({ allOffers, onSelectOffer }: any) {
  return (
     <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative z-20">
        <table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500"><tr><th className="px-6 py-4">Datum</th><th className="px-6 py-4">Lading</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actie</th></tr></thead>
           <tbody className="divide-y">{allOffers.map((o:any)=>(<tr key={o.id} className="hover:bg-slate-50 cursor-pointer" onClick={()=>onSelectOffer(o)}><td className="px-6 py-4 text-sm font-medium">{new Date(o.createdAt).toLocaleDateString()}</td><td className="px-6 py-4 font-bold">{o.cargoDetails?.volume}mt {o.cargoDetails?.cargo}</td><td className="px-6 py-4 uppercase text-[10px] font-extrabold tracking-widest"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{"OPEN"}</span></td><td className="px-6 py-4 text-right"><button className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-slate-800 border-none cursor-pointer">Bekijken</button></td></tr>))}</tbody>
        </table>
     </div>
  );
}

function AdminShipsTab({ allShips, onAddVessel, onDeleteVessel }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative z-20">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center"><div><h3 className="font-extrabold text-slate-800">Vlootbeheer</h3></div><button onClick={onAddVessel} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 border-none cursor-pointer">+ Schip Toevoegen</button></div>
        <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs"><tr><th className="px-6 py-4">Naam</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">DWT</th><th className="px-6 py-4 text-right">Acties</th></tr></thead><tbody className="divide-y">{allShips.map((s:any) => (<tr key={s.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-bold">{s.name}</td><td className="px-6 py-4">{s.type}</td><td className="px-6 py-4 font-mono">{s.dwt}</td><td className="px-6 py-4 text-right"><button onClick={()=>onDeleteVessel(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors border-none bg-transparent cursor-pointer"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
    </div>
  );
}

function AdminMarketRatesTab({ rates, onAdd, onUpdate, onDelete, onRestore, onUpdateMarket }: { rates: MarketRateEntry[], onAdd: (r: any) => void, onUpdate: (id: string, d: any) => void, onDelete: (id: string) => void, onRestore: (newData: any[]) => void, onUpdateMarket: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], loadPort: '', dischargePort: '', cargoType: '', freightRate: '', tonnage: '' });
  const [isUpdatingMarket, setIsUpdatingMarket] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const data = { ...form, freightRate: parseFloat(form.freightRate), volume: parseFloat(form.tonnage) }; if (editingId) { onUpdate(editingId, data); setEditingId(null); } else { onAdd(data); } setForm({ date: new Date().toISOString().split('T')[0], loadPort: '', dischargePort: '', cargoType: '', freightRate: '', tonnage: '' }); };
  const handleEdit = (r: MarketRateEntry) => { setEditingId(r.id); setForm({ date: r.date, loadPort: r.loadPort, dischargePort: r.dischargePort, cargoType: r.cargoType, freightRate: r.freightRate.toString(), tonnage: (r.volume || r.tonnage || '').toString() }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleBackup = () => { const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rates, null, 2)); const downloadAnchorNode = document.createElement('a'); downloadAnchorNode.setAttribute("href", dataStr); downloadAnchorNode.setAttribute("download", "fixtures_backup.json"); document.body.appendChild(downloadAnchorNode); downloadAnchorNode.click(); downloadAnchorNode.remove(); };
  const handleRestoreClick = () => { fileInputRef.current?.click(); };
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event) => { try { const json = JSON.parse(event.target?.result as string); if (Array.isArray(json)) { if (confirm('Backup herstellen?')) { onRestore(json); alert('Data hersteld!'); } } } catch (err) { alert('Fout bij het lezen van bestand.'); } }; reader.readAsDataURL(file); e.target.value = ''; };
  const handleUpdateMarketData = async () => { setIsUpdatingMarket(true); try { const freshReport = await generateMarketReport(); if (freshReport) { await storageService.saveGlobalMarketReport(freshReport); alert("Marktgegevens succesvol bijgewerkt via AI Web Scan!"); onUpdateMarket(); } } catch (error) { alert("Update mislukt."); } finally { setIsUpdatingMarket(false); } };
  return (
      <div className="space-y-6 relative z-20">
          <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200"><div className="flex items-center gap-4"><div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><RefreshCw className={`${isUpdatingMarket ? 'animate-spin' : ''}`} size={32}/></div><div><h3 className="text-xl font-black text-slate-800">Opgeslagen Markt Referenties</h3><p className="text-sm text-slate-500 font-medium">Human-in-the-Loop Markt Intelligence & Web Sync.</p></div></div><div className="flex gap-3"><button onClick={handleUpdateMarketData} disabled={isUpdatingMarket} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-700 shadow-lg border-none cursor-pointer disabled:opacity-50"><RefreshCw className={`${isUpdatingMarket ? 'animate-spin' : ''}`} size={14}/> {isUpdatingMarket ? 'Verversen...' : 'Ververs Markt Data'}</button><button onClick={handleBackup} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-black shadow-lg border-none cursor-pointer"><Download size={14}/> Backup Data</button><button onClick={handleRestoreClick} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-50 shadow-sm cursor-pointer"><Upload size={14}/> Herstel Data<input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileRestore} /></button></div></div>
          <div className={`bg-white p-8 rounded-2xl shadow-md border-2 transition-all ${editingId ? 'border-blue-500 bg-blue-50/20' : 'border-gray-100'}`}><form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-6 items-end"><div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Datum</label><input type="date" required className="w-full border border-slate-200 p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} /></div><div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Loading Port</label><input required className="w-full border border-slate-200 p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={form.loadPort} onChange={e=>setForm({...form, loadPort: e.target.value})} /></div><div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Disch Port</label><input required className="w-full border border-slate-200 p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={form.dischargePort} onChange={e=>setForm({...form, dischargePort: e.target.value})} /></div><div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cargo</label><input required className="w-full border border-slate-200 p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400" value={form.cargoType} onChange={e=>setForm({...form, cargoType: e.target.value})} /></div><div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tonnage</label><input required type="number" className="w-full border border-slate-200 p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-mono" value={form.tonnage} onChange={e=>setForm({...form, tonnage: e.target.value})} /></div><div className="flex gap-2"><div className="flex-1"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rate (€)</label><input type="number" step="0.5" required className="w-full border border-slate-200 p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={form.freightRate} onChange={e=>setForm({...form, freightRate: e.target.value})} /></div><button type="submit" className={`px-4 rounded-lg font-black text-white border-none cursor-pointer transition-all ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>{editingId ? 'Save' : '+'}</button></div></form></div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b"><tr><th className="px-6 py-4">Datum</th><th className="px-6 py-4">Route</th><th className="px-6 py-4">Lading</th><th className="px-6 py-4">Tonnage</th><th className="px-6 py-4">Tarief</th><th className="px-6 py-4 text-right">Actie</th></tr></thead><tbody className="divide-y divide-slate-100">{rates.map(r => (<tr key={r.id} className={`hover:bg-blue-50/50 transition-colors ${editingId === r.id ? 'bg-blue-50' : ''}`}><td className="px-6 py-4 text-slate-500 font-medium">{r.date}</td><td className="px-6 py-4 font-black text-slate-800">{r.loadPort} <span className="text-slate-300 font-normal mx-2">➝</span> {r.dischargePort}</td><td className="px-6 py-4 font-bold text-slate-600">{r.cargoType}</td><td className="px-6 py-4 font-mono text-slate-500 font-bold">{r.volume || (r as any).tonnage || '-'} mt</td><td className="px-6 py-4 font-mono font-black text-blue-700 text-base">€{r.freightRate}</td><td className="px-6 py-4 text-right flex justify-end gap-1"><button onClick={()=>handleEdit(r)} className="bg-white p-2 border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm cursor-pointer"><Edit2 size={16}/></button><button onClick={()=>onDelete(r.id)} className="bg-white p-2 border border-slate-200 rounded-lg text-red-400 hover:bg-red-50 hover:text-white transition-all shadow-sm cursor-pointer"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
      </div>
  );
}

function AdminQuickScansTab({ scans, onDeleteScan }: { scans: any[], onDeleteScan: (id: string) => void }) {
    const [selected, setSelected] = useState<any>(null);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[700px] mb-12 animate-fade-in relative z-20">
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col h-[700px] overflow-hidden"><div className="p-6 border-b bg-slate-50 font-black text-[10px] uppercase tracking-widest text-slate-400">AI Instant Scans Log</div><div className="divide-y overflow-y-auto flex-1">{scans.map(s => (<div key={s.id} onClick={() => setSelected(s)} className={`p-6 cursor-pointer hover:bg-blue-50 transition-all relative group ${selected?.id === s.id ? 'bg-blue-50 border-l-[6px] border-blue-600' : ''}`}><div className="flex justify-between mb-2"><span className="font-black text-slate-800 text-xs uppercase tracking-tight">{s.userCompany}</span><div className="flex items-center gap-2"><button onClick={(e) => { e.stopPropagation(); onDeleteScan(s.id); }} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 border-none bg-transparent cursor-pointer"><Trash2 size={12}/></button><span className="text-[9px] font-bold text-slate-400">{new Date(s.timestamp).toLocaleString()}</span></div></div><p className="text-[10px] font-bold text-slate-500 m-0 uppercase">{s.userName}</p><p className="text-[11px] text-slate-400 line-clamp-1 italic mt-1 m-0">Quote: {s.quote}</p></div>))}</div></div>
            <div className="lg:col-span-8 h-[700px]">{selected ? (<div className="bg-white rounded-3xl border border-slate-200 shadow-2xl h-full flex flex-col overflow-hidden relative z-30"><div className="p-6 border-b bg-slate-900 text-white flex justify-between items-center"><div className="flex items-center gap-3"><History size={20}/><h3 className="font-black text-xs uppercase tracking-widest m-0">Scan Archive Dossier</h3></div><button onClick={() => setSelected(null)} className="p-1 hover:bg-white/10 rounded-lg border-none bg-transparent cursor-pointer text-white"><X size={18}/></button></div><div className="p-8 overflow-y-auto flex-1 space-y-8 bg-white"><div className="bg-slate-50 p-6 rounded-2xl border border-slate-200"><p className="font-black text-[9px] uppercase text-slate-400 mb-2 m-0">Input Quote</p><p className="text-sm font-mono text-slate-600 italic m-0">"{selected.quote}"</p></div><div><p className="font-black text-[9px] uppercase text-blue-600 mb-4 tracking-widest m-0 border-b pb-2">AI Generated Advice (Plain Text)</p><div className="whitespace-pre-wrap text-sm font-medium text-slate-700 leading-relaxed bg-blue-50/20 p-6 rounded-2xl border border-blue-50">{selected.result}</div></div></div></div>) : (<div className="bg-white rounded-3xl border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-20 h-full text-center shadow-inner relative z-20"><History size={64} className="opacity-20 mb-6"/><h3 className="text-xl font-black uppercase tracking-widest opacity-60 m-0">Archive Viewer</h3></div>)}</div>
        </div>
    );
}

function AdminDocumentsTab({ onUpdateMarket }: { onUpdateMarket: () => void }) {
  const navigate = useNavigate();
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const [isUpdatingMarket, setIsUpdatingMarket] = useState(false);
  const handleUpdateMarketData = async () => { setIsUpdatingMarket(true); try { const freshReport = await generateMarketReport(); if (freshReport) { await storageService.saveGlobalMarketReport(freshReport); alert("Marktgegevens succesvol bijgewerkt via AI Web Scan!"); onUpdateMarket(); } } catch (error) { alert("Update mislukt."); } finally { setIsUpdatingMarket(false); } };
  return (
    <div className="space-y-8 animate-fade-in no-print pb-20 relative z-20">
       <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200"><div><h3 className="text-xl font-black text-slate-800 m-0 uppercase tracking-tighter">Market Benchmarking Engine</h3><p className="text-xs font-bold text-slate-400 uppercase mt-1">Geforceerde Web-Scan Update</p></div><button onClick={handleUpdateMarketData} disabled={isUpdatingMarket} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all border-none cursor-pointer shadow-lg disabled:opacity-50">{isUpdatingMarket ? <Loader2 className="animate-spin" size={18}/> : <RefreshCw size={18}/>}{isUpdatingMarket ? 'Scanning Global Port Data...' : 'Start Global AI Market Scan'}</button></div>
       {!activeDoc ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div onClick={()=>setActiveDoc('gencon')} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"><div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><FileSignature size={24}/></div><h4 className="text-lg font-black text-slate-900 m-0 uppercase tracking-tight">GENCON 94 (BIMCO)</h4></div></div>) : (<div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-200 animate-fade-in relative"><button onClick={()=>setActiveDoc(null)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full border-none bg-transparent cursor-pointer text-slate-400 transition-all"><X size={24}/></button><div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100"><div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><FileSignature size={28}/></div><h2 className="text-2xl font-black text-slate-900 m-0 uppercase tracking-tighter">GENCON 94 BOX LAYOUT</h2></div></div>)}
    </div>
  );
}

function AdminShipownersTab({ shipowners, onDelete }: { shipowners: Shipowner[], onDelete: (id: string) => void }) {
    const [searchTerm, setSearchTerm] = useState("");
    const sortedData = shipowners.filter(item => item.owner.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
        <div className="space-y-6 animate-fade-in relative z-20">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"><div className="flex flex-col md:flex-row justify-between items-center gap-4"><div className="flex items-center gap-4"><div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg"><Briefcase size={32}/></div><div><h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Shortsea Shipowners Directory</h3></div></div><div className="relative w-full md:w-80"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" placeholder="Zoek eigenaar..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div></div></div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-slate-900 text-white text-[10px] uppercase font-black tracking-widest border-b"><tr><th className="px-6 py-4">Owner</th><th className="px-6 py-4">PIC</th><th className="px-6 py-4">Tel</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Action</th></tr></thead><tbody className="divide-y">{sortedData.map((owner) => (<tr key={owner.id}><td className="px-6 py-4 font-black">{owner.owner}</td><td className="px-6 py-4">{owner.contact}</td><td className="px-6 py-4">{owner.tel}</td><td className="px-6 py-4">{owner.email}</td><td className="px-6 py-4"><button onClick={() => onDelete(owner.id)} className="p-2 text-slate-300 hover:text-red-600 border-none bg-transparent cursor-pointer"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
        </div>
    );
}

function AdminMessagesTab({ allMessages, onSendMessage, onDeleteMessage }: any) {
  return (
     <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm relative z-20"><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-extrabold text-slate-800">Systeemberichten</h3><button onClick={onSendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 border-none cursor-pointer">+ Nieuw Bericht</button></div><div className="space-y-4">{allMessages.map((m:any)=>(<div key={m.id} className="p-4 border border-gray-100 bg-slate-50 rounded-xl flex justify-between items-start"><div><div className="font-bold text-slate-800 mb-1">{m.subject}</div><div className="text-sm text-slate-500">{m.content}</div></div><button onClick={()=>onDeleteMessage(m.id)} className="text-slate-300 hover:text-red-500 p-1 border-none bg-transparent cursor-pointer"><Trash2 size={16}/></button></div>))}</div></div>
  );
}

function MessageModal({ onClose, onSendMessage }: any) {
  const [t, setT] = useState(''); const [m, setM] = useState('');
  return (
     <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"><div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-in-up"><h3 className="text-xl font-extrabold text-slate-900 mb-6">Broadcast Verzenden</h3><div className="space-y-4"><input placeholder="Onderwerp" value={t} onChange={e=>setT(e.target.value)} className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/><textarea rows={5} placeholder="Uw bericht..." value={m} onChange={e=>setM(e.target.value)} className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/><div className="flex gap-2 pt-2"><button onClick={()=>onSendMessage({title:t, message:m})} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 border-none cursor-pointer">Verstuur</button><button onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 border-none cursor-pointer">Annuleren</button></div></div></div></div>
  );
}

function AddVesselModal({ onClose, onAdd }: any) {
   const [form, setForm] = useState({ name: '', type: 'Coaster', dwt: '', status: 'Available' });
   return (
       <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in-up"><h3 className="text-xl font-extrabold text-slate-900 mb-6">Nieuw Schip Toevoegen</h3><form onSubmit={e=>{e.preventDefault(); onAdd(form);}} className="space-y-4"><input required placeholder="Scheepsnaam" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border border-gray-200 p-3 rounded-lg"/><input required placeholder="DWT" type="number" value={form.dwt} onChange={e=>setForm({...form, dwt:e.target.value})} className="w-full border border-gray-200 p-3 rounded-lg"/><div className="flex gap-2 pt-4"><button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 border-none cursor-pointer">Opslaan</button><button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 border-none cursor-pointer">Annuleren</button></div></form></div></div>
   );
}

function OfferDossierView({ offer, onClose }: { offer: Offer, onClose: () => void }) {
  return (
      <div className="flex h-full flex-col bg-white relative z-[65]"><div className="p-6 border-b flex justify-between items-center bg-slate-900 text-white"><div><h2 className="text-xl font-bold">Offer Dossier #{offer.id.slice(-6)}</h2></div><button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full border-none bg-transparent cursor-pointer text-white"><X/></button></div><div className="flex flex-1 overflow-hidden"><div className="w-1/3 border-r bg-slate-50 p-6 overflow-y-auto">Details View...</div><div className="flex-1 flex flex-col bg-[#f0f4f8]">Correspondence...</div></div></div>
  );
}

function ShipSearchTool() {
  const [ld, setLd] = useState(false);
  const handleSrch = async () => { setLd(true); await findRealTimeShips("North Sea", 3000, 15000); setLd(false); };
  return (<div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 relative z-20"><button onClick={handleSrch} disabled={ld} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold border-none cursor-pointer">{ld ? "Zoeken..." : "Zoek Schepen"}</button></div>);
}

function Tile({ icon, title, desc, onClick }: { icon: string, title: string, desc: string, onClick?: () => void }) {
  return (<div onClick={onClick} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md transition-all group relative z-20"><div className="text-4xl bg-slate-50 w-16 h-16 flex items-center justify-center rounded-2xl">{icon}</div><div><h4 className="text-lg font-extrabold text-slate-900 mb-1">{title}</h4><p className="text-sm text-slate-500">{desc}</p></div></div>);
}
