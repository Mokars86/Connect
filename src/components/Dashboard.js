import { renderHeader } from './Header.js';
import { renderQRCode } from '../utils/qrEngine.js';
import { isAutoScheduleEnabled } from '../utils/storage.js';

export function renderDashboard(container, { 
  activeProfile, 
  onOpenCustomize, 
  onOpenWidgets, 
  onOpenScan, 
  onOpenWallpaper, 
  onOpenConnections, 
  onOpenUtilityQR, 
  onOpenBurner, 
  onOpenExportKit, 
  onOpenAnalytics, 
  onOpenDrawer, 
  onOpenSettings, 
  onOpenProfileSelector, 
  onOpenSubscription,
  isPro = false,
  showToast 
}) {
  const nameUpper = (activeProfile.name || 'JANE DOE').toUpperCase();
  const phoneText = activeProfile.phone || '+1 555-0101';
  const profileType = activeProfile.type || 'Personal';
  const autoScheduleOn = isAutoScheduleEnabled();

  container.innerHTML = `
    <div class="screen-view dashboard-screen">
      <!-- Header Bar -->
      <div id="dashboard-header-slot"></div>

      <!-- Auto Schedule Indicator Banner -->
      ${autoScheduleOn ? `
        <div style="background: rgba(0, 201, 167, 0.12); border: 1px solid var(--primary-teal); border-radius: var(--radius-pill); padding: 4px 12px; font-size: 11px; font-weight: 800; color: var(--primary-teal); text-align: center; margin-bottom: 6px;">
          ⏰ AUTO-SCHEDULE ACTIVE: ${profileType.toUpperCase()} CARD (9 AM - 5 PM)
        </div>
      ` : ''}

      <!-- Top Sharing Info Pill -->
      <div class="sharing-info-pill" id="pill-sharing-info" title="Tap to copy or switch profile">
        <div class="sharing-label">
          SHARING <span class="sharing-badge">${profileType}</span>
          ${activeProfile.qrMode && activeProfile.qrMode !== 'vcard' ? `<span class="sharing-badge" style="background: #25D366; color: #FFF;">${activeProfile.qrMode.toUpperCase()} DIRECT</span>` : ''}
        </div>
        <div class="sharing-details">
          <span>${nameUpper}</span>
          <span style="opacity: 0.5;">|</span>
          <span>${phoneText}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left: 2px;">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </div>
      </div>

      <!-- Hero QR Code Container (~40% Screen Height) -->
      <div class="hero-qr-container">
        <div class="qr-card-frame" id="hero-qr-target" title="High-contrast QR code">
          <div class="qr-corner-accent corner-tl"></div>
          <div class="qr-corner-accent corner-tr"></div>
          <div class="qr-corner-accent corner-bl"></div>
          <div class="qr-corner-accent corner-br"></div>
        </div>
      </div>

      <!-- Bottom Action Buttons Stack -->
      <div class="dashboard-actions-stack">
        <button id="btn-dashboard-wallpaper" class="btn-primary" style="background: linear-gradient(135deg, #0077B6 0%, #00B4D8 100%);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          LOCK SCREEN WALLPAPER MODE
        </button>
      </div>
    </div>
  `;

  // Render Header Navbar
  const headerSlot = document.getElementById('dashboard-header-slot');
  if (headerSlot) {
    renderHeader(headerSlot, { onOpenDrawer, onOpenSettings, onOpenSubscription, isPro, activeProfile });
  }

  // Render SVG QR Code into target frame
  const qrTarget = document.getElementById('hero-qr-target');
  renderQRCode(qrTarget, activeProfile);

  // Attach Event Handlers
  document.getElementById('btn-dashboard-wallpaper')?.addEventListener('click', onOpenWallpaper);

  // Sharing pill click copies details & opens selector
  document.getElementById('pill-sharing-info')?.addEventListener('click', () => {
    navigator.clipboard?.writeText?.(`${activeProfile.name}: ${activeProfile.phone}`);
    showToast(`Copied ${activeProfile.name}'s contact info to clipboard!`);
    setTimeout(onOpenProfileSelector, 600);
  });
}
