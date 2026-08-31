import { getLogoSVG } from './Logo.js';

export function renderHeader(container, { onOpenDrawer, activeProfile }) {
  container.innerHTML = `
    <header class="app-header">
      <button id="btn-open-menu" class="btn-icon" aria-label="Open Navigation Menu" title="Menu">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div class="app-logo-badge" id="btn-header-logo">
        ${getLogoSVG(36)}
        <span class="brand-title">CONNECT</span>
      </div>

      <!-- Balanced Right Spacer for centered logo -->
      <div style="width: 38px; height: 38px; pointer-events: none;" aria-hidden="true"></div>
    </header>
  `;

  document.getElementById('btn-open-menu')?.addEventListener('click', onOpenDrawer);
  document.getElementById('btn-header-logo')?.addEventListener('click', onOpenDrawer);
}
