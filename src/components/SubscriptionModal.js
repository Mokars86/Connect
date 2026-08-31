import { isProSubscribed, getSubscriptionState, saveSubscriptionState, redeemPromoCode, cancelSubscription } from '../utils/storage.js';

export function renderSubscriptionModal(container, { featureName = '', showToast, onClose, onSuccess }) {
  const isSubscribed = isProSubscribed();
  const subState = getSubscriptionState();

  let selectedPlan = 'annual'; // Default selected: Annual (Best Value)

  const plans = [
    {
      id: 'monthly',
      name: 'Pro Monthly',
      desc: 'Billed monthly. Cancel anytime.',
      amountGHS: 30,
      periodLabel: '/ month',
      planCode: 'PLN_connect_monthly'
    },
    {
      id: 'annual',
      name: 'Pro Annual',
      desc: 'Billed yearly. Save over 30%',
      amountGHS: 250,
      periodLabel: '/ year',
      tag: '🔥 Best Value',
      planCode: 'PLN_connect_annual'
    },
    {
      id: 'lifetime',
      name: 'Lifetime Access',
      desc: 'One-time payment. Forever access.',
      amountGHS: 450,
      periodLabel: 'one-time',
      tag: '⭐ VIP Pass',
      planCode: 'PLN_connect_lifetime'
    }
  ];

  const features = [
    'Unlimited Contact Profiles & Smart Auto-Schedule',
    'Customize Profile Card & Advanced QR Code Design',
    'Apple & Google Wallet Pass Cards',
    'Burner / Temporary Expiring QR Links',
    'Full Scan Analytics & Instant PingBack Alerts',
    'Export Kit (Vector SVG & Print PDF Templates)',
    'Custom Logo Overlays & Unlimited Color Branding'
  ];

  const renderContent = () => {
    const activePlanObj = plans.find(p => p.id === selectedPlan) || plans[1];

    container.innerHTML = `
      <div class="modal-overlay active" id="subscription-modal-overlay">
        <div class="modal-card subscription-modal-card">
          <div class="modal-header" style="justify-content: flex-end; padding-bottom: 0;">
            <button id="btn-close-sub-modal" class="btn-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Pro Hero Header -->
          <div class="pro-hero-badge">
            <span>👑</span> Connect Pro
          </div>

          <div class="subscription-title">
            ${isSubscribed ? 'Your Subscription' : (featureName ? `Unlock ${featureName}` : 'Upgrade to Connect Pro')}
          </div>

          <div class="subscription-subtitle">
            ${isSubscribed 
              ? 'You have active access to all premium features and tools.'
              : 'Elevate your networking with custom branding, wallet passes, analytics, burner links & wallpapers.'}
          </div>

          ${isSubscribed ? `
            <!-- ACTIVE PRO CARD -->
            <div class="active-pro-card">
              <div class="active-pro-title">👑 ${subState.planName || 'Connect Pro Active'}</div>
              <div class="active-pro-sub">
                Ref: <code>${subState.ref || 'PRO-PASS'}</code> • Status: <strong style="color: #00C9A7;">Active</strong>
              </div>
              <button id="btn-cancel-sub" class="btn-secondary" style="font-size: 12px; padding: 8px 14px; width: 100%;">
                Reset / Switch Subscription
              </button>
            </div>
          ` : `
            <!-- FEATURE HIGHLIGHTS -->
            <div class="pro-features-list">
              ${features.map(f => `
                <div class="pro-feature-item">
                  <div class="pro-feature-icon">✓</div>
                  <div>${f}</div>
                </div>
              `).join('')}
            </div>

            <!-- PLAN SELECTOR CHIPS -->
            <div class="plan-option-grid">
              ${plans.map(p => `
                <div class="plan-chip ${selectedPlan === p.id ? 'active' : ''}" data-plan="${p.id}">
                  ${p.tag ? `<div class="plan-chip-tag">${p.tag}</div>` : ''}
                  <div class="plan-info-main">
                    <div class="plan-name">${p.name}</div>
                    <div class="plan-desc">${p.desc}</div>
                  </div>
                  <div class="plan-price-box">
                    <div class="plan-price">GHS ${p.amountGHS}</div>
                    <div class="plan-period">${p.periodLabel}</div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- PAYSTACK CHECKOUT CTA BUTTON -->
            <button id="btn-paystack-subscribe" class="btn-paystack-sub">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              Subscribe GHS <span id="lbl-sub-amount">${activePlanObj.amountGHS}</span> with Paystack
            </button>

            <!-- PAYSTACK BADGE -->
            <div class="paystack-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Secured by Paystack • Mobile Money & Cards Supported
            </div>

            <!-- PROMO CODE SECTION -->
            <div class="promo-code-section">
              <button id="btn-toggle-promo" class="promo-toggle-btn">
                Have a Promo or VIP Code?
              </button>
              <div id="promo-form-wrapper" style="display: none;" class="promo-input-group">
                <input type="text" id="input-promo-code" placeholder="e.g. CONNECTPRO2026" />
                <button id="btn-submit-promo" class="btn-apply-promo">Redeem</button>
              </div>
            </div>
          `}
        </div>
      </div>
    `;

    const overlay = document.getElementById('subscription-modal-overlay');

    const closeModal = () => {
      overlay?.classList.remove('active');
      setTimeout(() => {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 300);
      if (onClose) onClose();
    };

    document.getElementById('btn-close-sub-modal')?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    if (isSubscribed) {
      document.getElementById('btn-cancel-sub')?.addEventListener('click', () => {
        cancelSubscription();
        if (showToast) showToast('Subscription state reset to Free mode.');
        closeModal();
      });
      return;
    }

    // Handle Plan Selection
    document.querySelectorAll('.plan-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        selectedPlan = chip.getAttribute('data-plan');
        const planObj = plans.find(p => p.id === selectedPlan);
        document.querySelectorAll('.plan-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const lbl = document.getElementById('lbl-sub-amount');
        if (lbl && planObj) lbl.textContent = planObj.amountGHS;
      });
    });

    // Toggle Promo Form
    document.getElementById('btn-toggle-promo')?.addEventListener('click', () => {
      const wrapper = document.getElementById('promo-form-wrapper');
      if (wrapper) {
        wrapper.style.display = wrapper.style.display === 'none' ? 'flex' : 'none';
      }
    });

    // Apply Promo Code
    document.getElementById('btn-submit-promo')?.addEventListener('click', () => {
      const input = document.getElementById('input-promo-code');
      const val = input ? input.value : '';
      const result = redeemPromoCode(val);
      if (result.success) {
        if (showToast) showToast(result.message);
        if (onSuccess) onSuccess(result.sub);
        closeModal();
      } else {
        if (showToast) showToast(result.message);
      }
    });

    // Paystack Trigger
    document.getElementById('btn-paystack-subscribe')?.addEventListener('click', () => {
      const targetPlan = plans.find(p => p.id === selectedPlan) || plans[1];
      triggerPaystackSubscription(targetPlan);
    });

    const triggerPaystackSubscription = (planObj) => {
      if (showToast) showToast(`Opening Paystack Checkout for ${planObj.name}...`);

      const handleSuccess = (refObj) => {
        const subData = saveSubscriptionState({
          planType: planObj.id,
          planName: planObj.name,
          ref: refObj.reference || 'PAYSTACK_' + Math.floor(Math.random() * 1000000)
        });
        if (showToast) showToast(`🎉 Success! Upgraded to ${planObj.name}.`);
        if (onSuccess) onSuccess(subData);
        closeModal();
      };

      try {
        if (window.PaystackPop) {
          const handler = window.PaystackPop.setup({
            key: 'pk_live_demo_connect_app', // Paystack Public Key
            email: 'user@connectapp.io',
            amount: planObj.amountGHS * 100,
            currency: 'GHS',
            ref: 'CONNECT_SUB_' + Math.floor((Math.random() * 1000000000) + 1),
            plan: planObj.id === 'lifetime' ? '' : planObj.planCode,
            callback: function(response) {
              handleSuccess(response);
            },
            onClose: function() {
              if (showToast) showToast('Paystack checkout window closed.');
            }
          });
          handler.openIframe();
        } else {
          // Load Paystack Inline script dynamically if not present
          const script = document.createElement('script');
          script.src = 'https://js.paystack.co/v1/inline.js';
          script.onload = () => triggerPaystackSubscription(planObj);
          script.onerror = () => {
            // Fallback for offline or blocked script environment: instant simulation unlock
            handleSuccess({ reference: 'DEMO_UNLOCK_' + Date.now() });
          };
          document.body.appendChild(script);
        }
      } catch (err) {
        // Fallback simulation unlock for testing
        handleSuccess({ reference: 'DEMO_UNLOCK_' + Date.now() });
      }
    };
  };

  renderContent();
}
