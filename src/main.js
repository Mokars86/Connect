import './styles/main.css';
import './styles/onboarding.css';
import './styles/dashboard.css';
import './styles/editor.css';
import './styles/drawer.css';
import './styles/splash.css';
import './styles/scan.css';
import './styles/wallpaper.css';
import './styles/connections.css';
import './styles/utility.css';
import './styles/analytics.css';
import './styles/exportkit.css';
import './styles/burner.css';
import './styles/pingback.css';
import './styles/bottomnav.css';
import './styles/walletpass.css';
import './styles/donation.css';
import './styles/subscription.css';
import './styles/cloudsync.css';

import { renderBottomNav } from './components/BottomNav.js';
import { renderWalletPassModal } from './components/WalletPassModal.js';
import { renderDonationModal } from './components/DonationModal.js';
import { renderSubscriptionModal } from './components/SubscriptionModal.js';
import { renderCloudSyncModal } from './components/CloudSyncModal.js';

import { 
  loadProfiles, 
  getActiveProfileId, 
  setActiveProfileId, 
  getActiveProfile, 
  updateProfile, 
  isOnboarded, 
  setOnboarded, 
  getThemeMode, 
  setThemeMode,
  isAutoScheduleEnabled,
  setAutoScheduleEnabled,
  isProSubscribed
} from './utils/storage.js';

import { downloadVCardFile } from './utils/vcard.js';
import { renderOnboarding } from './components/Onboarding.js';
import { renderDashboard } from './components/Dashboard.js';
import { renderEditor } from './components/Editor.js';
import { renderDrawer } from './components/Drawer.js';
import { renderWidgetGuideModal } from './components/WidgetGuide.js';
import { renderProfileSelectorModal } from './components/ProfileSelector.js';
import { renderSplashScreen } from './components/SplashScreen.js';
import { renderScanModal } from './components/ScanModal.js';
import { renderScannedContactModal } from './components/ScannedContactModal.js';
import { renderLockScreenWallpaperModal } from './components/LockScreenWallpaperModal.js';
import { renderMyConnections } from './components/MyConnections.js';
import { renderUtilityQRModal } from './components/UtilityQRModal.js';
import { renderAnalyticsModal } from './components/AnalyticsModal.js';
import { renderExportKitModal } from './components/ExportKitModal.js';
import { renderBurnerModal } from './components/BurnerModal.js';
import { renderPingBackModal } from './components/PingBackModal.js';
import { renderInstallModal } from './components/InstallModal.js';
import { renderPrivacyModal } from './components/PrivacyModal.js';

// Global PWA Event Listener & Service Worker Registration
window.deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('ServiceWorker registration failed:', err);
    });
  });
}

class ConnectApp {
  constructor() {
    this.appContainer = document.getElementById('app');
    this.currentScreen = 'dashboard';
    this.activeTab = 'card';
    this.drawerControl = null;
    this.widgetModalControl = null;
    this.profileModalControl = null;

    this.init();
  }

  init() {
    // Apply saved Theme Mode
    const savedTheme = getThemeMode();
    this.applyTheme(savedTheme);

    // Render underlying active screen first
    if (!isOnboarded()) {
      this.navigateTo('onboarding');
    } else {
      this.navigateTo('dashboard');
    }

    // Render Animated Splash Boot Screen Overlay on top
    this.openSplashScreen(1800);

    // Check URL parameters for PWA App Icon Shortcut & Widget actions
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    if (action) {
      setTimeout(() => {
        if (action === 'scan') this.openScanModal();
        else if (action === 'wallpaper') this.openWallpaperModal();
        else if (action === 'wallet') this.openWalletPassModal();
        else if (action === 'burner') this.openBurnerModal();
        else if (action === 'utility') this.openUtilityQRModal();
        else if (action === 'widgets') this.openWidgetGuide();
        else if (action === 'analytics') this.openAnalyticsModal();
        else if (action === 'share') this.navigateTo('dashboard');
      }, 1900);
    }
  }

