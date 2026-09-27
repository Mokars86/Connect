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

        <div style="display: flex; flex-direction: column; gap: 14px; align-items: center;">
          <!-- Camera Scanner Viewport -->
          <div class="scanner-viewport-frame" id="scanner-frame">
            <div id="reader"></div>
            <!-- Laser Scan Line & Viewfinder Corners Overlay -->
            <div class="scanner-laser-beam"></div>
            <div class="scanner-corner-bracket sc-tl"></div>
            <div class="scanner-corner-bracket sc-tr"></div>
            <div class="scanner-corner-bracket sc-bl"></div>
            <div class="scanner-corner-bracket sc-br"></div>
            <div class="scanner-status-indicator" id="scanner-status-text">Starting camera...</div>
          </div>

          <!-- Camera Controls / Status -->
          <div id="scanner-error-container" style="display: none; width: 100%; text-align: center;">
            <p id="scanner-error-msg" style="font-size: 12.5px; color: #E63946; margin-bottom: 8px; font-weight: 600;"></p>
            <button id="btn-retry-camera" class="btn-secondary-outlined" style="padding: 7px 14px; font-size: 12px; margin: 0 auto;">
              🔄 Retry Camera Access
            </button>
          </div>

          <p style="font-size: 13px; color: var(--text-secondary); text-align: center; margin: 0;">
            Point your camera at another user's Connect QR code or select a saved image.
          </p>

          <!-- File Upload Option -->
          <div style="width: 100%;">
            <label class="btn-secondary-outlined" style="cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
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
  let isScanning = true;

  const stopScanner = async () => {
    if (html5QrcodeScanner) {
      try {
        if (html5QrcodeScanner.isScanning) {
          await html5QrcodeScanner.stop();
        }
        await html5QrcodeScanner.clear();
      } catch (e) {
        // ignore stop errors
      }
      html5QrcodeScanner = null;
    }
  };

  const closeModal = async () => {
    isScanning = false;
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
    if (!isScanning) return;
    isScanning = false;

    // Haptic feedback if available
    if (navigator.vibrate) {
      try { navigator.vibrate(60); } catch (e) {}
    }

    await stopScanner();
    const contact = parseVCardText(decodedText);
    if (contact) {
      onScanned(contact);
      closeModal();
    }
  };

  // Start Camera Scanner
  const startCamera = async () => {
    const statusText = document.getElementById('scanner-status-text');
    const errContainer = document.getElementById('scanner-error-container');
    const errMsg = document.getElementById('scanner-error-msg');
    if (errContainer) errContainer.style.display = 'none';
    if (statusText) {
      statusText.style.display = 'block';
      statusText.textContent = 'Connecting camera...';
    }

    try {
      if (html5QrcodeScanner) {
        await stopScanner();
      }

      // Use jsQR engine directly (useBarCodeDetectorIfSupported: false avoids WebView stub issues)
      html5QrcodeScanner = new Html5Qrcode('reader', {
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: false
        },
        verbose: false
      });

      // Unconstrained full-frame scanning for 100% instant detection
      const config = {
        fps: 20,
        aspectRatio: 1.0,
        disableFlip: false
      };

      // 1. Try back / environment camera
      try {
        await html5QrcodeScanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => handleScannedResult(decodedText),
          () => {}
        );
        if (statusText) statusText.style.display = 'none';
        return;
      } catch (envErr) {
        console.warn('FacingMode environment start failed, checking device cameras...', envErr);
      }

      // 2. Fallback to enumerated cameras
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        // Find rear camera or use last camera
        const backCam = devices.find(d => /back|rear|environment|camera2 0|facing back/i.test(d.label)) || devices[devices.length - 1];
        await html5QrcodeScanner.start(
          backCam.id,
          config,
          (decodedText) => handleScannedResult(decodedText),
          () => {}
        );
        if (statusText) statusText.style.display = 'none';
      } else {
        throw new Error('No camera found on this device');
      }
    } catch (err) {
      console.error('Camera scanner start error:', err);
      if (statusText) statusText.style.display = 'none';
      if (errContainer && errMsg) {
        errContainer.style.display = 'block';
        errMsg.textContent = err.name === 'NotAllowedError' 
          ? 'Camera permission was denied. Please grant camera permission or select a QR image below.'
          : 'Unable to access camera feed. You can select a photo from your gallery below.';
      }
    }
  };

  document.getElementById('btn-retry-camera')?.addEventListener('click', () => {
    startCamera();
  });

  // Initialize camera after DOM settles
  setTimeout(() => {
    startCamera();
  }, 200);

  // File Upload QR Reader
  document.getElementById('qr-file-input')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileScanner = new Html5Qrcode('reader', {
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: false
        }
      });
      const decodedText = await fileScanner.scanFile(file, true);
      handleScannedResult(decodedText);
    } catch (err) {
      alert('Could not detect a valid QR code in this image. Please ensure the QR code is clearly visible and try again.');
    }
  });
}
