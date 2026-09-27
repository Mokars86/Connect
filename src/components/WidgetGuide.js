export function renderWidgetGuideModal(container, { onClose }) {
  container.innerHTML = `
    <div class="modal-overlay" id="widget-modal-overlay">
      <div class="modal-card widget-modal-card" style="max-width: 440px; text-align: left; box-sizing: border-box;">
        <div class="modal-header" style="margin-bottom: 10px;">
          <div class="modal-title" style="font-size: 16px;">Widgets & App Shortcuts</div>
          <button id="btn-close-widget-modal" class="btn-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="widget-guide-content">
          <!-- Overview Box -->
          <div style="background: rgba(9, 165, 219, 0.08); border: 1px solid rgba(9, 165, 219, 0.25); border-radius: 12px; padding: 10px 12px; margin-bottom: 10px;">
            <strong style="color: var(--text-primary); font-size: 12.5px; display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
              <span>⚡</span> What do Widgets & Shortcuts do?
            </strong>
            <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.4; margin: 0;">
              Widgets and App Shortcuts give you <strong>1-tap instant access</strong> from your phone's Home Screen or Lock Screen without opening app menus.
            </p>
          </div>

          <!-- Feature Breakdown Cards -->
          <div class="widget-step-card">
            <div class="step-num">1</div>
            <div>
              <strong style="display: block; font-size: 12.5px; color: var(--text-primary);">
                App Icon Long-Press Menu (Android & iOS)
              </strong>
              <span style="font-size: 11px; color: var(--text-secondary); line-height: 1.35;">
                Press and hold the installed Connect app icon on your home screen to reveal shortcuts: <em>Scan QR</em>, <em>Wallpaper</em>, and <em>Wallet Pass</em>.
              </span>
            </div>
          </div>

          <div class="widget-step-card">
            <div class="step-num">2</div>
            <div>
              <strong style="display: block; font-size: 12.5px; color: var(--text-primary);">
                Lock Screen Poster & Standby Mode
              </strong>
              <span style="font-size: 11px; color: var(--text-secondary); line-height: 1.35;">
                Set your Connect QR code as your phone's Lock Screen Wallpaper. People can scan your details directly off your lock screen.
              </span>
            </div>
          </div>

          <div class="widget-step-card">
            <div class="step-num">3</div>
            <div>
              <strong style="display: block; font-size: 12.5px; color: var(--text-primary);">
                Apple & Google Wallet Pass
              </strong>
              <span style="font-size: 11px; color: var(--text-secondary); line-height: 1.35;">
                Save your contact card into Apple Wallet or Google Wallet for double-tap side button access.
              </span>
            </div>
          </div>

          <!-- Shortcut Test Buttons -->
          <div style="margin-top: 10px; border-top: 1px dashed var(--border-input, #EEE); padding-top: 10px;">
            <div style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; margin-bottom: 6px;">
              TEST APP SHORTCUTS LIVE
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <button id="btn-test-shortcut-scan" class="btn-secondary-outlined" style="font-size: 11.5px; padding: 7px 8px;">
                📷 Scan QR
              </button>
              <button id="btn-test-shortcut-wallpaper" class="btn-secondary-outlined" style="font-size: 11.5px; padding: 7px 8px;">
                📱 Wallpaper
              </button>
              <button id="btn-test-shortcut-wallet" class="btn-secondary-outlined" style="font-size: 11.5px; padding: 7px 8px;">
                💳 Wallet Pass
              </button>
              <button id="btn-test-shortcut-burner" class="btn-secondary-outlined" style="font-size: 11.5px; padding: 7px 8px;">
                🔥 Burner QR
              </button>
            </div>
          </div>

          <button id="btn-install-pwa" class="btn-primary" style="margin-top: 10px; width: 100%; padding: 11px; font-size: 13px;">
            INSTALL TO HOME SCREEN
          </button>
        </div>
      </div>
    </div>
  `;

  const overlay = document.getElementById('widget-modal-overlay');

  const openModal = () => overlay?.classList.add('active');
  const closeModal = () => {
    overlay?.classList.remove('active');
    if (onClose) onClose();
  };

  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.getElementById('btn-close-widget-modal')?.addEventListener('click', closeModal);

  document.getElementById('btn-test-shortcut-scan')?.addEventListener('click', () => {
    closeModal();
    window.connectApp?.openScanModal?.();
  });

  document.getElementById('btn-test-shortcut-wallpaper')?.addEventListener('click', () => {
    closeModal();
    window.connectApp?.openWallpaperModal?.();
  });

  document.getElementById('btn-test-shortcut-wallet')?.addEventListener('click', () => {
    closeModal();
    window.connectApp?.openWalletPassModal?.();
  });

  document.getElementById('btn-test-shortcut-burner')?.addEventListener('click', () => {
    closeModal();
    window.connectApp?.openBurnerModal?.();
  });

  document.getElementById('btn-install-pwa')?.addEventListener('click', () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then(() => {
        window.deferredPrompt = null;
      });
    } else {
      window.connectApp?.openInstallModal?.();
    }
  });

  return { openModal, closeModal };
}
