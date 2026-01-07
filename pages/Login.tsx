
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ship, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useLanguage } from '../App';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard'); 
    } else {
      if (result.error === 'Email not verified') {
          // Provide link to verification page if email exists but unverified
          setError(language === 'en' ? 'Account exists but email is not verified.' : 'Account bestaat, maar email is niet geverifieerd.');
          // Optional: You could redirect them to verify page, but let's keep it simple with an error
      } else {
          setError(language === 'en' ? 'Invalid email or password' : 'Ongeldig e-mailadres of wachtwoord');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4">
            <Ship size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">
            {language === 'en' ? 'Welcome Back' : 'Welkom Terug'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {language === 'en' ? 'Sign in to access your dashboard' : 'Log in voor toegang tot uw dashboard'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center text-sm">
              <AlertCircle size={16} className="mr-2" /> {error}
              {error.includes('verified') && (
                  <Link to={`/verify-email?email=${encodeURIComponent(email)}`} className="ml-2 underline font-bold">
                      Verify Now
                  </Link>
              )}
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/30"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <ArrowRight className="h-5 w-5 text-blue-500 group-hover:text-blue-400" aria-hidden="true" />
              </span>
              {language === 'en' ? 'Sign in' : 'Inloggen'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-500">
             {language === 'en' ? "Don't have an account?" : "Nog geen account?"}
          </span>{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
             {language === 'en' ? "Register for free" : "Gratis registreren"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
