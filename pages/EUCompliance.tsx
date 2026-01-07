
import React from 'react';
import { useLanguage } from '../App';
import { ShieldCheck, Scale, FileCheck, CheckCircle, Info, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';

const EUCompliance: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-slate-50 min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#1e5aa0] p-10 text-white flex items-center gap-6">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
              <Landmark size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter m-0">{t.euCompTitle}</h1>
              <p className="text-blue-100 font-medium mt-1 m-0 opacity-80 uppercase text-[10px] tracking-widest">EU Regulatory Standard Adherence</p>
            </div>
          </div>

          <div className="p-10 lg:p-12 space-y-12">
            <p className="text-xl text-slate-700 leading-relaxed font-medium m-0 border-b pb-8">
              {t.euCompIntro}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* GDPR Quick Info */}
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col h-full">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl w-fit mb-6">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4 m-0">{t.privacyGdprTitle}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium mb-8 flex-grow">
                        {t.privacyGdprEuStorageText}
                    </p>
                    <Link to="/privacy-policy" className="text-blue-600 font-black uppercase tracking-widest text-[10px] no-underline hover:underline">
                        Read Full GDPR Policy &rarr;
                    </Link>
                </div>

                {/* ePrivacy Quick Info */}
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col h-full">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl w-fit mb-6">
                        <FileCheck size={24} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4 m-0">{t.cookieEprivacyTitle}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium mb-8 flex-grow">
                        {t.cookieStrictText}
                    </p>
                    <Link to="/cookie-settings" className="text-blue-600 font-black uppercase tracking-widest text-[10px] no-underline hover:underline">
                        Read Full Cookie Policy &rarr;
                    </Link>
                </div>
            </div>

            {/* Maritime Disclaimer Mention */}
            <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100">
                <div className="flex items-center gap-3 mb-4">
                    <Info className="text-orange-600" size={24} />
                    <h4 className="text-sm font-black text-orange-900 uppercase tracking-widest m-0">Nautical Safety & Regulation</h4>
                </div>
                <p className="text-xs text-orange-800 leading-relaxed font-bold m-0 italic">
                    {t.legalDisclaimerText}
                </p>
            </div>

            <div className="pt-8 border-t border-slate-100 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                <CheckCircle size={12}/> Verified 2025 Regulatory Alignment
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EUCompliance;
