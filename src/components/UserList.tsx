import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role, User } from '../types';
import { Search, Mail, Building, Hash, Shield, UserCheck, AlertCircle, Edit, X, Key, Eye, EyeOff, Save, User as UserIcon } from 'lucide-react';

const ROLE_DETAILS: Record<Role, { label: string; badgeStyle: string; icon: string }> = {
  'Agent': { label: 'Support Desk Agent', badgeStyle: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20', icon: '📞' },
  'Supervisor': { label: 'Operations Supervisor', badgeStyle: 'bg-violet-500/10 text-violet-400 border border-violet-500/20', icon: '⚡' },
  'Super Admin': { label: 'Master Systems Admin', badgeStyle: 'bg-rose-500/10 text-rose-400 border border-rose-500/20', icon: '👑' },
};

export default function UserList() {
  const { users, updateUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // State for active edit target
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Telesales');
  const [role, setRole] = useState<Role>('Agent');
  const [password, setPassword] = useState('');
  const [isActiveState, setIsActiveState] = useState(true);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.employeeId && user.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalActive = users.filter(u => u.isActive !== false).length;
  const totalInactive = users.length - totalActive;

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setUsername(user.username || '');
    setEmployeeId(user.employeeId || '');
    setDepartment(user.department || '');
    setRole(user.role);
    setPassword(user.password || 'password');
    setIsActiveState(user.isActive !== false);
    setFormError('');
    setFormSuccess('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name.trim() || !email.trim() || !username.trim() || !password.trim() || !employeeId.trim() || !department.trim()) {
      setFormError('Please fill in all the required fields correctly.');
      return;
    }

    // Check for duplicates excluding the editing user himself
    const otherUsers = users.filter(u => u.id !== editingUser?.id);
    
    if (otherUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setFormError('Email address already registered to another user.');
      return;
    }
    if (otherUsers.some(u => u.username?.toLowerCase() === username.trim().toLowerCase())) {
      setFormError('Username has been claimed by another account.');
      return;
    }
    if (otherUsers.some(u => u.employeeId?.toLowerCase() === employeeId.trim().toLowerCase())) {
      setFormError('Employee ID already is assigned to another user.');
      return;
    }

    if (editingUser) {
      updateUser(
        editingUser.id,
        name.trim(),
        email.trim(),
        role,
        username.trim(),
        employeeId.trim(),
        department.trim(),
        password.trim(),
        isActiveState
      );

      setFormSuccess('Successfully updated user details!');
      
      // Auto-close modal after success animations
      setTimeout(() => {
        setEditingUser(null);
      }, 800);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d1527] p-6 rounded-2xl border border-slate-800/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/15 text-blue-400 rounded-xl border border-blue-500/10">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-100">System User Directory</h3>
            <p className="text-slate-400 text-xs">Official corporate directory of Sheba.xyz support agents, managers, and IT personnel.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-500/15 uppercase tracking-wide flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {totalActive} Active
          </span>
          {totalInactive > 0 && (
            <span className="bg-rose-500/10 text-rose-400 text-[10px] font-bold px-2.5 py-1 rounded border border-rose-500/15 uppercase tracking-wide flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              {totalInactive} Disabled
            </span>
          )}
        </div>
      </div>

      {/* Controls: Search and Filter */}
      <div className="bg-[#0d1527] p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-450" />
          <input
            type="text"
            placeholder="Search users by name, email, employee ID, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111a2f] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-100 font-semibold"
          />
        </div>
        <div className="w-full md:w-56">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-[#111a2f] border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-100 font-bold"
          >
            <option value="all">📁 All Roles / Departments</option>
            <option value="Agent">📞 Support Agent</option>
            <option value="Supervisor">⚡ Supervisor</option>
            <option value="Super Admin">👑 Super Admin</option>
          </select>
        </div>
      </div>

      {/* Users List Cards Rendering */}
      {filteredUsers.length === 0 ? (
        <div className="bg-[#0d1527] rounded-2xl p-12 border border-slate-800/80 text-center space-y-3">
          <div className="p-3 bg-slate-800/50 w-fit mx-auto rounded-full text-slate-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-300">No users found matching filters</p>
          <p className="text-xs text-slate-500">Try adjusting your keyword search or selected portal role.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => {
            const details = ROLE_DETAILS[user.role] || { label: 'Personnel', badgeStyle: 'bg-slate-800 text-slate-400 border border-slate-700', icon: '👤' };
            const isActive = user.isActive !== false;

            return (
              <div 
                key={user.id}
                className={`bg-[#0d1527] border rounded-2xl p-5 hover:border-slate-700 transition duration-200 flex flex-col justify-between ${
                  isActive ? 'border-slate-800/80' : 'border-rose-950/45 bg-[#0e1220]'
                }`}
              >
                {/* Header Profile Info */}
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full border mr-1 flex items-center justify-center bg-slate-800/80 text-slate-400 ${
                      isActive ? 'border-slate-700' : 'border-rose-900/50 opacity-60'
                    }`}>
                      <UserIcon className="w-6 h-6 text-slate-300" />
                    </div>
                    <span className={`absolute bottom-0 right-1 w-3 h-3 rounded-full border-2 border-[#0d1527] ${
                      isActive ? 'bg-emerald-500' : 'bg-rose-500'
                    }`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-sm font-bold truncate ${isActive ? 'text-slate-100' : 'text-slate-500 line-through'}`}>
                      {user.name}
                    </h4>
                    <p className="text-[10px] text-slate-450 font-mono truncate">{user.username || `@${user.name.split(' ')[0].toLowerCase()}`}</p>
                    
                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded uppercase mt-2 ${details.badgeStyle}`}>
                      <span>{details.icon}</span>
                      <span>{user.role}</span>
                    </span>
                  </div>
                </div>

                {/* Body Meta Details */}
                <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                    <span className="truncate text-slate-400 font-medium select-all">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                    <span className="truncate text-slate-400 font-medium">{user.department || 'General Operations'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                    <span className="font-mono text-[11px] text-slate-400 font-bold">{user.employeeId || 'EMP-DYNAMIC'}</span>
                  </div>
                </div>

                {/* Footer Account Status & Edit profile button */}
                <div className="mt-4 pt-3 border-t border-slate-800/30 flex items-center justify-between gap-4">
                  <div className="text-[10px] font-bold text-slate-450 flex flex-col">
                    <span className="text-[8px] uppercase tracking-wide">SYSTEM STATUS:</span>
                    {isActive ? (
                      <span className="text-emerald-400 uppercase">Active / Authorized</span>
                    ) : (
                      <span className="text-rose-400 uppercase">Disabled</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleStartEdit(user)}
                    className="px-2.5 py-1.5 bg-[#141f35] border border-slate-700/60 rounded-xl text-[10px] font-bold text-blue-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Edit className="w-3 h-3" />
                    Edit User
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Polish Edit User Modal Overlay */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0b1120] border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600/15 border border-blue-500/25 rounded-xl text-blue-400">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Edit User Details</h3>
                  <p className="text-[11px] text-slate-400">Modifying profile for <span className="font-semibold text-slate-200">{editingUser.name}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-1 px-1.5 text-slate-400 hover:text-white bg-[#141f35] border border-slate-700/60 rounded-lg hover:bg-slate-800 transition text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error and Success states */}
            {formError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold leading-relaxed">
                ⚠️ {formError}
              </div>
            )}
            {formSuccess && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs font-semibold">
                🎉 {formSuccess}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4 overflow-y-auto pr-1 flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full name input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111a2f] border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-[#141f35] text-slate-100"
                  />
                </div>

                {/* Professional email */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111a2f] border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-[#141f35] text-slate-100"
                  />
                </div>

                {/* Unique username */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">Unique Username *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111a2f] border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-[#141f35] text-slate-100"
                  />
                </div>

                {/* Security password */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">Security Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-[#111a2f] border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-[#141f35] text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-450 hover:text-slate-100"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Assigned employee id */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">Employee ID Number *</label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111a2f] border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-[#141f35] text-slate-100 font-mono"
                  />
                </div>

                {/* Assigned department */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">Assigned Corporate Department *</label>
                  <select
                    required
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111a2f] border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-[#141f35] text-slate-100 cursor-pointer"
                  >
                    <option value="Telesales">Telesales</option>
                    <option value="Backoffice">Backoffice</option>
                    <option value="Inbound">Inbound</option>
                    <option value="DQM">DQM</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                {/* Selected Role */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">User Access Role *</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-[#111a2f] border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-[#141f35] text-slate-100"
                  >
                    <option value="Agent">📞 Support Agent</option>
                    <option value="Supervisor">⚡ Supervisor</option>
                    <option value="Super Admin">👑 Super Admin</option>
                  </select>
                </div>

                {/* Account Status Option */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">Account status</label>
                  <select
                    value={isActiveState ? 'active' : 'inactive'}
                    onChange={e => setIsActiveState(e.target.value === 'active')}
                    className="w-full px-3 py-2 bg-[#111a2f] border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-[#141f35] text-slate-100"
                  >
                    <option value="active">🟢 Active / Authorized</option>
                    <option value="inactive">🔴 Inactive / Disabled</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-transparent text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-900 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
