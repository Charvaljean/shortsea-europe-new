
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ship, Lock, Mail, User as UserIcon, Building2, Phone, AlertCircle } from 'lucide-react';
import { useLanguage } from '../App';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    password: '',
    confirmPassword: '',
    website_url: '' // Honeypot field
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // HONEYPOT CHECK
    // If a bot filled this invisible field, silent fail or block
    if (formData.website_url) {
        console.warn("Bot detected via honeypot");
        return; // Silent block
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      company: formData.company,
      phone: formData.phone
    }, formData.password);

    if (result.success) {
      // Redirect to verification page instead of dashboard
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } else {
      setError("Registration failed. Email might be taken.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-slate-900 rounded-xl flex items-center justify-center text-white mb-4">
            <Ship size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">
            {language === 'en' ? 'Create Account' : 'Account Aanmaken'}
          </h2>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center text-sm">
              <AlertCircle size={16} className="mr-2" /> {error}
            </div>
          )}
          
          {/* Honeypot Field - Hidden from humans */}
          <input 
            type="text" 
            name="website_url" 
            style={{ display: 'none' }} 
            value={formData.website_url}
            onChange={e => setFormData({...formData, website_url: e.target.value})}
            tabIndex={-1} 
            autoComplete="off"
          />

          <div className="grid grid-cols-2 gap-4">
             <div className="relative">
                <UserIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
             </div>
             <div className="relative">
                <Building2 className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                />
             </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="email"
              required
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email Address"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="tel"
              required
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="password"
              required
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

           <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="password"
              required
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-lg"
          >
            {language === 'en' ? 'Register' : 'Registreren'}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-500">
             {language === 'en' ? "Already have an account?" : "Heeft u al een account?"}
          </span>{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
             {language === 'en' ? "Login" : "Inloggen"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
