/**
 * Paystack Payment Integration Service
 * Supports Ghanaian Mobile Money (MTN MoMo, Telecel, AT) and Visa/Mastercard.
 */

export const PAYSTACK_CONFIG = {
  secretKey: import.meta.env.VITE_PAYSTACK_SECRET_KEY || '',
  currency: 'GHS'
};

/**
 * Initialize a Paystack transaction directly via Paystack API
 * @param {Object} params
 * @param {string} params.email - Customer email address
 * @param {number} params.amountGHS - Amount in GHS
 * @param {string} params.planName - Plan or item name
 * @param {Object} params.metadata - Custom metadata
 * @returns {Promise<{success: boolean, authorization_url?: string, access_code?: string, reference?: string, error?: string}>}
 */
export async function initializePaystackTransaction({ email, amountGHS, planName = 'Connect Pro', metadata = {} }) {
  try {
    const reference = 'CONNECT_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
    // Amount in sub-units (pesewas/kobo: GHS 1 = 100 pesewas)
    const amountInSubunits = Math.round(amountGHS * 100);

    const payload = {
      email: email || 'subscriber@connectapp.io',
      amount: amountInSubunits,
      currency: PAYSTACK_CONFIG.currency,
      reference,
      channels: ['card', 'mobile_money'],
      metadata: {
        custom_fields: [
          { display_name: 'Product', variable_name: 'product_name', value: planName },
          { display_name: 'Customer Email', variable_name: 'customer_email', value: email },
          ...(metadata.custom_fields || [])
        ],
        ...metadata
      }
    };

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status && result.data) {
      return {
        success: true,
        authorization_url: result.data.authorization_url,
        access_code: result.data.access_code,
        reference: result.data.reference || reference
      };
    } else {
      return {
        success: false,
        error: result.message || 'Failed to initialize Paystack transaction.'
      };
    }
  } catch (err) {
    console.error('Paystack initialization error:', err);
    return {
      success: false,
      error: err.message || 'Network error communicating with Paystack.'
    };
  }
}

/**
 * Verify a transaction reference with Paystack
 * @param {string} reference
 * @returns {Promise<{success: boolean, verified: boolean, data?: Object, error?: string}>}
 */
export async function verifyPaystackTransaction(reference) {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.status && result.data && result.data.status === 'success') {
      return {
        success: true,
        verified: true,
        data: result.data
      };
    } else {
      return {
        success: true,
        verified: false,
        status: result.data?.status || 'pending',
        data: result.data
      };
    }
  } catch (err) {
    console.error('Paystack verification error:', err);
    return {
      success: false,
      verified: false,
      error: err.message
    };
  }
}

/**
 * Open Paystack Checkout seamlessly
 * Handles both Paystack popup window & redirect fallback
 */
export async function startPaystackCheckout({
  email,
  amountGHS,
  planName,
  onSuccess,
  onCancel,
  showToast
}) {
  if (showToast) showToast(`🔒 Initializing Paystack payment for ${planName}...`);

  const initRes = await initializePaystackTransaction({ email, amountGHS, planName });

  if (!initRes.success || !initRes.authorization_url) {
    if (showToast) showToast(`⚠️ Paystack Notice: ${initRes.error || 'Check internet connection.'}`);
    return;
  }

  // Open Paystack Checkout in a dedicated secure popup window
  const width = 500;
  const height = 650;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  
  const checkoutWindow = window.open(
    initRes.authorization_url,
    'PaystackCheckout',
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=no,resizable=yes`
  );

  if (showToast) showToast('💳 Paystack checkout opened. Complete payment on the checkout screen.');

  // Polling verification to auto-detect payment completion
  let pollCount = 0;
  const maxPolls = 60; // 3 minutes maximum
  const pollInterval = setInterval(async () => {
    pollCount++;
    if (pollCount > maxPolls || (checkoutWindow && checkoutWindow.closed)) {
      clearInterval(pollInterval);
    }

    try {
      const verifyRes = await verifyPaystackTransaction(initRes.reference);
      if (verifyRes.verified) {
        clearInterval(pollInterval);
        if (checkoutWindow && !checkoutWindow.closed) {
          checkoutWindow.close();
        }
        if (onSuccess) {
          onSuccess({
            reference: initRes.reference,
            amount: amountGHS,
            email,
            planName,
            verified: true
          });
        }
      }
    } catch (e) {
      // silent poll catch
    }
  }, 3000);
}
