import { getWhatsAppLink, getTelegramLink, getSocialLink, downloadVCardFile } from '../utils/vcard.js';
import { saveContactToVault, logAnalyticsEvent } from '../utils/storage.js';

export function renderScannedContactModal(container, { contact, onClose, onOpenConnections, showToast }) {
  const name = contact.name || 'Scanned Contact';
  const phone = contact.phone || '';
  const email = contact.email || '';
  const website = contact.website || '';
  const initial = name.charAt(0).toUpperCase();

  // Helper to retrieve platform SVGs
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'whatsapp':
        return `<svg width="24" height="24" viewBox="0 0 32 32" fill="none"><path d="M16 0C7.163 0 0 7.163 0 16c0 2.825.738 5.476 2.032 7.773L.057 32l8.432-1.928A15.918 15.918 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0z" fill="#25D366"/><path d="M23.5 19.3c-.4-.2-2.3-1.1-2.6-1.2-.3-.1-.6-.2-.8.2-.2.3-.9 1.2-1.1 1.4-.2.2-.4.3-.8.1-2.3-1.1-3.8-2-5.3-4.6-.2-.3 0-.5.2-.7l.5-.6c.2-.2.3-.4.4-.6.1-.2 0-.4 0-.6s-.8-2-1.1-2.7c-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.8.1-1.2.5s-1.6 1.5-1.6 3.7 1.6 4.3 1.8 4.6c.2.3 3.2 4.9 7.7 6.8 3.7 1.6 4.5 1.3 5.3 1.2 1-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.1-.3-.2-.7-.4z" fill="#FFFFFF"/></svg>`;
      case 'instagram':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;
      case 'linkedin':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`;
      case 'x':
      case 'twitter':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
      case 'tiktok':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.86c0 1.25-.26 2.53-.87 3.63-.7 1.27-1.84 2.28-3.18 2.82-1.4.56-2.97.6-4.4.15-1.4-.44-2.61-1.39-3.37-2.62-1.02-1.65-1.12-3.8-.26-5.54.83-1.67 2.47-2.84 4.31-3.08.31-.04.62-.05.93-.04v4.08c-.46-.03-.94.07-1.35.29-.42.23-.74.62-.91 1.07-.22.61-.13 1.34.25 1.87.38.54.98.88 1.64.93.63.05 1.28-.15 1.74-.58.46-.44.71-1.07.72-1.7V.02z"/></svg>`;
      case 'telegram':
        return `<svg width="22" height="22" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#229ED9"/><path d="M7.6 15.6l15.1-5.8c.7-.3 1.3.2 1.1.9l-2.6 12.1c-.2.9-.7 1.1-1.4.7l-4-2.9-1.9 1.8c-.2.2-.4.4-.8.4l.3-4.1 7.4-6.7c.3-.3-.1-.5-.5-.2l-9.2 5.8-4-1.2c-.9-.3-.9-.9.2-1.3z" fill="#FFFFFF"/></svg>`;
      case 'facebook':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`;
      case 'youtube':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>`;
      case 'github':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`;
      case 'snapchat':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.002 2c-3.79 0-5.877 2.783-5.877 5.316 0 1.25.447 2.502.447 2.502s-.513.19-.747.234c-.454.084-.87.218-.87.671 0 .61.782.909 1.34 1.042.06.014.116.027.168.04-.038.354-.253 1.272-.94 1.838-.544.449-1.254.582-1.745.674-.325.061-.539.297-.539.58 0 .548.81.996 1.808 1.218.423.094.887.142 1.366.166.453.691 1.296 1.206 2.651 1.488.528.11 1.096.17 1.688.17.625 0 1.22-.064 1.77-.181 1.332-.284 2.162-.8 2.607-1.488.487-.024.958-.073 1.388-.168.998-.222 1.808-.67 1.808-1.218 0-.283-.214-.519-.539-.58-.491-.092-1.2-.225-1.745-.674-.687-.566-.902-1.484-.94-1.838.052-.013.108-.026.168-.04.558-.133 1.34-.432 1.34-1.042 0-.453-.416-.587-.87-.671-.234-.044-.747-.234-.747-.234s.447-1.252.447-2.502C17.879 4.783 15.792 2 12.002 2z"/></svg>`;
      case 'call':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
      case 'sms':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
      case 'email':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
      default:
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
    }
  };

  // Build list of all action channels
  const actions = [];

  // WhatsApp
  if (phone || contact.whatsapp) {
    actions.push({
      id: 'whatsapp',
      label: 'WhatsApp',
      link: getWhatsAppLink(phone || contact.whatsapp),
      className: 'btn-whatsapp'
    });
  }

  // Instagram
  if (contact.instagram) {
    actions.push({
      id: 'instagram',
      label: 'Instagram',
      link: getSocialLink('instagram', contact.instagram),
      className: 'btn-instagram'
    });
  }

  // LinkedIn
  if (contact.linkedin) {
    actions.push({
      id: 'linkedin',
      label: 'LinkedIn',
      link: getSocialLink('linkedin', contact.linkedin),
      className: 'btn-linkedin'
    });
  }

  // X / Twitter
  if (contact.twitter) {
    actions.push({
      id: 'x',
      label: '𝕏 (Twitter)',
      link: getSocialLink('x', contact.twitter),
      className: 'btn-x'
    });
  }

  // TikTok
  if (contact.tiktok) {
    actions.push({
      id: 'tiktok',
      label: 'TikTok',
      link: getSocialLink('tiktok', contact.tiktok),
      className: 'btn-tiktok'
    });
  }

  // Telegram
  if (contact.telegram || (phone && !actions.some(a => a.id === 'telegram'))) {
    actions.push({
      id: 'telegram',
      label: 'Telegram',
      link: getSocialLink('telegram', contact.telegram || phone),
      className: 'btn-telegram'
    });
  }

  // Facebook
  if (contact.facebook) {
    actions.push({
      id: 'facebook',
      label: 'Facebook',
      link: getSocialLink('facebook', contact.facebook),
      className: 'btn-facebook'
    });
  }

  // YouTube
  if (contact.youtube) {
    actions.push({
      id: 'youtube',
      label: 'YouTube',
      link: getSocialLink('youtube', contact.youtube),
      className: 'btn-youtube'
    });
  }

  // GitHub
  if (contact.github) {
    actions.push({
      id: 'github',
      label: 'GitHub',
      link: getSocialLink('github', contact.github),
      className: 'btn-github'
    });
  }

  // Snapchat
  if (contact.snapchat) {
    actions.push({
      id: 'snapchat',
      label: 'Snapchat',
      link: getSocialLink('snapchat', contact.snapchat),
      className: 'btn-snapchat'
    });
  }

  // Additional parsed socials
  if (Array.isArray(contact.socials)) {
    contact.socials.forEach(s => {
      const p = (s.platform || '').toLowerCase();
      if (!actions.some(a => a.id === p)) {
        actions.push({
          id: p,
          label: p.charAt(0).toUpperCase() + p.slice(1),
          link: getSocialLink(p, s.handle || s.url),
          className: `btn-${p}`
        });
      }
    });
  }

  // Call & SMS
  if (phone) {
    actions.push({
      id: 'call',
      label: 'Call Phone',
      link: `tel:${phone}`,
      className: 'btn-call'
    });
    actions.push({
      id: 'sms',
      label: 'Send SMS',
      link: `sms:${phone}`,
      className: 'btn-sms'
    });
  }

  // Email
  if (email) {
    actions.push({
      id: 'email',
      label: 'Send Email',
      link: `mailto:${email}`,
      className: 'btn-email'
    });
  }

  // Website
  if (website && !actions.some(a => a.link === website)) {
    actions.push({
      id: 'website',
      label: 'Website',
      link: website.startsWith('http') ? website : `https://${website}`,
      className: 'btn-website'
    });
  }

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
            <div class="scanned-contact-phone">${phone || email || 'Connected Profile'}</div>
            ${contact.company ? `<div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">${contact.title ? `${contact.title} at ` : ''}${contact.company}</div>` : ''}
          </div>

          <!-- Direct Messaging & Actions Pop Grid with Official Logos -->
          <div class="pop-messaging-grid">
            ${actions.map((act, idx) => `
              <a 
                href="${act.link}" 
                target="_blank" 
                class="pop-messaging-btn ${act.className}" 
                style="animation-delay: ${(0.05 + idx * 0.05).toFixed(2)}s;"
                title="Open ${act.label}"
                data-action="${act.id}">
                ${getPlatformIcon(act.id)}
                <span>${act.label}</span>
              </a>
            `).join('')}
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
  document.querySelectorAll('.pop-messaging-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const actId = btn.getAttribute('data-action');
      if (actId) logAnalyticsEvent(actId, 'scanned');
    });
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
