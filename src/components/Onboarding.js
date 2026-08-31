import { getLogoSVG } from './Logo.js';
import { getCountryOptionsHTML } from '../utils/countryCodes.js';

export function renderOnboarding(container, options = {}) {
  const callback = options.onGenerateQR || options.onComplete;

  container.innerHTML = `
    <div class="screen-view onboarding-screen">
      <div class="onboarding-header">
        <div class="onboarding-logo-wrapper">
          ${getLogoSVG(96)}
        </div>
      </div>

      <div class="onboarding-hero-card">
        <div class="shield-icon-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <rect x="9" y="11" width="6" height="5" rx="1" fill="currentColor"/>
            <path d="M10 11V9a2 2 0 0 1 4 0v2"/>
          </svg>
        </div>
        <div class="offline-badge-text">100% OFFLINE & PRIVATE</div>
      </div>

      <form id="onboarding-form" class="onboarding-form" novalidate>
        <div class="floating-label-group">
          <input type="text" id="onboard-name" placeholder=" " autocomplete="name" />
          <label for="onboard-name">FULL NAME (OPTIONAL)</label>
        </div>

        <div class="phone-input-combo">
          <select id="onboard-country" class="country-select" title="Country Code">
            ${getCountryOptionsHTML('+233')}
          </select>

          <div class="floating-label-group" style="flex: 1; margin-bottom: 0;">
            <input type="tel" id="onboard-phone" placeholder=" " autocomplete="tel" required />
            <label for="onboard-phone">PHONE NUMBER</label>
          </div>
        </div>

        <div id="onboard-error" class="onboard-error-msg" style="display: none; color: #E63946; font-size: 13px; font-weight: 600; text-align: center; margin-top: 4px;"></div>

        <div class="onboarding-footer" style="margin-top: 18px;">
          <button type="submit" class="btn-primary" id="btn-generate-qr">
            GENERATE MY QR CODE
          </button>
        </div>
      </form>
    </div>
  `;

  const form = document.getElementById('onboarding-form');
  const errorEl = document.getElementById('onboard-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (errorEl) errorEl.style.display = 'none';

    const nameInput = document.getElementById('onboard-name').value.trim();
    const country = document.getElementById('onboard-country').value;
    const phoneInput = document.getElementById('onboard-phone').value.trim();

    if (!phoneInput) {
      if (errorEl) {
        errorEl.textContent = '⚠️ Please enter your phone number to generate your QR code.';
        errorEl.style.display = 'block';
      }
      return;
    }

    const finalName = nameInput || 'My Contact Card';
    const fullPhone = phoneInput.startsWith('+') ? phoneInput : `${country} ${phoneInput}`;

    if (typeof callback === 'function') {
      callback({ name: finalName, phone: fullPhone });
    }
  });
}
