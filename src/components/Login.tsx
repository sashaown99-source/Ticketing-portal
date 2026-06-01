import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, User as UserIcon, LogIn, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { Role } from '../types';

const ROLE_DETAILS: Record<Role, { label: string; badgeStyle: string; icon: string }> = {
  'agent': { label: 'Support Desk Agent', badgeStyle: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30', icon: '📞' },
  'Supervisor': { label: 'Operations Supervisor', badgeStyle: 'bg-violet-500/20 text-violet-300 border border-violet-500/30', icon: '⚡' },
  'Manager': { label: 'Business Unit Manager', badgeStyle: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30', icon: '💼' },
  'Admin': { label: 'Portal Administrator', badgeStyle: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', icon: '👤' },
  'IT': { label: 'IT Systems Engineer', badgeStyle: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30', icon: '💻' },
  'HR': { label: 'HR Lead Specialist', badgeStyle: 'bg-amber-500/20 text-amber-300 border border-amber-500/30', icon: '🤝' },
  'Finance': { label: 'Finance Controller', badgeStyle: 'bg-teal-500/20 text-teal-300 border border-teal-500/30', icon: '🪙' },
  'Admin access': { label: 'Master Systems Admin', badgeStyle: 'bg-rose-500/20 text-rose-300 border border-rose-500/30', icon: '👑' },
};

export default function Login() {
  const { users, setCurrentUser, registerUser, resetState } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('IT');
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickLogin = (userId: string) => {
    setErrorMsg('');
    const user = users.find(u => u.id === userId);
    if (user) {
      if (user.isActive === false) {
        setErrorMsg('This simulation account has been set to Inactive. It cannot be used to sign in.');
        return;
      }
      setCurrentUser(user);
    }
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const user = users.find(u => u.email.toLowerCase() === customEmail.trim().toLowerCase());
    if (user) {
      if (user.isActive === false) {
        setErrorMsg('This simulation account has been deactivated by administration. Contact support.');
        return;
      }
      setCurrentUser(user);
    } else {
      setErrorMsg('User with this email not found. Try one of the quick login presets or register below.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please enter both name and email.');
      return;
    }
    const emailExists = users.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (emailExists) {
      setErrorMsg('Email already registered.');
      return;
    }
    const newUser = registerUser(name.trim(), email.trim(), role);
    setCurrentUser(newUser);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-12 border border-slate-100">
        
        {/* Left Side: Brand & Quick Selection */}
        <div className="md:col-span-12 lg:col-span-5 bg-slate-900 text-white p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-wide">Sheba.xyz Ticketing portal</span>
            </div>
            
            <h2 className="text-2xl font-semibold mb-2 animate-fade-in">Simulated Sandbox Environment</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              This dynamic portal demonstrates support processes. Switch between simulated roles instantly for evaluation.
            </p>

            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase block mb-3">Quick Actions (Try any profile)</span>
            <div className="space-y-2 mb-4 max-h-[380px] overflow-y-auto pr-1">
              {users.map(u => {
                const isUserActive = u.isActive !== false;
                const details = ROLE_DETAILS[u.role] || { label: 'Personnel', badgeStyle: 'bg-slate-600/30 text-slate-300 border border-slate-705', icon: '👤' };
                return (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u.id)}
                    className={`w-full text-left p-3 rounded-xl transition border flex items-center gap-3 group ${
                      isUserActive
                        ? 'bg-slate-800 hover:bg-slate-700 border-slate-700/50 hover:border-blue-500/40'
                        : 'bg-slate-900 border-slate-850 opacity-40 relative'
                    }`}
                  >
                    <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full border border-slate-700" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate group-hover:text-white ${isUserActive ? 'text-slate-200' : 'text-slate-500 line-through'}`}>{u.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{details.label}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1 ${details.badgeStyle}`}>
                        <span>{details.icon}</span>
                        <span>{u.role}</span>
                      </span>
                      {!isUserActive && (
                        <span className="text-[8px] bg-red-900/65 text-red-300 border border-red-500/30 font-bold px-1.5 py-0.5 rounded uppercase leading-none shadow-sm">
                          Inactive
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button 
              onClick={resetState}
              className="w-full flex items-center justify-center gap-2 text-xs py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition"
            >
              <RefreshCw className="w-3 h-3" />
              Reset All Sandbox Data
            </button>
          </div>
        </div>

        {/* Right Side: Traditional Login / Register Form */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-slate-800 mb-1">
              {isRegister ? 'Register Employee Account' : 'IT System Sign-in'}
            </h3>
            <p className="text-slate-500 text-sm">
              {isRegister ? 'Create a secure simulation account.' : 'Sign in using any email or simulate credentials.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-150">
              {errorMsg}
            </div>
          )}

          {!isRegister ? (
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black mb-1.5" htmlFor="login_email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    id="login_email"
                    type="email"
                    required
                    placeholder="e.g. sasha.c@company.internal"
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 transition font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 Hint: Enter any user's email like <strong className="text-slate-700">employee@company.com</strong> or custom.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5" htmlFor="login_password">
                  Security Password
                </label>
                <input
                  id="login_password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 transition font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2.5 rounded-xl text-sm transition shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In securely
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black mb-1.5" htmlFor="reg_name">
                  Full Name
                </label>
                <input
                  id="reg_name"
                  type="text"
                  required
                  placeholder="e.g. Oliver Twist"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5" htmlFor="reg_email">
                  Email Address
                </label>
                <input
                  id="reg_email"
                  type="email"
                  required
                  placeholder="oliver@company.internal"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5">
                  Select Sandbox Assigned Role
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white font-medium text-slate-750 transition"
                >
                  <option value="agent">📞 agent &mdash; Support Desk Agent</option>
                  <option value="Supervisor">⚡ Supervisor &mdash; Operations Supervisor</option>
                  <option value="Manager">💼 Manager &mdash; Business Unit Manager</option>
                  <option value="Admin">👤 Admin &mdash; Portal Administrator</option>
                  <option value="IT">💻 IT &mdash; IT Systems Engineer</option>
                  <option value="HR">🤝 HR &mdash; HR Lead Specialist</option>
                  <option value="Finance">🪙 Finance &mdash; Finance Controller</option>
                  <option value="Admin access">👑 Admin access &mdash; Master Systems Admin</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2.5 rounded-xl text-sm transition shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Register Simulation Account
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            {isRegister ? (
              <span>Already registered? <button onClick={() => setIsRegister(false)} className="text-blue-600 hover:underline font-semibold ml-1">Log in here</button></span>
            ) : (
              <span>Need to simulate registration? <button onClick={() => setIsRegister(true)} className="text-blue-600 hover:underline font-semibold ml-1">Create account</button></span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
