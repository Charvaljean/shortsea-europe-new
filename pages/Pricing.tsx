
import React from 'react';
import { useLanguage } from '../App';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { Check, X, Loader2, Zap, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Pricing: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleProUpgrade = () => {
    console.log("Upgrade button clicked. User:", user);

    if (!user) {
      // If not logged in, go to register
      console.log("User not logged in, redirecting to register");
      navigate('/register');
      return;
    }

    // Simulate Payment Gateway Logic
    const confirmMsg = language === 'en' 
      ? "Proceed to Payment Gateway (Simulation)?\n\nUpgrade to Professional Plan (€49/mo)"
      : "Ga naar Betaalpagina (Simulatie)?\n\nUpgrade naar Professioneel Plan (€49/mnd)";

    if (window.confirm(confirmMsg)) {
       console.log("User confirmed payment simulation");
       // Perform Upgrade
       const updated = storageService.updateUserSubscription(user.id, 'pro');
       
       if (updated) {
           console.log("Storage updated successfully");
           updateUser({ subscriptionPlan: 'pro' });
           const successMsg = language === 'en' 
             ? "Payment Successful! Welcome to Shortsea Professional."
             : "Betaling Geslaagd! Welkom bij Shortsea Professional.";
           alert(successMsg);
           navigate('/dashboard');
       } else {
           console.error("Failed to update user subscription in storage");
           const errorMsg = language === 'en'
             ? "Upgrade failed: User record not found. Please try logging out and back in."
             : "Upgrade mislukt: Gebruikersgegevens niet gevonden. Log uit en probeer opnieuw.";
           alert(errorMsg);
       }
    }
  };

  return (
    <div className="bg-white py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">{t.pricingTitle}</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            {t.pricingSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-[2.5rem] p-10 hover:shadow-xl transition-shadow flex flex-col bg-white">
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{t.planFree}</h3>
            <div className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">€0 <span className="text-base font-bold text-slate-400 uppercase tracking-widest">{t.mo}</span></div>
            <ul className="space-y-4 mb-10 flex-grow list-none p-0">
              <li className="flex items-start space-x-3">
                <Check className="text-green-500 mt-1 flex-shrink-0" size={18} />
                <span className="text-slate-600 font-medium text-sm">{t.feat1}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="text-green-500 mt-1 flex-shrink-0" size={18} />
                <span className="text-slate-600 font-medium text-sm">{t.feat2}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Zap className="text-blue-500 mt-1 flex-shrink-0" size={18} />
                <span className="text-slate-900 font-black text-sm uppercase tracking-tight">{t.featAiScanPay}</span>
              </li>
              <li className="flex items-start space-x-3 opacity-50">
                <X className="text-slate-300 mt-1 flex-shrink-0" size={18} />
                <span className="text-slate-400 font-medium text-sm">{t.featNoExpert}</span>
              </li>
            </ul>
            <Link to={user ? "/dashboard" : "/register"} className="w-full block text-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-black uppercase tracking-widest text-[11px] py-4 rounded-xl transition-colors no-underline">
              {user ? (language === 'en' ? 'Go to Dashboard' : 'Naar Dashboard') : t.btnStart}
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="border-4 border-blue-600 rounded-[2.5rem] p-10 shadow-2xl relative flex flex-col transform md:-translate-y-4 bg-white z-10">
            <div className="absolute top-0 right-10 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-b-xl shadow-lg">POPULAR</div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{t.planPro}</h3>
            <div className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">€49 <span className="text-base font-bold text-slate-400 uppercase tracking-widest">{t.mo}</span></div>
            <ul className="space-y-4 mb-10 flex-grow list-none p-0">
              <li className="flex items-start space-x-3">
                <Check className="text-green-500 mt-1 flex-shrink-0" size={18} />
                <span className="text-slate-600 font-medium text-sm">{t.feat4}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Zap className="text-blue-600 mt-1 flex-shrink-0" size={18} />
                <span className="text-slate-900 font-black text-sm uppercase tracking-tight">{t.featAiScanUnlim}</span>
              </li>
              <li className="flex items-start space-x-3">
                <ShieldCheck className="text-blue-600 mt-1 flex-shrink-0" size={18} />
                <span className="text-slate-900 font-black text-sm uppercase tracking-tight">{t.featExpertAddon}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="text-green-500 mt-1 flex-shrink-0" size={18} />
                <span className="text-slate-600 font-medium text-sm">{t.feat5}</span>
              </li>
            </ul>
            <button 
              onClick={handleProUpgrade}
              className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-xl transition-all shadow-xl shadow-blue-100 border-none cursor-pointer transform hover:-translate-y-0.5"
            >
              {user?.subscriptionPlan === 'pro' 
                ? (language === 'en' ? 'Current Plan' : 'Huidig Plan') 
                : t.btnStart
              }
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="border border-gray-200 rounded-[2.5rem] p-10 hover:shadow-xl transition-shadow flex flex-col bg-slate-900 text-white">
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{t.planEnt}</h3>
            <div className="text-4xl font-black text-white mb-8 tracking-tighter">Custom</div>
            <ul className="space-y-4 mb-10 flex-grow list-none p-0">
              <li className="flex items-start space-x-3">
                <ShieldCheck className="text-blue-400 mt-1 flex-shrink-0" size={18} />
                <span className="text-blue-50 font-black text-sm uppercase tracking-tight">{t.featExpertIncl}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="text-blue-400 mt-1 flex-shrink-0" size={18} />
                <span className="text-slate-300 font-medium text-sm">{t.featExpertPriority}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="text-blue-400 mt-1 flex-shrink-0" size={18} />
                <span className="text-slate-300 font-medium text-sm">{t.feat8}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="text-blue-400 mt-1 flex-shrink-0" size={18} />
                <span className="text-slate-300 font-medium text-sm">Full COA Management</span>
              </li>
            </ul>
            <Link to="/contact" className="w-full block text-center bg-white hover:bg-gray-100 text-slate-900 font-black uppercase tracking-widest text-[11px] py-4 rounded-xl transition-colors no-underline">
              {t.btnContact}
            </Link>
          </div>
        </div>

        {/* PROMOTIONAL SAVINGS BADGE */}
        <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 animate-fade-in-up shadow-sm">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Zap size={32} />
            </div>
            <div>
                <h4 className="text-blue-900 font-black uppercase tracking-widest text-xs mb-2">Commercial Optimization Insight</h4>
                <p className="text-blue-800 font-bold leading-relaxed m-0 text-lg md:text-xl">
                    {t.pricingSaveBadge}
                </p>
            </div>
        </div>

        <div className="mt-20 text-center">
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Shortsea Europe Independent Validation Services 2025</p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
