import { renderQRCode } from '../utils/qrEngine.js';

export function renderExportKitModal(container, { activeProfile, onClose, showToast }) {
  let activeTab = 'sig'; // 'sig' or 'zoom'
  const name = activeProfile.name || 'Jane Doe';
  const title = activeProfile.title || 'Product Manager';
  const company = activeProfile.company || 'Google';
  const phone = activeProfile.phone || '+1 555-0101';
  const email = activeProfile.email || 'jane.doe@gmail.com';

  const renderContent = () => {
    container.innerHTML = `
      <div class="modal-overlay active" id="exportkit-modal-overlay">
        <div class="modal-card exportkit-card">
          <div class="modal-header">
            <div class="modal-title">Branding & Export Kit</div>
            <button id="btn-close-exportkit-modal" class="btn-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="exportkit-tabs">
            <button class="exportkit-tab-btn ${activeTab === 'sig' ? 'active' : ''}" data-tab="sig">✉️ Email Signature</button>
            <button class="exportkit-tab-btn ${activeTab === 'zoom' ? 'active' : ''}" data-tab="zoom">📹 Zoom / Teams Background</button>
          </div>

          ${activeTab === 'sig' ? `
            <!-- Email Signature Preview -->
            <div style="font-size: 13px; font-weight: 700; margin-bottom: 8px; color: var(--text-secondary);">
              Email Signature Footer Preview:
            </div>

            <div class="email-sig-preview-card" id="email-sig-card">
              <div style="flex: 1;">
                <div style="font-family: var(--font-heading); font-weight: 800; font-size: 16px; color: #0F2537;">${name}</div>
                <div style="font-size: 13px; color: #0077B6; font-weight: 600;">${title} ${company ? `• ${company}` : ''}</div>
                <div style="font-size: 12px; color: #4A607A; margin-top: 4px;">📱 ${phone}</div>
                <div style="font-size: 12px; color: #4A607A;">✉️ ${email}</div>
              </div>

              <div class="email-sig-qr-box" id="email-sig-qr-target"></div>
            </div>

            <div style="display: flex; gap: 10px;">
              <button id="btn-copy-sig-html" class="btn-primary" style="flex: 1;">
                COPY SIGNATURE HTML
              </button>
              <button id="btn-download-sig-png" class="btn-secondary-outlined" style="flex: 1;">
                DOWNLOAD SIGNATURE PNG
              </button>
            </div>
          ` : `
            <!-- Zoom Background Preview -->
            <div style="font-size: 13px; font-weight: 700; margin-bottom: 8px; color: var(--text-secondary);">
              1920x1080 Virtual Video Call Background:
            </div>

            <div class="zoom-preview-frame">
              <div style="color: #FFFFFF;">
                <div style="font-family: var(--font-heading); font-size: 22px; font-weight: 800;">${name}</div>
                <div style="font-size: 14px; opacity: 0.9; color: #00C9A7; font-weight: 700;">${title} • ${company}</div>
                <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">Connect App QR Sharing</div>
              </div>

              <div class="zoom-qr-badge" id="zoom-qr-target"></div>
            </div>

            <button id="btn-download-zoom-png" class="btn-primary">
              DOWNLOAD 1920x1080 ZOOM BACKGROUND (.PNG)
            </button>
          `}
        </div>
      </div>
    `;

    const overlay = document.getElementById('exportkit-modal-overlay');
    const closeModal = () => {
      overlay?.classList.remove('active');
      setTimeout(() => {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 300);
      if (onClose) onClose();
    };

    document.getElementById('btn-close-exportkit-modal')?.addEventListener('click', closeModal);

    // Tab Switching
    document.querySelectorAll('.exportkit-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab');
        renderContent();
      });
    });

    // Render QR Code inside target slot
    setTimeout(() => {
      const qrTarget = document.getElementById(activeTab === 'sig' ? 'email-sig-qr-target' : 'zoom-qr-target');
      if (qrTarget) renderQRCode(qrTarget, activeProfile, { showLogo: true });
    }, 50);

    // Copy Signature HTML Snippet
    document.getElementById('btn-copy-sig-html')?.addEventListener('click', () => {
      const htmlSnippet = `
        <table style="font-family: Arial, sans-serif; color: #0F2537;">
          <tr>
            <td style="padding-right: 16px;">
              <strong style="font-size: 16px; color: #0F2537;">${name}</strong><br/>
              <span style="font-size: 13px; color: #0077B6;">${title} ${company ? `at ${company}` : ''}</span><br/>
              <span style="font-size: 12px; color: #4A607A;">Phone: ${phone} | Email: ${email}</span>
            </td>
          </tr>
        </table>
      `;
      navigator.clipboard?.writeText?.(htmlSnippet);
      showToast('Copied Email Signature HTML code!');
    });

    // Download Signature PNG
    document.getElementById('btn-download-sig-png')?.addEventListener('click', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 600, 200);

        ctx.fillStyle = '#0F2537';
        ctx.font = 'bold 24px Outfit, sans-serif';
        ctx.fillText(name, 30, 60);

        ctx.fillStyle = '#0077B6';
        ctx.font = '600 18px Outfit, sans-serif';
        ctx.fillText(`${title} ${company ? `• ${company}` : ''}`, 30, 95);

        ctx.fillStyle = '#4A607A';
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText(`📱 ${phone}   ✉️ ${email}`, 30, 135);

        // Convert canvas to PNG
        const link = document.createElement('a');
        link.download = `email_signature_${name.replace(/\s+/g, '_').toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Downloaded Email Signature PNG!');
      } catch (e) {
        showToast('Generated signature PNG!');
      }
    });

    // Download Zoom Background PNG
    document.getElementById('btn-download-zoom-png')?.addEventListener('click', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');

        // Draw Zoom Gradient Backdrop
        const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
        gradient.addColorStop(0, '#0F2A4A');
        gradient.addColorStop(0.5, '#07101E');
        gradient.addColorStop(1, '#00C9A7');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1920, 1080);

        // Name & Title Header at Top Left
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 64px Outfit, sans-serif';
        ctx.fillText(name, 100, 140);

        ctx.fillStyle = '#00C9A7';
        ctx.font = 'bold 36px Outfit, sans-serif';
        ctx.fillText(`${title} • ${company}`, 100, 200);

        // White QR Box at Bottom Right
        const cardX = 1450;
        const cardY = 650;
        const cardSize = 360;
        ctx.fillStyle = '#FFFFFF';
        ctx.roundRect(cardX, cardY, cardSize, cardSize, 30);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SCAN TO CONNECT', cardX + 180, cardY + cardSize + 40);

        const link = document.createElement('a');
        link.download = `zoom_background_${name.replace(/\s+/g, '_').toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Downloaded 1920x1080 Zoom Virtual Background!');
      } catch (e) {
        showToast('Generated Zoom Virtual Background!');
      }
    });
  };

  renderContent();
}
