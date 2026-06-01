import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App & Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Drive scopes
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = localStorage.getItem('sheba_drive_token');

// Track active listeners
const listeners = new Set<(user: User | null, token: string | null) => void>();

// Helper to handle 401 auth expiration
const handleAuthError = (status: number) => {
  if (status === 401) {
    console.warn("OAuth Access Token expired. Resetting Google Drive session.");
    cachedAccessToken = null;
    localStorage.removeItem('sheba_drive_token');
    auth.signOut().catch(() => {});
    listeners.forEach(listener => listener(null, null));
    throw new Error('Google Account session expired. Please reconnect your account to continue.');
  }
};

// Initialize auth state listener.
export const initAuth = (
  onAuthChange: (user: User | null, token: string | null) => void
) => {
  listeners.add(onAuthChange);
  
  // Call right away with current state
  onAuthChange(auth.currentUser, cachedAccessToken);

  const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
    if (!user) {
      cachedAccessToken = null;
      localStorage.removeItem('sheba_drive_token');
    }
    listeners.forEach(listener => listener(user, cachedAccessToken));
  });

  return () => {
    listeners.delete(onAuthChange);
    unsubscribe();
  };
};

// Sign in via Google with Popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve the Google OAuth access token');
    }

    cachedAccessToken = credential.accessToken;
    localStorage.setItem('sheba_drive_token', cachedAccessToken);
    listeners.forEach(listener => listener(result.user, cachedAccessToken));
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Retrieve in-memory Google Access Token
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Sign Out
export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  localStorage.removeItem('sheba_drive_token');
  listeners.forEach(listener => listener(null, null));
};

export interface DriveFile {
  id: string;
  name: string;
  createdTime: string;
  size?: string;
}

// Ensure the folder ID remains static as provided by the user
export const GOOGLE_DRIVE_FOLDER_ID = '141fYIOM4J2Y1YamglTTOF2sZRSs_mTfp';

/**
 * Custom Folder Discovery and Creation:
 * 1. Checks if designated custom folder is accessible
 * 2. If not, queries for "Sheba Support Backups" folder
 * 3. If not found, creates "Sheba Support Backups" folder
 * 4. Fallback to 'root'
 */
export const getOrCreateBackupFolder = async (token: string): Promise<string> => {
  // 1. Try preconfigured folder
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${GOOGLE_DRIVE_FOLDER_ID}?fields=id`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      return GOOGLE_DRIVE_FOLDER_ID;
    }
    if (res.status === 401) {
      handleAuthError(401);
    }
  } catch (err: any) {
    if (err.message && err.message.includes('expired')) throw err;
    console.warn("Custom folder not accessible, assessing options...");
  }

  // 2. Look for "Sheba Support Backups"
  try {
    const queryStr = decodeURIComponent("mimeType='application/vnd.google-apps.folder' and name='Sheba Support Backups' and trashed=false");
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent("mimeType='application/vnd.google-apps.folder' and name='Sheba Support Backups' and trashed=false")}&fields=files(id)`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }
    if (res.status === 401) {
      handleAuthError(401);
    }
  } catch (err: any) {
    if (err.message && err.message.includes('expired')) throw err;
    console.warn("Backup folder search failed:", err);
  }

  // 3. Create "Sheba Support Backups" folder
  try {
    const res = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Sheba Support Backups',
        mimeType: 'application/vnd.google-apps.folder'
      })
    });
    if (res.ok) {
      const folder = await res.json();
      return folder.id;
    }
    if (res.status === 401) {
      handleAuthError(401);
    }
  } catch (err: any) {
    if (err.message && err.message.includes('expired')) throw err;
    console.error("Backup folder creation failed:", err);
  }

  // 4. Default fallback to root
  return 'root';
};

/**
 * Exports application database state into Google Drive folder
 */
export const exportDatabaseToDrive = async (token: string, dbData: any): Promise<any> => {
  const folderId = await getOrCreateBackupFolder(token);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `sheba_ticketing_db_${timestamp}.json`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    parents: [folderId]
  };

  const boundary = 'sheba_drive_boundary';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const body = delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(dbData) +
    closeDelimiter;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: body
  });

  if (!response.ok) {
    handleAuthError(response.status);
    const errText = await response.text();
    throw new Error(`Google Drive Upload Failed: ${response.status} - ${errText}`);
  }

  return await response.json();
};

/**
 * List existing database backups in the Drive Folder
 */
export const listBackupsInDrive = async (token: string): Promise<DriveFile[]> => {
  const folderId = await getOrCreateBackupFolder(token);
  const query = `'${folderId}' in parents and name contains 'sheba_ticketing_db' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,createdTime,size)&orderBy=createdTime+desc`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    handleAuthError(response.status);
    const errText = await response.text();
    throw new Error(`Failed listing backup files: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  return result.files || [];
};

/**
 * Get contents of a backup file to import/restore
 */
export const downloadBackupContent = async (token: string, fileId: string): Promise<any> => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    handleAuthError(response.status);
    const errText = await response.text();
    throw new Error(`Failed to download backup data: ${response.status} - ${errText}`);
  }

  return await response.json();
};
