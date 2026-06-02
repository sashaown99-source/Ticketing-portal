import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, Check, Copy, AlertCircle, ShieldAlert,
  Settings, ExternalLink, Terminal, CloudUpload, CloudDownload, 
  Trash2, Server, HelpCircle, CheckCircle, Wifi
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSupabaseConfig, setSupabaseConfig, recreateSupabaseClient, resetSupabaseConfig } from '../lib/supabaseClient';

export default function SupabaseSync() {
  const { 
    users, tickets, comments, auditLogs, 
    importDatabaseState, resetState 
  } = useApp();

  const [config, setConfig] = useState(getSupabaseConfig());
  const [projectIdInput, setProjectIdInput] = useState(config.projectId);
  const [anonKeyInput, setAnonKeyInput] = useState(config.anonKey);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error' | 'checking'>('idle');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' | null }>({ text: '', type: null });
  const [showConfig, setShowConfig] = useState(false);
  
  // Table row counts in Supabase
  const [remoteCounts, setRemoteCounts] = useState({
    users: 0,
    tickets: 0,
    comments: 0,
    auditLogs: 0,
  });

  // Generated SQL Code to make it incredibly simple for the user to paste into the Supabase SQL Editor
  const sqlSchemaCode = `-- =========================================================================
-- SHEBA SUPPORT PORTAL DATABASE SCHEMA - SUPABASE POSTGRESQL
-- Paste this script into the Supabase SQL Editor to initialize all tables
-- =========================================================================

-- 1. Create table for Users
CREATE TABLE IF NOT EXISTS public.sheba_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    username TEXT,
    "employeeId" TEXT,
    department TEXT,
    password TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN DEFAULT TRUE
);

-- 2. Create table for Tickets
CREATE TABLE IF NOT EXISTS public.sheba_tickets (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT,
    status TEXT,
    "screenshotUrl" TEXT,
    "assignedTo" TEXT,
    "assignedBy" TEXT,
    "assignedDepartment" TEXT,
    "assignedRole" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create table for Comments
CREATE TABLE IF NOT EXISTS public.sheba_comments (
    id TEXT PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "commentText" TEXT NOT NULL,
    "isInternal" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create table for Audit Logs
CREATE TABLE IF NOT EXISTS public.sheba_audit_logs (
    id TEXT PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    action TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on Row Level Security (RLS) or leave public for testing
ALTER TABLE public.sheba_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheba_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheba_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheba_audit_logs DISABLE ROW LEVEL SECURITY;
`;

  // Connection Test
  const testConnection = async (silent = false) => {
    if (!silent) setConnectionStatus('checking');
    try {
      const activeClient = recreateSupabaseClient(projectIdInput, anonKeyInput);
      
      // Let's query one table (like users) with limit(1) to see if it responds
      const { data, error } = await activeClient
        .from('sheba_users')
        .select('id')
        .limit(1);

      if (error) {
        // If error refers to 'relation "public.sheba_users" does not exist'
        if (error.message.includes('does not exist')) {
          setConnectionStatus('success'); // connection works, but tables not yet matching SQL
          if (!silent) {
            setStatusMessage({
              text: 'Connected to Supabase endpoint successfully, but the tables (sheba_users, etc.) do not exist yet. Please query and execute the setup SQL schema script shown below first!',
              type: 'warning'
            });
          }
          return { success: true, tablesMissing: true };
        } else {
          throw error;
        }
      }

      // If success, load remote row counts for all tables
      const cUsers = await activeClient.from('sheba_users').select('*', { count: 'exact', head: true });
      const cTickets = await activeClient.from('sheba_tickets').select('*', { count: 'exact', head: true });
      const cComments = await activeClient.from('sheba_comments').select('*', { count: 'exact', head: true });
      const cAudit = await activeClient.from('sheba_audit_logs').select('*', { count: 'exact', head: true });

      setRemoteCounts({
        users: cUsers.count || 0,
        tickets: cTickets.count || 0,
        comments: cComments.count || 0,
        auditLogs: cAudit.count || 0,
      });

      setConnectionStatus('success');
      if (!silent) {
        setStatusMessage({
          text: 'Excellent! Successfully connected to Supabase database. Tables are online and ready.',
          type: 'success'
        });
      }
      return { success: true, tablesMissing: false };
    } catch (err: any) {
      console.error(err);
      setConnectionStatus('error');
      if (!silent) {
        setStatusMessage({
          text: `Supabase connection attempt failed: ${err.message || 'Please verify Project ID and API Key credentials.'}`,
          type: 'error'
        });
      }
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    // Run an initial silent network probe to update counts
    testConnection(true);
  }, []);

  const handleSaveConfig = () => {
    setSupabaseConfig(projectIdInput, anonKeyInput);
    const updated = getSupabaseConfig();
    setConfig(updated);
    setStatusMessage({ text: 'Configuration properties updated in context successfully.', type: 'success' });
    testConnection();
  };

  const handleResetConfig = () => {
    resetSupabaseConfig();
    const updated = getSupabaseConfig();
    setProjectIdInput(updated.projectId);
    setAnonKeyInput(updated.anonKey);
    setConfig(updated);
    setStatusMessage({ text: 'Reset credentials back to defaults successfully.', type: 'success' });
    
    setTimeout(() => {
      testConnection();
    }, 100);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaCode);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  // Push local state to Supabase
  const pushStateToSupabase = async () => {
    setIsSyncing(true);
    setStatusMessage({ text: '', type: null });

    try {
      const activeClient = recreateSupabaseClient(projectIdInput, anonKeyInput);

      // 1. Double check connectivity
      const probe = await testConnection(true);
      if (!probe.success || probe.tablesMissing) {
        throw new Error(probe.tablesMissing 
          ? 'Required database tables do not exist yet. Please run the SQL schema code inside Supabase first!' 
          : 'Could not connect to Supabase. Check credentials configuration.'
        );
      }

      setStatusMessage({ text: 'Uploading state records... (Removing existing first to ensure neat integrity)', type: 'warning' });

      // Clean existing rows before batch insert
      await activeClient.from('sheba_users').delete().neq('id', 'null-id-match-safeguard');
      await activeClient.from('sheba_tickets').delete().neq('id', 'null-id-match-safeguard');
      await activeClient.from('sheba_comments').delete().neq('id', 'null-id-match-safeguard');
      await activeClient.from('sheba_audit_logs').delete().neq('id', 'null-id-match-safeguard');

      // Upload in sequential batches
      if (users.length > 0) {
        const { error } = await activeClient.from('sheba_users').insert(users);
        if (error) throw error;
      }
      if (tickets.length > 0) {
        const { error } = await activeClient.from('sheba_tickets').insert(tickets);
        if (error) throw error;
      }
      if (comments.length > 0) {
        const { error } = await activeClient.from('sheba_comments').insert(comments);
        if (error) throw error;
      }
      if (auditLogs.length > 0) {
        const { error } = await activeClient.from('sheba_audit_logs').insert(auditLogs);
        if (error) throw error;
      }

      setStatusMessage({ 
        text: `Success! Local support state database pushed to Supabase tables. Uploaded ${users.length} users, ${tickets.length} tickets, ${comments.length} comments, and ${auditLogs.length} audit logs.`, 
        type: 'success' 
      });

      // Refresh stats
      testConnection(true);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ 
        text: `Failed to push state records: ${err.message || 'Check database permissions and constraints.'}`, 
        type: 'error' 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull state from Supabase
  const pullStateFromSupabase = async () => {
    setIsSyncing(true);
    setStatusMessage({ text: '', type: null });

    try {
      const activeClient = recreateSupabaseClient(projectIdInput, anonKeyInput);

      // Probe tables
      const probe = await testConnection(true);
      if (!probe.success || probe.tablesMissing) {
        throw new Error(probe.tablesMissing 
          ? 'Required database tables do not exist yet in Supabase. Run the SQL script first!' 
          : 'Could not connect to Supabase.'
        );
      }

      setStatusMessage({ text: 'Downloading database tables from Supabase...', type: 'warning' });

      // Gather remote lists
      const { data: dbUsers, error: uErr } = await activeClient.from('sheba_users').select('*');
      if (uErr) throw uErr;

      const { data: dbTickets, error: tErr } = await activeClient.from('sheba_tickets').select('*').order('createdAt', { ascending: false });
      if (tErr) throw tErr;

      const { data: dbComments, error: cErr } = await activeClient.from('sheba_comments').select('*');
      if (cErr) throw cErr;

      const { data: dbAudit, error: aErr } = await activeClient.from('sheba_audit_logs').select('*').order('createdAt', { ascending: false });
      if (aErr) throw aErr;

      // Populate local global state
      importDatabaseState({
        users: dbUsers as any || [],
        tickets: dbTickets as any || [],
        comments: dbComments as any || [],
        auditLogs: dbAudit as any || []
      });

      setStatusMessage({ 
        text: `Database sync pulling complete! Synchronized ${dbUsers?.length || 0} users, ${dbTickets?.length || 0} tickets, ${dbComments?.length || 0} comments, and ${dbAudit?.length || 0} audit logs in real time.`, 
        type: 'success' 
      });
      
      // Update local counts
      testConnection(true);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ 
        text: `Failed to download state: ${err.message || 'Check connection details.'}`, 
        type: 'error' 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div id="supabase-sync-panel" className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Welcome Action Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
              <Database className="w-5 h-5 animate-pulse" />
            </span>
            <div className="text-xs uppercase font-extrabold tracking-widest text-blue-500">Relational Database Integration</div>
          </div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            Supabase Postgres Manager
          </h2>
          <p className="text-slate-400 text-xs">
            Connect, back up, and synchronize your Sheba support portal tickets, active profiles, comments, and audit trails directly to Postgres.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 px-3 border border-slate-700 hover:border-slate-600 bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            {showConfig ? 'Hide Config' : 'View Credentials'}
          </button>
          
          <button
            type="button"
            onClick={() => testConnection()}
            className="p-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-900/15"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
            Check Connection
          </button>
        </div>
      </div>

      {/* Connection & Interactive Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Connection status card */}
        <div className="bg-slate-900/45 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Gateway Status</h3>
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                connectionStatus === 'success' ? 'bg-emerald-400' :
                connectionStatus === 'error' ? 'bg-rose-450' : 
                connectionStatus === 'checking' ? 'bg-amber-400' : 'bg-slate-500'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                connectionStatus === 'success' ? 'bg-emerald-500' :
                connectionStatus === 'error' ? 'bg-rose-500' :
                connectionStatus === 'checking' ? 'bg-amber-500' : 'bg-slate-600'
              }`}></span>
            </span>
          </div>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-2">
            <div className="text-[10px] text-slate-400 font-bold">Target endpoint API:</div>
            <div className="font-mono text-[10px] text-slate-200 truncate select-all bg-slate-950 p-2 rounded">
              https://{config.projectId}.supabase.co
            </div>
            
            <div className="flex items-center justify-between text-[11px] font-bold pt-1.5">
              <span className="text-slate-400">Status Response:</span>
              <span className={`uppercase tracking-widest text-[10px] font-extrabold ${
                connectionStatus === 'success' ? 'text-emerald-400' :
                connectionStatus === 'error' ? 'text-rose-400' :
                connectionStatus === 'checking' ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {connectionStatus === 'success' && 'Connected'}
                {connectionStatus === 'error' && 'Failed'}
                {connectionStatus === 'checking' && 'Pinging...'}
                {connectionStatus === 'idle' && 'Not Verified'}
              </span>
            </div>
          </div>
        </div>

        {/* Sync Controls card */}
        <div className="md:col-span-2 bg-slate-900/45 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-3">
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Synchronize State Objects</h3>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                <Wifi className="w-3 h-3 text-emerald-400" />
                Dual-Mode Supported
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              When connected to your database, you can seed/export the system state up to Supabase to start clean, or pull updated ticket entries down directly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5 pt-4">
            <button
              type="button"
              disabled={isSyncing}
              onClick={pullStateFromSupabase}
              className="py-3 bg-blue-600/10 hover:bg-blue-600/15 active:bg-blue-600/25 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <CloudDownload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
              Get state from Supabase
            </button>

            <button
              type="button"
              disabled={isSyncing}
              onClick={pushStateToSupabase}
              className="py-3 bg-violet-600/10 hover:bg-violet-600/15 active:bg-violet-600/25 border border-violet-500/20 text-violet-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
              Send state to Supabase
            </button>
          </div>
        </div>

      </div>

      {/* Dynamic Status Notifications */}
      {statusMessage.text && (
        <div className={`p-4 rounded-xl border flex gap-3 text-xs ${
          statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-550/20 text-emerald-400' :
          statusMessage.type === 'error' ? 'bg-red-500/10 border-red-550/20 text-red-400' :
          statusMessage.type === 'warning' ? 'bg-amber-500/15 border-amber-550/20 text-amber-400' :
          'bg-slate-800 border-slate-700 text-slate-300'
        }`}>
          <div>
            {statusMessage.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5" />}
            {statusMessage.type === 'error' && <ShieldAlert className="w-4 h-4 mt-0.5" />}
            {statusMessage.type === 'warning' && <AlertCircle className="w-4 h-4 mt-0.5" />}
          </div>
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold block mb-0.5">
              {statusMessage.type === 'success' && 'Task Successful'}
              {statusMessage.type === 'error' && 'Error Message Logged'}
              {statusMessage.type === 'warning' && 'Notice Notification / Warning'}
            </span>
            {statusMessage.text}
          </div>
          <button 
            type="button" 
            onClick={() => setStatusMessage({ text: '', type: null })}
            className="text-[10px] font-bold hover:text-slate-150 self-start opacity-70"
          >
            ✕
          </button>
        </div>
      )}

      {/* Row Counter Table Comparison */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Server className="w-4 h-4 text-slate-400" />
            State Synchronization Tables Inventory
          </h3>
          <p className="text-slate-400 text-xs">Verify the actual row totals inside your current offline browser storage vs Supabase remote servers.</p>
        </div>

        <div className="overflow-hidden border border-slate-850 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-850 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="p-3">Database Element Table</th>
                <th className="p-3 text-right">Offline Cache (Local Storage)</th>
                <th className="p-3 text-right">Supabase Tables (PostgreSQL)</th>
                <th className="p-3 text-center">Connection State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 bg-slate-900/15 font-semibold">
              <tr>
                <td className="p-3 text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    sheba_users
                  </div>
                </td>
                <td className="p-3 text-right font-mono text-slate-400">{users.length} rows</td>
                <td className="p-3 text-right font-mono text-slate-100">{remoteCounts.users} rows</td>
                <td className="p-3 text-center">
                  <span className="inline-block bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-bold">
                    {connectionStatus === 'success' ? 'Synchronized' : 'Offline'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    sheba_tickets
                  </div>
                </td>
                <td className="p-3 text-right font-mono text-slate-400">{tickets.length} rows</td>
                <td className="p-3 text-right font-mono text-slate-100">{remoteCounts.tickets} rows</td>
                <td className="p-3 text-center">
                  <span className="inline-block bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-bold">
                    {connectionStatus === 'success' ? 'Synchronized' : 'Offline'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                    sheba_comments
                  </div>
                </td>
                <td className="p-3 text-right font-mono text-slate-400">{comments.length} rows</td>
                <td className="p-3 text-right font-mono text-slate-100">{remoteCounts.comments} rows</td>
                <td className="p-3 text-center">
                  <span className="inline-block bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-bold">
                    {connectionStatus === 'success' ? 'Synchronized' : 'Offline'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    sheba_audit_logs
                  </div>
                </td>
                <td className="p-3 text-right font-mono text-slate-400">{auditLogs.length} rows</td>
                <td className="p-3 text-right font-mono text-slate-100">{remoteCounts.auditLogs} rows</td>
                <td className="p-3 text-center">
                  <span className="inline-block bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-bold">
                    {connectionStatus === 'success' ? 'Synchronized' : 'Offline'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SQL Setup Script Box */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/60 pb-3">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-pink-400" />
              Supabase Postgres SQL Setup Script
            </h3>
            <p className="text-slate-400 text-xs">Run this code block in your Supabase SQL editor to build compatible Postgres table structures.</p>
          </div>

          <button 
            type="button"
            onClick={handleCopyToClipboard}
            className="self-start sm:self-center p-2 px-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            {copiedQuery ? (
              <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied Setup Script!</span>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy SQL Script
              </>
            )}
          </button>
        </div>

        <div className="relative rounded-xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-[10px] text-slate-300 leading-relaxed max-h-72 overflow-y-auto">
          <pre className="whitespace-pre-wrap">{sqlSchemaCode}</pre>
        </div>

        <div className="p-4 bg-blue-950/20 border border-blue-900/30 rounded-xl space-y-2">
          <h4 className="text-xs font-extrabold text-blue-405 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            Where do I run this SQL?
          </h4>
          <ol className="list-decimal list-inside text-[11px] text-slate-400 space-y-1 leading-relaxed">
            <li>Open the <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-0.5">Supabase Dashboard <ExternalLink className="w-2.5 h-2.5 inline" /></a> and locate your project: <strong>savzqksbvknxrcxctfto</strong>.</li>
            <li>In the left sidebar, click on the <strong className="text-slate-300">SQL Editor</strong> tab (looks like a terminal logo <span className="font-mono text-[10px] border border-slate-800 bg-slate-900 p-0.5 rounded">SQL</span>).</li>
            <li>Click <strong className="text-slate-300">New Query</strong>, paste the copied SQL setup script above, and hit the green <strong className="text-slate-300">Run</strong> button in the bottom-right corner!</li>
          </ol>
        </div>
      </div>

      {/* Edit Credentials Config Box */}
      {showConfig && (
        <div className="bg-[#121c35] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-blue-400" />
              Supabase Project Connection Settings
            </h3>
            <span className="text-[10px] font-mono font-bold bg-slate-900 border border-slate-850 p-1 text-slate-400 rounded">
              Local Storage Persisted
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400">Supabase Project Reference ID</label>
              <input 
                type="text" 
                value={projectIdInput}
                onChange={e => setProjectIdInput(e.target.value)}
                placeholder="Project ID..."
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-blue-500 rounded-xl p-3 text-slate-200 font-mono text-xs focus:outline-none transition"
              />
              <p className="text-[10px] text-slate-500">The 20-character sub-domain ID found in your dashboard URL.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400">Public Anonymous/Publishable Web Key</label>
              <input 
                type="text" 
                value={anonKeyInput}
                onChange={e => setAnonKeyInput(e.target.value)}
                placeholder="sb_publishable_..."
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-blue-500 rounded-xl p-3 text-slate-200 font-mono text-xs focus:outline-none transition"
              />
              <p className="text-[10px] text-slate-500">The public anon key provided to establish browser requests.</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <button 
              type="button"
              onClick={handleResetConfig}
              className="p-2 px-4 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Reset to Defaults
            </button>
            <button 
              type="button"
              onClick={handleSaveConfig}
              className="p-2 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl transition shadow-lg shadow-blue-900/20 cursor-pointer"
            >
              Verify & Apply Changes
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
