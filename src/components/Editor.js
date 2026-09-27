import { getLogoSVG } from './Logo.js';
import { renderQRCode } from '../utils/qrEngine.js';
import { uploadToStorage } from '../utils/supabaseClient.js';
import { isProSubscribed } from '../utils/storage.js';

export function renderEditor(container, { activeProfile, onSave, onBack, onUpgradePro }) {
  let draftProfile = { ...activeProfile };
  const currentColor = draftProfile.color || '#00C9A7';
  let isUploadingAvatar = false;
  const isPro = isProSubscribed();
  const maxSocials = isPro ? 4 : 1;

  // Initialize socials array safely
  if (!Array.isArray(draftProfile.socials)) {
    draftProfile.socials = [];
  }
  if (draftProfile.socials.length === 0 && draftProfile.linkedin) {
    draftProfile.socials.push({ platform: 'linkedin', handle: draftProfile.linkedin });
  }

  const SOCIAL_PLATFORMS = [
    { id: 'instagram', label: '📸 Instagram', placeholder: '@username' },
    { id: 'whatsapp', label: '💚 WhatsApp', placeholder: '+233...' },
    { id: 'linkedin', label: '💼 LinkedIn', placeholder: 'username or profile URL' },
    { id: 'x', label: '𝕏 X (Twitter)', placeholder: '@username' },
    { id: 'tiktok', label: '🎵 TikTok', placeholder: '@username' },
    { id: 'telegram', label: '✈️ Telegram', placeholder: '@username or +233...' },
    { id: 'facebook', label: '📘 Facebook', placeholder: 'username or profile URL' },
    { id: 'youtube', label: '▶️ YouTube', placeholder: '@channel' },
    { id: 'github', label: '🐙 GitHub', placeholder: 'username' },
    { id: 'snapchat', label: '👻 Snapchat', placeholder: 'username' }
  ];

  const swatches = [
    { label: 'Teal', color: '#00C9A7' },
    { label: 'Red', color: '#E63946' },
    { label: 'Blue', color: '#0077B6' },
    { label: 'Green', color: '#2A9D8F' },
    { label: 'Slate', color: '#1D3557' },
    { label: 'Purple', color: '#7209B7' }
  ];

  container.innerHTML = `
    <div class="screen-view editor-screen">
      <!-- Header Bar -->
      <div class="editor-header">
        <button id="btn-editor-back" class="btn-icon" aria-label="Back to Dashboard" title="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        <div class="editor-title">Customize Card</div>

        <button id="btn-editor-save" class="btn-save-pill" title="Save Changes">
          💾 SAVE
        </button>
      </div>

      <!-- Live Mini QR Code Preview -->
      <div class="editor-mini-preview-container">
        <div class="mini-qr-frame" id="mini-qr-target" style="border-color: ${currentColor}">
          <div class="qr-corner-accent corner-tl"></div>
          <div class="qr-corner-accent corner-tr"></div>
          <div class="qr-corner-accent corner-bl"></div>
          <div class="qr-corner-accent corner-br"></div>
        </div>
        <div class="mini-qr-caption">LIVE PREVIEW</div>
      </div>

      <!-- Form Inputs -->
      <form id="editor-form" class="editor-fields-form">
        <!-- Avatar Logo Section -->
        <div class="section-label">🖼️ Center Logo / Photo (Supabase Storage: Connect)</div>

        <div class="avatar-upload-box">
          <label class="btn-upload-avatar" id="lbl-upload-avatar" style="cursor: pointer;">
            ${draftProfile.avatar ? (draftProfile.avatar.includes('supabase.co') ? '☁️ Supabase Cloud Image (Tap to Change)' : '✅ Avatar Uploaded (Tap to Change)') : '🖼️ Upload Logo / Photo'}
            <input type="file" id="avatar-file-input" accept="image/*" style="display: none;" />
          </label>
          ${draftProfile.avatar ? `
            <button type="button" id="btn-reset-avatar" class="btn-icon" style="color: #E63946;" title="Reset to App Logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          ` : ''}
        </div>
        <div id="avatar-storage-status" style="font-size: 11px; color: var(--text-muted); margin-top: -6px; margin-bottom: 6px;"></div>

        <!-- Instant QR Mode -->
        <div class="section-label">📇 QR Code Payload Format</div>

        <div class="floating-label-group">
          <select id="edit-qrmode">
            <option value="vcard" ${draftProfile.qrMode === 'vcard' ? 'selected' : ''}>📇 vCard 3.0 Full Contact Card</option>
            <option value="whatsapp" ${draftProfile.qrMode === 'whatsapp' ? 'selected' : ''}>💚 Direct WhatsApp Instant Chat</option>
            <option value="sms" ${draftProfile.qrMode === 'sms' ? 'selected' : ''}>💬 Direct SMS Text Message</option>
          </select>
          <label for="edit-qrmode">QR Payload Format</label>
        </div>

        <!-- Next-Gen QR Aesthetics -->
        <div class="section-label">✨ QR Visual Style & Geometry</div>

        <div class="floating-label-group">
          <select id="edit-qrpattern">
            <option value="rounded" ${(!draftProfile.qrPattern || draftProfile.qrPattern === 'rounded') ? 'selected' : ''}>✨ WhatsApp / Apple Micro-Rounded</option>
            <option value="dots" ${draftProfile.qrPattern === 'dots' ? 'selected' : ''}>🫧 Circular Dots</option>
            <option value="squircle" ${draftProfile.qrPattern === 'squircle' ? 'selected' : ''}>🔲 Smooth Squircles</option>
          </select>
          <label for="edit-qrpattern">QR Pixel Geometry</label>
        </div>

        <div class="floating-label-group">
          <select id="edit-qreye">
            <option value="rounded" ${(!draftProfile.qrEyeStyle || draftProfile.qrEyeStyle === 'rounded') ? 'selected' : ''}>🔲 WhatsApp / iOS Super-Ellipse Eyes</option>
            <option value="circle" ${draftProfile.qrEyeStyle === 'circle' ? 'selected' : ''}>⭕ Circular Radar Eyes</option>
            <option value="square" ${draftProfile.qrEyeStyle === 'square' ? 'selected' : ''}>⬛ Classic Square Eyes</option>
          </select>
          <label for="edit-qreye">Corner Finder Eyes Style</label>
        </div>

        <!-- Core Contact Data -->
        <div class="section-label">👤 Core Contact Data</div>

        <div class="floating-label-group">
          <input type="text" id="edit-name" value="${draftProfile.name || ''}" placeholder=" " required />
          <label for="edit-name">Full Name</label>
        </div>

        <div class="floating-label-group">
          <input type="tel" id="edit-phone" value="${draftProfile.phone || ''}" placeholder=" " required />
          <label for="edit-phone">Phone Number</label>
        </div>

        <!-- Professional Details -->
        <div class="section-label">💼 Professional Details</div>

        <div class="floating-label-group">
          <input type="text" id="edit-title" value="${draftProfile.title || ''}" placeholder=" " />
          <label for="edit-title">Job Title / Role</label>
        </div>

        <div class="floating-label-group">
          <input type="text" id="edit-company" value="${draftProfile.company || ''}" placeholder=" " />
          <label for="edit-company">Company / Organization</label>
        </div>

        <div class="floating-label-group">
          <input type="email" id="edit-email" value="${draftProfile.email || ''}" placeholder=" " />
          <label for="edit-email">Email Address</label>
        </div>

        <div class="floating-label-group">
          <input type="url" id="edit-website" value="${draftProfile.website || ''}" placeholder=" " />
          <label for="edit-website">Website URL</label>
        </div>

        <!-- Social Media Handles (Free: 1 | Pro: 4) -->
        <div class="section-label" style="display: flex; align-items: center; justify-content: space-between;">
          <span>🌐 Social Media Handles</span>
          <span class="social-tier-badge ${isPro ? 'pro-badge' : 'free-badge'}">
            ${isPro ? '⭐ PRO: Up to 4 Handles' : '⚡ FREE: 1 Handle'}
          </span>
        </div>

        <div id="socials-list-container" class="socials-list-container">
          <!-- Dynamically populated social rows -->
        </div>

        <button type="button" id="btn-add-social" class="btn-add-social">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          ADD SOCIAL MEDIA HANDLE
        </button>

        <!-- Mobile Money Payment Channels -->
        <div class="section-label">📲 Mobile Money (MoMo) Details</div>

        <div class="floating-label-group">
          <select id="edit-momo-network">
            <option value="" ${!draftProfile.momoNetwork ? 'selected' : ''}>None / Not Set</option>
            <option value="MTN Mobile Money" ${draftProfile.momoNetwork === 'MTN Mobile Money' ? 'selected' : ''}>💛 MTN Mobile Money (MoMo)</option>
            <option value="Telecel Cash" ${draftProfile.momoNetwork === 'Telecel Cash' ? 'selected' : ''}>🔴 Telecel Cash (Vodafone)</option>
            <option value="AirtelTigo Money" ${draftProfile.momoNetwork === 'AirtelTigo Money' ? 'selected' : ''}>💙 AirtelTigo Money (AT)</option>
          </select>
          <label for="edit-momo-network">Mobile Money Network</label>
        </div>

        <div class="floating-label-group">
          <input type="tel" id="edit-momo-number" value="${draftProfile.momoNumber || ''}" placeholder=" " />
          <label for="edit-momo-number">Mobile Money Account Number</label>
        </div>

        <!-- Brand Color Theme Accent -->
        <div class="color-swatch-section">
          <div class="color-swatch-header">🎨 Brand Accent Color</div>
          <div class="color-swatch-grid">
            ${swatches.map(s => `
              <div 
                class="swatch-item ${draftProfile.color === s.color ? 'active' : ''}" 
                style="background-color: ${s.color};" 
                data-color="${s.color}"
                title="${s.label}">
              </div>
            `).join('')}
            <input type="color" id="swatch-custom-picker" class="swatch-picker-input" value="${currentColor}" title="Custom Color Picker" />
          </div>
        </div>

        <!-- Bottom Form Submit Button -->
        <button type="submit" id="btn-editor-submit-bottom" class="btn-primary" style="margin-top: 10px; margin-bottom: 24px;">
          💾 SAVE & APPLY CARD CHANGES
        </button>
      </form>
    </div>
  `;

  // Render Initial Mini QR Code
  const miniTarget = document.getElementById('mini-qr-target');
  const updateLivePreview = () => {
    // Read input values into draftProfile
    draftProfile.name = document.getElementById('edit-name')?.value || '';
    draftProfile.phone = document.getElementById('edit-phone')?.value || '';
    draftProfile.title = document.getElementById('edit-title')?.value || '';
    draftProfile.company = document.getElementById('edit-company')?.value || '';
    draftProfile.email = document.getElementById('edit-email')?.value || '';
    draftProfile.website = document.getElementById('edit-website')?.value || '';
    draftProfile.momoNetwork = document.getElementById('edit-momo-network')?.value || '';
    draftProfile.momoNumber = document.getElementById('edit-momo-number')?.value || '';
    draftProfile.qrMode = document.getElementById('edit-qrmode')?.value || 'vcard';
    draftProfile.qrPattern = document.getElementById('edit-qrpattern')?.value || 'rounded';
    draftProfile.qrEyeStyle = document.getElementById('edit-qreye')?.value || 'rounded';

    // Synchronize legacy linkedin property with socials array if present
    const li = draftProfile.socials.find(s => s.platform === 'linkedin');
    if (li && li.handle) draftProfile.linkedin = li.handle;

    if (miniTarget) {
      miniTarget.style.borderColor = draftProfile.color || '#00C9A7';
      renderQRCode(miniTarget, draftProfile);
    }
  };

  // Render Dynamic Social Rows
  const renderSocialRows = () => {
    const containerEl = document.getElementById('socials-list-container');
    const addBtn = document.getElementById('btn-add-social');
    if (!containerEl) return;

    const currentIsPro = isProSubscribed();
    const maxHandles = currentIsPro ? 4 : 1;

    containerEl.innerHTML = draftProfile.socials.map((social, idx) => {
      const currentPlatform = social.platform || 'instagram';
      const platformDef = SOCIAL_PLATFORMS.find(p => p.id === currentPlatform) || SOCIAL_PLATFORMS[0];

      return `
        <div class="social-row-card" data-idx="${idx}">
          <div class="social-row-fields">
            <select class="social-platform-select" data-idx="${idx}">
              ${SOCIAL_PLATFORMS.map(p => `
                <option value="${p.id}" ${p.id === currentPlatform ? 'selected' : ''}>${p.label}</option>
              `).join('')}
            </select>
            <input 
              type="text" 
              class="social-handle-input" 
              data-idx="${idx}" 
              placeholder="${platformDef.placeholder}" 
              value="${social.handle || ''}" 
            />
          </div>
          <button type="button" class="btn-remove-social" data-idx="${idx}" title="Remove Handle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `;
    }).join('');

    // Attach listeners on platform change
    containerEl.querySelectorAll('.social-platform-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const newPlatform = e.target.value;
        draftProfile.socials[idx].platform = newPlatform;
        const input = containerEl.querySelector(`.social-handle-input[data-idx="${idx}"]`);
        const pDef = SOCIAL_PLATFORMS.find(p => p.id === newPlatform);
        if (input && pDef) input.placeholder = pDef.placeholder;
        updateLivePreview();
      });
    });

    // Attach listeners on handle input
    containerEl.querySelectorAll('.social-handle-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        draftProfile.socials[idx].handle = e.target.value.trim();
        updateLivePreview();
      });
    });

    // Attach listeners on remove
    containerEl.querySelectorAll('.btn-remove-social').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        draftProfile.socials.splice(idx, 1);
        renderSocialRows();
        updateLivePreview();
      });
    });

    // Update Add button label and state
    if (addBtn) {
      if (!currentIsPro && draftProfile.socials.length >= 1) {
        addBtn.innerHTML = `⭐ Upgrade to PRO to add up to 4 Social Handles`;
        addBtn.classList.add('btn-add-social-upgrade');
        addBtn.disabled = false;
      } else if (currentIsPro && draftProfile.socials.length >= 4) {
        addBtn.innerHTML = `✅ Maximum 4 PRO Handles Added`;
        addBtn.classList.remove('btn-add-social-upgrade');
        addBtn.disabled = true;
      } else {
        addBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          + ADD SOCIAL MEDIA HANDLE (${draftProfile.socials.length}/${maxHandles})
        `;
        addBtn.classList.remove('btn-add-social-upgrade');
        addBtn.disabled = false;
      }
    }
  };

  renderSocialRows();
  updateLivePreview();

  // Add Social Handle button click handler
  document.getElementById('btn-add-social')?.addEventListener('click', () => {
    const currentIsPro = isProSubscribed();
    const maxHandles = currentIsPro ? 4 : 1;

    if (!currentIsPro && draftProfile.socials.length >= 1) {
      if (onUpgradePro) {
        onUpgradePro('Add up to 4 Social Media Handles');
      }
      return;
    }

    if (draftProfile.socials.length < maxHandles) {
      draftProfile.socials.push({ platform: 'instagram', handle: '' });
      renderSocialRows();
      updateLivePreview();
    }
  });

  // Attach live input listeners for instant preview
  const formInputs = document.querySelectorAll('#editor-form input:not([type="color"]), #editor-form select');
  formInputs.forEach(input => input.addEventListener('input', updateLivePreview));

  // Custom Avatar upload listener with Supabase Storage integration
  document.getElementById('avatar-file-input')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const statusEl = document.getElementById('avatar-storage-status');
    const labelEl = document.getElementById('lbl-upload-avatar');

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        draftProfile.avatar = event.target.result;
        updateLivePreview();
      };
      reader.readAsDataURL(file);

      // Async upload to Supabase Storage Bucket 'Connect'
      if (statusEl) statusEl.textContent = '☁️ Uploading to Supabase Storage (Connect)...';
      try {
        const uploadRes = await uploadToStorage(file, `avatar_${draftProfile.id || 'profile'}_${Date.now()}`);
        if (uploadRes.success && uploadRes.url) {
          draftProfile.avatar = uploadRes.url;
          if (statusEl) {
            statusEl.innerHTML = '<span style="color: #3ECF8E; font-weight: 600;">✅ Uploaded to Supabase Cloud (Bucket: Connect)</span>';
          }
          if (labelEl) labelEl.textContent = '☁️ Supabase Cloud Image (Tap to Change)';
        } else {
          if (statusEl) {
            statusEl.innerHTML = '<span style="color: #FFB703;">⚡ Stored locally in card (Cloud bucket: ' + (uploadRes.error || 'Ready') + ')</span>';
          }
        }
      } catch (err) {
        if (statusEl) statusEl.textContent = '⚡ Stored locally in profile';
      }
    }
  });

  // Reset Avatar handler
  document.getElementById('btn-reset-avatar')?.addEventListener('click', () => {
    draftProfile.avatar = '';
    const statusEl = document.getElementById('avatar-storage-status');
    if (statusEl) statusEl.textContent = '';
    updateLivePreview();
  });

  // Swatch click handlers
  const swatchItems = document.querySelectorAll('.swatch-item');
  swatchItems.forEach(item => {
    item.addEventListener('click', () => {
      swatchItems.forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      draftProfile.color = item.getAttribute('data-color');
      document.getElementById('swatch-custom-picker').value = draftProfile.color;
      updateLivePreview();
    });
  });

  // Custom Color Picker handler
  document.getElementById('swatch-custom-picker')?.addEventListener('input', (e) => {
    swatchItems.forEach(s => s.classList.remove('active'));
    draftProfile.color = e.target.value;
    updateLivePreview();
  });

  // Back & Save Handlers
  document.getElementById('btn-editor-back')?.addEventListener('click', onBack);

  const saveAction = (e) => {
    if (e) e.preventDefault();
    updateLivePreview();
    onSave(draftProfile);
  };

  document.getElementById('btn-editor-save')?.addEventListener('click', saveAction);
  document.getElementById('editor-form')?.addEventListener('submit', saveAction);
}
