import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserPortal from './components/UserPortal';
import CreateTicket from './components/CreateTicket';
import TicketDetail from './components/TicketDetail';
import UserManagement from './components/UserManagement';
import UserList from './components/UserList';

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
  Users,
  User,
  Cloud,
  Database
} from 'lucide-react';
import { SUPABASE_SQL_SETUP } from './lib/supabaseClient';

function AppContent() {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    resetState,
    isSupabaseSynced,
    supabaseError,
    reconnectSupabase,
    seedDummyToSupabase
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  // Sync default active tabs on login/role switch
  useEffect(() => {
    if (currentUser) {
      const isPowerRole = ['Super Admin', 'Supervisor'].includes(currentUser.role);
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
      
      {/* Main Structural Frame */}
      <div className="flex-1 flex flex-col md:flex-row relative">
          {/* Mobile Header Toggle */}
        <header className="md:hidden bg-[#0d1527] border-b border-slate-800 p-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 bg-white">
              <img 
                src="/src/assets/images/sheba_logo_1780297177657.png" 
                alt="Sheba.xyz" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
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
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-700 bg-white shadow-md shadow-blue-500/5 select-none">
                <img 
                  src="/src/assets/images/sheba_logo_1780297177657.png" 
                  alt="Sheba.xyz" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
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

              {currentUser.role === 'Super Admin' && (
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

              {currentUser.role !== 'Agent' && (
                <button
                  onClick={() => { setActiveTab('user_list'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
                    activeTab === 'user_list'
                      ? 'bg-blue-600/15 text-blue-400 font-bold border border-blue-500/20 bg-blue-500/5' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0 text-slate-400" />
                  User List
                </button>
              )}

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
              <div className="w-8.5 h-8.5 rounded-full border border-slate-800 bg-slate-800/85 flex items-center justify-center text-slate-400 shrink-0 select-none">
                <User className="w-4.5 h-4.5 text-slate-300" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-100 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-450 truncate">{currentUser.email}</p>
              </div>
            </div>

            {/* Supabase connection indicator */}
            {currentUser?.role === 'Super Admin' && (
              <div className="flex flex-col gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800/50">
                <div className="flex items-center gap-2">
                  {isSupabaseSynced ? (
                    <>
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-wide uppercase">Live on Supabase</span>
                    </>
                  ) : supabaseError ? (
                    <>
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 animate-pulse"></span>
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 font-mono tracking-wide uppercase truncate">
                        {supabaseError === 'tables_missing' ? 'Schema Setup Ready' : 'Database Offline'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-slate-500"></span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wide uppercase">Connecting Supabase...</span>
                    </>
                  )}
                </div>
                {supabaseError && supabaseError !== 'tables_missing' && supabaseError !== 'empty_database' && (
                  <div className="text-[9px] text-amber-500/90 font-mono leading-tight whitespace-normal break-words max-w-full">
                    Status: {supabaseError}
                  </div>
                )}
              </div>
            )}
            
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

          {/* Supabase status setup and seeding panel */}
          {currentUser?.role === 'Super Admin' && supabaseError && supabaseError !== 'empty_database' && (
            <div className="bg-[#1e1b4b]/60 border border-[#4338ca]/60 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#4338ca]/20 text-[#818cf8] rounded-xl shrink-0">
                  <Database className="w-5 h-5 shrink-0" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-100 flex flex-wrap items-center gap-2 select-none">
                    Supabase Setup Helper: SQL Tables Required
                    <span className="text-[9px] bg-red-500/15 text-red-400 border border-red-500/10 px-1.5 py-0.5 rounded font-extrabold tracking-wider font-mono uppercase text-red-400">Action Required</span>
                  </h3>
                  <p className="text-xs text-slate-350 font-semibold mt-1">
                    Your database returned the following error status (নিচের এররটি পাওয়া গেছে):
                  </p>
                  <div className="mt-1 p-2 bg-[#090d16] border border-slate-800 rounded-lg text-[10px] font-mono text-amber-400 font-semibold break-all leading-tight">
                    {supabaseError === 'tables_missing' ? 'Relation "users" does not exist (The database tables are completely missing)' : supabaseError}
                  </div>
                  <p className="text-xs text-slate-350 leading-relaxed mt-3">
                    If this is a fresh setup or some tables are missing, copy the SQL script below, open your <span className="font-bold text-[#818cf8]">Supabase Console SQL Editor</span> (<span className="underline select-all">https://supabase.com</span>), paste the code, and click <span className="font-bold text-[#818cf8]">Run</span> to build the tables and insert initial mock records!
                  </p>
                  <p className="text-xs text-[#a5b4fc]/90 mt-1 font-semibold">
                    (ডাটাবেসে টেবিলগুলো তৈরি করার জন্য নিচের SQL কোডটি কপি করে সুপাবেসের SQL Editor-এ রান করুন।)
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  readOnly
                  value={SUPABASE_SQL_SETUP}
                  className="w-full h-44 bg-[#090d16] border border-slate-800 rounded-xl p-3 text-[10px] font-mono text-slate-400 focus:outline-none focus:border-slate-700"
                />
                <button
                  onClick={handleCopySql}
                  className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-md transition cursor-pointer"
                >
                  {sqlCopied ? '✅ SQL Copied to Clipboard!' : '📋 Copy SQL Script'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={reconnectSupabase}
                  className="bg-[#c2185b] hover:bg-[#ad144e] active:bg-[#880e4f] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md hover:scale-[1.01] cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                  Recheck / Verify Database Connection
                </button>
                <button
                  onClick={seedDummyToSupabase}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700/50 transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  🧹 Clear Database of Demo Data
                </button>
              </div>
            </div>
          )}

          {currentUser?.role === 'Super Admin' && supabaseError === 'empty_database' && (
            <div className="bg-[#1c2e4a]/60 border border-blue-500/20 rounded-2xl p-6 space-y-3 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl shrink-0">
                  <Database className="w-5 h-5 animate-pulse shrink-0" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 select-none">
                    Supabase Relational Tables Ready
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-405 border border-emerald-500/10 px-1.5 py-0.5 rounded font-extrabold tracking-wider font-mono uppercase text-emerald-300">Ready</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    Your database tables are connected successfully, but they don't have any records. Click the button below to initialize the system and clean legacy demo data.
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">
                    (ডাটাবেসে এডমিন অ্যাকাউন্ট তৈরি এবং ডেমো ডাটা রিমুভ করার জন্য নিচের বাটনে ক্লিক করুন।)
                  </p>
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={seedDummyToSupabase}
                  className="bg-[#c2185b] hover:bg-[#ad144e] active:bg-[#880e4f] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md hover:scale-[1.01] cursor-pointer"
                >
                  🧹 Initialize Admin Account & Clear Demo Data
                </button>
              </div>
            </div>
          )}

          {/* Core App View dispatcher */}
          {activeTab === 'dashboard' && (
            <Dashboard onSelectTicket={navigateToTicket} />
          )}

          {activeTab === 'user_management' && currentUser.role === 'Super Admin' && (
            <UserManagement />
          )}

          {activeTab === 'user_list' && currentUser.role !== 'Agent' && (
            <UserList />
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
                const isPowerRole = ['Super Admin', 'Supervisor'].includes(currentUser.role);
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
