
import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Check, Anchor, CloudRain, Leaf } from 'lucide-react';
import { useLanguage } from '../App';

export const CustomComplianceTile: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="group h-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex flex-col items-center gap-3"
        id="complianceTile"
      >
        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600 mb-2 transition-transform group-hover:scale-105">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
             <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 11.95c-1.05 0-2.06-.16-3-.46V19l3 1 3-1v-6.55c-.94.3-1.95.46-3 .46z"/>
           </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 m-0">{t.prop4Title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed m-0">{t.prop4Text}</p>
        <div className="mt-auto text-blue-600 text-xs font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
            View Details &rarr;
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          id="complianceOverlay"
        >
          <div 
            className="bg-white rounded-2xl w-[90%] max-w-2xl max-h-[85vh] overflow-y-auto p-8 relative shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-red-500 transition-colors z-10"
              id="closeCompliance"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{t.compTitle}</h2>
                    <p className="text-slate-500">{t.compSubtitle}</p>
                </div>
            </div>
            
            <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                {t.compIntro}
            </p>

            <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-gray-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg"><Lock size={20} className="text-blue-600"/> {t.compGdprTitle}</h3>
                    <ul className="space-y-3 text-slate-600 list-none pl-0">
                        <li className="flex items-start gap-3"><Check size={18} className="text-green-500 mt-0.5 flex-shrink-0"/> {t.compGdpr1}</li>
                        <li className="flex items-start gap-3"><Check size={18} className="text-green-500 mt-0.5 flex-shrink-0"/> {t.compGdpr2}</li>
                        <li className="flex items-start gap-3"><Check size={18} className="text-green-500 mt-0.5 flex-shrink-0"/> {t.compGdpr3}</li>
                    </ul>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-gray-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg"><Anchor size={20} className="text-blue-600"/> {t.compMarTitle}</h3>
                    <ul className="space-y-3 text-slate-600 list-none pl-0">
                        <li className="flex items-start gap-3"><Check size={18} className="text-green-500 mt-0.5 flex-shrink-0"/> {t.compMar1}</li>
                        <li className="flex items-start gap-3"><Check size={18} className="text-green-500 mt-0.5 flex-shrink-0"/> {t.compMar2}</li>
                        <li className="flex items-start gap-3"><Check size={18} className="text-green-500 mt-0.5 flex-shrink-0"/> {t.compMar3}</li>
                    </ul>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-gray-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg"><CloudRain size={20} className="text-blue-600"/> {t.compDigTitle}</h3>
                    <ul className="space-y-3 text-slate-600 list-none pl-0">
                        <li className="flex items-start gap-3"><Check size={18} className="text-green-500 mt-0.5 flex-shrink-0"/> {t.compDig1}</li>
                        <li className="flex items-start gap-3"><Check size={18} className="text-green-500 mt-0.5 flex-shrink-0"/> {t.compDig2}</li>
                        <li className="flex items-start gap-3"><Check size={18} className="text-green-500 mt-0.5 flex-shrink-0"/> {t.compDig3}</li>
                    </ul>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-gray-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg"><Leaf size={20} className="text-blue-600"/> {t.compEnvTitle}</h3>
                    <ul className="space-y-3 text-slate-600 list-none pl-0">
                        <li className="flex items-start gap-3"><Check size={18} className="text-green-500 mt-0.5 flex-shrink-0"/> {t.compEnv1}</li>
                        <li className="flex items-start gap-3"><Check size={18} className="text-green-500 mt-0.5 flex-shrink-0"/> {t.compEnv2}</li>
                        <li className="flex items-start gap-3"><Check size={18} className="text-green-500 mt-0.5 flex-shrink-0"/> {t.compEnv3}</li>
                    </ul>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-slate-500 italic">
                {t.compFooter}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
