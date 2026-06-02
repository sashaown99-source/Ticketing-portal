import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  exportDatabaseToDrive, 
  listBackupsInDrive, 
  downloadBackupContent, 
  DriveFile, 
  GOOGLE_DRIVE_FOLDER_ID,
  getOrCreateBackupFolder
} from '../lib/googleDriveService';
import { 
  Cloud, 
  CloudLightning, 
  Database, 
  Download, 
  UploadCloud, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  LogOut,
  Folder,
  Calendar,
  Lock,
  UserCheck
} from 'lucide-react';
import { User } from 'firebase/auth';

export default function DriveDatabaseSync() {
  const { users, tickets, comments, auditLogs, importDatabaseState } = useApp();
  
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [backups, setBackups] = useState<DriveFile[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | null }>({ text: '', type: null });
  const [isExporting, setIsExporting] = useState(false);
  const [restoreConfirmFile, setRestoreConfirmFile] = useState<DriveFile | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string>(GOOGLE_DRIVE_FOLDER_ID);

  // Subscribe to Authentication state
  useEffect(() => {
    const unsubscribe = initAuth((user, token) => {
      setGoogleUser(user);
      setAuthToken(token);
    });
    return unsubscribe;
  }, []);

  // Fetch Backups list when auth state changes or when successfully signed in
  useEffect(() => {
    if (authToken && googleUser) {
      fetchBackups();
    } else {
      setBackups([]);
    }
  }, [authToken, googleUser]);

  const handleSignIn = async () => {
    setStatusMessage({ text: '', type: null });
    try {
      await googleSignIn();
      setStatusMessage({ text: 'Connected to your Google Account successfully.', type: 'success' });
    } catch (err: any) {
      console.error(err);
      const isPopupError = err.code?.includes('popup-closed-by-user') || 
                           err.message?.includes('popup-closed-by-user') || 
                           err.message?.includes('cancelled') ||
                           err.message?.includes('popup');
      
      if (isPopupError) {
        setStatusMessage({ 
          text: 'Google Sign-In failed because the authorization popup was blocked or closed. Since the app runs inside an iframe (AI Studio preview window), browsers heavily restrict popups. To resolve this, click the "Open in New Tab" arrow button at the top-right of your preview screen to run the app in a standalone tab, and ensure your browser allows popup windows.', 
          type: 'error' 
        });
      } else {
        setStatusMessage({ 
          text: `Authentication failed: ${err.message || 'Please check popup blocker permissions.'}`, 
          type: 'error' 
        });
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setStatusMessage({ text: 'Successfully disconnected Google Drive access.', type: 'info' });
    } catch (err: any) {
      setStatusMessage({ text: 'Error signing out from Google.', type: 'error' });
    }
  };

  const fetchBackups = async () => {
    if (!authToken) return;
    setIsLoadingBackups(true);
    setStatusMessage({ text: '', type: null });
    try {
      const resolvedFolder = await getOrCreateBackupFolder(authToken);
      setActiveFolderId(resolvedFolder);
      const filesList = await listBackupsInDrive(authToken);
      setBackups(filesList);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ 
        text: err.message || 'Failed to access Google Drive backups.', 
        type: 'error' 
      });
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const handleExport = async () => {
    if (!authToken) return;
    setIsExporting(true);
    setStatusMessage({ text: 'Preparing local state packages...', type: 'info' });
    
    // Bundle database structure
    const localDatabaseBundle = {
      users,
      tickets,
      comments,
      auditLogs,
      exportedAt: new Date().toISOString()
    };

    try {
      const resolvedFolder = await getOrCreateBackupFolder(authToken);
      setActiveFolderId(resolvedFolder);
      const result = await exportDatabaseToDrive(authToken, localDatabaseBundle);
      
      let successMsg = `Export succeeded! Database Backup "${result.name}" saved.`;
      if (resolvedFolder !== GOOGLE_DRIVE_FOLDER_ID) {
        if (resolvedFolder === 'root') {
          successMsg += ' (Saved directly in your main Google Drive root as fallback folder)';
        } else {
          successMsg += ' (Saved inside a newly created "Sheba Support Backups" folder since the custom folder was not accessible)';
        }
      }
      
      setStatusMessage({ 
        text: successMsg, 
        type: 'success' 
      });
      // Refresh list
      fetchBackups();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ 
        text: `Backup export failed: ${err.message || 'Check permissions.'}`, 
        type: 'error' 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const triggerRestore = async (file: DriveFile) => {
    setRestoreConfirmFile(file);
  };

  const handleConfirmRestore = async () => {
    if (!authToken || !restoreConfirmFile) return;
    setIsRestoring(true);
    setStatusMessage({ text: 'Downloading backup state from Google Drive...', type: 'info' });
    
    try {
      const restoredData = await downloadBackupContent(authToken, restoreConfirmFile.id);
      
      // Perform restoration context action
      importDatabaseState(restoredData);
      
      setStatusMessage({ 
        text: `Successfully restored database to state: "${restoreConfirmFile.name}".`, 
        type: 'success' 
      });
      setRestoreConfirmFile(null);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ 
        text: `Restoration failed: ${err.message || 'Invalid backup structure.'}`, 
        type: 'error' 
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="bg-[#0d1527] border border-slate-800/60 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Workspace Storage
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-400" /> Google Drive Database Controller
            </h2>
            <p className="text-slate-400 text-xs">
              Synchronize, backup, and restore your Sheba.xyz support portal tickets, system users, 
              comments, and live trails directly to your designated Google Drive folder.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {googleUser ? (
              <button 
                onClick={handleSignOut}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600/10 hover:bg-rose-600/15 border border-rose-500/20 text-rose-400 flex items-center gap-1.5 transition whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" /> Disconnect account
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Control Center Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Local DB Stats & Connection */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Credentials Card */}
          <div className="bg-[#0d1527]/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" /> Folder & Account Connection
            </h3>
            
            {googleUser ? (
              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/35 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs uppercase border border-blue-500/20">
                    {googleUser.displayName?.charAt(0) || googleUser.email?.charAt(0) || 'G'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{googleUser.displayName || 'Google Member'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{googleUser.email}</p>
                  </div>
                </div>
                <div className="text-[10px] bg-blue-500/5 text-blue-300 p-1 px-1.5 rounded flex items-center gap-1">
                  <UserCheck className="w-3 h-3 shrink-0" /> Authorized Google Drive session is active.
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-center p-4 py-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                <p className="text-slate-400 text-xs px-2">
                  Connect your Google Account to access the real backup synchronization system.
                </p>
                
                {/* Official styled Google sign in button wrapper */}
                <div className="flex justify-center pt-2">
                  <button 
                    onClick={handleSignIn}
                    className="gsi-material-button w-full flex justify-center !rounded-xl !bg-white hover:!bg-slate-50 transition shadow-sm h-10 select-none cursor-pointer"
                  >
                    <div className="gsi-material-button-content-wrapper flex items-center gap-3">
                      <div className="gsi-material-button-icon w-5 h-5">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents font-semibold text-slate-800 text-xs tracking-wide">Connect Google Drive</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2.5 border-t border-slate-850 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Drive Target Directory</span>
              <a 
                href={activeFolderId === 'root' ? 'https://drive.google.com/drive/u/0/my-drive' : `https://drive.google.com/drive/u/0/folders/${activeFolderId}`}
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-blue-400 group transition text-[11px]"
              >
                <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate flex-1 font-mono">{activeFolderId === 'root' ? 'My Drive Root' : activeFolderId}</span>
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider group-hover:text-blue-400">Open Folder</span>
              </a>
            </div>
          </div>

          {/* Local Statistics */}
          <div className="bg-[#0d1527]/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" /> Pending State Variables
            </h3>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">Users</span>
                <span className="text-lg font-extrabold text-slate-200">{users.length}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">Active Tickets</span>
                <span className="text-lg font-extrabold text-slate-200">{tickets.length}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">Comments</span>
                <span className="text-lg font-extrabold text-slate-200">{comments.length}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">Audit Logs</span>
                <span className="text-lg font-extrabold text-slate-200">{auditLogs.length}</span>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={!authToken || isExporting}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                authToken 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10' 
                  : 'bg-slate-800 text-slate-500 border border-slate-850 cursor-not-allowed'
              }`}
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating & Syncing...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Export Now to Google Drive
                </>
              )}
            </button>
            {!authToken && (
              <p className="text-[10px] text-center text-slate-500 font-medium">
                * Requires connecting Google account first.
              </p>
            )}
          </div>

        </div>

        {/* Right Column: Database list from Drive (Takes 2 Columns) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Status Alert Banner */}
          {statusMessage.text && (
            <div className={`p-4 rounded-xl text-xs font-medium flex items-start gap-2.5 border ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-950/15 text-emerald-400 border-emerald-500/20' 
                : statusMessage.type === 'error' 
                ? 'bg-rose-950/15 text-rose-400 border-rose-500/20' 
                : 'bg-blue-950/15 text-blue-400 border-blue-500/20'
            }`}>
              {statusMessage.type === 'success' ? (
                <Check className="w-4.5 h-4.5 shrink-0 text-emerald-500 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-rose-500 mt-0.5" />
              ) : (
                <CloudLightning className="w-4.5 h-4.5 shrink-0 text-blue-500 mt-0.5" />
              )}
              <span className="flex-1 leading-relaxed">{statusMessage.text}</span>
              <button 
                onClick={() => setStatusMessage({ text: '', type: null })}
                className="text-slate-400 hover:text-white font-bold ml-1"
              >
                &times;
              </button>
            </div>
          )}

          {/* Backups List card */}
          <div className="bg-[#0d1527]/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Select Restore History Points
                </h3>
                <p className="text-[10px] text-slate-500">
                  List of valid JSON database backup snapshots hosted inside your connected Google folder.
                </p>
              </div>
              
              <button
                onClick={fetchBackups}
                disabled={!authToken || isLoadingBackups}
                className="p-1.5 px-2.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingBackups ? 'animate-spin text-blue-400' : ''}`} />
                <span>Reload</span>
              </button>
            </div>

            {!authToken ? (
              <div className="text-center py-16 space-y-3">
                <CloudLightning className="w-10 h-10 text-slate-700 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400">Database Snaps Locked</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Please log into your Google Account to automatically download any active snapshot copies 
                    found within directory '{activeFolderId === 'root' ? 'My Drive Root' : activeFolderId}'.
                  </p>
                </div>
              </div>
            ) : isLoadingBackups ? (
              <div className="text-center py-20 space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Scanning Google Drive Directory...</p>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-16 space-y-3 border border-dashed border-slate-850/65 rounded-xl bg-slate-900/10">
                <Folder className="w-10 h-10 text-slate-700 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400">Target Folder is Empty</p>
                  <p className="text-[11px] text-slate-505 max-w-md mx-auto">
                    No support logs database copies were found inside folder '{activeFolderId === 'root' ? 'My Drive Root' : activeFolderId}'. 
                    Click "Export Now" to initialize your first cloud database instance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-850/50 max-h-[380px] overflow-y-auto pr-1">
                {backups.map((file) => (
                  <div key={file.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-slate-900/30 px-2 rounded-lg transition">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate pr-2 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        {file.name}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(file.createdTime).toLocaleString()}
                        </span>
                        <span>•</span>
                        <span>
                          {file.size ? `${(parseInt(file.size) / 1024).toFixed(1)} KB` : 'JSON file'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => triggerRestore(file)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-xs font-bold text-blue-400 flex items-center gap-1 border border-blue-500/20 shadow-sm transition whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Confirmation Modal */}
      {restoreConfirmFile && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1527] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 -mr-6 -mt-6 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3 border-b border-slate-850 pb-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-200">Confirm Database Overwrite</h4>
                <p className="text-[10px] text-slate-500">Destructive workspace action</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-350 leading-relaxed">
              <p>
                You are about to restore the local database snapshot using the Google Drive backup file:
              </p>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-850 font-mono text-[11px] text-rose-400 select-all my-2">
                {restoreConfirmFile.name}
              </div>
              <p className="text-rose-450 font-bold bg-rose-500/5 p-2 rounded border border-rose-900/20">
                ⚠️ Warning: This will completely replace your current portal users, roles, tickets, comment threads, and logs with this backup copy.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRestoreConfirmFile(null)}
                disabled={isRestoring}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white transition"
              >
                Cancel
              </button>
              
              <button
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-lg shadow-rose-500/10 transition"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-3 px-0.5 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Overwrite State
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
