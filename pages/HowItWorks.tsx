import React from 'react';
import { useLanguage } from '../App';
import { Search, Calculator, CheckCircle, Ship } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <Search className="w-8 h-8 text-white" />,
      title: t.step1Title,
      desc: t.step1Desc
    },
    {
      icon: <Calculator className="w-8 h-8 text-white" />,
      title: t.step2Title,
      desc: t.step2Desc
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-white" />,
      title: t.step3Title,
      desc: t.step3Desc
    },
    {
      icon: <Ship className="w-8 h-8 text-white" />,
      title: t.step4Title,
      desc: t.step4Desc
    }
  ];

  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{t.hiwTitle}</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t.hiwSubtitle}
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 mb-6 transition-transform hover:scale-110">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
           <a href="/" className="inline-block px-8 py-4 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
             {t.hiwCta}
           </a>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;