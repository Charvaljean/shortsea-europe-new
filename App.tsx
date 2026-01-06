
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Ship, Menu, X, Globe, UserCircle, ChevronDown, Lock, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { NAV_ITEMS, TRANSLATIONS } from './constants';
import { Language } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { storageService } from './services/storageService';
import Home from './pages/Home';
import Services from './pages/Services';
import MarketInsights from './pages/MarketInsights';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import RequestOffer from './pages/RequestOffer';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Tools from './pages/Tools';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CookieSettings from './pages/CookieSettings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import EUCompliance from './pages/EUCompliance';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof TRANSLATIONS['en'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};

// Component om scroll naar boven te forceren bij route wijziging
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Header: React.FC<{ mobileMenuOpen: boolean, setMobileMenuOpen: (v: boolean) => void }> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-blue-600 rounded-lg text-white transition-transform hover:scale-105">
              <Ship size={24} />
            </div>
            <div className="font-semibold text-lg tracking-wide text-slate-800 uppercase">
              SHORTSEA <span className="text-blue-600">EUROPE</span>
            </div>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link to="/" className={`text-sm font-semibold uppercase tracking-widest ${location.pathname === '/' ? 'text-blue-600' : 'text-slate-500'}`}>Home</Link>
            
            <div className="relative group" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <button className={`flex items-center gap-1 text-sm font-semibold uppercase tracking-widest border-none bg-transparent cursor-pointer ${location.pathname === '/services' ? 'text-blue-600' : 'text-slate-500'}`}>
                {t.footerServices} <ChevronDown size={14}/>
              </button>
              {servicesOpen && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-2xl rounded-xl border border-gray-100 py-2 animate-fade-in">
                  <Link to="/services" className="block px-4 py-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">{t.service1Title}</Link>
                  <Link to="/services" className="block px-4 py-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">{t.service2Title}</Link>
                  <Link to="/services" className="block px-4 py-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">{t.service3Title}</Link>
                  <Link to="/services" className="block px-4 py-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">{t.service5Title}</Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link to="/" className="block px-4 py-3 text-xs font-bold text-slate-900 hover:bg-blue-50 hover:text-blue-600">{t.serviceFreightTitle}</Link>
                  <Link to="/insights?tab=analyzer" className="block px-4 py-3 text-xs font-bold text-slate-900 hover:bg-blue-50 hover:text-blue-600">{t.serviceAnalyzerTitle}</Link>
                </div>
              )}
            </div>

            <Link to="/insights" className={`text-sm font-semibold uppercase tracking-widest ${location.pathname === '/insights' ? 'text-blue-600' : 'text-slate-500'}`}>Chartering Advisory</Link>
            <Link to="/tools" className={`text-sm font-semibold uppercase tracking-widest ${location.pathname === '/tools' ? 'text-blue-600' : 'text-slate-500'}`}>Tools</Link>
            <Link to="/pricing" className={`text-sm font-semibold uppercase tracking-widest ${location.pathname === '/pricing' ? 'text-blue-600' : 'text-slate-500'}`}>Pricing</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => setLanguage(language === 'en' ? 'nl' : 'en')} className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 bg-transparent border-none cursor-pointer uppercase tracking-tighter">
              <Globe size={14} /><span>{language.toUpperCase()}</span>
            </button>
            {isAuthenticated ? (
               <div className="flex items-center space-x-4">
                  <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-2 text-slate-700 font-semibold text-xs tracking-tight">
                     <UserCircle size={18} /><span>{user?.name}</span>
                  </Link>
                  <button onClick={logout} className="text-[10px] text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer font-bold tracking-widest">LOGOUT</button>
               </div>
            ) : (
               <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-600 tracking-tight">LOGIN</Link>
            )}
            <Link to="/contact" className="px-5 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-full hover:bg-slate-800 transition-all uppercase tracking-widest">
              {t.ctaSecondary}
            </Link>
          </div>

          <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 bg-transparent border-none cursor-pointer">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const TrialBanner = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    if (!user || user.role === 'admin' || user.subscriptionPlan !== 'free') return null;
    const { expired, daysLeft } = storageService.checkTrialStatus(user);
    if (expired) return <div className="bg-red-600 text-white py-2 text-center text-xs font-black uppercase tracking-widest"><Lock size={12} className="inline mr-2"/> {t.trialExpired}</div>;
    return <div className="bg-orange-500 text-white py-2 text-center text-xs font-black uppercase tracking-widest">{t.trialRemaining.replace('{{days}}', daysLeft.toString())}</div>;
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthProvider>
      <LanguageContext.Provider value={{ language, setLanguage, t: TRANSLATIONS[language] }}>
        <HashRouter>
          <ScrollToTop />
          <TrialBanner />
          <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
          <main className="flex-grow min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/insights" element={<TrialProtected><MarketInsights /></TrialProtected>} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/tools" element={<TrialProtected><Tools /></TrialProtected>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/request-offer" element={<RequestOffer />} />
              <Route path="/cookie-settings" element={<CookieSettings />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/eu-compliance" element={<EUCompliance />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            </Routes>
          </main>
          <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                {/* Brand Column */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                      <Ship size={20} />
                    </div>
                    <div className="font-bold text-lg tracking-wide text-white uppercase">
                      SHORTSEA <span className="text-blue-600">EUROPE</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {TRANSLATIONS[language].footerText}
                  </p>
                  <div className="flex space-x-4">
                    <a href="#" className="text-slate-400 hover:text-white transition-colors"><Globe size={18}/></a>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors font-bold text-sm">LI</a>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors font-bold text-sm">TW</a>
                  </div>
                </div>

                {/* Platform Column */}
                <div>
                  <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">{TRANSLATIONS[language].footerPlatform}</h4>
                  <ul className="space-y-4 text-sm list-none p-0">
                    <li><Link to="/" className="text-slate-400 hover:text-blue-400 transition-colors no-underline">{TRANSLATIONS[language].serviceFreightTitle}</Link></li>
                    <li><Link to="/insights" className="text-slate-400 hover:text-blue-400 transition-colors no-underline">{TRANSLATIONS[language].footerInsights}</Link></li>
                    <li><Link to="/tools" className="text-slate-400 hover:text-blue-400 transition-colors no-underline">Tools</Link></li>
                    <li><Link to="/pricing" className="text-slate-400 hover:text-blue-400 transition-colors no-underline">{TRANSLATIONS[language].footerPricing}</Link></li>
                  </ul>
                </div>

                {/* Company Column */}
                <div>
                  <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">{TRANSLATIONS[language].footerCompany}</h4>
                  <ul className="space-y-4 text-sm list-none p-0">
                    <li><Link to="/about" className="text-slate-400 hover:text-blue-400 transition-colors no-underline">{TRANSLATIONS[language].footerAbout}</Link></li>
                    <li><Link to="/services" className="text-slate-400 hover:text-blue-400 transition-colors no-underline">{TRANSLATIONS[language].footerServices}</Link></li>
                    <li><Link to="/contact" className="text-slate-400 hover:text-blue-400 transition-colors no-underline">{TRANSLATIONS[language].footerContact}</Link></li>
                    <li><Link to="/terms-of-service" className="text-slate-400 hover:text-blue-400 transition-colors no-underline">Terms of Service</Link></li>
                  </ul>
                </div>

                {/* Contact Column */}
                <div>
                  <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Contact</h4>
                  <ul className="space-y-4 text-sm list-none p-0">
                    <li className="flex items-start space-x-3">
                      <MapPin size={16} className="text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-slate-400">Rotterdam HQ, Willemskade 12, NL</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Phone size={16} className="text-blue-500 flex-shrink-0" />
                      <span className="text-slate-400">+31 10 123 4567</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Mail size={16} className="text-blue-500 flex-shrink-0" />
                      <span className="text-slate-400">chartering@shortsea-europe.com</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                  &copy; {new Date().getFullYear()} SHORTSEA EUROPE. {TRANSLATIONS[language].footerRights}
                </div>
                <div className="flex space-x-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <Link to="/privacy-policy" className="hover:text-white transition-colors no-underline">Privacy Policy</Link>
                  <Link to="/cookie-settings" className="hover:text-white transition-colors no-underline">{TRANSLATIONS[language].cookieTitle}</Link>
                  <Link to="/eu-compliance" className="hover:text-white transition-colors no-underline">EU Compliance</Link>
                </div>
              </div>
            </div>
          </footer>
        </HashRouter>
      </LanguageContext.Provider>
    </AuthProvider>
  );
};

const TrialProtected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (user && user.role !== 'admin' && user.subscriptionPlan !== 'free') {
            const { expired } = storageService.checkTrialStatus(user);
            if (expired) navigate('/pricing');
        }
    }, [user, navigate]);
    return <>{children}</>;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode, adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (adminOnly && !isAdmin) navigate('/dashboard');
  }, [isAuthenticated, isAdmin, navigate, adminOnly]);
  if (!isAuthenticated || (adminOnly && !isAdmin)) return null;
  return <>{children}</>;
};

export default App;
