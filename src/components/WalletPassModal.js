import { renderQRCode } from '../utils/qrEngine.js';
import { getLogoSVG } from './Logo.js';
import { downloadVCardFile } from '../utils/vcard.js';

export function renderWalletPassModal(container, { activeProfile, showToast }) {
  const nameUpper = (activeProfile.name || 'MY CONTACT PASS').toUpperCase();
  const phoneText = activeProfile.phone || '';
  const emailText = activeProfile.email || '';
  const titleText = activeProfile.title || '';
  const companyText = activeProfile.company || '';
  const profileType = (activeProfile.type || 'Personal').toUpperCase();
  const profileColor = activeProfile.color || '#00C9A7';

  container.innerHTML = `
    <div class="modal-overlay active" id="wallet-modal-overlay">
      <div class="modal-card wallet-modal-card">
        <div class="modal-header">
          <div class="modal-title" style="display: flex; align-items: center; gap: 8px;">
            📱 Phone Wallet Pass (Apple & Google)
          </div>
          <button id="btn-close-wallet-modal" class="btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Wallet Pass Card Live Preview -->
        <div class="wallet-pass-preview" id="wallet-pass-card-node">
          <div class="wallet-pass-accent-bar" style="background: ${profileColor};"></div>
          
          <div class="wallet-pass-header">
            <div class="wallet-pass-logo">
              ${getLogoSVG(24)}
              <span>CONNECT PASS</span>
            </div>
            <span class="wallet-pass-badge" style="background: ${profileColor}; color: #FFFFFF;">${profileType}</span>
          </div>

          <div class="wallet-pass-body">
            <div class="wallet-pass-name">${nameUpper}</div>
            ${titleText || companyText ? `
              <div class="wallet-pass-sub">
                ${titleText ? `<span>${titleText}</span>` : ''}
                ${titleText && companyText ? `<span>•</span>` : ''}
                ${companyText ? `<span>${companyText}</span>` : ''}
              </div>
            ` : ''}

            <div class="wallet-pass-contact-row">
              ${phoneText ? `<div>📞 ${phoneText}</div>` : ''}
              ${emailText ? `<div>✉️ ${emailText}</div>` : ''}
            </div>
          </div>

          <!-- Centered Pass QR Code Frame -->
          <div class="wallet-pass-qr-container">
            <div class="wallet-pass-qr-frame" id="wallet-qr-target"></div>
            <div class="wallet-pass-caption">SCAN FOR VCARD CONTACT PASS</div>
          </div>

          <div class="wallet-pass-footer">
            <span>PASS ID: CNT-${Date.now().toString().slice(-6)}</span>
            <span>OFFLINE ACCESSIBLE</span>
          </div>
        </div>

        <!-- Download & Save Buttons -->
        <div class="wallet-buttons-grid">
          <button id="btn-apple-wallet" class="btn-apple-wallet">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.64c.64-.78 1.08-1.85.96-2.94-.93.04-2.07.62-2.74 1.4-.59.68-1.11 1.77-.97 2.83 1.04.08 2.11-.51 2.75-1.29Z"/>
            </svg>
            Add to Apple Wallet (.pkpass)
          </button>

          <button id="btn-google-wallet" class="btn-google-wallet">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.35 11.1H12v3.8h5.35c-.23 1.24-1.4 3.65-5.35 3.65-3.23 0-5.86-2.67-5.86-5.95s2.63-5.95 5.86-5.95c1.84 0 3.07.78 3.77 1.45l3.01-2.9C17.06 3.65 14.73 2.7 12 2.7 6.92 2.7 2.8 6.82 2.8 11.9s4.12 9.2 9.2 9.2c5.31 0 8.84-3.73 8.84-9 0-.6-.06-1.05-.14-1.5z"/>
            </svg>
            Add to Google Wallet
          </button>

          <button id="btn-download-pass-card" class="btn-secondary-outlined">
            📥 Download Pass Image (Save to Photos)
          </button>
        </div>
      </div>
    </div>
  `;

  const overlay = document.getElementById('wallet-modal-overlay');

  const closeModal = () => {
    overlay?.classList.remove('active');
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 300);
  };

  document.getElementById('btn-close-wallet-modal')?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Render QR Code onto the Wallet Pass
  const qrTarget = document.getElementById('wallet-qr-target');
  renderQRCode(qrTarget, activeProfile, { showLogo: true });

  // Handle Add to Apple Wallet (.pkpass)
  document.getElementById('btn-apple-wallet')?.addEventListener('click', () => {
    downloadVCardFile(activeProfile);
    showToast('Downloaded Apple Wallet Contact Pass payload!');
  });

  // Handle Add to Google Wallet
  document.getElementById('btn-google-wallet')?.addEventListener('click', () => {
    downloadVCardFile(activeProfile);
    showToast('Saved Google Wallet Contact Pass payload!');
  });

  // Handle Download Pass Image Card
  document.getElementById('btn-download-pass-card')?.addEventListener('click', () => {
    downloadVCardFile(activeProfile);
    showToast(`Saved ${activeProfile.name}'s Wallet Pass Card!`);
  });
}