  openSplashScreen(delayMs = 1800) {
    const splash = renderSplashScreen(document.body);
    splash.hide(delayMs);
  }

  applyTheme(theme) {
    if (theme === 'night') {
      document.body.classList.add('night-mode');
      document.body.classList.remove('day-mode');
      setThemeMode('night');
    } else {
      document.body.classList.add('day-mode');
      document.body.classList.remove('night-mode');
      setThemeMode('day');
    }

    const themeLabel = document.getElementById('theme-label-text');
    if (themeLabel) {
      themeLabel.textContent = theme === 'night' ? 'Night Mode' : 'Day Mode';
    }
  }

  showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  navigateTo(screen) {
    this.currentScreen = screen;
    this.render();
  }

  render() {
    const activeProfile = getActiveProfile();
    const isPro = isProSubscribed();

    if (this.currentScreen === 'onboarding') {
      const handleOnboardSubmit = (data) => {
        if (data && data.phone) {
          const active = getActiveProfile();
          updateProfile({
            ...active,
            name: data.name || active.name || 'My Contact Card',
            phone: data.phone
          });
          // Also update business profile default name if it was not set
          const profiles = loadProfiles();
          const bus = profiles.find(p => p.id === 'business');
          if (bus && !bus.name) {
            updateProfile({
              ...bus,
              name: data.name || 'My Contact Card'
            });
          }
        }
        setOnboarded(true);
        this.navigateTo('dashboard');
      };

      renderOnboarding(this.appContainer, {
        onComplete: handleOnboardSubmit,
        onGenerateQR: handleOnboardSubmit
      });
      this.attachBottomNav();
      return;
    }

    if (this.currentScreen === 'dashboard') {
      renderDashboard(this.appContainer, {
        activeProfile,
        isPro,
        onOpenCustomize: () => this.openCustomize(),
        onOpenWidgets: () => this.openWidgetGuide(),
        onOpenScan: () => this.openScanModal(),
        onOpenWallpaper: () => this.openWallpaperModal(),
        onOpenConnections: () => this.navigateTo('connections'),
        onOpenUtilityQR: () => this.openUtilityQRModal(),
        onOpenBurner: () => this.openBurnerModal(),
        onOpenExportKit: () => this.openExportKitModal(),
        onOpenAnalytics: () => this.openAnalyticsModal(),
        onOpenDrawer: () => this.openDrawer(),
        onOpenSettings: () => this.openDrawer(),
        onOpenProfileSelector: () => this.openProfileSelector(),
        onOpenSubscription: () => this.openSubscriptionModal(),
        showToast: (msg) => this.showToast(msg)
      });
      this.attachModals();
      this.attachBottomNav();
      return;
    }

    if (this.currentScreen === 'editor') {
      renderEditor(this.appContainer, {
        activeProfile,
        onSave: (updatedProfile) => {
          updateProfile(updatedProfile);
          this.showToast('Profile and QR design saved!');
          this.navigateTo('dashboard');
        },
        onBack: () => this.navigateTo('dashboard'),
        onUpgradePro: (feature) => this.openSubscriptionModal(feature)
      });
      this.attachBottomNav();
      return;
    }

    if (this.currentScreen === 'connections') {
      renderMyConnections(this.appContainer, {
        onBack: () => this.navigateTo('dashboard'),
        onScanQR: () => this.openScanModal(),
        showToast: (msg) => this.showToast(msg)
      });
      this.attachBottomNav();
      return;
    }
  }

