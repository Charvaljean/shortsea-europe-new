
import React from 'react';
import { useLanguage } from '../App';
import { FileText, ShieldCheck, Scale, AlertTriangle, Copyright, Globe, Lock, CheckCircle } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-slate-50 min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#1e5aa0] p-10 text-white flex items-center gap-6">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
              <FileText size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter m-0">Terms of Service</h1>
              <p className="text-blue-100 font-medium mt-1 m-0 opacity-80 uppercase text-[10px] tracking-widest">General Conditions & Framework</p>
            </div>
          </div>

          <div className="p-10 lg:p-12 space-y-12">
            {/* Section 1 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="text-blue-600" size={24} />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight m-0">{t.tos1Title}</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium m-0">{t.tos1Text}</p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-blue-600" size={24} />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight m-0">{t.tos2Title}</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium m-0">{t.tos2Text}</p>
            </section>

            {/* Section 3 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-orange-600" size={24} />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight m-0">{t.tos3Title}</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2 m-0">{t.tos3NavTitle}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold m-0">{t.tos3NavText}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2 m-0">{t.tos3FinTitle}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold m-0">{t.tos3FinText}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2 m-0">{t.tos3OpTitle}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold m-0">{t.tos3OpText}</p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Copyright className="text-blue-600" size={24} />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight m-0">{t.tos4Title}</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium m-0">{t.tos4Text}</p>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="text-blue-600" size={24} />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight m-0">{t.tos5Title}</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium m-0">{t.tos5Text}</p>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="text-blue-600" size={24} />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight m-0">{t.tos6Title}</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium m-0">{t.tos6Text}</p>
            </section>

            <div className="pt-8 border-t border-slate-100 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={12}/> Verified Regulatory Alignment 2025
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
