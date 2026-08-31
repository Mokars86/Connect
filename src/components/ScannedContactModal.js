import { getWhatsAppLink, getTelegramLink, downloadVCardFile } from '../utils/vcard.js';
import { saveContactToVault, logAnalyticsEvent } from '../utils/storage.js';

export function renderScannedContactModal(container, { contact, onClose, onOpenConnections, showToast }) {
  const name = contact.name || 'Scanned Contact';
  const phone = contact.phone || '';
  const email = contact.email || '';
  const initial = name.charAt(0).toUpperCase();

  const waLink = getWhatsAppLink(phone);
  const tgLink = getTelegramLink(phone);
  const callLink = phone ? `tel:${phone}` : '#';
  const smsLink = phone ? `sms:${phone}` : '#';

  container.innerHTML = `
    <div class="modal-overlay active" id="scanned-modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title">Scanned Contact</div>
          <button id="btn-close-scanned-modal" class="btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="scanned-contact-card">
          <div class="scanned-avatar-badge">${initial}</div>
          <div>
            <div class="scanned-contact-name">${name}</div>
            <div class="scanned-contact-phone">${phone || 'No phone number'}</div>
            ${contact.company ? `<div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">${contact.title ? `${contact.title} at ` : ''}${contact.company}</div>` : ''}
          </div>

          <!-- Direct Messaging & Actions Pop Grid with Official Logos -->
          <div class="pop-messaging-grid">
            <a href="${waLink}" target="_blank" id="btn-scanned-wa" class="pop-messaging-btn btn-whatsapp" title="Open in WhatsApp">
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                <path d="M16 0C7.163 0 0 7.163 0 16c0 2.825.738 5.476 2.032 7.773L.057 32l8.432-1.928A15.918 15.918 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0z" fill="#25D366"/>
                <path d="M23.5 19.3c-.4-.2-2.3-1.1-2.6-1.2-.3-.1-.6-.2-.8.2-.2.3-.9 1.2-1.1 1.4-.2.2-.4.3-.8.1-2.3-1.1-3.8-2-5.3-4.6-.2-.3 0-.5.2-.7l.5-.6c.2-.2.3-.4.4-.6.1-.2 0-.4 0-.6s-.8-2-1.1-2.7c-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.8.1-1.2.5s-1.6 1.5-1.6 3.7 1.6 4.3 1.8 4.6c.2.3 3.2 4.9 7.7 6.8 3.7 1.6 4.5 1.3 5.3 1.2 1-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.1-.3-.2-.7-.4z" fill="#FFFFFF"/>
              </svg>
              <span>WhatsApp</span>
            </a>

            <a href="${tgLink}" target="_blank" id="btn-scanned-tg" class="pop-messaging-btn btn-telegram" title="Open in Telegram">
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="16" fill="#229ED9"/>
                <path d="M7.6 15.6l15.1-5.8c.7-.3 1.3.2 1.1.9l-2.6 12.1c-.2.9-.7 1.1-1.4.7l-4-2.9-1.9 1.8c-.2.2-.4.4-.8.4l.3-4.1 7.4-6.7c.3-.3-.1-.5-.5-.2l-9.2 5.8-4-1.2c-.9-.3-.9-.9.2-1.3z" fill="#FFFFFF"/>
              </svg>
              <span>Telegram</span>
            </a>

            <a href="${callLink}" class="pop-messaging-btn btn-call">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Call</span>
            </a>

            <a href="${smsLink}" class="pop-messaging-btn btn-sms">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>SMS</span>
            </a>
          </div>

          <!-- Save Options Stack -->
          <button id="btn-save-to-vault" class="btn-primary" style="margin-top: 6px; background: linear-gradient(135deg, #00C9A7, #0077B6);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            SAVE TO MY CONNECTIONS VAULT
          </button>

          <button id="btn-save-scanned-vcard" class="btn-secondary-outlined" style="margin-top: 6px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            DOWNLOAD .VCF CONTACT FILE
          </button>
        </div>
      </div>
    </div>
  `;

  const overlay = document.getElementById('scanned-modal-overlay');
  const closeModal = () => {
    overlay?.classList.remove('active');
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 300);
    if (onClose) onClose();
  };

  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.getElementById('btn-close-scanned-modal')?.addEventListener('click', closeModal);

  // Click Loggers
  document.getElementById('btn-scanned-wa')?.addEventListener('click', () => {
    logAnalyticsEvent('whatsapp', 'scanned');
  });

  document.getElementById('btn-scanned-tg')?.addEventListener('click', () => {
    logAnalyticsEvent('telegram', 'scanned');
  });

  // Save to Vault Handler
  document.getElementById('btn-save-to-vault')?.addEventListener('click', () => {
    saveContactToVault(contact);
    if (showToast) showToast(`Saved ${name} to My Connections!`);
    closeModal();
    if (onOpenConnections) onOpenConnections();
  });

  document.getElementById('btn-save-scanned-vcard')?.addEventListener('click', () => {
    downloadVCardFile(contact);
    logAnalyticsEvent('share', 'vcard_export');
  });
}
