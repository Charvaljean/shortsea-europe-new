
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
  Zap, Loader2, Calculator, ArrowRight, AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const FREE_LIMIT = 2;

const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [viewMode, setViewMode] = useState<'kiel' | 'skagen' | 'direct'>('direct');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [randomSnippet, setRandomSnippet] = useState("");
  
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
    
    // Robuustere check voor het tonen van de knoppen: alleen als distance > 0 (Baltic voyages)
    const hasValidAlt = !!(result.skagenAlternative && result.skagenAlternative.distance > 0);
    
    if (hasValidAlt) {
      setViewMode('kiel'); 
    } else {
      setViewMode('direct');
    }
    
    await storageService.logActivity(user?.id || 'guest', user?.name || 'Guest', 'QUOTE_CALCULATION', `${result.routeDetails?.origin?.name} to ${result.routeDetails?.destination?.name}`, result);
    
    await storageService.saveQuickScan({
        userId: user?.id || 'guest',
        userName: user?.name || 'Guest',
        userCompany: user?.company || 'N/A',
        quote: `Route: ${result.routeDetails?.origin?.name}-${result.routeDetails?.destination?.name}`,
        result: `Vracht: €${result.estimatedRateLow}-${result.estimatedRateHigh}`
    });

    setIsFormOpen(false); 
    setTimeout(() => { resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
  };

  // Check of de route een alternatief toelaat (gebaseerd op AI data)
  const hasAlternative = !!(quote?.skagenAlternative && quote.skagenAlternative.distance > 0);
  const isSkagenActive = viewMode === 'skagen' && hasAlternative;

  const displayRateLow = isSkagenActive ? quote?.skagenAlternative?.rateLow : quote?.estimatedRateLow;
  const displayRateHigh = isSkagenActive ? quote?.skagenAlternative?.rateHigh : quote?.estimatedRateHigh;
  const displayCO2 = isSkagenActive ? quote?.skagenAlternative?.co2 : quote?.co2Emission;
  const displayDays = isSkagenActive ? quote?.skagenAlternative?.days : quote?.voyageDays;
  const displayDistance = isSkagenActive ? quote?.skagenAlternative?.distance : quote?.routeDetails?.distanceNm;
  const displayWaypoints = isSkagenActive ? quote?.skagenAlternative?.waypoints : quote?.routeDetails?.waypoints;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative min-h-screen bg-[#1e5aa0] flex items-center overflow-hidden no-print">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-blue-900/20 to-transparent z-10 pointer-events-none"></div>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 pt-20 pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="lg:w-[55%] space-y-8 animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg uppercase m-0">
                {language === 'nl' ? 'Charterer' : 'Charterer'} <br/>
                <span className="text-blue-300">Strategy Dashboard</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-50 max-w-2xl font-medium leading-relaxed drop-shadow">
                {language === 'nl' ? 'Versterk uw onderhandelingspositie met onafhankelijke data en strategisch advies specifiek voor ladingeigenaren.' : 'Strengthen your negotiation position with independent data and strategic advice specifically for cargo owners.'}
              </p>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex items-center gap-6 w-max max-w-full lg:max-w-[140%] shadow-2xl relative z-40 transition-all">
                  <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg flex-shrink-0"><Zap size={24}/></div>
                  <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1 m-0 opacity-90">Charterer Intelligence</p>
                      <p className="text-sm font-bold text-white m-0 italic whitespace-nowrap overflow-visible">"{randomSnippet}"</p>
                  </div>
              </div>

              <div className="flex flex-col space-y-4 pt-4">
                <div className="flex flex-row flex-wrap items-center gap-4">
                  <Link to="/insights?tab=analyzer" className="whitespace-nowrap px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl transition-all shadow-xl transform hover:-translate-y-1 flex items-center gap-2 no-underline">
                    <ClipboardCheck size={20} /> {t.ctaOfferCheck}
                  </Link>
                  <button onClick={handleStartRequest} className="whitespace-nowrap px-8 py-4 bg-white text-blue-900 text-lg font-bold rounded-xl transition-all shadow-lg transform hover:-translate-y-1 border-none cursor-pointer flex items-center gap-2">
                    <Calculator size={20} /> {language === 'nl' ? 'Start Strategie Scan' : 'Start Strategy Scan'}
                  </button>
                </div>
                <p className="text-blue-200 text-sm font-bold tracking-tight opacity-80 m-0">{t.heroPricingNote}</p>
              </div>
            </div>
            
            <div className="lg:w-[45%] hidden lg:block animate-fade-in relative lg:translate-x-12">
              <div className="relative transform scale-95 origin-center z-20">
                <div className="absolute -inset-2 bg-gradient-to-tr from-blue-400/30 to-blue-600/30 rounded-[2.5rem] blur-xl opacity-50"></div>
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/20 aspect-video lg:aspect-square">
                  <img 
                    src="https://images.unsplash.com/photo-1642689432429-0f71ab7e10c7?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.1.0" 
                    alt="Shortsea Strategy" 
                    className="w-full h-full object-cover object-right transform hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {quote && (
        <div ref={resultRef} className="bg-slate-50 py-20 scroll-mt-20 px-4">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-10 lg:p-16 space-y-10">
                            <div className="flex flex-col gap-6 border-b pb-8 border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Loading Port</span>
                                            <h2 className="text-2xl font-black text-slate-900 uppercase m-0">{quote.routeDetails.origin.name}</h2>
                                        </div>
                                        <ArrowRight className="text-blue-600" size={24} />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Discharge Port</span>
                                            <h2 className="text-2xl font-black text-slate-900 uppercase m-0">{quote.routeDetails.destination.name}</h2>
                                        </div>
                                    </div>
                                    <div className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest h-fit ${quote.marketSentiment.status === 'CHARTERER_MARKET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {quote.marketSentiment.status.replace('_', ' ')}
                                    </div>
                                </div>
                                
                                {hasAlternative && (
                                    <div className="flex gap-2 animate-fade-in">
                                        <button 
                                            onClick={() => setViewMode('kiel')}
                                            className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${viewMode === 'kiel' || viewMode === 'direct' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            {language === 'nl' ? 'Via Kiel Kanaal' : 'Via Kiel Canal'}
                                        </button>
                                        <button 
                                            onClick={() => setViewMode('skagen')}
                                            className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${viewMode === 'skagen' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            {language === 'nl' ? 'Via Skagen' : 'Via Skagen'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-600 rounded-[2.5rem] p-8 lg:p-10 text-white shadow-xl shadow-blue-200">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-70 m-0">Freight Range Benchmark (PMT)</p>
                                <div className="flex items-center gap-8 lg:gap-16">
                                    <div className="flex-1">
                                        <span className="text-[10px] font-bold uppercase block opacity-60 mb-1">Market Low</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold">€</span>
                                            <span className="text-4xl lg:text-5xl font-black">{displayRateLow}</span>
                                        </div>
                                    </div>
                                    <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
                                    <div className="flex-1">
                                        <span className="text-[10px] font-bold uppercase block opacity-60 mb-1">Market High</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold">€</span>
                                            <span className="text-4xl lg:text-5xl font-black">{displayRateHigh}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-2 gap-8">
                                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-60 m-0">{t.targetRateTitle}</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold">€</span>
                                            <span className="text-4xl font-black text-blue-400">{quote.negotiation.targetRate}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 m-0">CO2 Emission Status</p>
                                        <p className={`text-xs font-black m-0 uppercase ${quote.etsApplicable ? 'text-orange-400' : 'text-green-400'}`}>
                                            {quote.etsApplicable ? `ETS Payable: €${quote.euEtsCost}` : (quote.exemptionReason || "Exempted (Below 5000 GT)")}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 m-0">Voyage Duration</p>
                                        <p className="text-lg font-black text-slate-800 m-0">{displayDays} <span className="text-[10px] text-slate-400 font-bold uppercase">Days</span></p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 m-0">Distance</p>
                                        <p className="text-lg font-black text-slate-800 m-0">{displayDistance} <span className="text-[10px] text-slate-400 font-bold uppercase">NM</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-[500px] lg:h-auto min-h-[500px] border-l border-slate-100 relative">
                            <MapComponent 
                                origin={quote.routeDetails.origin} 
                                destination={quote.routeDetails.destination} 
                                waypoints={displayWaypoints}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-orange-50 border-2 border-orange-200 rounded-[2rem] p-8 flex items-start gap-6 animate-fade-in shadow-sm">
                    <div className="p-3 bg-orange-600 text-white rounded-xl flex-shrink-0 shadow-lg">
                        <AlertTriangle size={28}/>
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-orange-900 uppercase tracking-widest mb-2 m-0">{t.legalDisclaimerTitle}</h4>
                        <p className="text-sm text-orange-800 leading-relaxed font-bold m-0 italic">
                            {t.legalDisclaimerText}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-10 lg:p-12 rounded-[2.5rem] shadow-xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-8 border-b pb-6 border-slate-50">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Zap size={20}/></div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter m-0">{t.strategyAdvice}</h3>
                        </div>
                        <div className="prose prose-slate max-none prose-sm lg:prose-base font-medium text-slate-600 leading-relaxed">
                            {language === 'nl' ? quote.marketAdvisoryNl : quote.marketAdvisoryEn}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><Handshake size={100}/></div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-8 m-0 border-b border-white/10 pb-4">{t.negotiationDesk}</h3>
                            <div className="space-y-6">
                                {quote.negotiation.focusPoints.map((point, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                            <CheckCircle2 size={12} className="text-white"/>
                                        </div>
                                        <p className="text-sm font-bold text-slate-300 m-0 leading-relaxed">{point}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-10 p-6 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 m-0">{t.yourLeverage}</p>
                                <p className="text-sm font-bold text-white m-0 italic leading-relaxed">
                                    "{language === 'nl' ? quote.negotiation.leverageTextNl : quote.negotiation.leverageTextEn}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
                  <button 
                      onClick={() => setIsFormOpen(false)} 
                      className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full transition-colors border-none bg-transparent cursor-pointer text-slate-400"
                  >
                      <X size={28}/>
                  </button>
                  <div className="p-10 lg:p-16">
                      <CargoForm onQuoteReceived={handleQuoteReceived} />
                  </div>
              </div>
          </div>
      )}

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </div>
  );
};

export default Home;