  attachBottomNav(forcedTab) {
    if (this.currentScreen === 'onboarding') {
      const existing = document.getElementById('bottom-nav-slot');
      if (existing) existing.remove();
      return;
    }

    let navSlot = document.getElementById('bottom-nav-slot');
    if (!navSlot) {
      navSlot = document.createElement('div');
      navSlot.id = 'bottom-nav-slot';
      this.appContainer.appendChild(navSlot);
    }

    const currentTab = forcedTab || this.activeTab || (this.currentScreen === 'connections' ? 'contacts' : 'card');

    renderBottomNav(navSlot, {
      activeTab: currentTab,
      onTabSelect: (tab) => {
        this.activeTab = tab;
        if (tab === 'card' || tab === 'clients') {
          this.navigateTo('dashboard');
        } else if (tab === 'contacts' || tab === 'runway') {
          this.navigateTo('connections');
        } else if (tab === 'analytics' || tab === 'ledger') {
          this.openAnalyticsModal();
        } else if (tab === 'tools' || tab === 'inventory') {
          this.openUtilityQRModal();
        }
      },
      onFabClick: () => {
        this.openScanModal();
      }
    });
  }

  attachModals() {
    const isPro = isProSubscribed();

    // Attach Sidebar Drawer
    let drawerSlot = document.getElementById('drawer-slot');
    if (!drawerSlot) {
      drawerSlot = document.createElement('div');
      drawerSlot.id = 'drawer-slot';
      this.appContainer.appendChild(drawerSlot);
    }

    this.drawerControl = renderDrawer(drawerSlot, {
      activeProfile: getActiveProfile(),
      isPro,
      onOpenCustomize: () => this.openCustomize(),
      onOpenProfiles: () => this.openProfileSelector(),
      onOpenWidgets: () => this.openWidgetGuide(),
      onOpenScan: () => this.openScanModal(),
      onOpenWallpaper: () => this.openWallpaperModal(),
      onOpenConnections: () => this.navigateTo('connections'),
      onOpenUtilityQR: () => this.openUtilityQRModal(),
      onOpenBurner: () => this.openBurnerModal(),
      onOpenExportKit: () => this.openExportKitModal(),
      onOpenAnalytics: () => this.openAnalyticsModal(),
      onOpenWalletPass: () => this.openWalletPassModal(),
      onOpenDonation: () => this.openDonationModal(),
      onOpenInstall: () => this.openInstallModal(),
      onOpenSubscription: () => this.openSubscriptionModal(),
      onOpenCloudSync: () => this.openCloudSyncModal(),
      onOpenSplash: () => this.openSplashScreen(2000),
      onOpenPrivacy: () => this.openPrivacyModal(),

      onToggleAutoSchedule: () => {
        if (!isProSubscribed()) {
          this.openSubscriptionModal('Time-Based Auto-Schedule Switcher');
          return;
        }
        const current = isAutoScheduleEnabled();
        setAutoScheduleEnabled(!current);
        this.showToast(`Auto-Schedule (9 AM - 5 PM Weekdays) ${!current ? 'Enabled' : 'Disabled'}`);
        this.render();
      },
      isAutoScheduleOn: isAutoScheduleEnabled(),
      onExportVCard: () => {
        const profile = getActiveProfile();
        downloadVCardFile(profile);
        this.showToast(`Downloaded vCard file for ${profile.name}!`);
      },
      onToggleTheme: () => {
        const current = getThemeMode();
        this.applyTheme(current === 'night' ? 'day' : 'night');
      },
      onResetData: () => {
        if (confirm('Reset application data and return to onboarding?')) {
          localStorage.clear();
          location.reload();
        }
      },
      currentTheme: getThemeMode()
    });

    // Attach Widget Modal Slot
    let widgetSlot = document.getElementById('widget-modal-slot');
    if (!widgetSlot) {
      widgetSlot = document.createElement('div');
      widgetSlot.id = 'widget-modal-slot';
      this.appContainer.appendChild(widgetSlot);
    }
    this.widgetModalControl = renderWidgetGuideModal(widgetSlot, {});

    // Attach Profile Selector Modal Slot
    let profileSlot = document.getElementById('profile-modal-slot');
    if (!profileSlot) {
      profileSlot = document.createElement('div');
      profileSlot.id = 'profile-modal-slot';
      this.appContainer.appendChild(profileSlot);
    }
  }

