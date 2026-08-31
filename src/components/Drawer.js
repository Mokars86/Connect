import { getLogoSVG } from './Logo.js';

export function renderDrawer(container, { 
  activeProfile = {},
  onOpenCustomize,
  onOpenProfiles, 
  onOpenWidgets, 
  onOpenScan, 
  onOpenWallpaper, 
  onOpenConnections, 
  onOpenUtilityQR, 
  onOpenBurner, 
  onOpenExportKit, 
  onOpenAnalytics, 
  onOpenWalletPass,
  onOpenDonation,
  onOpenInstall,
  onOpenSplash, 
  onToggleAutoSchedule, 
  isAutoScheduleOn, 
  onExportVCard, 
  onToggleTheme, 
  onResetData, 
  currentTheme 
}) {
  const profileName = activeProfile.name || 'JANE DOE';
  const profileType = activeProfile.type || 'Personal';
  const firstLetter = profileName.charAt(0).toUpperCase();

  container.innerHTML = `
    <div class="drawer-backdrop" id="drawer-backdrop"></div>
    
    <div class="drawer-panel" id="drawer-panel">
      <!-- Scrollable Inner Content -->
      <div class="drawer-inner-content">
        <!-- Top Drawer Header -->
        <div class="drawer-header">
          <div class="app-logo-badge">
            ${getLogoSVG(34)}
            <span class="brand-title">CONNECT</span>
          </div>

          <button id="btn-close-drawer" class="btn-icon" aria-label="Close Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Active Profile Quick Card -->
        <div class="drawer-profile-card" id="menu-active-profile-card" title="Click to switch profile card">
          <div class="drawer-profile-avatar">
            ${firstLetter}
          </div>
          <div class="drawer-profile-info">
            <div class="drawer-profile-name">${profileName}</div>
            <div class="drawer-profile-badge">${profileType.toUpperCase()} CARD</div>
          </div>
          <div class="drawer-profile-switch-icon" title="Switch Card">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"/>
            </svg>
          </div>
        </div>

        <ul class="drawer-menu-list">
          <!-- SECTION 1: CARDS & DESIGN -->
          <div class="drawer-section-label">Cards & Customization</div>

          <li class="drawer-menu-item item-highlight" id="menu-customize">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-teal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <span class="drawer-item-label">Customize Card & QR</span>
            </div>
            <span class="drawer-pill-badge badge-teal">PRO DESIGN</span>
          </li>

          <li class="drawer-menu-item" id="menu-profiles">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <span class="drawer-item-label">All Profile Cards</span>
            </div>
            <svg class="drawer-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </li>

          <li class="drawer-menu-item" id="menu-burner">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-red">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/>
                </svg>
              </div>
              <span class="drawer-item-label">Disposable Burner QR</span>
            </div>
            <span class="drawer-pill-badge badge-red">TEMP</span>
          </li>

          <li class="drawer-menu-item" id="menu-wallpaper">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-purple">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="3" ry="3"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
              </div>
              <span class="drawer-item-label">Lock Screen Wallpaper</span>
            </div>
            <svg class="drawer-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </li>

          <!-- SECTION 2: VAULT & PASSES -->
          <div class="drawer-section-label">Vault & Wallet</div>

          <li class="drawer-menu-item" id="menu-connections">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-teal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span class="drawer-item-label">Saved Connections</span>
            </div>
            <svg class="drawer-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </li>

          <li class="drawer-menu-item" id="menu-walletpass">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-orange">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <span class="drawer-item-label">Apple & Google Wallet</span>
            </div>
            <span class="drawer-pill-badge badge-orange">PASS</span>
          </li>

          <li class="drawer-menu-item" id="menu-exportkit">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <span class="drawer-item-label">Email & Zoom Kit</span>
            </div>
            <svg class="drawer-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </li>

          <li class="drawer-menu-item" id="menu-export">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-teal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <span class="drawer-item-label">Download vCard (.vcf)</span>
            </div>
            <svg class="drawer-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </li>

          <!-- SECTION 3: UTILITIES & TOOLS -->
          <div class="drawer-section-label">Tools & Utilities</div>

          <li class="drawer-menu-item item-highlight" id="menu-install">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-teal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="3" ry="3"/>
                  <path d="M12 18h.01"/>
                  <path d="M12 7v6"/>
                  <path d="M9 10l3 3 3-3"/>
                </svg>
              </div>
              <span class="drawer-item-label">Install App (PWA)</span>
            </div>
            <span class="drawer-pill-badge badge-teal">APP</span>
          </li>

          <li class="drawer-menu-item" id="menu-utility">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-purple">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                  <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                  <line x1="12" y1="20" x2="12.01" y2="20"/>
                </svg>
              </div>
              <span class="drawer-item-label">WiFi & Utility QRs</span>
            </div>
            <svg class="drawer-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </li>

          <li class="drawer-menu-item" id="menu-scan">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-teal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                  <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                  <rect x="7" y="7" width="10" height="10" rx="1"/>
                </svg>
              </div>
              <span class="drawer-item-label">Scan Contact QR</span>
            </div>
            <svg class="drawer-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </li>

          <li class="drawer-menu-item" id="menu-analytics">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <span class="drawer-item-label">Sharing Analytics</span>
            </div>
            <svg class="drawer-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </li>

          <li class="drawer-menu-item" id="menu-widgets">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-teal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                </svg>
              </div>
              <span class="drawer-item-label">Manage Widgets</span>
            </div>
            <svg class="drawer-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </li>

          <li class="drawer-menu-item" id="menu-autoschedule">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-orange">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <span class="drawer-item-label">Time-Schedule Switch</span>
            </div>
            <span class="drawer-pill-badge ${isAutoScheduleOn ? 'badge-teal' : 'badge-gray'}">${isAutoScheduleOn ? 'ON' : 'OFF'}</span>
          </li>

          <!-- SECTION 4: PREFERENCES & SUPPORT -->
          <div class="drawer-section-label">Preferences & Support</div>

          <li class="drawer-menu-item" id="menu-theme">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-purple">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              </div>
              <span class="drawer-item-label">App Appearance</span>
            </div>
            <span class="drawer-pill-badge badge-teal" id="theme-label-text">${currentTheme === 'night' ? 'Night' : 'Day'}</span>
          </li>

          <li class="drawer-menu-item" id="menu-splash">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <span class="drawer-item-label">Replay Boot Screen</span>
            </div>
            <svg class="drawer-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </li>

          <li class="drawer-menu-item" id="menu-donation">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-teal" style="background: rgba(9, 165, 219, 0.12); color: #09A5DB;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                  <line x1="6" y1="1" x2="6" y2="4"/>
                  <line x1="10" y1="1" x2="10" y2="4"/>
                  <line x1="14" y1="1" x2="14" y2="4"/>
                </svg>
              </div>
              <span class="drawer-item-label">Buy Us a Coffee</span>
            </div>
            <span class="drawer-pill-badge badge-orange">SUPPORT</span>
          </li>

          <li class="drawer-menu-item item-danger" id="menu-reset">
            <div class="drawer-item-left">
              <div class="drawer-icon-box box-red">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
              </div>
              <span class="drawer-item-label" style="color: #E63946;">Reset App Data</span>
            </div>
            <svg class="drawer-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </li>
        </ul>
      </div>

      <!-- Drawer Footer with Mokars Tech Branding -->
      <div class="drawer-footer">
        <div class="drawer-footer-badge">
          <img src="/mokars_logo.png" alt="Mokars Tech" style="width: 18px; height: 18px; object-fit: contain;" />
          <span style="font-family: var(--font-heading); font-weight: 800; font-size: 11px; color: var(--text-primary);">
            Developed by Mokars Tech
          </span>
        </div>
        <div class="drawer-footer-text">Connect App v1.0.0 • 100% Offline & Private</div>
      </div>
    </div>
  `;

  const backdrop = document.getElementById('drawer-backdrop');
  const panel = document.getElementById('drawer-panel');

  const closeDrawer = () => {
    backdrop?.classList.remove('active');
    panel?.classList.remove('active');
  };

  const openDrawer = () => {
    backdrop?.classList.add('active');
    panel?.classList.add('active');
  };

  backdrop?.addEventListener('click', closeDrawer);
  document.getElementById('btn-close-drawer')?.addEventListener('click', closeDrawer);

  document.getElementById('menu-active-profile-card')?.addEventListener('click', () => {
    closeDrawer();
    if (onOpenProfiles) onOpenProfiles();
  });

  document.getElementById('menu-customize')?.addEventListener('click', () => {
    closeDrawer();
    if (onOpenCustomize) onOpenCustomize();
  });

  document.getElementById('menu-splash')?.addEventListener('click', () => {
    closeDrawer();
    if (onOpenSplash) onOpenSplash();
  });

  document.getElementById('menu-connections')?.addEventListener('click', () => {
    closeDrawer();
    if (onOpenConnections) onOpenConnections();
  });

  document.getElementById('menu-burner')?.addEventListener('click', () => {
    closeDrawer();
    if (onOpenBurner) onOpenBurner();
  });

  document.getElementById('menu-walletpass')?.addEventListener('click', () => {
    closeDrawer();
    if (onOpenWalletPass) onOpenWalletPass();
  });

  document.getElementById('menu-donation')?.addEventListener('click', () => {
    closeDrawer();
    if (onOpenDonation) onOpenDonation();
  });

  document.getElementById('menu-exportkit')?.addEventListener('click', () => {
    closeDrawer();
    if (onOpenExportKit) onOpenExportKit();
  });

  document.getElementById('menu-utility')?.addEventListener('click', () => {
    closeDrawer();
    if (onOpenUtilityQR) onOpenUtilityQR();
  });

  document.getElementById('menu-install')?.addEventListener('click', () => {
    closeDrawer();
    if (onOpenInstall) onOpenInstall();
  });

  document.getElementById('menu-analytics')?.addEventListener('click', () => {
    closeDrawer();
    if (onOpenAnalytics) onOpenAnalytics();
  });

  document.getElementById('menu-autoschedule')?.addEventListener('click', () => {
    onToggleAutoSchedule();
  });

  document.getElementById('menu-wallpaper')?.addEventListener('click', () => {
    closeDrawer();
    if (onOpenWallpaper) onOpenWallpaper();
  });

  document.getElementById('menu-scan')?.addEventListener('click', () => {
    closeDrawer();
    if (onOpenScan) onOpenScan();
  });

  document.getElementById('menu-profiles')?.addEventListener('click', () => {
    closeDrawer();
    onOpenProfiles();
  });

  document.getElementById('menu-widgets')?.addEventListener('click', () => {
    closeDrawer();
    onOpenWidgets();
  });

  document.getElementById('menu-export')?.addEventListener('click', () => {
    closeDrawer();
    onExportVCard();
  });

  document.getElementById('menu-theme')?.addEventListener('click', () => {
    onToggleTheme();
  });

  document.getElementById('menu-reset')?.addEventListener('click', () => {
    closeDrawer();
    onResetData();
  });

  return { openDrawer, closeDrawer };
}
