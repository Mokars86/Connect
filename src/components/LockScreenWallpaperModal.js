import { renderQRCode, drawQRCodeToCanvas } from '../utils/qrEngine.js';
import { getWallpaperTheme, setWallpaperTheme } from '../utils/storage.js';
import { downloadOrShareImage } from '../utils/fileDownloader.js';

export function renderLockScreenWallpaperModal(container, { activeProfile, onClose }) {
  const profileName = (activeProfile.name || 'MY CONTACT CARD').toUpperCase();
  const profileTitle = (activeProfile.title || '').trim();
  const profileCompany = (activeProfile.company || '').trim();
  const profilePhone = activeProfile.phone || '';
  const profileEmail = activeProfile.email || '';
  let activeTheme = getWallpaperTheme();

  const subTitleText = profileTitle && profileCompany 
    ? `${profileTitle} • ${profileCompany}` 
    : (profileTitle || profileCompany || 'SCAN TO ADD CONTACT DIRECTLY');

  const themes = [
    { id: 'mint', label: 'Minty Fresh', color: '#00C9A7', bg: 'linear-gradient(135deg, #EBF7F5, #00C9A7)' },
    { id: 'onyx', label: 'Onyx Black', color: '#FFFFFF', bg: 'linear-gradient(135deg, #27272A, #000000)' },
    { id: 'brown', label: 'Classic Brown', color: '#D4A373', bg: 'linear-gradient(135deg, #5D4037, #2C1810)' },
    { id: 'pink', label: 'Blush Pink', color: '#FF4081', bg: 'linear-gradient(135deg, #FF80AB, #C2185B)' },
    { id: 'emerald', label: 'Emerald Luxury', color: '#10B981', bg: 'linear-gradient(135deg, #022C22, #10B981)' },
    { id: 'minimal', label: 'Slate Minimal', color: '#0F172A', bg: 'linear-gradient(135deg, #F8FAFC, #334155)' }
  ];

  if (!themes.some(t => t.id === activeTheme)) {
    activeTheme = 'mint';
    setWallpaperTheme('mint');
  }

  container.innerHTML = `
    <div class="wallpaper-overlay wptheme-${activeTheme}" id="wallpaper-modal-overlay">
      <!-- Lock Screen Modern Header (No fake clock/date) -->
      <div class="wallpaper-status-bar">
        <div class="wallpaper-header-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span>DIGITAL CONTACT PASS</span>
        </div>
        <div class="wallpaper-hero-title">${profileName}</div>
        <div class="wallpaper-hero-subtitle">${subTitleText}</div>
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
          <span>${profilePhone || profileEmail || 'SCAN TO SAVE CONTACT'}</span>
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
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (onClose) onClose();
  };

  document.getElementById('btn-close-wallpaper-view')?.addEventListener('click', closeModal);

  // Download Lock Screen Wallpaper Image (.PNG Theme Exporter without fake time/date)
  document.getElementById('btn-export-wallpaper-png')?.addEventListener('click', async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      // Helper function to draw rounded rectangle
      const drawRoundedRect = (c, x, y, w, h, r) => {
        c.beginPath();
        if (c.roundRect) {
          c.roundRect(x, y, w, h, r);
        } else {
          c.moveTo(x + r, y);
          c.lineTo(x + w - r, y);
          c.quadraticCurveTo(x + w, y, x + w, y + r);
          c.lineTo(x + w, y + h - r);
          c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          c.lineTo(x + r, y + h);
          c.quadraticCurveTo(x, y + h, x, y + h - r);
          c.lineTo(x, y + r);
          c.quadraticCurveTo(x, y, x + r, y);
          c.closePath();
        }
      };

      // Theme Gradient Specs [c1, c2, c3, textColor, accentColor, badgeBg, badgeTextColor]
      const themeGradients = {
        mint: ['#EBF7F5', '#F4FBF9', '#D5EFEA', '#0F2537', '#00C9A7', 'rgba(0, 201, 167, 0.18)', '#007A65'],
        onyx: ['#18181B', '#09090B', '#000000', '#FFFFFF', '#E2E8F0', 'rgba(255, 255, 255, 0.16)', '#FFFFFF'],
        brown: ['#3E2723', '#2B1704', '#1A0E03', '#F5EBE0', '#D4A373', 'rgba(212, 163, 115, 0.22)', '#E6CCB2'],
        pink: ['#4A0E2E', '#880E4F', '#C2185B', '#FFF0F5', '#FF80AB', 'rgba(255, 128, 171, 0.25)', '#FF80AB'],
        emerald: ['#022C22', '#064E3B', '#047857', '#F0FDF4', '#34D399', 'rgba(52, 211, 153, 0.22)', '#34D399'],
        minimal: ['#F8FAFC', '#E2E8F0', '#CBD5E1', '#0F172A', '#0F172A', 'rgba(15, 23, 42, 0.10)', '#0F172A']
      };

      const [c1, c2, c3, textColor, accentColor, badgeBg, badgeTextColor] = themeGradients[activeTheme] || themeGradients.mint;

      // 1. Draw Theme Gradient Background
      const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
      gradient.addColorStop(0, c1);
      gradient.addColorStop(0.5, c2);
      gradient.addColorStop(1, c3);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1920);

      // --- UPPER HEADER: Leave top 580px clear for native phone clock & lockscreen widgets ---
      
      // 2. Top "DIGITAL CONTACT PASS" Pill Badge
      const topBadgeW = 460;
      const topBadgeH = 62;
      const topBadgeX = (1080 - topBadgeW) / 2;
      const topBadgeY = 600;
      
      drawRoundedRect(ctx, topBadgeX, topBadgeY, topBadgeW, topBadgeH, 31);
      ctx.fillStyle = badgeBg;
      ctx.fill();
      ctx.strokeStyle = badgeTextColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = badgeTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '800 24px "Outfit", "Segoe UI", -apple-system, sans-serif';
      ctx.fillText('DIGITAL CONTACT PASS', 540, topBadgeY + (topBadgeH / 2) + 1);

      // 3. Profile Name
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'alphabetic';
      ctx.font = '900 48px "Outfit", "Segoe UI", -apple-system, sans-serif';
      ctx.fillText(profileName, 540, 715);

      // 4. Subtitle / Job Title / Company
      ctx.font = '700 24px "Outfit", "Segoe UI", -apple-system, sans-serif';
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.85;
      ctx.fillText(subTitleText, 540, 762);
      ctx.globalAlpha = 1.0;

      // --- CENTER QR CARD (Compact & Perfectly Balanced) ---
      const cardSize = 520;
      const cardX = (1080 - cardSize) / 2;
      const cardY = 815;

      // Card Drop Shadow & Card Body
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      ctx.shadowBlur = 36;
      ctx.shadowOffsetY = 14;
      drawRoundedRect(ctx, cardX, cardY, cardSize, cardSize, 44);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Card Accent Border
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 5;
      ctx.stroke();

      // Draw High-Resolution QR Code onto the card
      const qrPadding = 36;
      const qrSize = cardSize - qrPadding * 2;
      drawQRCodeToCanvas(ctx, activeProfile, cardX + qrPadding, cardY + qrPadding, qrSize, {
        color: activeProfile.color || '#00C9A7',
        showLogo: true
      });

      // --- BELOW CARD BADGES ---
      
      // Contact Info Pill
      const pillW = 660;
      const pillH = 78;
      const pillX = (1080 - pillW) / 2;
      const pillY = 1380;
      ctx.fillStyle = activeTheme === 'mint' || activeTheme === 'minimal' ? '#FFFFFF' : 'rgba(15, 37, 55, 0.88)';
      drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 39);
      ctx.fill();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = activeTheme === 'mint' || activeTheme === 'minimal' ? '#0F2537' : '#FFFFFF';
      ctx.font = 'bold 28px "Outfit", "Segoe UI", -apple-system, sans-serif';
      ctx.textBaseline = 'middle';
      const badgeText = profilePhone ? `${profileName} | ${profilePhone}` : (profileEmail || profileName);
      ctx.fillText(badgeText, 540, pillY + (pillH / 2) + 1);

      // Call to action
      ctx.textBaseline = 'alphabetic';
      ctx.font = '800 26px "Outfit", "Segoe UI", -apple-system, sans-serif';
      ctx.fillStyle = accentColor;
      ctx.fillText('POINT CAMERA TO SCAN & SAVE', 540, 1500);

      ctx.font = '700 20px "Outfit", "Segoe UI", -apple-system, sans-serif';
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.80;
      ctx.fillText('NO APP NEEDED • INSTANT VCARD SYNC', 540, 1542);
      ctx.globalAlpha = 1.0;

      // Bottom footer branding (leaving clearance for home/fingerprint gesture)
      ctx.font = '700 18px "Outfit", "Segoe UI", -apple-system, sans-serif';
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.45;
      ctx.fillText('CONNECT DIGITAL IDENTITY • TAP & SCAN', 540, 1720);
      ctx.globalAlpha = 1.0;

      // Universal Native Share / Download / Preview
      await downloadOrShareImage(canvas, `connect_${activeTheme}_wallpaper.png`, `${profileName} - Lock Screen Wallpaper`);
    } catch (err) {
      console.error('Wallpaper export error:', err);
    }
  });
}
