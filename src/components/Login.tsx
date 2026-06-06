import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Key, Mail, LogIn } from 'lucide-react';
import { Role } from '../types';

export default function Login() {
  const { users, setCurrentUser, registerUser } = useApp();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('Agent');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    if (!emailInput.trim()) {
      setErrorMsg('Please enter a username or email address.');
      setIsSubmitting(false);
      return;
    }

    const trimmedInput = emailInput.trim().toLowerCase();

    // Verification against local memory state list of users (e.g. for offline use or default system admins)
    const localUser = users.find(u => 
      (u.email && u.email.toLowerCase() === trimmedInput) ||
      (u.username && u.username.toLowerCase() === trimmedInput)
    );

    if (localUser) {
      if (localUser.isActive === false) {
        setErrorMsg('This account has been deactivated by administration. Contact support.');
        setIsSubmitting(false);
        return;
      }

      const requiredPassword = localUser.password || 'password';
      if (passwordInput !== requiredPassword) {
        setErrorMsg('Invalid password. (Hint: default accounts use "password")');
        setIsSubmitting(false);
        return;
      }

      setCurrentUser(localUser);
    } else {
      // Dynamic on-the-fly registration to satisfy "jekono user pass dia login korte parbo"
      const cleanName = emailInput.split('@')[0];
      const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      
      const registered = registerUser(
        capitalizedName,
        emailInput.includes('@') ? emailInput : `${emailInput}@sheba.xyz`,
        'Agent', // Fallback default role for completely new login attempts
        emailInput,
        `EMP-${Math.floor(100 + Math.random() * 900)}`,
        'Support desk team',
        passwordInput || 'password'
      );
      
      setCurrentUser(registered);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex justify-center pb-2">
            <img 
              src="/src/assets/images/sheba_logo_1780297177657.png" 
              alt="Sheba.xyz" 
              className="w-20 h-20 object-contain rounded-2xl shadow-sm border border-slate-100/60"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Sheba.xyz Ticketing Portal</h2>
          <p className="text-slate-500 text-xs">Sign in to your authorized support or manager desk account.</p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-150 font-bold leading-relaxed">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Simple Login Form */}
        <form onSubmit={handleCustomLogin} className="space-y-4">
          
          {/* Email / Username field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700" htmlFor="login_email">
              Email or Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="login_email"
                type="text"
                required
                placeholder="Enter email or username"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 transition font-medium"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700" htmlFor="login_password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Key className="w-4 h-4" />
              </span>
              <input
                id="login_password"
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 transition font-medium"
              />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#c2185b] hover:bg-[#ad144e] active:bg-[#880e4f] text-white font-bold py-2.5 rounded-xl text-sm transition shadow-md shadow-pink-500/10 flex items-center justify-center gap-2 cursor-pointer pt-3 pb-3 disabled:opacity-55 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying Account...
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>



      </div>
    </div>
  );
}
