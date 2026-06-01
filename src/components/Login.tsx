import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Key, Mail, LogIn } from 'lucide-react';

export default function Login() {
  const { users, setCurrentUser } = useApp();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedInput = emailInput.trim().toLowerCase();
    const user = users.find(u => 
      (u.email && u.email.toLowerCase() === trimmedInput) ||
      (u.username && u.username.toLowerCase() === trimmedInput)
    );

    if (user) {
      if (user.isActive === false) {
        setErrorMsg('This account has been deactivated by administration. Contact support.');
        return;
      }

      // Enforce password verification. 
      // Newly created users have custom passwords.
      // Predefined default accounts use 'password' as their default sign-in password.
      const requiredPassword = user.password || 'password';
      if (passwordInput !== requiredPassword) {
        setErrorMsg('Invalid password. (Hint: default accounts use "password")');
        return;
      }

      setCurrentUser(user);
    } else {
      setErrorMsg('No account found with this email Address or corporate username.');
    }
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
            <label className="block text-xs font-bold text-slate-800" htmlFor="login_email">
              Corporate Email Address or Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="login_email"
                type="text"
                required
                placeholder="e.g. employee@company.com or employee99"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 transition font-medium"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800" htmlFor="login_password">
              Security Password
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
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer pt-3 pb-3"
          >
            <LogIn className="w-4 h-4" />
            Sign In Securely
          </button>
        </form>

        {/* Sandbox Quick-Login Switcher */}
        {users.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Sandbox Simulator &mdash; Quick Sign-In
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto pr-1">
              {users.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setCurrentUser(u)}
                  className="w-full text-left bg-slate-50 hover:bg-blue-50/40 active:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl p-2.5 flex items-center justify-between transition cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-500/10 uppercase shrink-0">
                      {u.name.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate leading-tight group-hover:text-blue-700 transition">
                        {u.name}
                      </p>
                      <p className="text-[9px] text-slate-500 truncate mt-0.5 leading-none">
                        User: <span className="font-mono font-semibold">{u.username || u.email.split('@')[0]}</span>
                      </p>
                    </div>
                  </div>
                  <span className="bg-white px-2 py-0.5 rounded text-[8px] font-bold text-slate-600 uppercase border border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-700 group-hover:border-blue-200 transition">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}



      </div>
    </div>
  );
}
