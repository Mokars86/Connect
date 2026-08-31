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
        <button id="btn-editor-back" class="btn-icon" aria-label="Back to Dashboard">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        <div class="app-logo-badge">
          ${getLogoSVG(34)}
        </div>

        <button id="btn-editor-save" class="btn-save-pill">
          SAVE
        </button>
      </div>

      <!-- Live Mini QR Code Preview -->
      <div class="editor-mini-preview-container">
        <div class="mini-qr-frame" id="mini-qr-target" style="border-color: ${currentColor}">
        </div>
      </div>

      <!-- Form Inputs -->
      <form id="editor-form" class="editor-fields-form">
        <div class="section-label">Core Contact Data</div>

        <div class="floating-label-group">
          <input type="text" id="edit-name" value="${draftProfile.name || ''}" placeholder=" " required />
          <label for="edit-name">Name</label>
        </div>

        <div class="floating-label-group">
          <input type="tel" id="edit-phone" value="${draftProfile.phone || ''}" placeholder=" " required />
          <label for="edit-phone">Phone Number</label>
        </div>

        <div class="section-label">vCard Enhancement (Optional)</div>

        <div class="floating-label-group">
          <input type="text" id="edit-title" value="${draftProfile.title || ''}" placeholder=" " />
          <label for="edit-title">Title</label>
        </div>

        <div class="floating-label-group">
          <input type="text" id="edit-company" value="${draftProfile.company || ''}" placeholder=" " />
          <label for="edit-company">Company</label>
        </div>

        <div class="floating-label-group">
          <input type="email" id="edit-email" value="${draftProfile.email || ''}" placeholder=" " />
          <label for="edit-email">Email</label>
        </div>

        <div class="floating-label-group">
          <input type="text" id="edit-linkedin" value="${draftProfile.linkedin || ''}" placeholder=" " />
          <label for="edit-linkedin">LinkedIn</label>
        </div>

        <div class="floating-label-group">
          <input type="url" id="edit-website" value="${draftProfile.website || ''}" placeholder=" " />
          <label for="edit-website">Website</label>
        </div>

        <!-- Color Customization Section -->
        <div class="color-swatch-section">
          <div class="color-swatch-header">COLOR</div>
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

    if (miniTarget) {
      miniTarget.style.borderColor = draftProfile.color || '#00C9A7';
      renderQRCode(miniTarget, draftProfile);
    }
  };

  updateLivePreview();

  // Attach live input listeners for instant preview
  const formInputs = document.querySelectorAll('#editor-form input:not([type="color"])');
  formInputs.forEach(input => input.addEventListener('input', updateLivePreview));

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
  document.getElementById('btn-editor-save')?.addEventListener('click', () => {
    updateLivePreview();
    onSave(draftProfile);
  });
}
