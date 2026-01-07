
import React from 'react';
import { useLanguage } from '../App';
import { Shield, Lock, Activity, Eye, Info, CheckCircle, ShieldCheck, Zap, Globe, MousePointer2 } from 'lucide-react';

const CookieSettings: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-slate-50 min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#1e5aa0] p-10 text-white flex items-center gap-6">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
              <Shield size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter m-0">{t.cookieTitle}</h1>
              <p className="text-blue-100 font-medium mt-1 m-0 opacity-80 uppercase text-[10px] tracking-widest">Privacy & Transparency Framework</p>
            </div>
          </div>

          {/* Intro Text */}
          <div className="p-10 lg:p-12 space-y-12">
            <p className="text-xl text-slate-700 leading-relaxed font-medium m-0">
              {t.cookieIntro}
            </p>

            <div className="space-y-8">
              {/* Basic Sections */}
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-6 items-start">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl flex-shrink-0">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 m-0">{t.cookieFuncTitle}</h3>
                  <p className="text-slate-600 leading-relaxed m-0 font-medium">
                    {t.cookieFuncText}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-6 items-start">
                <div className="p-3 bg-green-100 text-green-600 rounded-xl flex-shrink-0">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 m-0">{t.cookieAnalyticTitle}</h3>
                  <p className="text-slate-600 leading-relaxed m-0 font-medium">
                    {t.cookieAnalyticText}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 flex flex-col md:flex-row gap-6 items-start">
                <div className="p-3 bg-blue-600 text-white rounded-xl flex-shrink-0">
                  <Eye size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-blue-900 uppercase tracking-tight mb-2 m-0">{t.cookieManageTitle}</h3>
                  <p className="text-blue-800 leading-relaxed m-0 font-bold">
                    {t.cookieManageText}
                  </p>
                </div>
              </div>

              {/* EU Compliance Additions */}
              <div className="pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <ShieldCheck className="text-blue-600" size={28}/>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter m-0">{t.cookieEprivacyTitle}</h2>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="p-3 bg-slate-900 text-white rounded-xl flex-shrink-0">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 m-0">{t.cookieStrictTitle}</h3>
                      <p className="text-slate-600 leading-relaxed m-0 font-medium">
                        {t.cookieStrictText}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="p-3 bg-slate-900 text-white rounded-xl flex-shrink-0">
                      <Globe size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 m-0">{t.cookieNoTrackTitle}</h3>
                      <p className="text-slate-600 leading-relaxed m-0 font-medium">
                        {t.cookieNoTrackText}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="p-3 bg-slate-900 text-white rounded-xl flex-shrink-0">
                      <MousePointer2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 m-0">{t.cookiePrefTitle}</h3>
                      <p className="text-slate-600 leading-relaxed m-0 font-medium">
                        {t.cookiePrefText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                <CheckCircle size={12}/> Verified Regulatory Alignment 2025
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieSettings;
