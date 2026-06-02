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

        {/* Professional Authorized Credentials Tip */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Authorized Portal Instructions
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-650 space-y-1.5 leading-relaxed">
            <p>
              To create new user accounts, sign in first as the default Portal Administrator:
            </p>
            <div className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-[10px] space-y-1 text-slate-800">
              <div>Email: <span className="font-bold text-blue-600">sashaown99@gmail.com</span></div>
              <div>Password: <span className="font-bold text-blue-600">password</span></div>
            </div>
            <p className="text-[10px] text-slate-500">
              Once inside, navigate to <strong>&quot;Create a New User&quot;</strong> to dynamically add staff/agents, who can then log in independently with their respective usernames or emails to manage or submit tickets.
            </p>
          </div>
        </div>



      </div>
    </div>
  );
}