  openSubscriptionModal(featureName = '') {
    let subSlot = document.getElementById('subscription-modal-slot');
    if (!subSlot) {
      subSlot = document.createElement('div');
      subSlot.id = 'subscription-modal-slot';
      this.appContainer.appendChild(subSlot);
    }
    renderSubscriptionModal(subSlot, {
      featureName,
      showToast: (msg) => this.showToast(msg),
      onSuccess: () => {
        this.render();
      }
    });
  }

  openCustomize() {
    this.navigateTo('editor');
  }

  openWallpaperModal() {
    let wallpaperSlot = document.getElementById('wallpaper-modal-slot');
    if (!wallpaperSlot) {
      wallpaperSlot = document.createElement('div');
      wallpaperSlot.id = 'wallpaper-modal-slot';
      this.appContainer.appendChild(wallpaperSlot);
    }
    const activeProfile = getActiveProfile();
    renderLockScreenWallpaperModal(wallpaperSlot, { activeProfile });
  }

  openScanModal() {
    let scanSlot = document.getElementById('scan-modal-slot');
    if (!scanSlot) {
      scanSlot = document.createElement('div');
      scanSlot.id = 'scan-modal-slot';
      this.appContainer.appendChild(scanSlot);
    }
    renderScanModal(scanSlot, {
      onScanned: (contact) => {
        this.showScannedContactModal(contact);
      }
    });
  }

  showScannedContactModal(contact) {
    let scannedSlot = document.getElementById('scanned-modal-slot');
    if (!scannedSlot) {
      scannedSlot = document.createElement('div');
      scannedSlot.id = 'scanned-modal-slot';
      this.appContainer.appendChild(scannedSlot);
    }
    renderScannedContactModal(scannedSlot, { 
      contact, 
      onOpenConnections: () => this.navigateTo('connections'),
      showToast: (msg) => this.showToast(msg)
    });
  }

  openUtilityQRModal() {
    this.activeTab = 'tools';
    this.attachBottomNav('tools');
    let utilSlot = document.getElementById('utility-modal-slot');
    if (!utilSlot) {
      utilSlot = document.createElement('div');
      utilSlot.id = 'utility-modal-slot';
      this.appContainer.appendChild(utilSlot);
    }
    renderUtilityQRModal(utilSlot, {
      showToast: (msg) => this.showToast(msg)
    });
  }

  openBurnerModal() {
    if (!isProSubscribed()) {
      this.openSubscriptionModal('Disposable Burner QR Profiles');
      return;
    }
    let burnerSlot = document.getElementById('burner-modal-slot');
    if (!burnerSlot) {
      burnerSlot = document.createElement('div');
      burnerSlot.id = 'burner-modal-slot';
      this.appContainer.appendChild(burnerSlot);
    }
    renderBurnerModal(burnerSlot, {
      showToast: (msg) => this.showToast(msg)
    });
  }

  openExportKitModal() {
    if (!isProSubscribed()) {
      this.openSubscriptionModal('Export Kit (Vector SVG & Print PDF)');
      return;
    }
    let kitSlot = document.getElementById('exportkit-modal-slot');
    if (!kitSlot) {
      kitSlot = document.createElement('div');
      kitSlot.id = 'exportkit-modal-slot';
      this.appContainer.appendChild(kitSlot);
    }
    const activeProfile = getActiveProfile();
    renderExportKitModal(kitSlot, {
      activeProfile,
      showToast: (msg) => this.showToast(msg)
    });
  }

  openAnalyticsModal() {
    if (!isProSubscribed()) {
      this.openSubscriptionModal('Scan Analytics & Sharing Statistics');
      return;
    }
    this.activeTab = 'analytics';
    this.attachBottomNav('analytics');
    let analyticsSlot = document.getElementById('analytics-modal-slot');
    if (!analyticsSlot) {
      analyticsSlot = document.createElement('div');
      analyticsSlot.id = 'analytics-modal-slot';
      this.appContainer.appendChild(analyticsSlot);
    }
    renderAnalyticsModal(analyticsSlot, {});
  }

