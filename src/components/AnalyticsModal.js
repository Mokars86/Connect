import { getAnalytics } from '../utils/storage.js';

export function renderAnalyticsModal(container, { onClose }) {
  const stats = getAnalytics();

  const totalShares = stats.totalShares || 1;
  const waCount = stats.whatsappClicks || 0;
  const tgCount = stats.telegramClicks || 0;
  const savedCount = stats.contactsSaved || 0;
  const wallCount = stats.wallpaperViews || 0;

  const totalActions = Math.max(1, waCount + tgCount + savedCount + wallCount);
  const waPct = Math.round((waCount / totalActions) * 100);
  const tgPct = Math.round((tgCount / totalActions) * 100);

  container.innerHTML = `
    <div class="modal-overlay active" id="analytics-modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title">Sharing Analytics & Insights</div>
          <button id="btn-close-analytics-modal" class="btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style="margin-bottom: 12px;">
          <p style="font-size: 13px; color: var(--text-secondary);">
            All interactions and metrics are logged <strong>100% offline on your device</strong> to respect your absolute privacy.
          </p>
        </div>

        <!-- Stat Cards Grid -->
        <div class="analytics-grid">
          <div class="stat-card">
            <div class="stat-number">${totalShares}</div>
            <div class="stat-label">Total Shares</div>
          </div>

          <div class="stat-card">
            <div class="stat-number" style="color: #0077B6;">${savedCount}</div>
            <div class="stat-label">Saved Vault Contacts</div>
          </div>

          <div class="stat-card">
            <div class="stat-number" style="color: #25D366;">${waCount}</div>
            <div class="stat-label">WhatsApp Chats</div>
          </div>

          <div class="stat-card">
            <div class="stat-number" style="color: #229ED9;">${tgCount}</div>
            <div class="stat-label">Telegram Chats</div>
          </div>
        </div>

        <!-- Preferred Channel Breakdown -->
        <div style="background: var(--bg-input); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-input); margin-top: 10px;">
          <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">Preferred Messaging Channel</div>
          
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span>WhatsApp (${waCount})</span>
            <span>${waPct}%</span>
          </div>
          <div class="channel-progress-bar">
            <div class="progress-fill" style="width: ${waPct}%; background: #25D366;"></div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 10px; margin-bottom: 4px;">
            <span>Telegram (${tgCount})</span>
            <span>${tgPct}%</span>
          </div>
          <div class="channel-progress-bar">
            <div class="progress-fill" style="width: ${tgPct}%; background: #229ED9;"></div>
          </div>
        </div>

        <button id="btn-close-analytics-done" class="btn-primary" style="margin-top: 16px;">
          DONE
        </button>
      </div>
    </div>
  `;

  const overlay = document.getElementById('analytics-modal-overlay');
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

  document.getElementById('btn-close-analytics-modal')?.addEventListener('click', closeModal);
  document.getElementById('btn-close-analytics-done')?.addEventListener('click', closeModal);
}
