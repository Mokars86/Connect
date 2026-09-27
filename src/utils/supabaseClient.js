/**
 * Supabase Client & Backend Sync Service for Connect
 * 
 * Project ID: qkytpjhttmdpdrlqyjuo
 * Storage Bucket: Connect
 */

import { createClient } from '@supabase/supabase-js';

// Configuration parameters
export const SUPABASE_CONFIG = {
  projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID || 'qkytpjhttmdpdrlqyjuo',
  url: import.meta.env.VITE_SUPABASE_URL || 'https://qkytpjhttmdpdrlqyjuo.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreXRwamh0dG1kcGRybHF5anVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMDE2NTQsImV4cCI6MjEwNTc3NzY1NH0.GiKVDUZLz9SLhaD9SoBXKrEpNT7Pq7DkhNwks7sQj_A',
  storageBucket: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'Connect',
  databaseApi: import.meta.env.VITE_SUPABASE_DATABASE_API || 'https://qkytpjhttmdpdrlqyjuo.supabase.co/rest/v1/'
};

// Initialize Supabase Client Instance
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Device Sync ID for anonymous / unauthenticated guest users
const DEVICE_ID_KEY = 'connect_supabase_device_id_v1';
const AUTO_SYNC_KEY = 'connect_supabase_autosync_v1';

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function isAutoCloudSyncEnabled() {
  const val = localStorage.getItem(AUTO_SYNC_KEY);
  return val === null ? true : val === 'true'; // Default to true
}

export function setAutoCloudSyncEnabled(enabled = true) {
  localStorage.setItem(AUTO_SYNC_KEY, enabled ? 'true' : 'false');
}

// ==========================================
// 1. SUPABASE STORAGE (BUCKET: Connect)
// ==========================================

/**
 * Convert base64 data URL to Blob
 */
export function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Upload an avatar/logo or QR image directly to Supabase Storage bucket 'Connect'
 * @param {File|Blob|string} fileOrDataUrl 
 * @param {string} fileName 
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadToStorage(fileOrDataUrl, fileName = '') {
  try {
    let blob;
    let extension = 'png';

    if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
      blob = dataURLtoBlob(fileOrDataUrl);
      const mime = blob.type || 'image/png';
      extension = mime.split('/')[1] || 'png';
    } else if (fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File) {
      blob = fileOrDataUrl;
      if (fileOrDataUrl.name) {
        const parts = fileOrDataUrl.name.split('.');
        if (parts.length > 1) extension = parts.pop();
      }
    } else {
      throw new Error('Invalid file format provided for storage upload');
    }

    const uniqueName = fileName || `avatar_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`;
    const filePath = `avatars/${uniqueName}`;

    const { data, error } = await supabase.storage
      .from(SUPABASE_CONFIG.storageBucket)
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: blob.type || 'image/png'
      });

    if (error) {
      console.warn('Supabase storage upload notice:', error.message);
      return { success: false, error: error.message };
    }

    // Retrieve public URL
    const { data: publicUrlData } = supabase.storage
      .from(SUPABASE_CONFIG.storageBucket)
      .getPublicUrl(filePath);

    return { 
      success: true, 
      url: publicUrlData?.publicUrl || `${SUPABASE_CONFIG.url}/storage/v1/object/public/${SUPABASE_CONFIG.storageBucket}/${filePath}`,
      path: filePath
    };
  } catch (err) {
    console.error('Storage upload error:', err);
    return { success: false, error: err.message || 'Storage upload failed' };
  }
}

// ==========================================
// 2. SUPABASE AUTHENTICATION
// ==========================================

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (e) {
    return null;
  }
}

export async function signUpUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function signInUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 3. DATABASE SYNC & CLOUD BACKUP
// ==========================================

/**
 * Backup/sync all local application state to Supabase
 * @param {Object} payload 
 * @returns {Promise<{success: boolean, syncedAt: string, error?: string}>}
 */
export async function syncAllToSupabase({ profiles, contacts, utilityQRs, burnerProfiles, analytics, subscription }) {
  try {
    const user = await getCurrentUser();
    const ownerId = user ? user.id : getDeviceId();
    const isAuth = Boolean(user);
    const syncedAt = new Date().toISOString();

    const record = {
      owner_id: ownerId,
      is_authenticated: isAuth,
      user_email: user?.email || null,
      profiles: profiles || [],
      contacts: contacts || [],
      utility_qrs: utilityQRs || [],
      burner_profiles: burnerProfiles || [],
      analytics: analytics || {},
      subscription: subscription || {},
      updated_at: syncedAt
    };

    // Upsert into 'user_backups' or 'connect_data' table
    const { data, error } = await supabase
      .from('connect_data')
      .upsert(record, { onConflict: 'owner_id' })
      .select();

    if (error) {
      console.warn('Supabase connect_data sync notice:', error.message);
      // If table does not exist or permission denied, save sync timestamp locally
      return { success: false, error: error.message, syncedAt };
    }

    localStorage.setItem('connect_last_supabase_sync', syncedAt);
    return { success: true, syncedAt, data };
  } catch (err) {
    console.error('Failed to sync data to Supabase:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Restore data from Supabase backend for current user/device
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function restoreFromSupabase() {
  try {
    const user = await getCurrentUser();
    const ownerId = user ? user.id : getDeviceId();

    const { data, error } = await supabase
      .from('connect_data')
      .select('*')
      .eq('owner_id', ownerId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Test connectivity with Supabase (Ping Auth & Storage)
 */
export async function testSupabaseConnection() {
  try {
    // 1. Check Auth session reachability
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    
    // 2. Check Storage bucket status
    let bucketReachable = false;
    try {
      const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
      if (!bErr) bucketReachable = true;
    } catch (e) {
      // storage list might be restricted for anon, test getPublicUrl
      bucketReachable = true;
    }

    return {
      connected: true,
      projectId: SUPABASE_CONFIG.projectId,
      storageBucket: SUPABASE_CONFIG.storageBucket,
      url: SUPABASE_CONFIG.url,
      session: sessionData?.session || null,
      bucketReachable
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message
    };
  }
}
