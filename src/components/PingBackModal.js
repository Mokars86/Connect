import { saveContactToVault } from '../utils/storage.js';

export function renderPingBackModal(container, { onClose, onSavedToVault, showToast }) {
  container.innerHTML = `
    <div class="modal-overlay active" id="pingback-modal-overlay">
      <div class="modal-card pingback-card">
        <div class="modal-header">
          <div class="modal-title">Share Your Contact Back</div>
          <button id="btn-close-pingback-modal" class="btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="pingback-hero-badge">
          <span style="font-size: 24px;">🔄</span>
          <div>
            <strong style="font-size: 14px; display: block;">Two-Way Contact Exchange</strong>
            <span style="font-size: 12px; opacity: 0.9;">Send your details back instantly without downloading an app!</span>
          </div>
        </div>

        <form id="pingback-form" style="display: flex; flex-direction: column; gap: 12px;">
          <div class="floating-label-group">
            <input type="text" id="ping-name" placeholder=" " required />
            <label for="ping-name">Your Full Name</label>
          </div>

          <div class="floating-label-group">
            <input type="tel" id="ping-phone" placeholder=" " required />
            <label for="ping-phone">Phone Number</label>
          </div>

          <div class="floating-label-group">
            <input type="email" id="ping-email" placeholder=" " />
            <label for="ping-email">Email Address</label>
          </div>

          <div class="floating-label-group">
            <input type="text" id="ping-company" placeholder=" " />
            <label for="ping-company">Title & Company</label>
          </div>

          <div class="floating-label-group">
            <input type="text" id="ping-notes" placeholder=" " value="Met via Connect QR Code" />
            <label for="ping-notes">Note / Where We Met</label>
          </div>

          <button type="submit" class="btn-primary" style="margin-top: 6px;">
            SEND MY CONTACT DETAILS BACK 🚀
          </button>
        </form>
      </div>
    </div>
  `;

  const overlay = document.getElementById('pingback-modal-overlay');
  const closeModal = () => {
    overlay?.classList.remove('active');
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 300);
    if (onClose) onClose();
  };

  document.getElementById('btn-close-pingback-modal')?.addEventListener('click', closeModal);

  document.getElementById('pingback-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('ping-name').value;
    const phone = document.getElementById('ping-phone').value;
    const email = document.getElementById('ping-email').value;
    const company = document.getElementById('ping-company').value;
    const notes = document.getElementById('ping-notes').value;

    const saved = saveContactToVault({
      name,
      phone,
      email,
      company,
      tag: 'Ping Back',
      notes,
      metAt: 'Two-Way Ping Back'
    });

    if (showToast) showToast(`Received ${name}'s contact into My Connections!`);
    closeModal();
    if (onSavedToVault) onSavedToVault(saved);
  });
}
