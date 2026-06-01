import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserPortal from './components/UserPortal';
import CreateTicket from './components/CreateTicket';
import TicketDetail from './components/TicketDetail';
import UserManagement from './components/UserManagement';

// Icons
import { 
  ShieldAlert, 
  LayoutDashboard, 
  PlusCircle, 
  FolderLock, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight, 
  TicketCheck, 
  HelpCircle,
  Eye,
  RefreshCw,
  Users
} from 'lucide-react';

function AppContent() {
  const { currentUser, setCurrentUser, users, resetState } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync default active tabs on login/role switch
  useEffect(() => {
    if (currentUser) {
      const isPowerRole = ['Admin access', 'Admin', 'Supervisor'].includes(currentUser.role);
      if (isPowerRole) {
        setActiveTab('dashboard');
      } else {
        setActiveTab('my_tickets');
      }
      setSelectedTicketId(null);
    }
  }, [currentUser]);

  // Security check: Auto sign-out if current active profile is marked inactive
  useEffect(() => {
    if (currentUser) {
      const activeDbRecord = users.find(u => u.id === currentUser.id);
      if (activeDbRecord && activeDbRecord.isActive === false) {
        setCurrentUser(null);
      }
    }
  }, [users, currentUser, setCurrentUser]);

  if (!currentUser) {
    return <Login />;
  }

  const navigateToTicket = (id: string) => {
    setSelectedTicketId(id);
    setActiveTab('ticket_detail');
  };

  const handleCreateSuccess = () => {
    setActiveTab('my_tickets');
  };

  const currentRoleName = `${currentUser.role} Portal`;

  return (
    <div className="min-h-screen bg-[#060a13] flex flex-col text-slate-100">
      
      {/* Simulation Sandbox Quick Bar */}
      <div className="bg-[#0e1628]/95 text-slate-350 py-2.5 px-4 text-xs border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-[11px] tracking-wide text-slate-200">SANDBOX SIMULATOR:</span>
          <span className="text-slate-400 text-[10px]">Instantly swap profiles to test real role-based workflow behaviors.</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {users.filter(u => u.isActive !== false).map(u => (
            <button
              key={u.id}
              onClick={() => setCurrentUser(u)}
              className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer max-w-[130px] md:max-w-none truncate ${
                currentUser.id === u.id 
                  ? 'bg-blue-600 text-white shadow-sm font-semibold' 
                  : 'bg-[#18233c] text-slate-300 hover:bg-[#1f2d4d] border border-slate-700/60'
              }`}
            >
              <img src={u.avatarUrl} alt="" className="w-3.5 h-3.5 rounded-full" referrerPolicy="no-referrer" />
              <span className="truncate">
                {u.role === 'Admin access' ? '👑' : u.role === 'Admin' ? '👤' : u.role === 'Supervisor' ? '⚡' : u.role === 'Manager' ? '💼' : u.role === 'IT' ? '💻' : u.role === 'HR' ? '🤝' : u.role === 'Finance' ? '🪙' : '📞'} {u.name.split(' ')[0]}
              </span>
            </button>
          ))}
          <button 
            onClick={resetState}
            className="p-1 text-slate-400 hover:text-white transition ml-2 border border-slate-705 hover:bg-[#1a263f] rounded"
            title="Reset sandbox state"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Structural Frame */}
      <div className="flex-1 flex flex-col md:flex-row relative">
          {/* Mobile Header Toggle */}
        <header className="md:hidden bg-[#0d1527] border-b border-slate-800 p-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-wide text-slate-100">Sheba.xyz Ticketing Portal</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 px-2.5 text-slate-400 rounded-lg hover:bg-slate-800 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Sidebar Left Rail Navigation */}
        <aside className={`
          fixed md:static inset-y-0 left-0 w-64 bg-[#0d1527] border-r border-slate-800/80 transform md:transform-none transition duration-200 ease-in-out z-30 flex flex-col justify-between p-5 shrink-0 h-[calc(100vh-42px)] md:h-auto
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="space-y-6">
            
            {/* Sidebar Brand Header */}
            <div className="hidden md:flex items-center gap-2.5 px-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/10">
                <ShieldAlert className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-wider text-slate-100 uppercase block leading-none">Sheba.xyz</span>
                <span className="text-[10px] text-slate-450 font-semibold tracking-wider mt-1 block uppercase">Ticketing Portal</span>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1 pt-4 border-t border-slate-800">
              
              <button
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600/15 text-blue-400 font-bold border border-blue-500/20 bg-blue-500/5' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-blue-400" />
                Performance Dashboard
              </button>

              {currentUser.role === 'Admin access' && (
                <button
                  onClick={() => { setActiveTab('user_management'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
                    activeTab === 'user_management'
                      ? 'bg-blue-600/15 text-blue-400 font-bold border border-blue-500/20 bg-blue-500/5' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-blue-400" />
                  Create a New User
                </button>
              )}

              <button
                onClick={() => { setActiveTab('my_tickets'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
                  activeTab === 'my_tickets'
                    ? 'bg-blue-600/15 text-blue-400 font-bold border border-blue-500/20 bg-blue-500/5' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <TicketCheck className="w-4 h-4 shrink-0 text-slate-400" />
                Role Ticket Queue
              </button>

              <button
                onClick={() => { setActiveTab('create_ticket'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
                  activeTab === 'create_ticket'
                    ? 'bg-blue-600/15 text-blue-400 font-bold border border-blue-500/20 bg-blue-500/5' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <PlusCircle className="w-4 h-4 shrink-0 text-slate-400" />
                Create a New Ticket
              </button>

            </nav>
          </div>

          {/* User footer info block */}
          <div className="pt-4 border-t border-slate-850 space-y-3">
            <div className="flex items-center gap-2.5 px-1">
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.name} 
                className="w-8.5 h-8.5 rounded-full border border-slate-800" 
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-100 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-450 truncate">{currentUser.email}</p>
              </div>
            </div>
            
            <button
              onClick={() => setCurrentUser(null)}
              className="w-full text-left px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-medium flex items-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              Sign Out Account
            </button>
          </div>

        </aside>

        {/* Content Canvas */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          
          {/* Breadcrumb Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium font-mono">
            <span>Home</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-300 capitalize">{activeTab.replace('_', ' ')}</span>
          </div>

          {/* Core App View dispatcher */}
          {activeTab === 'dashboard' && (
            <Dashboard onSelectTicket={navigateToTicket} />
          )}

          {activeTab === 'user_management' && currentUser.role === 'Admin access' && (
            <UserManagement />
          )}

          {activeTab === 'my_tickets' && (
            <UserPortal 
              onSelectTicket={navigateToTicket} 
              onOpenCreate={() => setActiveTab('create_ticket')} 
            />
          )}

          {activeTab === 'create_ticket' && (
            <CreateTicket onSuccess={handleCreateSuccess} />
          )}

          {activeTab === 'ticket_detail' && selectedTicketId && (
            <TicketDetail 
              ticketId={selectedTicketId} 
              onBack={() => {
                const isPowerRole = ['Admin access', 'Admin', 'Supervisor'].includes(currentUser.role);
                if (isPowerRole) {
                  setActiveTab('dashboard');
                } else {
                  setActiveTab('my_tickets');
                }
              }} 
            />
          )}

        </main>

      </div>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
