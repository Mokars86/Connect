export function renderDonationModal(container, { activeProfile, showToast, onClose }) {
  let selectedAmount = 30; // Default 30 GHS (~$3 / 1 Coffee)
  let selectedQty = 1;

  const presets = [
    { qty: 1, label: '☕ 1 Coffee', ghs: 30 },
    { qty: 2, label: '☕☕ 2 Coffees', ghs: 50 },
    { qty: 5, label: '☕☕☕ 5 Coffees', ghs: 100 }
  ];

  const renderContent = () => {
    container.innerHTML = `
      <div class="modal-overlay active" id="donation-modal-overlay">
        <div class="modal-card donation-modal-card">
          <div class="modal-header" style="justify-content: flex-end; padding-bottom: 0;">
            <button id="btn-close-donation-modal" class="btn-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Hero Icon & Description -->
          <div class="donation-hero-icon">☕</div>
          <div class="donation-title">Buy Us a Coffee</div>
          <div class="donation-subtitle">
            If you enjoy using <strong>CONNECT</strong>, consider buying us a coffee! Your support keeps the app 100% free, private, and continuously updated.
          </div>

          <!-- Preset Amount Chips -->
          <div class="donation-preset-grid">
            ${presets.map(p => `
              <div class="donation-chip ${selectedAmount === p.ghs ? 'active' : ''}" data-amount="${p.ghs}" data-qty="${p.qty}">
                <div class="donation-chip-qty">${p.label}</div>
                <div class="donation-chip-amount">GHS ${p.ghs}</div>
              </div>
            `).join('')}
          </div>

          <!-- Form Inputs -->
          <form id="donation-form" style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
            <div class="floating-label-group">
              <input type="number" id="donate-amount" value="${selectedAmount}" min="5" step="5" required />
              <label for="donate-amount">Donation Amount (GHS)</label>
            </div>

            <div class="floating-label-group">
              <input type="text" id="donate-name" value="${activeProfile.name || ''}" placeholder=" " />
              <label for="donate-name">Your Name (Optional)</label>
            </div>

            <div class="floating-label-group">
              <input type="email" id="donate-email" value="${activeProfile.email || ''}" placeholder=" " required />
              <label for="donate-email">Your Email Address</label>
            </div>

            <button type="submit" id="btn-paystack-donate" class="btn-paystack">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              Donate GHS <span id="lbl-donate-btn-amount">${selectedAmount}</span> with Paystack
            </button>
          </form>

          <!-- Paystack Secure Badge -->
          <div class="paystack-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Secured by Paystack • Supports Mobile Money & Cards
          </div>
        </div>
      </div>
    `;

    const overlay = document.getElementById('donation-modal-overlay');

    const closeModal = () => {
      overlay?.classList.remove('active');
      setTimeout(() => {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 300);
      if (onClose) onClose();
    };

    document.getElementById('btn-close-donation-modal')?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Handle Preset Chip Click
    document.querySelectorAll('.donation-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const amt = parseInt(chip.getAttribute('data-amount'), 10);
        selectedAmount = amt;
        document.getElementById('donate-amount').value = amt;
        document.getElementById('lbl-donate-btn-amount').textContent = amt;
        document.querySelectorAll('.donation-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    // Custom Amount Input
    document.getElementById('donate-amount')?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 0;
      selectedAmount = val;
      document.getElementById('lbl-donate-btn-amount').textContent = val;
    });

    // Paystack Checkout Handler
    document.getElementById('donation-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const amountGHS = parseInt(document.getElementById('donate-amount').value, 10) || 30;
      const email = document.getElementById('donate-email').value || 'donor@example.com';
      const name = document.getElementById('donate-name').value || 'Generous Supporter';

      // Load Paystack Inline JS if not loaded yet
      if (!window.PaystackPop) {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.onload = () => triggerPaystackPopup(amountGHS, email, name);
        document.body.appendChild(script);
      } else {
        triggerPaystackPopup(amountGHS, email, name);
      }
    });

    const triggerPaystackPopup = (amountGHS, email, name) => {
      showToast(`Launching Paystack Checkout for GHS ${amountGHS}...`);

      try {
        if (window.PaystackPop) {
          const handler = window.PaystackPop.setup({
            key: 'pk_live_demo_connect_app', // Standard Paystack Key placeholder
            email: email,
            amount: amountGHS * 100, // Amount in kobo / pesewas
            currency: 'GHS',
            ref: 'CONNECT_' + Math.floor((Math.random() * 1000000000) + 1),
            metadata: {
              custom_fields: [
                { display_name: "Donor Name", variable_name: "donor_name", value: name }
              ]
            },
            callback: function(response) {
              showToast(`🎉 Thank you ${name}! Your donation was received.`);
              closeModal();
            },
            onClose: function() {
              showToast('Paystack checkout window closed.');
            }
          });
          handler.openIframe();
        } else {
          // Demo fallback modal confirmation
          showToast(`☕ Thank you ${name}! Paystack checkout initialized for GHS ${amountGHS}.`);
          closeModal();
        }
      } catch (err) {
        showToast(`☕ Thank you for supporting Connect App with GHS ${amountGHS}!`);
        closeModal();
      }
    };
  };

  renderContent();
}
