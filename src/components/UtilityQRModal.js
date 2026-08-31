import { renderQRCode } from '../utils/qrEngine.js';
import { loadUtilityQRs, saveUtilityQR, deleteUtilityQR } from '../utils/storage.js';

export function renderUtilityQRModal(container, { onClose, showToast }) {
  let activeTab = 'momo'; // 'momo', 'wifi', 'url', 'payment'
  let savedItems = loadUtilityQRs();

  const renderContent = () => {
    container.innerHTML = `
      <div class="modal-overlay active" id="utility-modal-overlay">
        <div class="modal-card utility-modal-card">
          <div class="modal-header">
            <div class="modal-title">Multi-Utility & Payment QR Generator</div>
            <button id="btn-close-utility-modal" class="btn-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="utility-type-tabs" style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;">
            <button class="utility-tab-btn ${activeTab === 'momo' ? 'active' : ''}" data-tab="momo">📲 Mobile Money</button>
            <button class="utility-tab-btn ${activeTab === 'wifi' ? 'active' : ''}" data-tab="wifi">📶 WiFi Access</button>
            <button class="utility-tab-btn ${activeTab === 'url' ? 'active' : ''}" data-tab="url">🌐 Social / Web</button>
            <button class="utility-tab-btn ${activeTab === 'payment' ? 'active' : ''}" data-tab="payment">💳 Global Pay</button>
          </div>

          <!-- Live QR Preview Frame -->
          <div class="utility-preview-container">
            <div class="utility-qr-frame" id="utility-qr-target">
              <div class="qr-corner-accent corner-tl"></div>
              <div class="qr-corner-accent corner-tr"></div>
              <div class="qr-corner-accent corner-bl"></div>
              <div class="qr-corner-accent corner-br"></div>
            </div>
          </div>

          <!-- Dynamic Form Inputs -->
          <form id="utility-form" style="display: flex; flex-direction: column; gap: 12px;">
            ${activeTab === 'momo' ? `
              <div class="floating-label-group">
                <select id="momo-network">
                  <option value="MTN MoMo">💛 MTN Mobile Money (MTN MoMo)</option>
                  <option value="Telecel Cash">🔴 Telecel Cash (Vodafone Cash)</option>
                  <option value="AirtelTigo Money">💙 AirtelTigo Money (AT Money)</option>
                </select>
                <label for="momo-network">Mobile Money Network</label>
              </div>

              <div class="floating-label-group">
                <input type="tel" id="momo-number" placeholder=" " value="024 123 4567" required />
                <label for="momo-number">Mobile Money Phone Number</label>
              </div>

              <div class="floating-label-group">
                <input type="text" id="momo-name" placeholder=" " value="Kwame Mensah" required />
                <label for="momo-name">Account Registered Name</label>
              </div>

              <div class="floating-label-group">
                <input type="text" id="momo-ref" placeholder=" " value="Payment Reference / Notes" />
                <label for="momo-ref">Reference / Merchant ID (Optional)</label>
              </div>
            ` : activeTab === 'wifi' ? `
              <div class="floating-label-group">
                <input type="text" id="wifi-ssid" placeholder=" " value="MyGuestWiFi" required />
                <label for="wifi-ssid">WiFi Network SSID (Name)</label>
              </div>

              <div class="floating-label-group">
                <input type="text" id="wifi-password" placeholder=" " value="guest12345" />
                <label for="wifi-password">WiFi Password</label>
              </div>

              <div class="floating-label-group">
                <select id="wifi-encryption">
                  <option value="WPA">WPA / WPA2 (Default)</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Open / No Password</option>
                </select>
                <label for="wifi-encryption">Encryption Type</label>
              </div>
            ` : activeTab === 'url' ? `
              <div class="floating-label-group">
                <input type="text" id="url-title" placeholder=" " value="My Instagram" required />
                <label for="url-title">Title / Name</label>
              </div>

              <div class="floating-label-group">
                <input type="url" id="url-payload" placeholder=" " value="https://instagram.com/myprofile" required />
                <label for="url-payload">Website or Social Profile URL</label>
              </div>
            ` : `
              <div class="floating-label-group">
                <input type="text" id="pay-title" placeholder=" " value="CashApp / Venmo / PayPal" required />
                <label for="pay-title">Payment Account Title</label>
              </div>

              <div class="floating-label-group">
                <input type="text" id="pay-payload" placeholder=" " value="https://cash.app/$username" required />
                <label for="pay-payload">Payment Link or Handle</label>
              </div>
            `}

            <button type="submit" class="btn-primary" style="margin-top: 6px;">
              SAVE & GENERATE ${activeTab === 'momo' ? 'MOMO' : 'UTILITY'} QR
            </button>
          </form>

          <!-- Saved Utility QRs List -->
          ${savedItems.length > 0 ? `
            <div class="utility-saved-list">
              <div style="font-size: 13px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Your Saved Utility & MoMo QRs</div>
              ${savedItems.map(item => `
                <div class="utility-saved-card">
                  <div>
                    <strong style="font-size: 14px; display: block;">${item.title}</strong>
                    <span style="font-size: 12px; color: var(--text-secondary);">${item.type.toUpperCase()} • ${item.dateCreated}</span>
                  </div>
                  <button class="btn-icon btn-delete-util" data-id="${item.id}" style="color: #E63946;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    const overlay = document.getElementById('utility-modal-overlay');

    const closeModal = () => {
      overlay?.classList.remove('active');
      setTimeout(() => {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 300);
      if (onClose) onClose();
    };

    document.getElementById('btn-close-utility-modal')?.addEventListener('click', closeModal);

    // Tab Switching
    document.querySelectorAll('.utility-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab');
        renderContent();
      });
    });

    // Real-time Live QR Code rendering
    const qrTarget = document.getElementById('utility-qr-target');
    const updateQR = () => {
      let color = '#00C9A7';
      if (activeTab === 'momo') {
        const net = document.getElementById('momo-network')?.value || 'MTN MoMo';
        if (net.includes('MTN')) color = '#FFCC00';
        else if (net.includes('Telecel')) color = '#E63946';
        else if (net.includes('AirtelTigo')) color = '#0077B6';
      }

      // Generate SVG QR Code
      renderQRCode(qrTarget, { name: 'Payment QR', color }, { showLogo: true });
    };

    updateQR();

    // Attach input listeners
    document.querySelectorAll('#utility-form input, #utility-form select').forEach(input => {
      input.addEventListener('input', updateQR);
    });

    // Form Submit
    document.getElementById('utility-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      let title = '';
      let payload = '';

      if (activeTab === 'momo') {
        const network = document.getElementById('momo-network').value;
        const number = document.getElementById('momo-number').value;
        const name = document.getElementById('momo-name').value;
        const ref = document.getElementById('momo-ref').value;
        title = `${network}: ${number} (${name})`;
        payload = `MOMO:${network.toUpperCase()};NUM:${number};NAME:${name};REF:${ref};`;
      } else if (activeTab === 'wifi') {
        const ssid = document.getElementById('wifi-ssid').value;
        const pass = document.getElementById('wifi-password').value;
        const enc = document.getElementById('wifi-encryption').value;
        title = `WiFi: ${ssid}`;
        payload = `WIFI:S:${ssid};T:${enc};P:${pass};;`;
      } else if (activeTab === 'url') {
        title = document.getElementById('url-title').value;
        payload = document.getElementById('url-payload').value;
      } else {
        title = document.getElementById('pay-title').value;
        payload = document.getElementById('pay-payload').value;
      }

      saveUtilityQR({ type: activeTab, title, payload, color: '#00C9A7' });
      savedItems = loadUtilityQRs();
      showToast(`Saved ${title} Payment QR!`);
      renderContent();
    });

    // Delete Utility Item
    document.querySelectorAll('.btn-delete-util').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteUtilityQR(id);
        savedItems = loadUtilityQRs();
        showToast('Deleted Payment/Utility QR');
        renderContent();
      });
    });
  };

  renderContent();
}
