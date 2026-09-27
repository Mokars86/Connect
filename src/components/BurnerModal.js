import { renderQRCode } from '../utils/qrEngine.js';
import { loadBurnerProfiles, saveBurnerProfile, deleteBurnerProfile } from '../utils/storage.js';

export function renderBurnerModal(container, { onClose, showToast }) {
  let burners = loadBurnerProfiles();

  const renderContent = () => {
    container.innerHTML = `
      <div class="modal-overlay active" id="burner-modal-overlay">
        <div class="modal-card burner-modal-card">
          <div class="modal-header">
            <div>
              <div class="modal-title">Temporary Burner Profile</div>
              <div class="burner-badge-indicator" style="margin-top: 4px;">🔥 Disposable QR Mode</div>
            </div>
            <button id="btn-close-burner-modal" class="btn-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
            Share a temporary QR code for marketplace buyers, rideshares, or short-term clients without revealing your personal or work phone number.
          </p>

          <!-- Burner QR Preview Frame -->
          <div class="burner-preview-frame" id="burner-qr-target">
            <div class="qr-corner-accent corner-tl" style="border-color: #E63946;"></div>
            <div class="qr-corner-accent corner-tr" style="border-color: #E63946;"></div>
            <div class="qr-corner-accent corner-bl" style="border-color: #E63946;"></div>
            <div class="qr-corner-accent corner-br" style="border-color: #E63946;"></div>
          </div>

          <!-- Create Burner Form -->
          <form id="burner-form" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="floating-label-group">
              <input type="text" id="burner-name" placeholder=" " value="" required />
              <label for="burner-name">Display Name (e.g. Temporary Contact)</label>
            </div>

            <div class="floating-label-group">
              <input type="tel" id="burner-phone" placeholder=" " value="" required />
              <label for="burner-phone">Phone Number</label>
            </div>

            <div class="floating-label-group">
              <select id="burner-duration">
                <option value="86400000">Expires in 24 Hours</option>
                <option value="604800000">Expires in 7 Days</option>
                <option value="2592000000">Expires in 30 Days</option>
              </select>
              <label for="burner-duration">Auto-Expiration Duration</label>
            </div>

            <button type="submit" class="btn-primary" style="background: linear-gradient(135deg, #E63946 0%, #D62828 100%);">
              GENERATE BURNER QR CODE
            </button>
          </form>

          <!-- Active Burners List -->
          ${burners.length > 0 ? `
            <div style="margin-top: 18px; border-top: 1px solid var(--border-light); padding-top: 14px;">
              <div style="font-size: 13px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Active Burner Profiles</div>
              ${burners.map(b => `
                <div class="burner-item-card">
                  <div>
                    <strong style="font-size: 14px; display: block; color: #E63946;">🔥 ${b.name}</strong>
                    <span style="font-size: 12px; color: var(--text-secondary);">${b.phone}</span>
                  </div>
                  <button class="btn-icon btn-delete-burner" data-id="${b.id}" style="color: #E63946;">
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

    const overlay = document.getElementById('burner-modal-overlay');
    const closeModal = () => {
      overlay?.classList.remove('active');
      setTimeout(() => {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 300);
      if (onClose) onClose();
    };

    document.getElementById('btn-close-burner-modal')?.addEventListener('click', closeModal);

    // Initial QR render
    const qrTarget = document.getElementById('burner-qr-target');
    const updateQR = () => {
      const name = document.getElementById('burner-name')?.value || 'Burner Contact';
      const phone = document.getElementById('burner-phone')?.value || '+1 555-0999';
      renderQRCode(qrTarget, { name, phone, color: '#E63946' }, { showLogo: true });
    };

    updateQR();
    document.querySelectorAll('#burner-form input').forEach(i => i.addEventListener('input', updateQR));

    // Form Submit
    document.getElementById('burner-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('burner-name').value;
      const phone = document.getElementById('burner-phone').value;
      const duration = parseInt(document.getElementById('burner-duration').value, 10);

      saveBurnerProfile({
        name,
        phone,
        expiresAt: Date.now() + duration
      });

      burners = loadBurnerProfiles();
      showToast('Created Disposable Burner Profile!');
      renderContent();
    });

    // Delete Burner
    document.querySelectorAll('.btn-delete-burner').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteBurnerProfile(id);
        burners = loadBurnerProfiles();
        showToast('Deleted Burner Profile');
        renderContent();
      });
    });
  };

  renderContent();
}
