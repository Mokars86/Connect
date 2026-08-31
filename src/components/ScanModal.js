import { Html5Qrcode } from 'html5-qrcode';
import { parseVCardText } from '../utils/vcard.js';

export function renderScanModal(container, { onScanned, onClose }) {
  container.innerHTML = `
    <div class="modal-overlay active" id="scan-modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title">Scan Contact QR Code</div>
          <button id="btn-close-scan-modal" class="btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px; align-items: center;">
          <!-- Camera Scanner Viewport -->
          <div class="scanner-viewport-frame">
            <div id="reader"></div>
          </div>

          <p style="font-size: 13px; color: var(--text-secondary); text-align: center;">
            Point your camera at another user's Connect QR code or upload an image file.
          </p>

          <!-- File Upload Option -->
          <div style="width: 100%;">
            <label class="btn-secondary-outlined" style="cursor: pointer;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              SELECT QR CODE IMAGE FILE
              <input type="file" id="qr-file-input" accept="image/*" style="display: none;" />
            </label>
          </div>
        </div>
      </div>
    </div>
  `;

  const overlay = document.getElementById('scan-modal-overlay');
  let html5QrcodeScanner = null;

  const stopScanner = async () => {
    if (html5QrcodeScanner) {
      try {
        await html5QrcodeScanner.stop();
      } catch (e) {
        // ignore stop errors
      }
    }
  };

  const closeModal = async () => {
    await stopScanner();
    overlay?.classList.remove('active');
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 300);
    if (onClose) onClose();
  };

  document.getElementById('btn-close-scan-modal')?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Handle Scanned Result
  const handleScannedResult = async (decodedText) => {
    await stopScanner();
    const contact = parseVCardText(decodedText);
    if (contact) {
      onScanned(contact);
      closeModal();
    }
  };

  // Start Camera Scanner
  setTimeout(() => {
    try {
      html5QrcodeScanner = new Html5Qrcode('reader');
      html5QrcodeScanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => handleScannedResult(decodedText),
        () => {}
      ).catch(err => {
        console.warn('Camera access error or unsupported:', err);
      });
    } catch (e) {
      console.warn('HTML5 Scanner initialization:', e);
    }
  }, 100);

  // File Upload QR Reader
  document.getElementById('qr-file-input')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const qrScanner = new Html5Qrcode('reader');
      const decodedText = await qrScanner.scanFile(file, true);
      handleScannedResult(decodedText);
    } catch (err) {
      alert('Could not detect a valid QR code in that image. Try another photo!');
    }
  });
}