  openWalletPassModal() {
    if (!isProSubscribed()) {
      this.openSubscriptionModal('Apple & Google Wallet Passes');
      return;
    }
    let walletSlot = document.getElementById('wallet-modal-slot');
    if (!walletSlot) {
      walletSlot = document.createElement('div');
      walletSlot.id = 'wallet-modal-slot';
      this.appContainer.appendChild(walletSlot);
    }
    const activeProfile = getActiveProfile();
    renderWalletPassModal(walletSlot, {
      activeProfile,
      showToast: (msg) => this.showToast(msg)
    });
  }

  openDonationModal() {
    let donationSlot = document.getElementById('donation-modal-slot');
    if (!donationSlot) {
      donationSlot = document.createElement('div');
      donationSlot.id = 'donation-modal-slot';
      this.appContainer.appendChild(donationSlot);
    }
    const activeProfile = getActiveProfile();
    renderDonationModal(donationSlot, {
      activeProfile,
      showToast: (msg) => this.showToast(msg)
    });
  }

  openInstallModal() {
    let installSlot = document.getElementById('install-modal-slot');
    if (!installSlot) {
      installSlot = document.createElement('div');
      installSlot.id = 'install-modal-slot';
      this.appContainer.appendChild(installSlot);
    }
    const installControl = renderInstallModal(installSlot, {
      showToast: (msg) => this.showToast(msg)
    });
    installControl.openModal();
  }

  openPingBackModal() {
    let pingSlot = document.getElementById('pingback-modal-slot');
    if (!pingSlot) {
      pingSlot = document.createElement('div');
      pingSlot.id = 'pingback-modal-slot';
      this.appContainer.appendChild(pingSlot);
    }
    renderPingBackModal(pingSlot, {
      onSavedToVault: () => this.navigateTo('connections'),
      showToast: (msg) => this.showToast(msg)
    });
  }

  openCloudSyncModal() {
    let syncSlot = document.getElementById('cloudsync-modal-slot');
    if (!syncSlot) {
      syncSlot = document.createElement('div');
      syncSlot.id = 'cloudsync-modal-slot';
      this.appContainer.appendChild(syncSlot);
    }
    renderCloudSyncModal(syncSlot, {
      showToast: (msg) => this.showToast(msg),
      onDataRestored: () => {
        this.render();
      }
    });
  }

  openPrivacyModal() {
    let privacySlot = document.getElementById('privacy-modal-slot');
    if (!privacySlot) {
      privacySlot = document.createElement('div');
      privacySlot.id = 'privacy-modal-slot';
      this.appContainer.appendChild(privacySlot);
    }
    renderPrivacyModal(privacySlot, {});
  }

  openDrawer() {
    if (this.drawerControl) {
      this.drawerControl.openDrawer();
    }
  }

  openWidgetGuide() {
    if (this.widgetModalControl) {
      this.widgetModalControl.openModal();
    }
  }

  openProfileSelector() {
    const profileSlot = document.getElementById('profile-modal-slot');
    if (profileSlot) {
      const profiles = loadProfiles();
      const activeId = getActiveProfileId();

      this.profileModalControl = renderProfileSelectorModal(profileSlot, {
        profiles,
        activeProfileId: activeId,
        onSelectProfile: (id) => {
          setActiveProfileId(id);
          const active = getActiveProfile();
          this.showToast(`Switched to ${active.type || active.name}'s Profile`);
          this.render();
        },
        onCreateProfile: () => {
          if (!isProSubscribed()) {
            this.openSubscriptionModal('Unlimited Contact Profile Cards');
            return;
          }
          const newProfile = {
            id: `custom_${Date.now()}`,
            type: 'Networking',
            name: 'New Contact',
            phone: '+1 555-0000',
            email: '',
            company: '',
            title: '',
            color: '#2A9D8F'
          };
          updateProfile(newProfile);
          setActiveProfileId(newProfile.id);
          this.showToast('Created new Profile Card!');
          this.navigateTo('editor');
        }
      });

      this.profileModalControl.openModal();
    }
  }
}

// Instantiate Application on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  window.connectApp = new ConnectApp();
});
