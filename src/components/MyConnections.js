import { getLogoSVG } from './Logo.js';
import { loadSavedContacts, deleteContactFromVault, saveContactToVault } from '../utils/storage.js';
import { getWhatsAppLink, getTelegramLink, downloadVCardFile } from '../utils/vcard.js';

export function renderMyConnections(container, { onBack, onScanQR, showToast }) {
  let contacts = loadSavedContacts();
  let currentFilterTag = 'All';
  let searchQuery = '';

  const renderContent = () => {
    let filtered = contacts.filter(c => {
      const matchTag = currentFilterTag === 'All' || c.tag === currentFilterTag;
      const q = searchQuery.toLowerCase();
      const matchQuery = !q || (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.company || '').toLowerCase().includes(q);
      return matchTag && matchQuery;
    });

    const tags = ['All', 'Networking', 'Event', 'Clients', 'Friends', 'VIP'];

    container.innerHTML = `
      <div class="screen-view connections-screen">
        <!-- Header -->
        <div class="connections-header">
          <button id="btn-connections-back" class="btn-icon" aria-label="Back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>

          <div style="font-family: var(--font-heading); font-weight: 800; font-size: 18px;">
            My Connections (${contacts.length})
          </div>

          <button id="btn-vault-scan" class="btn-icon" style="color: var(--primary-teal);" title="Scan New QR">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
              <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
              <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
              <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
              <rect x="7" y="7" width="10" height="10" rx="1"/>
            </svg>
          </button>
        </div>

        <!-- Search & Filter Bar -->
        <div class="search-filter-box">
          <div class="search-input-group">
            <svg class="search-icon-inside" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" id="vault-search-input" value="${searchQuery}" placeholder="Search name, phone, or company..." />
          </div>

          <div class="tag-filter-carousel">
            ${tags.map(t => `
              <div class="tag-chip ${t === currentFilterTag ? 'active' : ''}" data-tag="${t}">
                ${t}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Contacts Vault List -->
        <div class="contacts-vault-list">
          ${filtered.length === 0 ? `
            <div class="empty-vault-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              <div><strong>No Connections Found</strong></div>
              <p style="font-size: 13px;">Scan another user's QR code to save their profile here!</p>
              <button id="btn-empty-scan" class="btn-primary" style="margin-top: 10px; width: auto; padding: 10px 20px;">
                SCAN QR CODE NOW
              </button>
            </div>
          ` : filtered.map(c => {
            const initial = (c.name || 'C').charAt(0).toUpperCase();
            const waLink = getWhatsAppLink(c.phone);
            const tgLink = getTelegramLink(c.phone);
            const callLink = c.phone ? `tel:${c.phone}` : '#';
            const smsLink = c.phone ? `sms:${c.phone}` : '#';

            return `
              <div class="contact-vault-card" data-id="${c.id}">
                <div class="contact-card-main">
                  <div class="contact-avatar">${initial}</div>
                  <div class="contact-info">
                    <div class="contact-name-row">
                      <span class="contact-name-text">${c.name}</span>
                      <span class="contact-tag-badge">${c.tag || 'Contact'}</span>
                    </div>
                    <div class="contact-phone-sub">${c.phone || 'No phone'} ${c.company ? `• ${c.company}` : ''}</div>
                  </div>
                </div>

                ${c.notes ? `<div class="contact-notes-box">📝 ${c.notes}</div>` : ''}

                <!-- Quick Action Row -->
                <div class="contact-actions-row">
                  <a href="${waLink}" target="_blank" class="vault-action-btn" style="background: #25D366;" title="WhatsApp">
                    <svg width="18" height="18" viewBox="0 0 32 32" fill="#FFF">
                      <path d="M16 0C7.163 0 0 7.163 0 16c0 2.825.738 5.476 2.032 7.773L.057 32l8.432-1.928A15.918 15.918 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0z"/>
                    </svg>
                  </a>

                  <a href="${tgLink}" target="_blank" class="vault-action-btn" style="background: #229ED9;" title="Telegram">
                    <svg width="18" height="18" viewBox="0 0 32 32" fill="#FFF">
                      <circle cx="16" cy="16" r="16"/>
                    </svg>
                  </a>

                  <a href="${callLink}" class="vault-action-btn" style="background: #00C9A7;" title="Call">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </a>

                  <a href="${smsLink}" class="vault-action-btn" style="background: #7209B7;" title="SMS">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </a>

                  <button class="vault-action-btn btn-export-vcf" data-id="${c.id}" style="background: #0077B6;" title="Export .vcf">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                    </svg>
                  </button>

                  <button class="vault-action-btn btn-delete-contact" data-id="${c.id}" style="background: #E63946; margin-left: auto;" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Event Handlers
    document.getElementById('btn-connections-back')?.addEventListener('click', onBack);
    document.getElementById('btn-vault-scan')?.addEventListener('click', onScanQR);
    document.getElementById('btn-empty-scan')?.addEventListener('click', onScanQR);

    // Search input
    const searchInput = document.getElementById('vault-search-input');
    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderContent();
    });

    // Tag Filter chips
    const tagChips = document.querySelectorAll('.tag-chip');
    tagChips.forEach(chip => {
      chip.addEventListener('click', () => {
        currentFilterTag = chip.getAttribute('data-tag');
        renderContent();
      });
    });

    // Export .vcf handler
    document.querySelectorAll('.btn-export-vcf').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const c = contacts.find(item => item.id === id);
        if (c) {
          downloadVCardFile(c);
          showToast(`Exported ${c.name}.vcf file`);
        }
      });
    });

    // Delete handler
    document.querySelectorAll('.btn-delete-contact').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteContactFromVault(id);
        contacts = loadSavedContacts();
        showToast('Deleted contact from vault');
        renderContent();
      });
    });
  };

  renderContent();
}
