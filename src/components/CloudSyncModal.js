/**
 * Cloud Sync & Supabase Backend Manager Modal
 */
import { 
  SUPABASE_CONFIG, 
  getDeviceId, 
  isAutoCloudSyncEnabled, 
  setAutoCloudSyncEnabled,
  syncAllToSupabase,
  restoreFromSupabase,
  getCurrentUser,
  signInUser,
  signUpUser,
  signOutUser,
  testSupabaseConnection
} from '../utils/supabaseClient.js';

import { 
  loadProfiles, 
  saveProfiles, 
  loadSavedContacts, 
  loadUtilityQRs, 
  loadBurnerProfiles, 
  getAnalytics, 
  getSubscriptionState,
  saveSubscriptionState
} from '../utils/storage.js';

export function renderCloudSyncModal(container, { showToast, onDataRestored }) {
  let currentUser = null;
  let isTesting = false;
  let connectionStatus = 'checking'; // 'connected', 'offline', 'checking'
  let isSyncing = false;

  const checkInitialState = async () => {
    currentUser = await getCurrentUser();
    const testRes = await testSupabaseConnection();
    connectionStatus = testRes.connected ? 'connected' : 'offline';
    renderView();
  };

  const renderView = () => {
    const isAutoSync = isAutoCloudSyncEnabled();
    const lastSync = localStorage.getItem('connect_last_supabase_sync') 
      ? new Date(localStorage.getItem('connect_last_supabase_sync')).toLocaleTimeString() 
      : 'Never';

    container.innerHTML = `
      <div class="cloudsync-modal-backdrop active" id="cloudsync-backdrop">
        <div class="cloudsync-modal-panel">
          <!-- Header -->
          <div class="cloudsync-header">
            <div class="cloudsync-header-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3ECF8E" stroke-width="2.5">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
              </svg>
              <span>Supabase Cloud Sync</span>
            </div>
            <button id="btn-close-cloudsync" class="btn-icon" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="cloudsync-content">
            <!-- Supabase Connection Badge -->
            <div class="supabase-badge-card">
              <div class="supabase-badge-top">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#3ECF8E">
                    <path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.001.001A.8.8 0 0 0 2.84 13.73h9.362v8.958a.396.396 0 0 0 .716.233l9.081-12.261.001-.001a.8.8 0 0 0-.638-1.306z"/>
                  </svg>
                  <strong style="font-size: 15px; color: var(--text-primary);">Supabase Backend</strong>
                </div>
                <span class="supabase-status-pill ${connectionStatus === 'connected' ? '' : 'offline'}">
                  ${connectionStatus === 'connected' ? '● CONNECTED' : '● OFFLINE / READY'}
                </span>
              </div>

              <div class="supabase-meta-grid">
                <div class="supabase-meta-item">
                  <div class="supabase-meta-label">Project ID</div>
                  <div class="supabase-meta-val" title="${SUPABASE_CONFIG.projectId}">${SUPABASE_CONFIG.projectId}</div>
                </div>
                <div class="supabase-meta-item">
                  <div class="supabase-meta-label">Storage Bucket</div>
                  <div class="supabase-meta-val">${SUPABASE_CONFIG.storageBucket}</div>
                </div>
                <div class="supabase-meta-item">
                  <div class="supabase-meta-label">Last Sync</div>
                  <div class="supabase-meta-val">${lastSync}</div>
                </div>
                <div class="supabase-meta-item">
                  <div class="supabase-meta-label">Device Sync ID</div>
                  <div class="supabase-meta-val">${currentUser ? 'Account' : getDeviceId().substring(0, 10) + '...'}</div>
                </div>
              </div>
            </div>

            <!-- Quick Sync & Restore Actions -->
            <div class="cloudsync-section-title">⚡ Cloud Operations</div>
            <div class="sync-actions-row">
              <button id="btn-cloud-push" class="btn-sync-action primary-sync" ${isSyncing ? 'disabled' : ''}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
                <span>${isSyncing ? 'Syncing...' : 'Backup to Cloud'}</span>
              </button>

              <button id="btn-cloud-pull" class="btn-sync-action" ${isSyncing ? 'disabled' : ''}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3ECF8E" stroke-width="2.5">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
                <span>Restore Data</span>
              </button>
            </div>

            <!-- Auto-Sync Toggle -->
            <div class="sync-toggle-row">
              <div>
                <strong style="font-size: 13.5px; color: var(--text-primary); display: block;">Real-time Auto-Sync</strong>
                <span style="font-size: 11px; color: var(--text-muted);">Sync profiles and scanned cards on update</span>
              </div>
              <label class="switch-control" style="position: relative; display: inline-block; width: 44px; height: 24px;">
                <input type="checkbox" id="chk-auto-sync" ${isAutoSync ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;" />
                <span style="position: absolute; cursor: pointer; inset: 0; background-color: ${isAutoSync ? '#3ECF8E' : 'var(--border-color)'}; border-radius: 24px; transition: .3s;">
                  <span style="position: absolute; content: ''; height: 18px; width: 18px; left: ${isAutoSync ? '22px' : '3px'}; bottom: 3px; background-color: white; border-radius: 50%; transition: .3s;"></span>
                </span>
              </label>
            </div>

            <!-- User Auth / Cross-Device Link Section -->
            <div class="cloudsync-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>${currentUser ? 'Supabase Account' : 'Cross-Device Account (Optional)'}</span>
            </div>

            ${currentUser ? `
              <div class="auth-form-box" style="background: rgba(62,207,142,0.06); border-color: rgba(62,207,142,0.3);">
                <div style="font-size: 13px; color: var(--text-primary);">
                  Logged in as: <strong>${currentUser.email || 'User'}</strong>
                </div>
                <button id="btn-supabase-logout" class="btn-primary" style="background: #E63946; padding: 10px; font-size: 12.5px;">
                  SIGN OUT FROM SUPABASE
                </button>
              </div>
            ` : `
              <form id="supabase-auth-form" class="auth-form-box">
                <input type="email" id="auth-email" class="auth-input" placeholder="Email address" required />
                <input type="password" id="auth-password" class="auth-input" placeholder="Password (min. 6 characters)" required />
                <div class="auth-btn-row">
                  <button type="button" id="btn-auth-signin" class="btn-sync-action" style="padding: 10px; font-size: 12.5px;">
                    Sign In
                  </button>
                  <button type="button" id="btn-auth-signup" class="btn-sync-action primary-sync" style="padding: 10px; font-size: 12.5px;">
                    Register
                  </button>
                </div>
              </form>
            `}
          </div>
        </div>
      </div>
    `;

    // Attach listeners
    const backdrop = document.getElementById('cloudsync-backdrop');
    const closeModal = () => {
      backdrop?.classList.remove('active');
      setTimeout(() => {
        container.innerHTML = '';
      }, 250);
    };

    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    document.getElementById('btn-close-cloudsync')?.addEventListener('click', closeModal);

    // Auto-sync switch
    document.getElementById('chk-auto-sync')?.addEventListener('change', (e) => {
      setAutoCloudSyncEnabled(e.target.checked);
      showToast(`Real-time Cloud Auto-Sync ${e.target.checked ? 'Enabled' : 'Disabled'}`);
      renderView();
    });

    // Cloud Backup Push
    document.getElementById('btn-cloud-push')?.addEventListener('click', async () => {
      isSyncing = true;
      renderView();
      showToast('☁️ Backing up data to Supabase...');

      const payload = {
        profiles: loadProfiles(),
        contacts: loadSavedContacts(),
        utilityQRs: loadUtilityQRs(),
        burnerProfiles: loadBurnerProfiles(),
        analytics: getAnalytics(),
        subscription: getSubscriptionState()
      };

      const res = await syncAllToSupabase(payload);
      isSyncing = false;
      if (res.success) {
        showToast('✅ Successfully backed up to Supabase Cloud!');
      } else {
        showToast('⚠️ Synced locally (Note: ' + (res.error || 'Check Supabase table') + ')');
      }
      renderView();
    });

    // Cloud Restore Pull
    document.getElementById('btn-cloud-pull')?.addEventListener('click', async () => {
      isSyncing = true;
      renderView();
      showToast('☁️ Fetching data from Supabase...');

      const res = await restoreFromSupabase();
      isSyncing = false;
      if (res.success && res.data) {
        const d = res.data;
        if (d.profiles && Array.isArray(d.profiles) && d.profiles.length) saveProfiles(d.profiles);
        if (d.subscription) saveSubscriptionState(d.subscription);
        showToast('✅ Restored data from Supabase!');
        if (onDataRestored) onDataRestored();
      } else {
        showToast('ℹ️ ' + (res.error || 'No remote backup found for this account yet.'));
      }
      renderView();
    });

    // Auth Sign In
    document.getElementById('btn-auth-signin')?.addEventListener('click', async () => {
      const email = document.getElementById('auth-email')?.value;
      const pass = document.getElementById('auth-password')?.value;
      if (!email || !pass) {
        showToast('Please enter both email and password.');
        return;
      }
      showToast('Signing in to Supabase...');
      const res = await signInUser(email, pass);
      if (res.success) {
        showToast(`Welcome back, ${email}!`);
        currentUser = await getCurrentUser();
        renderView();
      } else {
        showToast(`Sign in error: ${res.error}`);
      }
    });

    // Auth Sign Up
    document.getElementById('btn-auth-signup')?.addEventListener('click', async () => {
      const email = document.getElementById('auth-email')?.value;
      const pass = document.getElementById('auth-password')?.value;
      if (!email || !pass) {
        showToast('Please enter both email and password.');
        return;
      }
      showToast('Registering with Supabase...');
      const res = await signUpUser(email, pass);
      if (res.success) {
        showToast('Registration successful! Please check your email if confirmation is required.');
        currentUser = await getCurrentUser();
        renderView();
      } else {
        showToast(`Registration notice: ${res.error}`);
      }
    });

    // Logout
    document.getElementById('btn-supabase-logout')?.addEventListener('click', async () => {
      await signOutUser();
      currentUser = null;
      showToast('Signed out from Supabase.');
      renderView();
    });
  };

  checkInitialState();
}
