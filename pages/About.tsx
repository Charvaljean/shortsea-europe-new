
import React from 'react';
import { useLanguage } from '../App';
import { Ship, Anchor, Globe, Award, Leaf, ShieldCheck, Zap, TrendingUp, Cpu, FileText, Users, CheckCircle, Medal, Check } from 'lucide-react';

const About: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white font-sans">
      
      {/* PROFESSIONAL HERO SECTION */}
      <div className="relative bg-[#1e5aa0] py-28 overflow-hidden">
         {/* Abstract Maritime Pattern Overlay */}
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
         <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-800/50 text-blue-100 text-xs font-bold tracking-widest uppercase mb-6 border border-blue-400/30">
              Since 2024
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              {t.aboutTitle}
            </h1>
            <p className="text-xl md:text-2xl text-blue-50 font-light max-w-3xl mx-auto leading-relaxed opacity-90">
              {t.aboutSubtitle}
            </p>
         </div>
      </div>

      {/* MISSION & VISION (Screenshot Implementation) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-5xl">
              <div className="flex items-center space-x-4 mb-10">
                  <div className="p-4 bg-blue-50 rounded-2xl text-[#1e5aa0] shadow-inner">
                      <Medal size={32} strokeWidth={1.5} />
                  </div>
                  <span className="text-[#1e5aa0] font-black uppercase tracking-widest text-xs">{t.abPartnerTitle}</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tighter uppercase">
                  {t.abReliablePartnerTitle}
              </h2>
              
              <p className="text-xl text-slate-600 leading-relaxed mb-12 font-medium">
                  {t.abReliablePartnerText}
              </p>

              <div className="space-y-6">
                  <div className="flex items-center space-x-4 group">
                      <div className="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500 transition-colors group-hover:bg-green-500 group-hover:text-white">
                        <Check size={20} strokeWidth={3} />
                      </div>
                      <span className="text-slate-800 font-black text-lg uppercase tracking-tight">{t.abBullet1}</span>
                  </div>
                  <div className="flex items-center space-x-4 group">
                      <div className="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500 transition-colors group-hover:bg-green-500 group-hover:text-white">
                        <Check size={20} strokeWidth={3} />
                      </div>
                      <span className="text-slate-800 font-black text-lg uppercase tracking-tight">{t.abBullet2}</span>
                  </div>
                  <div className="flex items-center space-x-4 group">
                      <div className="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500 transition-colors group-hover:bg-green-500 group-hover:text-white">
                        <Check size={20} strokeWidth={3} />
                      </div>
                      <span className="text-slate-800 font-black text-lg uppercase tracking-tight">{t.abBullet3}</span>
                  </div>
              </div>
          </div>
      </div>

      {/* STATS STRIP */}
      <div className="bg-slate-900 py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#1e5aa0]/10 pattern-grid-lg opacity-20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                  <div className="p-6 border-r-0 md:border-r border-slate-700/50">
                      <div className="text-6xl font-extrabold text-white mb-2 tracking-tight">40%</div>
                      <div className="text-blue-400 font-bold uppercase tracking-widest text-sm">{t.abImp1}</div>
                  </div>
                  <div className="p-6 border-r-0 md:border-r border-slate-700/50">
                      <div className="text-6xl font-extrabold text-white mb-2 tracking-tight">15%</div>
                      <div className="text-blue-400 font-bold uppercase tracking-widest text-sm">{t.abImp2}</div>
                  </div>
                  <div className="p-6">
                      <div className="text-6xl font-extrabold text-white mb-2 tracking-tight">99%</div>
                      <div className="text-blue-400 font-bold uppercase tracking-widest text-sm">{t.abImp3}</div>
                  </div>
              </div>
          </div>
      </div>

      {/* CORE VALUES / WHAT IS SHORTSEA */}
      <div className="bg-slate-50 py-24">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.abWhatIsTitle}</h2>
                <div className="h-1 w-20 bg-[#1e5aa0] mx-auto rounded-full mb-6"></div>
                <p className="text-slate-600 text-lg leading-relaxed">{t.abWhatIsText}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { icon: <Leaf size={32} />, text: t.abWhatIs1, color: 'text-green-600', bg: 'bg-green-50' },
                    { icon: <TrendingUp size={32} />, text: t.abWhatIs2, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { icon: <Zap size={32} />, text: t.abWhatIs3, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { icon: <Anchor size={32} />, text: t.abWhatIs4, color: 'text-orange-600', bg: 'bg-orange-50' }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                        <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
                            {item.icon}
                        </div>
                        <p className="font-bold text-slate-800 text-lg">{item.text.split(':')[0]}</p>
                        <p className="text-slate-500 text-sm mt-2">{item.text.split(':')[1]}</p>
                    </div>
                ))}
            </div>
         </div>
      </div>

      {/* SERVICES GRID */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-lg hover:border-[#1e5aa0]/30 transition-all">
                    <div className="w-14 h-14 bg-blue-50 text-[#1e5aa0] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1e5aa0] group-hover:text-white transition-colors">
                        <Cpu size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{t.abAiTitle}</h3>
                    <p className="text-slate-600 leading-relaxed">{t.abAiText}</p>
                </div>
                <div className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-lg hover:border-[#1e5aa0]/30 transition-all">
                    <div className="w-14 h-14 bg-blue-50 text-[#1e5aa0] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1e5aa0] group-hover:text-white transition-colors">
                        <FileText size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{t.abProcessTitle}</h3>
                    <p className="text-slate-600 leading-relaxed">{t.abProcessText}</p>
                </div>
                <div className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-lg hover:border-[#1e5aa0]/30 transition-all">
                    <div className="w-14 h-14 bg-blue-50 text-[#1e5aa0] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1e5aa0] group-hover:text-white transition-colors">
                        <ShieldCheck size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{t.abSafeTitle}</h3>
                    <p className="text-slate-600 leading-relaxed">{t.abSafeText}</p>
                </div>
            </div>
        </div>
      </div>

      {/* SUSTAINABILITY FOOTER */}
      <div className="bg-[#0f2a1d] text-white py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
              </svg>
          </div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
              <div className="inline-block p-4 bg-white/10 rounded-full mb-8 backdrop-blur-sm border border-white/20">
                <Leaf size={40} className="text-green-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t.abGreenTitle}</h2>
              <p className="text-xl text-green-100/90 leading-relaxed font-light">
                  {t.abGreenText}
              </p>
          </div>
      </div>
    </div>
  );
};

export default About;
