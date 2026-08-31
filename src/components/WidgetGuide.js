export function renderWidgetGuideModal(container, { onClose }) {
  container.innerHTML = `
    <div class="modal-overlay" id="widget-modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title">Quick Add Widget Tutorial</div>
          <button id="btn-close-widget-modal" class="btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="widget-guide-content">
          <p style="margin-bottom: 16px; font-size: 14px; color: var(--text-secondary);">
            Display your Connect QR code directly on your phone's Lock Screen or Home Screen for 1-tap instant sharing.
          </p>

          <div class="widget-step-card">
            <div class="step-num">1</div>
            <div>
              <strong style="display: block; font-size: 14px;">Add to Home Screen (PWA)</strong>
              <span style="font-size: 13px; color: var(--text-secondary);">
                Tap your browser menu (Share or 3 dots) and select <strong>"Add to Home Screen"</strong> to install Connect as a native app icon.
              </span>
            </div>
          </div>

          <div class="widget-step-card">
            <div class="step-num">2</div>
            <div>
              <strong style="display: block; font-size: 14px;">iOS Lock Screen Widget Setup</strong>
              <span style="font-size: 13px; color: var(--text-secondary);">
                Press & hold Lock Screen > Tap <strong>Customize</strong> > Tap <strong>Add Widgets</strong> > Select <strong>Shortcuts / Connect</strong> app to pin QR code for instant display.
              </span>
            </div>
          </div>

          <div class="widget-step-card">
            <div class="step-num">3</div>
            <div>
              <strong style="display: block; font-size: 14px;">Android Home Screen Stack</strong>
              <span style="font-size: 13px; color: var(--text-secondary);">
                Long-press Home Screen > Select <strong>Widgets</strong> > Drag <strong>Connect Web App Shortcut</strong> to your main screen.
              </span>
            </div>
          </div>

          <button id="btn-install-pwa" class="btn-primary" style="margin-top: 14px;">
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

  document.getElementById('btn-install-pwa')?.addEventListener('click', () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then(() => {
        window.deferredPrompt = null;
      });
    } else {
      alert('To install on your phone, tap your browser menu and select "Add to Home Screen"!');
    }
  });

  return { openModal, closeModal };
}
