import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../App';
import { useAuth as useAuthContext } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import CargoForm from '../components/CargoForm';
import MapComponent from '../components/MapComponent';
import PaywallModal from '../components/PaywallModal'; 
import { QuoteResult } from '../types';
import { 
  X, Ship, DollarSign, Anchor, CheckCircle2, 
  ClipboardCheck, Handshake,
  Zap, Loader2, Calculator, ArrowRight, AlertTriangle, ShieldCheck, History,
  TrendingUp, BarChart3, Globe, Shield, Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const FREE_LIMIT = 2;
const CONSISTENCY_THRESHOLD_HOURS = 72;

const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [viewMode, setViewMode] = useState<'kiel' | 'skagen' | 'direct'>('direct');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [randomSnippet, setRandomSnippet] = useState("");
  const [isCheckingHistory, setIsCheckingHistory] = useState(false);
  
  const resultRef = useRef<HTMLDivElement>(null);

  const snippets = [
    { en: "Charterer Alert: Baltic tonnage supply increasing, downward rate pressure likely.", nl: "Charterer Alert: Aanbod van Baltic tonnage stijgt, neerwaartse druk op tarieven verwacht." },
    { en: "Negotiation Tip: LSMGO prices in Rotterdam down 4% - factor this into your offers.", nl: "Onderhandelingstip: LSMGO prijzen in Rotterdam 4% gedaald - neem dit mee in uw biedingen." },
    { en: "Market Intel: 3000dwt units in North Sea are currently seeking backloads.", nl: "Markt Intel: 3000dwt eenheden in de Noordzee zoeken momenteel actief naar retourlading." },
    { en: "Cost Saving: Ships under 5000 GT are exempted from EU ETS. Verify your vessel size.", nl: "Kostenbesparing: Schepen onder 5000 GT zijn vrijgesteld van EU ETS. Controleer uw scheepsgrootte." }
  ];

  useEffect(() => {
    const s = snippets[Math.floor(Math.random() * snippets.length)];
    setRandomSnippet(language === 'nl' ? s.nl : s.en);
  }, [language]);

  const checkUsageAndOpenForm = async () => {
    const count = await storageService.getUsageCount(user?.id);
    const isPro = user?.subscriptionPlan === 'pro' || user?.subscriptionPlan === 'enterprise' || user?.role === 'admin';
    if (count >= FREE_LIMIT && !isPro) {
        setShowPaywall(true);
    } else {
        setIsFormOpen(true);
    }
  };

  const handleStartRequest = () => {
    checkUsageAndOpenForm();
  };

  const handleQuoteReceived = async (result: QuoteResult) => {
    const count = await storageService.getUsageCount(user?.id);
    const isPro = user?.subscriptionPlan === 'pro' || user?.subscriptionPlan === 'enterprise' || user?.role === 'admin';
    
    if (count >= FREE_LIMIT && !isPro) {
        setIsFormOpen(false);
        setShowPaywall(true);
        return;
    }

    setQuote(result);
    const hasValidAlt = !!(result.skagenAlternative && result.skagenAlternative.distance > 0);
    setViewMode(hasValidAlt ? 'kiel' : 'direct');
    
    await storageService.logActivity(user?.id || 'guest', user?.name || 'Guest', 'QUOTE_CALCULATION', `${result.routeDetails?.origin?.name} to ${result.routeDetails?.destination?.name}`, result);
    
    await storageService.saveQuickScan({
        userId: user?.id || 'guest',
        userName: user?.name || 'Guest',
        userCompany: user?.company || 'N/A',
        quote: `Route: ${result.routeDetails?.origin?.name}-${result.routeDetails?.destination?.name} (${result.estimatedRateLow}-${result.estimatedRateHigh})`,
        result: JSON.stringify(result) 
    });

    setIsFormOpen(false); 
    setTimeout(() => { resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
  };

  // --- CASCADING SEARCH & CONSISTENCY CHECK ---
  const handleInterceptRequest = async (request: any) => {
      setIsCheckingHistory(true);
      try {
          const scans = await storageService.getQuickScans();
          const routeKey = `Route: ${request.loadPort}-${request.dischargePort}`;
          
          const recentMatch = scans.find(s => {
              const age = (Date.now() - new Date(s.timestamp).getTime()) / (1000 * 60 * 60);
              return s.quote.startsWith(routeKey) && age <= CONSISTENCY_THRESHOLD_HOURS;
          });

          if (recentMatch) {
              try {
                  const cachedResult = JSON.parse(recentMatch.result);
                  handleQuoteReceived(cachedResult);
                  return true; 
              } catch (e) {
                  return false; 
              }
          }
      } catch (e) {
          console.error("History check failed", e);
      } finally {
          setIsCheckingHistory(false);
      }
      return false; 
  };

  const hasAlternative = !!(quote?.skagenAlternative && quote.skagenAlternative.distance > 0);
  const isSkagenActive = viewMode === 'skagen' && hasAlternative;

  const displayRateLow = isSkagenActive ? quote?.skagenAlternative?.rateLow : quote?.estimatedRateLow;
  const displayRateHigh = isSkagenActive ? quote?.skagenAlternative?.rateHigh : quote?.estimatedRateHigh;
  const displayDistance = isSkagenActive ? quote?.skagenAlternative?.distance : quote?.routeDetails?.distanceNm;
  const displayDays = isSkagenActive ? quote?.skagenAlternative?.days : quote?.voyageDays;
  const displayWaypoints = isSkagenActive ? quote?.skagenAlternative?.waypoints : quote?.routeDetails?.waypoints;

  return (
    <div className="flex flex-col">
      {/* Hero Section - SOLID TRUST BLUE */}
      <div className="relative min-h-[90vh] bg-[#1e5aa0] flex items-center overflow-hidden no-print">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 pt-20 pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="lg:w-[55%] space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-blue-200 text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck size={12}/> {language === 'nl' ? 'Geverifieerd Charterers Platform' : 'Verified Charterers Platform'}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg uppercase m-0">
                {language === 'nl' ? 'Strategisch' : 'Charterer'} <br/>
                <span className="text-blue-300">Chartering Support</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-50 max-w-2xl font-medium leading-relaxed drop-shadow">
                {t.heroSubtitle}
              </p>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex items-center gap-6 w-max max-w-full shadow-2xl transition-all">
                  <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg flex-shrink-0"><Zap size={24}/></div>
                  <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1 m-0">Charterer Intelligence</p>
                      <p className="text-sm font-bold text-white m-0 italic">"{randomSnippet}"</p>
                  </div>
              </div>

              <div className="flex flex-col space-y-4 pt-4">
                <div className="flex flex-row flex-wrap items-center gap-4">
                  <Link to="/insights?tab=analyzer" className="whitespace-nowrap px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl transition-all shadow-xl transform hover:-translate-y-1 flex items-center gap-2">
                    <ClipboardCheck size={20} /> {t.ctaOfferCheck}
                  </Link>
                  <button onClick={handleStartRequest} className="whitespace-nowrap px-8 py-4 bg-white text-blue-900 text-lg font-bold rounded-xl transition-all shadow-lg transform hover:-translate-y-1 flex items-center gap-2 border-none cursor-pointer">
                    <Calculator size={20} /> {language === 'nl' ? 'Vracht Indicatie' : 'Freight Indication'}
                  </button>
                </div>
                <p className="text-blue-200 text-sm font-bold tracking-tight opacity-80 m-0">{t.heroPricingNote}</p>
              </div>
            </div>
            
            <div className="lg:w-[45%] hidden lg:block animate-fade-in relative">
              <div className="relative transform scale-95 origin-center z-20">
                <div className="absolute -inset-4 bg-blue-400/20 rounded-[3rem] blur-2xl"></div>
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white/10 aspect-square">
                  <img 
                    src="https://images.unsplash.com/photo-1524522173746-f628baad3644?w=800&auto=format&fit=crop&q=80" 
                    alt="Maritime Hub" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="bg-slate-900 py-10 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-60">
              <div className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest">
                  <TrendingUp size={20} className="text-blue-500" /> Market Integrity
              </div>
              <div className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest">
                  <Globe size={20} className="text-blue-500" /> EU Coastal Network
              </div>
              <div className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest">
                  <Shield size={20} className="text-blue-500" /> Independent Insights
              </div>
              <div className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest">
                  <Activity size={20} className="text-blue-500" /> Live Data Sync
              </div>
          </div>
      </div>

      {/* Results Section */}
      {quote && (
        <div ref={resultRef} className="bg-slate-50 py-16 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats and Route Card */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-8 border-b pb-4">
                     <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter m-0">{t.resultTitle}</h2>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => setViewMode('direct')}
                          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode==='direct'?'bg-blue-600 text-white shadow-md':'bg-slate-100 text-slate-400 border-none cursor-pointer'}`}
                        >
                          {t.shortest}
                        </button>
                        {hasAlternative && (
                          <button 
                            onClick={() => setViewMode('skagen')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode==='skagen'?'bg-blue-600 text-white shadow-md':'bg-slate-100 text-slate-400 border-none cursor-pointer'}`}
                          >
                            {t.noCanal}
                          </button>
                        )}
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 m-0">{t.lowEstimate}</p>
                        <p className="text-xl font-black text-blue-600 m-0">€{displayRateLow?.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 m-0">{t.highEstimate}</p>
                        <p className="text-xl font-black text-blue-600 m-0">€{displayRateHigh?.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 m-0">{t.seaDistance}</p>
                        <p className="text-xl font-black text-slate-800 m-0">{displayDistance} <span className="text-[10px]">NM</span></p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 m-0">{t.estVoyage}</p>
                        <p className="text-xl font-black text-slate-800 m-0">{displayDays} <span className="text-[10px]">DAYS</span></p>
                    </div>
                  </div>

                  <div className="h-[400px] rounded-3xl overflow-hidden shadow-inner border border-slate-200">
                    <MapComponent 
                      origin={quote.routeDetails.origin} 
                      destination={quote.routeDetails.destination}
                      waypoints={displayWaypoints}
                    />
                  </div>
                </div>
              </div>

              {/* Advisory Card */}
              <div className="space-y-6">
                <div className="bg-blue-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden h-full flex flex-col">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={120}/></div>
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2 m-0"><Zap size={20} className="text-yellow-400"/> {t.strategyAdvice}</h3>
                  <div className="space-y-6 relative z-10 flex-1">
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
                        <p className="text-sm font-bold leading-relaxed m-0 italic">
                            "{language === 'nl' ? quote.marketAdvisoryNl : quote.marketAdvisoryEn}"
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-300 m-0">{t.negotiationDesk}</h4>
                        {quote.negotiation.focusPoints.map((point, idx) => (
                            <div key={idx} className="flex gap-3 items-start">
                                <div className="mt-1 flex-shrink-0 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">✓</div>
                                <p className="text-xs font-bold m-0 text-blue-50">{point}</p>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 mt-auto">
                        <Link to="/insights?tab=analyzer" className="w-full flex justify-center py-4 bg-white text-blue-900 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-blue-50 transition-all no-underline shadow-lg">
                            {t.ctaOfferCheck}
                        </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full text-slate-500 hover:text-red-500 transition-colors z-50 border-none cursor-pointer shadow-lg"
            >
              <X size={24} />
            </button>
            <CargoForm onQuoteReceived={handleQuoteReceived} />
          </div>
        </div>
      )}

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </div>
  );
};

export default Home;
