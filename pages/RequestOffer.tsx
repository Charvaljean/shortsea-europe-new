
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../App';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { getCommodityStowage } from '../services/geminiService'; // Import AI Service
import { Calendar, Ship, Anchor, FileText, CheckCircle2, Box, Info, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const RequestOffer: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
      loadPort: '', dischargePort: '', laycanStart: '', laycanEnd: '',
      cargo: '', volume: '', stowage: '', hazmat: '',
      terms: 'FIOS', idea: '',
      email: user?.email || '', phone: user?.phone || '', company: user?.company || ''
  });

  // State for AI Stowage Lookup
  const [loadingStowage, setLoadingStowage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userId = user ? user.id : 'guest';
    const userName = user ? user.name : 'Guest User';
    
    // 1. Log generic activity (for overview)
    const details = `Firm Offer Request: ${form.volume}mt ${form.cargo}`;
    storageService.logActivity(userId, userName, 'OFFER_REQUEST', details, form);

    // 2. CREATE A STRUCTURED OFFER / DOSSIER
    storageService.createOffer({
        userId,
        userName,
        userEmail: form.email,
        userCompany: form.company,
        cargoDetails: {
            loadPort: form.loadPort,
            dischargePort: form.dischargePort,
            cargo: form.cargo,
            volume: form.volume,
            laycanStart: form.laycanStart,
            laycanEnd: form.laycanEnd,
            terms: form.terms,
            stowage: form.stowage,
            idea: form.idea
        }
    });

    setTimeout(() => setSubmitted(true), 1000);
  };

  const handleAutoStowage = async () => {
    if (!form.cargo) {
        alert(language === 'en' ? "Please enter a Cargo Description first." : "Vul eerst een Ladingbeschrijving in.");
        return;
    }

    setLoadingStowage(true);
    try {
        const result = await getCommodityStowage(form.cargo);
        if (result && result.factorCbft) {
            setForm(prev => ({ ...prev, stowage: result.factorCbft.toString() }));
        } else {
            alert(language === 'en' ? "Could not find stowage factor. Please enter manually." : "Geen stuwagefactor gevonden. Vul handmatig in.");
        }
    } catch (e) {
        console.error("Stowage lookup failed", e);
    } finally {
        setLoadingStowage(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full p-12 rounded-3xl shadow-xl text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{language === 'en' ? 'Request Received' : 'Aanvraag Ontvangen'}</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            {t.roSuccess}
          </p>
          <Link to="/" className="inline-block px-8 py-3 bg-slate-900 text-white rounded-lg font-bold">
            {language === 'en' ? 'Back to Home' : 'Terug naar Home'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-[#1e5aa0] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">{t.roTitle}</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">{t.roSubtitle}</p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Voyage Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex items-center space-x-3">
              <Anchor className="text-[#1e5aa0]" size={20} />
              <h3 className="text-lg font-bold text-slate-800">{t.roSectionVoyage}</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.loadLabel}</label>
                <input type="text" required value={form.loadPort} onChange={e => setForm({...form, loadPort: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.dischLabel}</label>
                <input type="text" required value={form.dischargePort} onChange={e => setForm({...form, dischargePort: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.roLaycanStart}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input type="date" required value={form.laycanStart} onChange={e => setForm({...form, laycanStart: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.roLaycanEnd}</label>
                <div className="relative">
                   <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                   <input type="date" required value={form.laycanEnd} onChange={e => setForm({...form, laycanEnd: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Cargo Specs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex items-center space-x-3">
              <Box className="text-[#1e5aa0]" size={20} />
              <h3 className="text-lg font-bold text-slate-800">{t.roSectionCargo}</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.cargoLabel}</label>
                <input type="text" required value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder={language === 'en' ? "e.g. Wheat, Steel Coils" : "bijv. Tarwe, Staalrollen"} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.volumeLabel}</label>
                <input type="number" required value={form.volume} onChange={e => setForm({...form, volume: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              
              {/* STOWAGE FACTOR WITH AI LOOKUP */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.roStowage}</label>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        step="0.1" 
                        value={form.stowage} 
                        onChange={e => setForm({...form, stowage: e.target.value})} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        placeholder="e.g. 45" 
                    />
                    <button 
                        type="button"
                        onClick={handleAutoStowage}
                        disabled={loadingStowage}
                        className="bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 px-3 rounded-lg flex items-center justify-center transition-colors min-w-[50px]"
                        title={language === 'en' ? "Find SF via AI" : "Vind SF via AI"}
                    >
                        {loadingStowage ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                    {language === 'en' ? "Click search to auto-fill based on cargo description." : "Klik op zoek om automatisch in te vullen op basis van lading."}
                </p>
              </div>

              <div className="md:col-span-2">
                 <label className="block text-sm font-semibold text-slate-700 mb-2">{t.roHazmat}</label>
                 <input type="text" value={form.hazmat} onChange={e => setForm({...form, hazmat: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder={language === 'en' ? "If yes, specify Class & UN Number" : "Indien ja, specificeer Klasse & UN Nummer"} />
              </div>
            </div>
          </div>

          {/* Section 3: Terms & Contact */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex items-center space-x-3">
              <FileText className="text-[#1e5aa0]" size={20} />
              <h3 className="text-lg font-bold text-slate-800">{t.roSectionTerms} & {t.roSectionContact}</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.roTerms}</label>
                <select value={form.terms} onChange={e => setForm({...form, terms: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option>FIOS (Free In/Out Stowed)</option>
                    <option>FILO (Free In / Liner Out)</option>
                    <option>LIFO (Liner In / Free Out)</option>
                    <option>Liner Terms</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.roIdea}</label>
                <input type="number" step="0.50" value={form.idea} onChange={e => setForm({...form, idea: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div className="md:col-span-2 border-t border-gray-100 my-2"></div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.formEmail}</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.contactPhone}</label>
                <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
               <div className="md:col-span-2">
                 <label className="block text-sm font-semibold text-slate-700 mb-2">{language === 'en' ? 'Company Name' : 'Bedrijfsnaam'}</label>
                 <input type="text" required value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#1e5aa0] hover:bg-blue-800 text-white font-bold py-5 rounded-xl shadow-lg shadow-blue-900/20 text-lg transition-all transform hover:-translate-y-1">
             {t.roSubmit}
          </button>
          
          <p className="text-center text-xs text-slate-400">
             {t.disclaimer}
          </p>
        </form>
      </div>
    </div>
  );
};

export default RequestOffer;
