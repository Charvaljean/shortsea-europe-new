import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../App';
import { CargoRequest, QuoteResult } from '../types';
import { getFreightQuote } from '../services/geminiService';

interface CargoFormProps {
  onQuoteReceived: (quote: QuoteResult) => void;
}

const CargoForm: React.FC<CargoFormProps> = ({ onQuoteReceived }) => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<CargoRequest>({
    cargoType: '',
    volume: '',
    loadPort: '',
    dischargePort: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const quote = await getFreightQuote(request, language);
      onQuoteReceived(quote);
    } catch (error) {
      console.error(error);
      alert("Error calculating quote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.formTitle}</h2>
        <p className="text-slate-500 text-sm">Enter your cargo details to receive a real-time AI-generated indication.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">{t.cargoLabel}</label>
            <input
              required
              type="text"
              placeholder={language === 'en' ? "e.g. Steel Coils, Wheat, Project Cargo" : "bijv. Staalrollen, Tarwe, Projectlading"}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              value={request.cargoType}
              onChange={e => setRequest({...request, cargoType: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">{t.volumeLabel}</label>
            <input
              required
              type="number"
              placeholder="3000"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              value={request.volume}
              onChange={e => setRequest({...request, volume: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">{t.loadLabel}</label>
            <input
              required
              type="text"
              placeholder={language === 'en' ? "e.g. Rotterdam, Antwerp" : "bijv. Rotterdam, Antwerpen"}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              value={request.loadPort}
              onChange={e => setRequest({...request, loadPort: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">{t.dischLabel}</label>
            <input
              required
              type="text"
              placeholder={language === 'en' ? "e.g. Bilbao, Genoa" : "bijv. Bilbao, Genua"}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              value={request.dischargePort}
              onChange={e => setRequest({...request, dischargePort: e.target.value})}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              <span>{t.loading}</span>
            </>
          ) : (
            <>
              <span>{t.submitButton}</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CargoForm;
