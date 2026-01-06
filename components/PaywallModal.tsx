
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Check, Crown } from 'lucide-react';
import { useLanguage } from '../App';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';

interface PaywallModalProps {
  onClose: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleDirectUpgrade = () => {
      if (!user) return; // Should not happen given the UI logic below

      const confirmMsg = language === 'en' 
        ? "Proceed to Payment (Simulation) for Pro Plan?"
        : "Ga door naar betaling (Simulatie) voor Pro Plan?";
        
      if (confirm(confirmMsg)) {
          const updated = storageService.updateUserSubscription(user.id, 'pro');
          if (updated) {
              updateUser({ subscriptionPlan: 'pro' });
              alert(language === 'en' ? "Upgrade Successful!" : "Upgrade Geslaagd!");
              onClose(); // Close modal on success
          } else {
              alert(language === 'en' ? "Upgrade failed. User not found." : "Upgrade mislukt. Gebruiker niet gevonden.");
          }
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors z-10"
        >
          <X size={20} />
        </button>
        
        <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {language === 'en' ? 'Usage Limit Reached' : 'Gebruikslimiet Bereikt'}
            </h2>
            <p className="text-slate-600 mb-8">
                {language === 'en' 
                    ? 'You have used your free daily tools and indications. To ensure fair usage and access professional features, please upgrade your plan.' 
                    : 'U heeft uw gratis dagelijkse tools en indicaties gebruikt. Voor onbeperkte toegang en professionele functies, upgrade uw abonnement.'}
            </p>

            <div className="bg-slate-50 rounded-xl p-6 border border-gray-200 mb-8 text-left">
                <h3 className="font-bold text-slate-900 mb-4">{language === 'en' ? 'Professional Plan Includes:' : 'Professioneel Plan Bevat:'}</h3>
                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-slate-700">
                        <Check className="text-green-500 flex-shrink-0" size={18} />
                        <span>{language === 'en' ? 'Unlimited Freight Calculations' : 'Onbeperkte Vrachtberekeningen'}</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-700">
                        <Check className="text-green-500 flex-shrink-0" size={18} />
                        <span>{language === 'en' ? 'Unlimited Tool Usage (Ice, Laytime, Distance)' : 'Onbeperkt Tool Gebruik (IJs, Ligtijd, Afstand)'}</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-700">
                        <Check className="text-green-500 flex-shrink-0" size={18} />
                        <span>{language === 'en' ? 'Full Market Insights Access' : 'Volledige Toegang tot Marktinzichten'}</span>
                    </li>
                </ul>
            </div>

            <div className="space-y-3">
                {user ? (
                    <button 
                        onClick={handleDirectUpgrade}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Crown size={18} />
                        {language === 'en' ? 'Upgrade Now (€49/mo)' : 'Nu Upgraden (€49/mnd)'}
                    </button>
                ) : (
                    <button 
                        onClick={() => navigate('/register')}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                    >
                        {language === 'en' ? 'Create Account & Upgrade' : 'Account Aanmaken & Upgraden'}
                    </button>
                )}
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-white border border-gray-300 text-slate-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                    {language === 'en' ? 'Not Now' : 'Niet Nu'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
