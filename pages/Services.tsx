
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../App';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { 
  Anchor, Package, ShieldCheck, Ship, Truck, Calculator, 
  FileSearch, X, Send, Loader2, CheckCircle2, User, Building2, 
  Mail, Phone, FileText, Upload, Ruler, Scale, Globe
} from 'lucide-react';

interface ServiceInquiryModalProps {
  serviceId: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClose: () => void;
}

const ServiceInquiryModal: React.FC<ServiceInquiryModalProps> = ({ serviceId, title, description, icon, onClose }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    company: user?.company || '',
    email: user?.email || '',
    phone: user?.phone || '',
    details: '',
    specificData: {} as any,
    fileName: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, fileName: file.name }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    const inquiryContent = `
SERVICE TYPE: ${title}
--------------------------
CLIENT DETAILS:
Name: ${formData.name}
Company: ${formData.company}
Email: ${formData.email}
Phone: ${formData.phone}

ANALYSIS DETAILS:
${formData.details}

FILE ATTACHED: ${formData.fileName || 'None'}

SMART DATA:
${JSON.stringify(formData.specificData, null, 2)}
    `;

    setTimeout(() => {
      storageService.sendMessage(false, user?.id || 'guest', inquiryContent, {
        subject: `SMART SERVICE REQUEST: ${title}`,
        guestDetails: {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone
        },
        type: 'inquiry',
        serviceType: serviceId
      });
      setStatus('success');
    }, 1500);
  };

  if (status === 'success') {
    return (
      <div className="bg-white rounded-[2.5rem] p-12 text-center max-w-lg w-full shadow-2xl animate-fade-in-up">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">
          {language === 'nl' ? 'Aanvraag Ontvangen' : 'Request Received'}
        </h3>
        <p className="text-slate-600 font-medium leading-relaxed mb-8">
          {language === 'nl' 
            ? 'Uw gegevens voor de analyse zijn succesvol ontvangen. Onze experts stellen een uitgebreid rapport op en sturen dit per e-mail naar u toe.' 
            : 'Your analysis data has been successfully received. Our experts are preparing a comprehensive report and will send it to your email shortly.'}
        </p>
        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all border-none cursor-pointer">
          {language === 'nl' ? 'Sluiten' : 'Close'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto relative shadow-2xl animate-fade-in-up border border-slate-200">
      <div className="p-10 lg:p-12">
        <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full border-none bg-transparent cursor-pointer text-slate-400 transition-colors"><X size={24}/></button>
        
        <div className="flex items-center gap-6 mb-10 border-b pb-8 border-slate-50">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-inner">{icon}</div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter m-0">{title}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 m-0">
                {language === 'nl' ? 'Gedetailleerde Analyse Aanvraag' : 'Detailed Analysis Request'}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 font-medium leading-relaxed mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
          "{description}"
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {language === 'nl' ? 'Volledige Naam' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-300" size={18}/>
                <input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {language === 'nl' ? 'Bedrijfsnaam' : 'Company Name'}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3.5 text-slate-300" size={18}/>
                <input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={formData.company} onChange={e=>setFormData({...formData, company: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {language === 'nl' ? 'Zakelijk E-mailadres' : 'Business Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-300" size={18}/>
                <input required type="email" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {language === 'nl' ? 'Telefoonnummer' : 'Phone Number'}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-slate-300" size={18}/>
                <input required type="tel" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100 space-y-6">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-blue-800 m-0 border-b border-blue-100 pb-4">
                {language === 'nl' ? 'Technische Parameters voor Analyse' : 'Technical Parameters for Analysis'}
            </h4>
            
            {serviceId === 'spot' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                          {language === 'nl' ? 'Lading & Volume (MT)' : 'Cargo & Volume (MT)'}
                        </label>
                        <input className="w-full p-3 bg-white border border-blue-100 rounded-lg outline-none" placeholder={language === 'nl' ? "bijv. 3000mt Staal" : "e.g. 3000mt Steel"} onChange={e=>setFormData({...formData, specificData: {...formData.specificData, cargo: e.target.value}})} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                          {language === 'nl' ? 'Route (Van - Naar)' : 'Route (From - To)'}
                        </label>
                        <input className="w-full p-3 bg-white border border-blue-100 rounded-lg outline-none" placeholder={language === 'nl' ? "bijv. RTM - BIL" : "e.g. RTM - BIL"} onChange={e=>setFormData({...formData, specificData: {...formData.specificData, route: e.target.value}})} />
                    </div>
                </div>
            )}

            {serviceId === 'coa' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                          {language === 'nl' ? 'Jaartonnage (Totaal)' : 'Annual Tonnage (Total)'}
                        </label>
                        <input className="w-full p-3 bg-white border border-blue-100 rounded-lg outline-none" placeholder={language === 'nl' ? "bijv. 50.000 MT per jaar" : "e.g. 50,000 MT per year"} onChange={e=>setFormData({...formData, specificData: {...formData.specificData, annualVolume: e.target.value}})} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                          {language === 'nl' ? 'Frequentie Shipments' : 'Shipment Frequency'}
                        </label>
                        <input className="w-full p-3 bg-white border border-blue-100 rounded-lg outline-none" placeholder={language === 'nl' ? "bijv. 1 shipment per maand" : "e.g. 1 shipment per month"} onChange={e=>setFormData({...formData, specificData: {...formData.specificData, frequency: e.target.value}})} />
                    </div>
                </div>
            )}

            {serviceId === 'project' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                          {language === 'nl' ? 'Max Afmetingen (LxBxH)' : 'Max Dimensions (LxWxH)'}
                        </label>
                        <input className="w-full p-3 bg-white border border-blue-100 rounded-lg outline-none" placeholder={language === 'nl' ? "bijv. 12 x 4 x 4 meter" : "e.g. 12 x 4 x 4 meters"} onChange={e=>setFormData({...formData, specificData: {...formData.specificData, dims: e.target.value}})} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                          {language === 'nl' ? 'Max Unit Gewicht (MT)' : 'Max Unit Weight (MT)'}
                        </label>
                        <input className="w-full p-3 bg-white border border-blue-100 rounded-lg outline-none" placeholder={language === 'nl' ? "bijv. 45 MT" : "e.g. 45 MT"} onChange={e=>setFormData({...formData, specificData: {...formData.specificData, weight: e.target.value}})} />
                    </div>
                </div>
            )}

            {(serviceId === 'compliance' || serviceId === 'risk' || serviceId === 'benchmark') && (
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                          {language === 'nl' ? 'Specifiek Focusgebied' : 'Specific Focus Area'}
                        </label>
                        <input className="w-full p-3 bg-white border border-blue-100 rounded-lg outline-none" placeholder={serviceId === 'compliance' ? (language === 'nl' ? 'bijv. EU ETS Kosten, Carbon Footprint' : 'e.g. EU ETS Costs, Carbon Footprint') : (language === 'nl' ? 'bijv. Route risico, prijs benchmarking' : 'e.g. Route risk, price benchmarking')} onChange={e=>setFormData({...formData, specificData: {...formData.specificData, focus: e.target.value}})} />
                    </div>
                </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                {language === 'nl' ? 'Aanvullende Omschrijving / Toelichting' : 'Additional Description / Remarks'}
              </label>
              <textarea 
                rows={4} 
                className="w-full p-4 bg-white border border-blue-100 rounded-xl outline-none text-sm font-medium" 
                placeholder={language === 'nl' ? "Beschrijf hier uw specifieke situatie voor een nauwkeurige analyse..." : "Describe your specific situation for an accurate analysis..."}
                value={formData.details}
                onChange={e=>setFormData({...formData, details: e.target.value})}
              />
            </div>

            <div className="flex items-center gap-4 p-4 bg-white border border-blue-100 rounded-xl">
                <Upload size={20} className="text-blue-500"/>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest m-0 truncate">
                        {formData.fileName ? (language === 'nl' ? 'Bestand Geselecteerd' : 'File Selected') : (language === 'nl' ? 'Upload Documenten (Optioneel)' : 'Upload Documents (Optional)')}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold m-0 uppercase truncate">
                        {formData.fileName || (language === 'nl' ? 'Plannen, offertes of specificaties (PDF/JPG)' : 'Plans, quotes or specifications (PDF/JPG)')}
                    </p>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                />
                <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border-none cursor-pointer hover:bg-blue-100 transition-all"
                >
                    {formData.fileName ? (language === 'nl' ? 'Wijzigen' : 'Change') : (language === 'nl' ? 'Bestand Kiezen' : 'Choose File')}
                </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={status === 'submitting'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-50 border-none cursor-pointer"
          >
            {status === 'submitting' ? <Loader2 className="animate-spin" size={24}/> : <Send size={20}/>}
            {language === 'nl' ? 'Analyse Aanvraag Verzenden' : 'Submit for Analysis'}
          </button>
          
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest m-0">
            {language === 'nl' 
                ? 'Door te verzenden gaat u akkoord met onze privacyvoorwaarden. Uw analyse wordt binnen 24 uur verzonden.' 
                : 'By submitting you agree to our privacy terms. Your analysis will be sent within 24 hours.'}
          </p>
        </form>
      </div>
    </div>
  );
};

const Services: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<{ id: string, title: string, desc: string, icon: any } | null>(null);

  const servicesList = [
    { id: 'spot', title: t.service1Title, desc: t.service1Text, icon: <Ship size={32} /> },
    { id: 'coa', title: t.service2Title, desc: t.service2Text, icon: <Package size={32} /> },
    { id: 'project', title: t.service3Title, desc: t.service3Text, icon: <Anchor size={32} /> },
    { id: 'compliance', title: t.service4Title, desc: t.service4Text, icon: <ShieldCheck size={32} /> },
    { id: 'risk', title: t.service5Title, desc: t.service5Text, icon: <Truck size={32} /> },
    { id: 'benchmark', title: t.serviceFreightTitle, desc: t.serviceFreightText, icon: <Calculator size={32} /> }
  ];

  const handleQuoteValidationClick = () => {
    window.scrollTo(0, 0);
    navigate('/insights?tab=analyzer');
  };

  return (
    <div className="bg-white py-20 relative min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">{t.servicesTitle}</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">{t.servicesText}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {servicesList.map((service) => (
            <div 
              key={service.id} 
              onClick={() => {
                if (service.id === 'benchmark') {
                    handleQuoteValidationClick();
                } else {
                    setSelectedService(service);
                }
              }}
              className="flex space-x-6 p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-blue-200 hover:bg-slate-50 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                  {service.icon}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{service.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium mb-4">
                  {service.desc}
                </p>
                <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    {language === 'nl' ? (service.id === 'benchmark' ? 'Direct Valideren' : 'Start Analyse') : (service.id === 'benchmark' ? 'Validate Now' : 'Start Analysis')} &rarr;
                </div>
              </div>
            </div>
          ))}

          <div 
            onClick={handleQuoteValidationClick}
            className="flex space-x-6 p-8 rounded-[2rem] bg-slate-900 border border-slate-800 hover:bg-black transition-all cursor-pointer group shadow-2xl hover:-translate-y-1 md:col-span-2 lg:col-span-1"
          >
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <FileSearch size={32} />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{t.serviceAnalyzerTitle}</h3>
              <p className="text-slate-400 leading-relaxed text-sm font-medium mb-4">
                {t.serviceAnalyzerText}
              </p>
              <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                  {language === 'nl' ? 'Direct Valideren' : 'Validate Now'} &rarr;
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-24 bg-slate-50 border border-slate-200 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <h2 className="text-3xl lg:text-4xl font-black mb-6 uppercase tracking-tighter text-slate-900">{t.servicesCtaTitle}</h2>
            <p className="text-slate-500 mb-10 max-w-2xl mx-auto font-medium text-lg leading-relaxed">{t.servicesCtaText}</p>
            <Link to="/contact" className="inline-flex px-10 py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl hover:-translate-y-1">
                {t.servicesCtaButton}
            </Link>
        </div>
      </div>

      {selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedService(null)}></div>
            <ServiceInquiryModal 
              serviceId={selectedService.id}
              title={selectedService.title}
              description={selectedService.desc}
              icon={selectedService.icon}
              onClose={() => setSelectedService(null)}
            />
        </div>
      )}
    </div>
  );
};

export default Services;
