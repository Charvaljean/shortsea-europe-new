
import React from 'react';
import { useLanguage } from '../App';
import { ShieldCheck, Lock, Globe, Database, Shield, CheckCircle, Scale, Eye, HardDrive, Cpu } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-slate-50 min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#1e5aa0] p-10 text-white flex items-center gap-6">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
              <ShieldCheck size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter m-0">{t.privacyTitle.split(' - ')[0]}</h1>
              <p className="text-blue-100 font-medium mt-1 m-0 opacity-80 uppercase text-[10px] tracking-widest">Trust & Security Protocol</p>
            </div>
          </div>

          {/* Intro Text */}
          <div className="p-10 lg:p-12 space-y-12">
            <p className="text-xl text-slate-700 leading-relaxed font-medium m-0">
              {t.privacyIntro}
            </p>

            <div className="grid grid-cols-1 gap-12">
              {/* Basic Sections */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 m-0">{t.privacyCollTitle}</h3>
                  <p className="text-slate-600 leading-relaxed m-0 font-medium">
                    {t.privacyCollText}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                  <Globe size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 m-0">{t.privacyAiTitle}</h3>
                  <p className="text-slate-600 leading-relaxed m-0 font-medium">
                    {t.privacyAiText}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 m-0">{t.privacyStoreTitle}</h3>
                  <p className="text-slate-600 leading-relaxed m-0 font-medium">
                    {t.privacyStoreText}
                  </p>
                </div>
              </div>

              {/* GDPR Compliance Header */}
              <div className="pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <Scale className="text-blue-600" size={28}/>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter m-0">{t.privacyGdprTitle}</h2>
                </div>
                
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="p-3 bg-slate-900 text-white rounded-xl flex-shrink-0">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 m-0">{t.privacyGdprLegalTitle}</h3>
                      <p className="text-slate-600 leading-relaxed m-0 font-medium">
                        {t.privacyGdprLegalText}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="p-3 bg-slate-900 text-white rounded-xl flex-shrink-0">
                      <Eye size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 m-0">{t.privacyGdprAccessTitle}</h3>
                      <p className="text-slate-600 leading-relaxed m-0 font-medium">
                        {t.privacyGdprAccessText}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="p-3 bg-slate-900 text-white rounded-xl flex-shrink-0">
                      <HardDrive size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 m-0">{t.privacyGdprEuStorageTitle}</h3>
                      <p className="text-slate-600 leading-relaxed m-0 font-medium">
                        {t.privacyGdprEuStorageText}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="p-3 bg-slate-900 text-white rounded-xl flex-shrink-0">
                      <Cpu size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 m-0">{t.privacyGdprAutoTitle}</h3>
                      <p className="text-slate-600 leading-relaxed m-0 font-medium">
                        {t.privacyGdprAutoText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={12}/> {t.compFooter}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
