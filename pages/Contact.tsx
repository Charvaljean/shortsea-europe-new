
import React, { useState, useRef } from 'react';
import { useLanguage } from '../App';
import { storageService } from '../services/storageService';
import { Mail, Phone, MapPin, CheckCircle, Loader2, Building2, Upload, X, Paperclip } from 'lucide-react';

const Contact: React.FC = () => {
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    message: '',
    fileName: '',
    fileData: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setFormData(prev => ({ ...prev, fileName: file.name, fileData: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, fileName: '', fileData: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    
    // Use timeout to show loading state briefly, then save to DB
    setTimeout(() => {
      try {
        const finalMessage = formData.message + (formData.fileName ? `\n\n[BIJLAGE BIJGEVOEGD: ${formData.fileName}]` : '');
        
        storageService.sendMessage(false, 'guest', finalMessage, {
          subject: `New Inquiry from ${formData.firstName} ${formData.lastName}`,
          guestDetails: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            company: formData.company
          },
          type: 'inquiry',
          attachment: formData.fileName ? { name: formData.fileName, data: formData.fileData } : null
        });
        
        setStatus('success');
        setFormData({ firstName: '', lastName: '', company: '', email: '', message: '', fileName: '', fileData: '' });
      } catch (error) {
        console.error(error);
        alert("Failed to send message. Please try again.");
        setStatus('idle');
      }
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-gray-50 py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-6">{t.contactTitle}</h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              {t.contactIntro}
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white rounded-lg shadow-sm text-blue-600">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{t.contactHq}</h3>
                  <p className="text-slate-600">Willemskade 12<br/>3016 DA Rotterdam<br/>The Netherlands</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white rounded-lg shadow-sm text-blue-600">
                   <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{t.contactPhone}</h3>
                  <p className="text-slate-600">+31 10 123 4567 (24/7 Desk)</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white rounded-lg shadow-sm text-blue-600">
                   <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{t.contactEmail}</h3>
                  <p className="text-slate-600">chartering@shortsea-europe.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t.contactFormTitle}</h2>
            
            {status === 'success' ? (
              <div className="text-center py-12 animate-fade-in-up">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                <p className="text-slate-600 mb-6">Thank you for contacting us. We will get back to you shortly.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="px-6 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors border-none cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t.formFirstName}</label>
                      <input 
                        type="text" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t.formLastName}</label>
                      <input 
                        type="text" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t.formCompany}</label>
                        <input 
                            type="text" 
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t.formEmail}</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">{t.formMessage}</label>
                   <textarea 
                      rows={4} 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   ></textarea>
                </div>

                {/* FILE UPLOAD SECTION */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">{language === 'en' ? 'Attachments (Optional)' : 'Bijlagen (Optioneel)'}</label>
                    <div className={`flex items-center gap-4 p-4 border border-gray-300 rounded-lg transition-all ${formData.fileName ? 'bg-blue-50 border-blue-200' : 'bg-slate-50'}`}>
                        <div className="flex-shrink-0">
                            {formData.fileName ? <CheckCircle className="text-green-500" size={20}/> : <Upload className="text-blue-600" size={20}/>}
                        </div>
                        <div className="flex-1 truncate">
                            <p className="text-xs font-bold text-slate-800 truncate m-0">
                                {formData.fileName ? formData.fileName : (language === 'en' ? 'Upload files (PDF, JPG, PNG)' : 'Documenten uploaden (PDF, JPG, PNG)')}
                            </p>
                            {formData.fileName && <p className="text-[10px] text-blue-600 font-bold m-0 uppercase tracking-tighter">Ready to send</p>}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <div className="flex gap-2">
                            {formData.fileName ? (
                                <button 
                                    type="button" 
                                    onClick={removeFile}
                                    className="p-1.5 hover:bg-red-50 text-red-500 rounded-md transition-colors border-none bg-transparent cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-1.5 bg-white border border-gray-300 text-slate-700 rounded-md text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-all shadow-sm"
                                >
                                    {language === 'en' ? 'Browse' : 'Bladeren'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'sending'}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border-none cursor-pointer"
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Sending...
                    </>
                  ) : (
                    <>
                      {t.formSend}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
