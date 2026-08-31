import { renderQRCode } from '../utils/qrEngine.js';
import { getWallpaperTheme, setWallpaperTheme } from '../utils/storage.js';

export function renderLockScreenWallpaperModal(container, { activeProfile, onClose }) {
  const profileName = (activeProfile.name || 'JANE DOE').toUpperCase();
  const profilePhone = activeProfile.phone || '+1 555-0101';
  let activeTheme = getWallpaperTheme();

  const themes = [
    { id: 'mint', label: 'Minty Fresh', color: '#00C9A7', bg: 'linear-gradient(135deg, #EBF7F5, #00C9A7)' },
    { id: 'cyber', label: 'Cyber Midnight', color: '#00E5BF', bg: 'linear-gradient(135deg, #0B192C, #00E5BF)' },
    { id: 'sunset', label: 'Sunset Horizon', color: '#FF512F', bg: 'linear-gradient(135deg, #FF512F, #DD2476)' },
    { id: 'emerald', label: 'Emerald Luxury', color: '#10B981', bg: 'linear-gradient(135deg, #022C22, #10B981)' },
    { id: 'violet', label: 'Electric Violet', color: '#7209B7', bg: 'linear-gradient(135deg, #3A0CA3, #4CC9F0)' },
    { id: 'minimal', label: 'Slate Minimal', color: '#0F172A', bg: 'linear-gradient(135deg, #F8FAFC, #334155)' }
  ];

  const updateClockAndDate = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    const optionsDate = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', optionsDate);

    const clockEl = document.getElementById('wallpaper-clock-text');
    const dateEl = document.getElementById('wallpaper-date-text');

    if (clockEl) clockEl.textContent = `${hours}:${minutes}`;
    if (dateEl) dateEl.textContent = dateStr;
  };

  container.innerHTML = `
    <div class="wallpaper-overlay wptheme-${activeTheme}" id="wallpaper-modal-overlay">
      <!-- Lock Screen Status Header -->
      <div class="wallpaper-status-bar">
        <div class="wallpaper-lock-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div class="wallpaper-clock" id="wallpaper-clock-text">09:41</div>
        <div class="wallpaper-date" id="wallpaper-date-text">Wednesday, August 16</div>
      </div>

      <!-- Center Hero Lock Screen QR Card -->
      <div class="wallpaper-qr-hero">
        <div class="wallpaper-qr-card" id="wallpaper-qr-target">
          <div class="qr-corner-accent corner-tl"></div>
          <div class="qr-corner-accent corner-tr"></div>
          <div class="qr-corner-accent corner-bl"></div>
          <div class="qr-corner-accent corner-br"></div>
        </div>

        <div class="wallpaper-profile-badge">
          <span>${profileName}</span>
          <span style="opacity: 0.5;">|</span>
          <span>${profilePhone}</span>
        </div>
      </div>

      <!-- Wallpaper Theme Selection Swatches -->
      <div class="wallpaper-selector-bar">
        <div class="wptheme-label">SELECT WALLPAPER THEME</div>
        <div class="wptheme-carousel">
          ${themes.map(t => `
            <div 
              class="wptheme-chip ${t.id === activeTheme ? 'active' : ''}" 
              style="background: ${t.bg};" 
              data-wptheme="${t.id}"
              title="${t.label}">
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Action Bar -->
      <div class="wallpaper-actions-bar">
        <button id="btn-export-wallpaper-png" class="btn-download-wallpaper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          DOWNLOAD LOCK SCREEN WALLPAPER
        </button>

        <button id="btn-close-wallpaper-view" class="btn-close-wallpaper">
          EXIT WALLPAPER MODE
        </button>
      </div>
    </div>
  `;

  // Start live clock timer
  updateClockAndDate();
  const clockInterval = setInterval(updateClockAndDate, 10000);

  // Render High-Contrast QR Code with embedded CONNECT Logo emblem
  const qrTarget = document.getElementById('wallpaper-qr-target');
  renderQRCode(qrTarget, activeProfile, { showLogo: true });

  const overlay = document.getElementById('wallpaper-modal-overlay');

  // Handle Theme Switching
  const chips = document.querySelectorAll('.wptheme-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const newTheme = chip.getAttribute('data-wptheme');
      overlay.className = `wallpaper-overlay wptheme-${newTheme}`;
      activeTheme = newTheme;
      setWallpaperTheme(newTheme);
    });
  });

  const closeModal = () => {
    clearInterval(clockInterval);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (onClose) onClose();
  };

  document.getElementById('btn-close-wallpaper-view')?.addEventListener('click', closeModal);

  // Download Lock Screen Wallpaper Image (.PNG Theme Exporter)
  document.getElementById('btn-export-wallpaper-png')?.addEventListener('click', async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      // Theme Gradient Specs
      const themeGradients = {
        mint: ['#EBF7F5', '#F4FBF9', '#E3F4F0', '#0F2537', '#00B4D8'],
        cyber: ['#0B192C', '#0F2A4A', '#07101E', '#FFFFFF', '#00E5BF'],
        sunset: ['#2A0845', '#6441A5', '#FF512F', '#FFFFFF', '#FF512F'],
        emerald: ['#022C22', '#064E3B', '#047857', '#F0FDF4', '#10B981'],
        violet: ['#10002B', '#3A0CA3', '#7209B7', '#FFFFFF', '#4CC9F0'],
        minimal: ['#F8FAFC', '#E2E8F0', '#CBD5E1', '#0F172A', '#0F172A']
      };

      const [c1, c2, c3, textColor, borderColor] = themeGradients[activeTheme] || themeGradients.mint;

      // Draw Theme Background
      const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
      gradient.addColorStop(0, c1);
      gradient.addColorStop(0.5, c2);
      gradient.addColorStop(1, c3);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1920);

      // Draw Time & Date Header
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.font = 'bold 120px Outfit, sans-serif';
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      ctx.fillText(timeStr, 540, 320);

      ctx.font = '700 36px Outfit, sans-serif';
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.8;
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      ctx.fillText(dateStr, 540, 390);
      ctx.globalAlpha = 1.0;

      // Draw White QR Card Box
      const cardX = 190;
      const cardY = 540;
      const cardSize = 700;
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 40;
      ctx.roundRect(cardX, cardY, cardSize, cardSize, 60);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 10;
      ctx.stroke();

      // Convert SVG QR to Image & Draw onto Canvas
      const svgEl = qrTarget.querySelector('svg');
      if (svgEl) {
        const xml = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        
        img.onload = () => {
          ctx.drawImage(img, cardX + 50, cardY + 50, cardSize - 100, cardSize - 100);
          URL.revokeObjectURL(url);

          // Draw Profile Pill Card
          ctx.fillStyle = activeTheme === 'mint' || activeTheme === 'minimal' ? '#FFFFFF' : 'rgba(15, 37, 55, 0.7)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 4;
          ctx.roundRect(190, 1330, 700, 100, 50);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = activeTheme === 'mint' || activeTheme === 'minimal' ? '#0F2537' : '#FFFFFF';
          ctx.font = 'bold 36px Outfit, sans-serif';
          ctx.fillText(`${profileName} | ${profilePhone}`, 540, 1395);

          ctx.font = '800 28px Outfit, sans-serif';
          ctx.fillStyle = borderColor;
          ctx.fillText('SCAN WITH CAMERA TO CONNECT', 540, 1540);

          // Download PNG
          const link = document.createElement('a');
          link.download = `connect_${activeTheme}_wallpaper.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        };
        img.src = url;
      }
    } catch (err) {
      console.error('Wallpaper export error:', err);
    }
  });
}
