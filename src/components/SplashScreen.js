import { getLogoSVG } from './Logo.js';

export function renderSplashScreen(parentContainer = document.body) {
  // Remove existing splash overlay if present
  const existing = document.getElementById('splash-screen-overlay');
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }

  const splashEl = document.createElement('div');
  splashEl.id = 'splash-screen-overlay';
  splashEl.className = 'splash-screen';
  
  splashEl.innerHTML = `
    <div class="splash-bg-orb splash-orb-top"></div>
    <div class="splash-bg-orb splash-orb-bottom"></div>

    <div class="splash-content">
      <div class="splash-logo-container">
        <div class="splash-ripple-ring ring-1"></div>
        <div class="splash-ripple-ring ring-2"></div>
        <div class="splash-emblem-glass">
          <div class="splash-logo-svg">
            ${getLogoSVG(86)}
          </div>
        </div>
      </div>

      <div class="splash-text-group">
        <div class="splash-title">CONNECT</div>
        <div class="splash-subtitle-pill">
          <span class="splash-subtitle-dot"></span>
          INSTANT QR CONTACT SHARING
        </div>
      </div>
    </div>

    <div class="splash-footer">
      <div class="splash-loader-progress">
        <div class="splash-loader-bar"></div>
      </div>

      <div class="splash-brand-badge">
        <img src="/mokars_logo.png" alt="Mokars Tech" class="splash-brand-img" />
        <span class="splash-brand-text">Developed by Mokars Tech</span>
      </div>

      <div class="splash-security-tag">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        100% OFFLINE & PRIVATE
      </div>
    </div>
  `;

  parentContainer.appendChild(splashEl);

  return {
    hide: (delayMs = 1800) => {
      setTimeout(() => {
        splashEl.classList.add('fade-out');
        setTimeout(() => {
          if (splashEl.parentNode) {
            splashEl.parentNode.removeChild(splashEl);
          }
        }, 600);
      }, delayMs);
    }
  };
}
