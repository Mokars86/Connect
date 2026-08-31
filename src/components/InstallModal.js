export function renderInstallModal(container, options = {}) {
  let modalOverlay = document.getElementById('install-modal-overlay');

  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'install-modal-overlay';
    modalOverlay.className = 'modal-overlay';
    container.appendChild(modalOverlay);
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  function updateContent() {
    if (isStandalone) {
      modalOverlay.innerHTML = `
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">App Already Installed</h3>
            <button class="icon-btn close-modal-btn" aria-label="Close">✕</button>
          </div>
          <div style="text-align: center; padding: 20px 10px;">
            <div style="width: 64px; height: 64px; background: rgba(0, 201, 167, 0.15); color: #00C9A7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 28px;">
              ✓
            </div>
            <h4 style="font-family: var(--font-heading); color: var(--text-primary); font-size: 16px; margin-bottom: 8px;">You're using CONNECT App!</h4>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">CONNECT is running in native app mode on your device.</p>
          </div>
          <button class="btn btn-primary btn-block close-modal-btn" style="margin-top: 16px;">Got It</button>
        </div>
      `;
    } else if (isIOS) {
      modalOverlay.innerHTML = `
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">Install CONNECT on iOS</h3>
            <button class="icon-btn close-modal-btn" aria-label="Close">✕</button>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Install CONNECT on your iPhone or iPad for instant offline access and full-screen experience.
          </p>

          <div class="widget-step-card">
            <div class="step-num">1</div>
            <div>
              <strong style="color: var(--text-primary); font-size: 13.5px; display: block; margin-bottom: 2px;">
                Tap the Share Button
              </strong>
              <span style="font-size: 12px; color: var(--text-muted);">
                Tap the Share icon <span style="font-size: 15px; color: var(--primary-teal);">⎋</span> or <span style="font-size: 15px; color: var(--primary-teal);">[↑]</span> in your Safari toolbar at the bottom.
              </span>
            </div>
          </div>

          <div class="widget-step-card">
            <div class="step-num">2</div>
            <div>
              <strong style="color: var(--text-primary); font-size: 13.5px; display: block; margin-bottom: 2px;">
                Select "Add to Home Screen"
              </strong>
              <span style="font-size: 12px; color: var(--text-muted);">
                Scroll down the action menu and tap <strong style="color: var(--text-primary);">Add to Home Screen ➕</strong>.
              </span>
            </div>
          </div>

          <div class="widget-step-card">
            <div class="step-num">3</div>
            <div>
              <strong style="color: var(--text-primary); font-size: 13.5px; display: block; margin-bottom: 2px;">
                Tap "Add"
              </strong>
              <span style="font-size: 12px; color: var(--text-muted);">
                Confirm by tapping <strong style="color: var(--primary-teal);">Add</strong> in the top-right corner.
              </span>
            </div>
          </div>

          <button class="btn btn-primary btn-block close-modal-btn" style="margin-top: 16px;">Done</button>
        </div>
      `;
    } else {
      // Android / Desktop Chrome / Edge
      modalOverlay.innerHTML = `
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">Install CONNECT App</h3>
            <button class="icon-btn close-modal-btn" aria-label="Close">✕</button>
          </div>
          <div style="text-align: center; padding: 16px 10px;">
            <img src="/logo.png" alt="CONNECT Logo" style="width: 72px; height: 72px; border-radius: 18px; margin-bottom: 14px; box-shadow: 0 8px 24px rgba(0, 201, 167, 0.25);" />
            <h4 style="font-family: var(--font-heading); color: var(--text-primary); font-size: 16px; margin-bottom: 6px;">Install CONNECT App</h4>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 20px;">
              Add CONNECT to your device home screen for instant offline QR contact sharing & zero load times.
            </p>
            <button id="trigger-pwa-install-btn" class="btn btn-primary btn-block" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span>📲</span> <span>Install Application</span>
            </button>
          </div>
        </div>
      `;
    }

    modalOverlay.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', closeModal);
    });

    const triggerInstallBtn = modalOverlay.querySelector('#trigger-pwa-install-btn');
    if (triggerInstallBtn) {
      triggerInstallBtn.addEventListener('click', async () => {
        if (window.deferredPrompt) {
          window.deferredPrompt.prompt();
          const { outcome } = await window.deferredPrompt.userChoice;
          if (options.showToast) {
            options.showToast(outcome === 'accepted' ? 'Thank you for installing CONNECT!' : 'Installation cancelled');
          }
          window.deferredPrompt = null;
          closeModal();
        } else {
          if (options.showToast) {
            options.showToast('Tap browser menu (⋮) -> Add to Home Screen / Install App');
          }
          closeModal();
        }
      });
    }
  }

  function openModal() {
    updateContent();
    modalOverlay.classList.add('active');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  return { openModal, closeModal };
}
