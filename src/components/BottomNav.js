export function renderBottomNav(container, { activeTab = 'card', onTabSelect, onFabClick }) {
  container.innerHTML = `
    <div class="bottom-nav-slot">
      <nav class="bottom-nav-bar" aria-label="Bottom Navigation">
        <!-- Tab 1: My Card -->
        <button class="nav-item ${activeTab === 'card' ? 'active' : ''}" data-tab="card" id="nav-btn-card" title="My QR Contact Card" aria-selected="${activeTab === 'card'}">
          <div class="nav-item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="3"></rect>
              <circle cx="9" cy="10" r="2.5"></circle>
              <line x1="15" y1="9" x2="19" y2="9"></line>
              <line x1="15" y1="13" x2="18" y2="13"></line>
              <line x1="6" y1="16" x2="18" y2="16"></line>
            </svg>
          </div>
          <span class="nav-item-label">My Card</span>
        </button>

        <!-- Tab 2: Contacts -->
        <button class="nav-item ${activeTab === 'contacts' ? 'active' : ''}" data-tab="contacts" id="nav-btn-contacts" title="Saved Contacts & Connections" aria-selected="${activeTab === 'contacts'}">
          <div class="nav-item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <span class="nav-item-label">Contacts</span>
        </button>

        <!-- Center Floating Action Button (+ FAB) -->
        <div class="nav-fab-wrapper">
          <button class="nav-fab-btn" id="nav-fab-plus" title="Scan QR Code" aria-label="Scan QR Code">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        <!-- Tab 3: Analytics -->
        <button class="nav-item ${activeTab === 'analytics' ? 'active' : ''}" data-tab="analytics" id="nav-btn-analytics" title="Analytics & QR Stats" aria-selected="${activeTab === 'analytics'}">
          <div class="nav-item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <span class="nav-item-label">Analytics</span>
        </button>

        <!-- Tab 4: Tools -->
        <button class="nav-item ${activeTab === 'tools' ? 'active' : ''}" data-tab="tools" id="nav-btn-tools" title="Utility Tools & QR Generators" aria-selected="${activeTab === 'tools'}">
          <div class="nav-item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
            </svg>
          </div>
          <span class="nav-item-label">Tools</span>
        </button>
      </nav>
    </div>
  `;

  // Attach tab click listeners
  container.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      if (onTabSelect) {
        onTabSelect(tab);
      }
    });
  });

  // FAB click listener
  const fabBtn = container.querySelector('#nav-fab-plus');
  if (fabBtn) {
    fabBtn.addEventListener('click', () => {
      if (onFabClick) {
        onFabClick();
      }
    });
  }

  return {
    setActiveTab: (tabId) => {
      container.querySelectorAll('.nav-item').forEach(btn => {
        const dataTab = btn.getAttribute('data-tab');
        const isActive = (dataTab === tabId);
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }
  };
}
