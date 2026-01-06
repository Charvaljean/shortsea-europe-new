
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { useLanguage } from '../App';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  // For demo purposes, we fetch the code to display it (in a real app, this wouldn't be here)
  const [demoCode, setDemoCode] = useState<string>('');

  useEffect(() => {
    // In a real app, you would NEVER do this.
    // This is strictly for the demo so the user knows what to type
    // FIX: Wrap async call to getUsers
    const fetchCode = async () => {
        const users = await storageService.getUsers();
        const user = users.find(u => u.email === email);
        if (user && user.verificationCode) {
            setDemoCode(user.verificationCode);
        }
    };
    fetchCode();
  }, [email]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await storageService.verifyUserEmail(email, code);
    
    if (success) {
        setStatus('success');
        setTimeout(() => {
            navigate('/login');
        }, 2000);
    } else {
        setStatus('error');
        setErrorMsg('Invalid code');
    }
  };

  const handleResend = async () => {
    // FIX: await resendVerificationCode call
    const newCode = await storageService.resendVerificationCode(email);
    if (newCode) {
        setDemoCode(newCode);
        alert(`New code sent: ${newCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center">
        
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={32} />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {language === 'en' ? 'Check your Inbox' : 'Controleer uw Inbox'}
        </h2>
        <p className="text-slate-600 mb-8">
            {language === 'en' 
                ? `We've sent a verification code to ${email}. Please enter it below to activate your account.` 
                : `We hebben een verificatiecode gestuurd naar ${email}. Voer deze hieronder in om uw account te activeren.`}
        </p>

        {/* DEMO HELP BOX */}
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6 text-sm">
            <strong>Demo Mode:</strong> The email system is simulated.
            <br />
            Your code is: <span className="font-mono font-bold text-lg">{demoCode}</span>
        </div>

        {status === 'success' ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center justify-center gap-2 mb-6">
                <CheckCircle size={20} />
                <span>Email Verified! Redirecting...</span>
            </div>
        ) : (
            <form onSubmit={handleVerify} className="space-y-6">
                <div>
                    <input 
                        type="text" 
                        maxLength={6}
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        className="w-full text-center text-3xl font-mono tracking-widest py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                        placeholder="000000"
                    />
                    {status === 'error' && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}
                </div>

                <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                    {language === 'en' ? 'Verify Email' : 'Verifieer Email'}
                </button>
            </form>
        )}

        <div className="mt-6 flex justify-between items-center text-sm">
            <button onClick={handleResend} className="text-blue-600 hover:underline flex items-center gap-1">
                <RefreshCw size={14} /> Resend Code
            </button>
            <Link to="/login" className="text-slate-500 hover:text-slate-800">
                Back to Login
            </Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyEmail;
