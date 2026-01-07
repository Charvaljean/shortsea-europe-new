import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { AdvisoryRequest, Message } from '../types';
import { 
  Clock, ShieldCheck, X, FileText, Lock, CheckCircle, 
  Loader2, Send, ChevronRight, LayoutDashboard, Zap, 
  MessageSquare, User, History, ArrowRight, Download, 
  Bell, Building2, Mail, ExternalLink, Trash2, FileSpreadsheet,
  UserCheck, Ship, Box
} from 'lucide-react';
import { useLanguage } from '../App';
// Fix: Added Link to imports from react-router-dom
import { useNavigate, Link } from 'react-router-dom';

type PortalTab = 'overview' | 'scans' | 'advisories' | 'messages' | 'profile';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<PortalTab>('overview');
  const [advisories, setAdvisories] = useState<AdvisoryRequest[]>([]);
  const [quickScans, setQuickScans] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [selectedAdv, setSelectedAdv] = useState<AdvisoryRequest | null>(null);
  const [selectedScan, setSelectedScan] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
          const [advs, scans, msgs] = await Promise.all([
            storageService.getAdvisories(),
            storageService.getQuickScans(),
            storageService.getMessages()
          ]);
          setAdvisories(advs.filter(a => a.userId === user.id));
          setQuickScans(scans.filter(s => s.userId === user.id));
          setMessages(msgs.filter(m => m.userId === user.id || m.userId === 'all'));
      }
    };
    loadData();
  }, [user, activeTab]);

  if (!user) return null;

  const handleRequestExpert = async (scan: any) => {
    const newReq: AdvisoryRequest = {
        id: 'adv_' + Date.now(), 
        userId: user.id, 
        userName: user.name,
        userCompany: user.company, 
        quoteText: scan.quote, 
        serviceType: 'EXPERT_PREMIUM',
        status: 'PENDING', 
        aiDraft: scan.result,
        timestamp: new Date().toISOString()
    };
    await storageService.saveAdvisory(newReq);
    alert(language === 'nl' ? "Expert aanvraag ingediend! U vindt deze onder 'Advisory'." : "Expert request submitted! You can find it under 'Advisory'.");
    setActiveTab('advisories');
    setSelectedScan(null);
    setSelectedAdv(newReq);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><LayoutDashboard size={120}/></div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 m-0 uppercase tracking-tighter">{t.dbWelcome.replace('{{name}}', user.name.split(' ')[0])}</h2>
                    <p className="text-slate-500 font-bold text-sm m-0">
                        {t.dbSummary
                            .replace('{{msgCount}}', messages.length.toString())
                            .replace('{{advCount}}', advisories.filter(a => a.status === 'PENDING').length.toString())
                        }
                    </p>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => navigate('/insights?tab=analyzer')} className="px-6 py-3 bg-[#1e5aa0] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg border-none cursor-pointer flex items-center gap-2"><Zap size={14}/> {t.dbNewScan}</button>
                   <button onClick={() => navigate('/request-offer')} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg border-none cursor-pointer flex items-center gap-2"><FileText size={14}/> {t.dbReqAdvice}</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Zap size={24}/></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">{t.dbTotalScans}</p><p className="text-2xl font-black text-slate-900 m-0">{quickScans.length}</p></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-green-200 transition-colors">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><ShieldCheck size={24}/></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">{t.dbExpertReports}</p><p className="text-2xl font-black text-slate-900 m-0">{advisories.length}</p></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-purple-200 transition-colors">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><MessageSquare size={24}/></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">{t.dbHqMessages}</p><p className="text-2xl font-black text-slate-900 m-0">{messages.length}</p></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6 border-b pb-4 border-slate-50">
                        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 m-0 flex items-center gap-2"><Zap size={16} className="text-blue-600"/> {t.dbRecentScans}</h3>
                        <button onClick={() => setActiveTab('scans')} className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline border-none bg-transparent cursor-pointer">{t.dbViewAll}</button>
                    </div>
                    <div className="space-y-4">
                        {quickScans.length === 0 ? <p className="text-slate-400 italic text-sm py-4">{t.dbNoScans}</p> : quickScans.slice(0, 3).map(s => (
                            <div key={s.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center group hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer" onClick={() => setSelectedScan(s)}>
                                <div className="truncate pr-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{new Date(s.timestamp).toLocaleDateString()}</p>
                                    <p className="text-xs font-black text-slate-700 m-0 truncate">{s.quote.slice(0, 40)}...</p>
                                </div>
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors"/>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6 border-b pb-4 border-slate-50">
                        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 m-0 flex items-center gap-2"><Bell size={16} className="text-blue-600"/> {t.dbHqNotifs}</h3>
                        <button onClick={() => setActiveTab('messages')} className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline border-none bg-transparent cursor-pointer">{t.dbInbox}</button>
                    </div>
                    <div className="space-y-4">
                        {messages.length === 0 ? <p className="text-slate-400 italic text-sm py-4">{t.dbNoMsgs}</p> : messages.slice(0, 3).map(m => (
                            <div key={m.id} className="flex gap-4 items-start p-4 rounded-xl hover:bg-blue-50/30 transition-colors">
                                <div className="mt-1 w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 shadow-sm"/>
                                <div><p className="text-xs font-black text-slate-800 m-0 uppercase tracking-tight">{m.subject}</p><p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-medium">{m.content}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        );

      case 'scans':
        return (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-end mb-6">
                <div><h2 className="text-2xl font-black text-slate-900 m-0 uppercase tracking-tighter">{t.dbScanHist}</h2><p className="text-slate-500 font-bold text-sm m-0">{t.dbScanHistDesc}</p></div>
                <button onClick={() => navigate('/insights?tab=analyzer')} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg border-none cursor-pointer flex items-center gap-2"><Zap size={14}/> {t.dbNewScan}</button>
             </div>
             <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b"><tr><th className="px-8 py-5">{t.dbColDate}</th><th className="px-8 py-5">{t.dbColQuote}</th><th className="px-8 py-5">{t.dbColStatus}</th><th className="px-8 py-5 text-right">{t.dbColAction}</th></tr></thead><tbody className="divide-y divide-slate-100">{quickScans.map(s => (<tr key={s.id} className="hover:bg-blue-50/30 transition-colors"><td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(s.timestamp).toLocaleDateString()}</td><td className="px-8 py-5 font-black text-slate-800 text-xs truncate max-w-xs">{s.quote.slice(0, 60)}...</td><td className="px-8 py-5"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter shadow-sm">{t.dbStatusComp}</span></td><td className="px-8 py-5 text-right"><div className="flex justify-end gap-3"><button onClick={() => setSelectedScan(s)} className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline border-none bg-transparent cursor-pointer">{t.dbViewAdvice} &rarr;</button><button onClick={() => handleRequestExpert(s)} className="text-purple-600 font-black text-[10px] uppercase tracking-widest hover:underline border-none bg-transparent cursor-pointer flex items-center gap-1"><UserCheck size={12}/> {t.dbReqExpert}</button></div></td></tr>))}</tbody></table></div>
          </div>
        );

      case 'advisories':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in h-[700px]">
              <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
                  <div className="p-6 border-b bg-slate-50 flex justify-between items-center"><h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 m-0">{t.dbExpertDossiers}</h3><span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{advisories.length}</span></div>
                  <div className="overflow-y-auto flex-1 divide-y divide-slate-50">{advisories.map(a => (<div key={a.id} onClick={() => setSelectedAdv(a)} className={`p-6 cursor-pointer hover:bg-blue-50 transition-all flex justify-between items-center group border-l-[6px] ${selectedAdv?.id === a.id ? 'bg-blue-50 border-blue-600' : 'border-transparent'}`}><div className="truncate"><div className="flex items-center gap-2 mb-2"><span className={`w-2 h-2 rounded-full ${a.status==='RELEASED'?'bg-green-600':'bg-orange-500 shadow-sm shadow-orange-200 animate-pulse'}`}/><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(a.timestamp).toLocaleDateString()}</span></div><p className="text-xs font-black text-slate-700 m-0 uppercase truncate pr-4">{a.serviceType.replace('_', ' ')}</p></div><ChevronRight className={selectedAdv?.id === a.id ? 'text-blue-600' : 'text-slate-300'} size={16}/></div>))}</div>
              </div>
              <div className="lg:col-span-8 h-full">
                  {selectedAdv ? (
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl h-full flex flex-col overflow-hidden relative"><div className="p-8 border-b bg-slate-900 text-white flex justify-between items-center"><div className="flex items-center gap-5"><div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40"><ShieldCheck size={28}/></div><div><h2 className="text-xl font-black m-0 uppercase tracking-tighter">{t.dbCharterAdvice}</h2><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest m-0">{t.dbDossier}: {selectedAdv.id.toUpperCase()}</p></div></div><button onClick={() => setSelectedAdv(null)} className="p-2 hover:bg-white/10 rounded-full text-white border-none bg-transparent cursor-pointer transition-all"><X size={24}/></button></div><div className="p-10 overflow-y-auto flex-1 bg-slate-50/30">{selectedAdv.status === 'PENDING' ? (<div className="flex flex-col items-center justify-center py-20 animate-fade-in"><div className="w-24 h-24 border-8 border-orange-500/20 border-t-orange-500 rounded-full mb-8 animate-spin" /><h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4">{t.dbReviewProgress}</h3><p className="text-slate-500 font-bold text-lg max-w-xl mx-auto leading-relaxed text-center">{t.dbReviewDesc}</p></div>) : (<div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-lg animate-fade-in-up">{selectedAdv.finalAdvice}</div>)}</div></div>
                  ) : (
                    <div className="bg-white rounded-[3rem] border-4 border-dashed border-slate-200 h-full flex flex-col items-center justify-center text-slate-400 text-center p-20 shadow-inner"><div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-xl"><FileText size={80} className="opacity-10"/></div><h3 className="text-2xl font-black uppercase tracking-widest opacity-60 m-0">{t.dbHqDash}</h3><p className="max-w-xs font-bold text-sm opacity-50 mt-4 leading-relaxed m-0">{t.dbSelectDossier}</p></div>
                  )}
              </div>
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-8 animate-fade-in">
             <div><h2 className="text-2xl font-black text-slate-900 m-0 uppercase tracking-tighter">{t.dbHqComm}</h2><p className="text-slate-500 font-bold text-sm m-0">{t.dbHqCommDesc}</p></div>
             <div className="grid grid-cols-1 gap-6">{messages.length === 0 ? (<div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center"><Bell size={48} className="mx-auto text-slate-200 mb-4"/><p className="text-slate-400 font-black uppercase tracking-widest">No secure messages yet.</p></div>) : messages.map(m => (<div key={m.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-start group hover:border-blue-200 transition-all"><div className="p-4 bg-blue-50 text-blue-600 rounded-2xl flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><MessageSquare size={24}/></div><div className="flex-1"><div className="flex justify-between items-start mb-2"><h4 className="text-lg font-black text-slate-900 uppercase tracking-tight m-0">{m.subject}</h4><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(m.timestamp).toLocaleString()}</span></div><p className="text-slate-600 leading-relaxed font-medium m-0">{m.content}</p></div></div>))}</div>
          </div>
        );

      case 'profile':
        return (
          <div className="max-w-3xl animate-fade-in space-y-8">
             <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"><div className="p-8 border-b bg-slate-50 flex items-center gap-6"><div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center text-4xl font-black shadow-xl shadow-blue-900/40">{user.name[0]}</div><div><h2 className="text-2xl font-black text-slate-900 m-0 uppercase tracking-tighter">{user.name}</h2><p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mt-1">{user.subscriptionPlan} {t.dbAccountMember}</p></div></div><div className="p-10 space-y-8"><div className="grid grid-cols-1 md:grid-cols-2 gap-10"><div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Building2 size={12}/> {t.dbCompany}</label><p className="text-lg font-bold text-slate-800 m-0">{user.company}</p></div><div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Mail size={12}/> {t.dbEmail}</label><p className="text-lg font-bold text-slate-800 m-0">{user.email}</p></div><div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> {t.dbMemberSince}</label><p className="text-lg font-bold text-slate-800 m-0">{new Date(user.joinedAt).toLocaleDateString()}</p></div><div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={12}/> {t.dbVerifyStatus}</label><div className="flex items-center gap-2"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Verified Identity</span></div></div></div></div><div className="p-8 border-t bg-slate-50 flex justify-between items-center"><p className="text-[10px] font-bold text-slate-400 uppercase max-w-xs leading-relaxed m-0 italic">{t.dbEncryptedNote}</p><button onClick={logout} className="px-6 py-2 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest border-none cursor-pointer hover:bg-red-100 transition-colors">Sign Out</button></div></div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col h-auto md:h-screen sticky top-0 no-print z-50 shadow-sm">
         <div className="p-8 border-b hidden md:block">
            {/* Fix: Link component is now properly imported */}
            <Link to="/" className="flex items-center space-x-3 no-underline group mb-1"><div className="p-2 bg-blue-600 rounded-lg text-white group-hover:scale-105 transition-transform shadow-md"><Ship size={20} /></div><div className="font-black text-sm tracking-tighter text-slate-900 uppercase">SHORTSEA <span className="text-blue-600">PRO</span></div></Link>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{t.dbPortalSubtitle}</p>
         </div>
         <nav className="p-6 flex-1 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar">
            <SidebarLink icon={<LayoutDashboard size={18}/>} label={t.dbNavOverview} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <SidebarLink icon={<Zap size={18}/>} label={t.dbNavScans} active={activeTab === 'scans'} onClick={() => setActiveTab('scans')} />
            <SidebarLink icon={<ShieldCheck size={18}/>} label={t.dbNavAdvisory} active={activeTab === 'advisories'} onClick={() => setActiveTab('advisories')} />
            <SidebarLink icon={<MessageSquare size={18}/>} label={t.dbNavMessages} active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
            <div className="hidden md:block my-4 border-t border-slate-50"/>
            <SidebarLink icon={<User size={18}/>} label={t.dbNavProfile} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
         </nav>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-x-hidden relative">
          {renderContent()}
      </main>

      {selectedScan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in no-print">
            <div className="bg-white rounded-[2.5rem] w-full max-w-6xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in-up border border-slate-200">
                <div className="p-8 border-b bg-slate-900 text-white flex justify-between items-center"><div className="flex items-center gap-4"><div className="p-3 bg-blue-600 rounded-2xl shadow-lg"><History size={24}/></div><div><h2 className="text-xl font-black m-0 uppercase tracking-tighter">{t.dbArchiveTitle}</h2><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest m-0">{t.dbRef}: {selectedScan.id.toUpperCase()}</p></div></div><div className="flex items-center gap-3"><button onClick={()=>window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer"><Download size={14}/> PDF Report</button><div className="w-px h-8 bg-white/20 mx-2"/><button onClick={() => setSelectedScan(null)} className="p-2 hover:bg-white/10 rounded-full text-white border-none bg-transparent cursor-pointer transition-all"><X size={24}/></button></div></div>
                <div className="p-10 overflow-y-auto flex-1 bg-white"><div className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-200"><h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 m-0 flex items-center gap-2"><ArrowRight size={12} className="text-blue-600"/> {t.dbOrigQuote}</h4><p className="text-sm font-mono text-slate-600 italic m-0">"{selectedScan.quote}"</p></div><h4 className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-6 m-0 border-b pb-2">{t.advisoryTitle}</h4><div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-base pt-2">{selectedScan.result}</div></div>
            </div>
        </div>
      )}
    </div>
  );
};

interface SidebarLinkProps { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; }
const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-none cursor-pointer whitespace-nowrap md:w-full ${active ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100 shadow-blue-50' : 'bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
        <span className={active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-900'}>{icon}</span>
        <span>{label}</span>
    </button>
);

export default Dashboard;