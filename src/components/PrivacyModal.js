export function renderPrivacyModal(container, { onClose }) {
  container.innerHTML = `
    <div class="modal-overlay active" id="privacy-modal-overlay">
      <div class="modal-card" style="max-height: 85vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">🔒</span>
            <div class="modal-title">Privacy Policy</div>
          </div>
          <button id="btn-close-privacy-modal" class="btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style="overflow-y: auto; padding-right: 4px; font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; text-align: left;">
          <div style="background: rgba(0, 201, 167, 0.1); border: 1px solid var(--primary-teal); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 14px;">
            <strong style="color: var(--primary-teal); display: block; margin-bottom: 2px;">🛡️ 100% Privacy & Local-First Guarantee</strong>
            Connect is built to protect your identity. All cards, social media links, and scanned contacts are stored 100% on your device. We never sell or share your personal data.
          </div>

          <h4 style="color: var(--text-primary); margin: 12px 0 4px 0; font-size: 14px;">1. Information We Collect</h4>
          <p style="margin-bottom: 10px;">
            Only the data you choose to provide: Full Name, Phone Number, Job Title, Company, Email, Social Media Handles (Instagram, TikTok, LinkedIn, 𝕏, etc.), and custom logo photos.
          </p>

          <h4 style="color: var(--text-primary); margin: 12px 0 4px 0; font-size: 14px;">2. Device Permissions</h4>
          <p style="margin-bottom: 6px;">
            <strong>📷 Camera:</strong> Used solely in real-time to scan QR codes. Video streams are never recorded or transmitted.
          </p>
          <p style="margin-bottom: 6px;">
            <strong>📁 Storage/Media:</strong> Used only when you select a profile picture or save contact cards and wallpaper PNGs.
          </p>
          <p style="margin-bottom: 10px;">
            <strong>🌐 Internet:</strong> Used only for opening social links and optional user-authenticated cloud backup.
          </p>

          <h4 style="color: var(--text-primary); margin: 12px 0 4px 0; font-size: 14px;">3. Data Deletion & Control</h4>
          <p style="margin-bottom: 10px;">
            You have full ownership of your data. You can delete individual contacts or perform a complete wipe via <em>"Reset App Data"</em> at any time.
          </p>

          <h4 style="color: var(--text-primary); margin: 12px 0 4px 0; font-size: 14px;">4. Developer Support</h4>
          <p style="margin-bottom: 14px;">
            Developed by Mokars Tech.<br />
            Email: <a href="mailto:support@mokarstech.com" style="color: var(--primary-teal); font-weight: 700;">support@mokarstech.com</a>
          </p>
        </div>

        <button id="btn-privacy-agree-close" class="btn-primary" style="margin-top: 14px;">
          I UNDERSTAND
        </button>
      </div>
    </div>
  `;

  const overlay = document.getElementById('privacy-modal-overlay');
  const closeModal = () => {
    overlay?.classList.remove('active');
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 300);
    if (onClose) onClose();
  };

  document.getElementById('btn-close-privacy-modal')?.addEventListener('click', closeModal);
  document.getElementById('btn-privacy-agree-close')?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
}
