import { getLogoSVG } from './Logo.js';
import { renderQRCode } from '../utils/qrEngine.js';

export function renderEditor(container, { activeProfile, onSave, onBack }) {
  let draftProfile = { ...activeProfile };
  const currentColor = draftProfile.color || '#00C9A7';

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
        <div class="section-label">🖼️ Center Logo / Photo</div>

        <div class="avatar-upload-box">
          <label class="btn-upload-avatar" style="cursor: pointer;">
            ${draftProfile.avatar ? '✅ Avatar Uploaded (Tap to Change)' : '🖼️ Upload Logo / Photo'}
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
          <input type="text" id="edit-linkedin" value="${draftProfile.linkedin || ''}" placeholder=" " />
          <label for="edit-linkedin">LinkedIn Profile URL</label>
        </div>

        <div class="floating-label-group">
          <input type="url" id="edit-website" value="${draftProfile.website || ''}" placeholder=" " />
          <label for="edit-website">Website URL</label>
        </div>

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
    draftProfile.name = document.getElementById('edit-name').value;
    draftProfile.phone = document.getElementById('edit-phone').value;
    draftProfile.title = document.getElementById('edit-title').value;
    draftProfile.company = document.getElementById('edit-company').value;
    draftProfile.email = document.getElementById('edit-email').value;
    draftProfile.linkedin = document.getElementById('edit-linkedin').value;
    draftProfile.website = document.getElementById('edit-website').value;
    draftProfile.momoNetwork = document.getElementById('edit-momo-network')?.value || '';
    draftProfile.momoNumber = document.getElementById('edit-momo-number')?.value || '';
    draftProfile.qrMode = document.getElementById('edit-qrmode').value;

    if (miniTarget) {
      miniTarget.style.borderColor = draftProfile.color || '#00C9A7';
      renderQRCode(miniTarget, draftProfile);
    }
  };

  updateLivePreview();

  // Attach live input listeners for instant preview
  const formInputs = document.querySelectorAll('#editor-form input:not([type="color"]), #editor-form select');
  formInputs.forEach(input => input.addEventListener('input', updateLivePreview));

  // Custom Avatar upload listener
  document.getElementById('avatar-file-input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        draftProfile.avatar = event.target.result;
        updateLivePreview();
      };
      reader.readAsDataURL(file);
    }
  });

  // Reset Avatar handler
  document.getElementById('btn-reset-avatar')?.addEventListener('click', () => {
    draftProfile.avatar = '';
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
