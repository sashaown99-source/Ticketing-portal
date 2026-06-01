import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role, User } from '../types';
import { UserPlus, Users, Key, Mail, Shield, Building, Hash, Eye, EyeOff, Edit2, XCircle } from 'lucide-react';

export default function UserManagement() {
  const { users, registerUser, updateUser } = useApp();
  
  // State for tracking the user being edited administratively
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // States for user register/edit form
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<Role>('agent');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStartEdit = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setName(userToEdit.name);
    setEmployeeId(userToEdit.employeeId || '');
    setDepartment(userToEdit.department || '');
    setRole(userToEdit.role);
    setEmail(userToEdit.email);
    setUsername(userToEdit.username || '');
    setPassword(userToEdit.password || '');
    setIsActive(userToEdit.isActive !== false);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setName('');
    setEmployeeId('');
    setDepartment('');
    setRole('agent');
    setEmail('');
    setUsername('');
    setPassword('');
    setIsActive(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !username.trim() || !password.trim() || !employeeId.trim() || !department.trim()) {
      setErrorMsg('Please fill in all the required fields correctly.');
      return;
    }

    // Filter out the currently edited user when validating uniqueness
    const otherUsers = editingUser 
      ? users.filter(u => u.id !== editingUser.id) 
      : users;

    const emailExists = otherUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
    const usernameExists = otherUsers.some(u => u.username?.toLowerCase() === username.trim().toLowerCase());
    const empIdExists = otherUsers.some(u => u.employeeId?.toLowerCase() === employeeId.trim().toLowerCase());

    if (emailExists) {
      setErrorMsg('A user with this Email address is already registered.');
      return;
    }
    if (usernameExists) {
      setErrorMsg('A user with this Username is already registered.');
      return;
    }
    if (empIdExists) {
      setErrorMsg('A user with this Employee ID is already registered.');
      return;
    }

    if (editingUser) {
      // Perform administrative update
      updateUser(
        editingUser.id,
        name.trim(),
        email.trim(),
        role,
        username.trim(),
        employeeId.trim(),
        department.trim(),
        password.trim(),
        isActive
      );
      setSuccessMsg(`Successfully updated user account details for ${name.trim()} (${role})!`);
      setEditingUser(null);
    } else {
      // Register new user with choices
      registerUser(
        name.trim(),
        email.trim(),
        role,
        username.trim(),
        employeeId.trim(),
        department.trim(),
        password.trim()
      );
      setSuccessMsg(`Successfully created new user account for ${name.trim()} (${role})!`);
    }
    
    // Clear inputs after successful submission/update
    setName('');
    setEmployeeId('');
    setDepartment('');
    setRole('agent');
    setEmail('');
    setUsername('');
    setPassword('');
    setIsActive(true);
  };

  const ROLE_BADGE_STYLE: Record<Role, string> = {
    'Admin access': 'bg-red-500/10 text-red-400 border border-red-500/20',
    'Admin': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    'Supervisor': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    'Manager': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    'IT': 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    'HR': 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
    'Finance': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    'agent': 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Dynamic Header */}
      <div className="flex items-center gap-3 bg-[#0d1527] p-6 rounded-2xl border border-slate-800/80 shadow-sm justify-between flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/15 text-blue-400 rounded-xl border border-blue-500/10">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-100">User & Access Management</h3>
            <p className="text-slate-400 text-xs">Administratively manage personnel accounts, assign support roles, and create secure credentials.</p>
          </div>
        </div>
        <span className="bg-blue-600/15 text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded border border-blue-500/20 uppercase tracking-wide">
          Total Directory: {users.length} Users
        </span>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Side: Create/Edit User Form */}
        <div className={`lg:col-span-5 bg-[#0d1527] border rounded-2xl p-6 shadow-sm h-fit space-y-4 transition-all duration-300 ${
          editingUser ? 'border-amber-500/40 bg-[#121a30] shadow-amber-500/5' : 'border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
            <div className="flex items-center gap-2">
              {editingUser ? (
                <>
                  <Edit2 className="w-4.5 h-4.5 text-amber-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-amber-200">Edit Sheba.xyz Account</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4.5 h-4.5 text-blue-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">Add New Sheba.xyz Account</span>
                </>
              )}
            </div>
            {editingUser && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 font-bold px-2.5 py-1 rounded text-red-400 flex items-center gap-1 cursor-pointer transition border border-slate-700/60"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 text-emerald-400 text-xs rounded-xl border border-emerald-500/20 font-medium">
              🎉 {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 text-red-400 text-xs rounded-xl border border-red-500/20 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-300">
            {/* Full Name */}
            <div>
              <label className="block mb-1 font-semibold text-slate-300">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Tanzim Rahman"
                className="w-full px-3 py-2 bg-[#141f35] border border-slate-700/60 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] text-slate-100 placeholder-slate-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Employee ID */}
              <div>
                <label className="block mb-1 font-semibold text-slate-300">Employee ID *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                    <Hash className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    placeholder="e.g. EMP-9304"
                    className="w-full pl-8 pr-3 py-2 bg-[#141f35] border border-slate-700/60 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] text-slate-100 placeholder-slate-500 transition"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block mb-1 font-semibold text-slate-300">Department *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                    <Building className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. Tech Operations"
                    className="w-full pl-8 pr-3 py-2 bg-[#141f35] border border-slate-700/60 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] text-slate-100 placeholder-slate-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 font-semibold text-slate-300">Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tanzim@sheba.xyz"
                  className="w-full pl-8 pr-3 py-2 bg-[#141f35] border border-slate-700/60 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] text-slate-100 placeholder-slate-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Username */}
              <div>
                <label className="block mb-1 font-semibold text-slate-300">Username *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="tanzim99"
                  className="w-full px-3 py-2 bg-[#141f35] border border-slate-700/60 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] text-slate-100 placeholder-slate-500 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block mb-1 font-semibold text-slate-300">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-8 py-2 bg-[#141f35] border border-slate-700/60 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] text-slate-100 placeholder-slate-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Custom high-fidelity dropdown with 8 specific user roles */}
            <div>
              <label className="block mb-1.5 font-bold text-slate-300">User access credentials *</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="w-full px-3 py-2.5 bg-[#141f35] border border-slate-700/60 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] text-slate-100 font-semibold"
              >
                <option value="agent">📞 agent &mdash; Standard Support Desk Employee</option>
                <option value="Supervisor">⚡ Supervisor &mdash; Operations Supervisor</option>
                <option value="Manager">💼 Manager &mdash; Business Unit Manager</option>
                <option value="Admin">👤 Admin &mdash; Portal Administrator</option>
                <option value="IT">💻 IT &mdash; IT Systems Engineer</option>
                <option value="HR">🤝 HR &mdash; HR Lead Specialist</option>
                <option value="Finance">🪙 Finance &mdash; Finance Controller</option>
                <option value="Admin access">👑 Admin access &mdash; Master Systems Admin</option>
              </select>
              <p className="text-[10px] text-slate-450 mt-1">This user will only see and work with tickets related to their specific department role access details.</p>
            </div>

            {/* Account Status Option */}
            <div>
              <label className="block mb-1.5 font-bold text-slate-300">Account status</label>
              <select
                value={isActive ? 'active' : 'inactive'}
                onChange={e => setIsActive(e.target.value === 'active')}
                className="w-full px-3 py-2.5 bg-[#141f35] border border-slate-700/60 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-[#1a2948] text-slate-100 font-semibold"
              >
                <option value="active">🟢 Active / Active</option>
                <option value="inactive">🔴 Inactive / Inactive (Disabled)</option>
              </select>
              <p className="text-[10px] text-slate-450 mt-1">Inactive accounts will be immediately blocked from signing into the portal in sandbox logins.</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full font-bold py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4 ${
                editingUser 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/10' 
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/10'
              }`}
            >
              {editingUser ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {editingUser ? 'Save Updates' : 'Register Sheba User'}
            </button>

            {editingUser && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-xl transition border border-slate-700/60 font-semibold cursor-pointer text-center text-xs mt-1 block"
              >
                Cancel and Clear
              </button>
            )}
          </form>
        </div>

        {/* Right Side: Existing Users Table view */}
        <div className="lg:col-span-7 bg-[#0d1527] border border-slate-800/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-200">Active User Database</span>
            </div>
            
            <div className="overflow-x-auto text-xs">
              <table className="w-full table-auto text-left border-collapse">
                <thead>
                  <tr className="bg-[#121c33]/70 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    <th className="px-5 py-3">Personnel</th>
                    <th className="px-5 py-3">ID / Dept</th>
                    <th className="px-5 py-3">Username</th>
                    <th className="px-5 py-3 font-medium text-center">Access Role</th>
                    <th className="px-5 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  {users.map(u => (
                    <tr 
                      key={u.id} 
                      className={`hover:bg-slate-800/30 transition ${
                        editingUser?.id === u.id ? 'bg-amber-500/5 border-l-2 border-amber-500/30' : ''
                      }`}
                    >
                      {/* Avatar & Name & Email */}
                      <td className="px-5 py-3 flex items-center gap-2">
                        <img 
                          src={u.avatarUrl} 
                          alt="" 
                          className="w-8 h-8 rounded-full border border-slate-700" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-200 line-clamp-1">{u.name}</p>
                          <p className="text-[10px] text-slate-450 line-clamp-1 font-mono">{u.email}</p>
                        </div>
                      </td>

                      {/* Emp ID and Dept */}
                      <td className="px-5 py-3">
                        <p className="font-bold text-slate-300 font-mono text-[10px]">{u.employeeId || 'N/A'}</p>
                        <p className="text-[10px] text-slate-400">{u.department || 'General'}</p>
                      </td>

                      {/* Username */}
                      <td className="px-5 py-3 font-bold text-slate-300 font-mono">
                        {u.username || u.email.split('@')[0]}
                      </td>

                      {/* Access / Role Badge */}
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase mb-1 ${
                          ROLE_BADGE_STYLE[u.role] || 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {u.role}
                        </span>
                        <div className="flex justify-center mt-1">
                          {u.isActive !== false ? (
                            <span className="inline-flex items-center gap-1 text-[8px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold px-1.5 py-0.5 rounded uppercase leading-none">
                              <span className="w-1 h-1 rounded-full bg-emerald-400" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[8px] text-rose-400 bg-rose-500/10 border border-rose-500/20 font-bold px-1.5 py-0.5 rounded uppercase leading-none">
                              <span className="w-1 h-1 rounded-full bg-rose-400" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Edit actions button */}
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleStartEdit(u)}
                          className={`p-1 px-3.5 rounded text-[10px] font-bold transition inline-flex items-center gap-1.5 cursor-pointer border ${
                            editingUser?.id === u.id
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-sm'
                              : 'bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border-blue-500/25'
                          }`}
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-[#121c33]/40 border-t border-slate-800/80 text-[10px] text-slate-400 font-bold leading-relaxed">
            💡 Quick Tip: Newly created or updated users immediately populate in the top "SANDBOX SIMULATOR" profiles bar above, allowing you to instantly switch login active identities to test custom ticket creations and workflows.
          </div>
        </div>

      </div>

    </div>
  );
}
