import { getLogoSVG } from './Logo.js';

export function renderHeader(container, { onOpenDrawer, onOpenSubscription, isPro = false }) {
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

      <button id="btn-header-pro" class="btn-header-pro ${isPro ? 'pro-active' : ''}" style="
        background: ${isPro ? 'linear-gradient(135deg, #09A5DB 0%, #00C9A7 100%)' : 'linear-gradient(135deg, #FFB703 0%, #FF8800 100%)'};
        color: ${isPro ? '#FFFFFF' : '#1A1A1A'};
        border: none;
        border-radius: 20px;
        padding: 5px 12px;
        font-family: var(--font-heading);
        font-weight: 800;
        font-size: 11px;
        letter-spacing: 0.5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 2px 8px ${isPro ? 'rgba(9,165,219,0.3)' : 'rgba(255,183,3,0.4)'};
        transition: transform 0.2s ease;
      ">
        <span>${isPro ? '👑' : '⚡'}</span>
        <span>${isPro ? 'PRO' : 'Upgrade'}</span>
      </button>
    </header>
  `;

  document.getElementById('btn-open-menu')?.addEventListener('click', onOpenDrawer);
  document.getElementById('btn-header-logo')?.addEventListener('click', onOpenDrawer);
  document.getElementById('btn-header-pro')?.addEventListener('click', () => {
    if (onOpenSubscription) onOpenSubscription();
  });
}
