/**
 * Local Storage State Manager for Connect Application
 */

const STORAGE_KEYS = {
  PROFILES: 'connect_profiles_v1',
  ACTIVE_PROFILE_ID: 'connect_active_profile_v1',
  THEME_MODE: 'connect_theme_mode_v1',
  ONBOARDED: 'connect_onboarded_v1',
  WALLPAPER_THEME: 'connect_wallpaper_theme_v1',
  SAVED_CONTACTS: 'connect_saved_contacts_v1',
  UTILITY_QRS: 'connect_utility_qrs_v1',
  ANALYTICS: 'connect_analytics_v1',
  AUTO_SCHEDULE: 'connect_auto_schedule_v1',
  BURNER_PROFILES: 'connect_burner_profiles_v1'
};

const DEFAULT_PROFILES = [
  {
    id: 'personal',
    type: 'Personal',
    name: 'Jane Doe',
    phone: '+1 555-0101',
    email: 'jane.doe@gmail.com',
    title: 'Product Manager',
    company: 'Google',
    linkedin: 'linkedin.com/in/janedoe',
    website: 'https://janedoe.me',
    color: '#00C9A7',
    avatar: '', // Custom center logo/avatar data URL
    qrMode: 'vcard' // 'vcard', 'whatsapp', 'sms'
  },
  {
    id: 'business',
    type: 'Business',
    name: 'Jane Doe',
    phone: '+1 555-0199',
    email: 'jane.doe@company.com',
    title: 'Senior Solutions Lead',
    company: 'Connect Inc.',
    linkedin: 'linkedin.com/in/janedoe-pro',
    website: 'https://connectapp.io',
    color: '#0077B6',
    avatar: '',
    qrMode: 'vcard'
  }
];

export function loadProfiles() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!data) {
      saveProfiles(DEFAULT_PROFILES);
      return DEFAULT_PROFILES;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_PROFILES;
  }
}

export function saveProfiles(profiles) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles:', e);
  }
}

export function getActiveProfileId() {
  // Check if Auto-Schedule is enabled
  if (isAutoScheduleEnabled()) {
    const scheduledId = getAutoScheduledProfileId();
    if (scheduledId) return scheduledId;
  }
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID) || 'personal';
}

export function setActiveProfileId(id) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
}

export function getActiveProfile() {
  const profiles = loadProfiles();
  const activeId = getActiveProfileId();
  return profiles.find(p => p.id === activeId) || profiles[0] || DEFAULT_PROFILES[0];
}

export function updateProfile(updatedProfile) {
  const profiles = loadProfiles();
  const index = profiles.findIndex(p => p.id === updatedProfile.id);
  if (index !== -1) {
    profiles[index] = { ...profiles[index], ...updatedProfile };
  } else {
    profiles.push(updatedProfile);
  }
  saveProfiles(profiles);
}

// FEATURE 3A: Time-Based Auto-Schedule (9 AM - 5 PM Weekdays = Business, Else = Personal)
export function isAutoScheduleEnabled() {
  return localStorage.getItem(STORAGE_KEYS.AUTO_SCHEDULE) === 'true';
}

export function setAutoScheduleEnabled(enabled = true) {
  localStorage.setItem(STORAGE_KEYS.AUTO_SCHEDULE, enabled ? 'true' : 'false');
}

export function getAutoScheduledProfileId() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 6 = Sat
  const hour = now.getHours(); // 0-23

  // Weekdays (Mon-Fri) between 9 AM (9) and 5 PM (17) => Business Profile
  if (day >= 1 && day <= 5 && hour >= 9 && hour < 17) {
    return 'business';
  }
  return 'personal';
}

// FEATURE 3C: Burner / Disposable Temporary Contact Mode
export function loadBurnerProfiles() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BURNER_PROFILES);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveBurnerProfile(burner) {
  const burners = loadBurnerProfiles();
  const newBurner = {
    id: `burner_${Date.now()}`,
    type: 'Burner',
    name: burner.name || 'Temporary Contact',
    phone: burner.phone || '+1 555-9999',
    purpose: burner.purpose || 'Marketplace / Rideshare',
    expiresAt: burner.expiresAt || (Date.now() + 24 * 60 * 60 * 1000), // Default 24 hours
    color: '#E63946'
  };
  burners.unshift(newBurner);
  localStorage.setItem(STORAGE_KEYS.BURNER_PROFILES, JSON.stringify(burners));
  return newBurner;
}

export function deleteBurnerProfile(id) {
  const burners = loadBurnerProfiles().filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEYS.BURNER_PROFILES, JSON.stringify(burners));
}

// Basic App State
export function isOnboarded() {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
}

export function setOnboarded(status = true) {
  localStorage.setItem(STORAGE_KEYS.ONBOARDED, status ? 'true' : 'false');
}

export function getThemeMode() {
  return localStorage.getItem(STORAGE_KEYS.THEME_MODE) || 'day';
}

export function setThemeMode(mode) {
  localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
}

export function getWallpaperTheme() {
  return localStorage.getItem(STORAGE_KEYS.WALLPAPER_THEME) || 'mint';
}

export function setWallpaperTheme(themeId) {
  localStorage.setItem(STORAGE_KEYS.WALLPAPER_THEME, themeId);
}

// Saved Contacts & Analytics
export function loadSavedContacts() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_CONTACTS);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveContactToVault(contact) {
  const contacts = loadSavedContacts();
  const existingIdx = contacts.findIndex(c => c.phone && c.phone === contact.phone);
  
  const newContact = {
    id: contact.id || `contact_${Date.now()}`,
    name: contact.name || 'Saved Contact',
    phone: contact.phone || '',
    email: contact.email || '',
    title: contact.title || '',
    company: contact.company || '',
    tag: contact.tag || 'Networking',
    notes: contact.notes || '',
    metAt: contact.metAt || 'Scanned QR Code',
    dateSaved: contact.dateSaved || new Date().toLocaleDateString()
  };

  if (existingIdx !== -1) {
    contacts[existingIdx] = { ...contacts[existingIdx], ...newContact };
  } else {
    contacts.unshift(newContact);
  }

  localStorage.setItem(STORAGE_KEYS.SAVED_CONTACTS, JSON.stringify(contacts));
  logAnalyticsEvent('contact_saved', 'vault');
  return newContact;
}

export function deleteContactFromVault(contactId) {
  const contacts = loadSavedContacts().filter(c => c.id !== contactId);
  localStorage.setItem(STORAGE_KEYS.SAVED_CONTACTS, JSON.stringify(contacts));
}

export function loadUtilityQRs() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.UTILITY_QRS);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveUtilityQR(utilityItem) {
  const items = loadUtilityQRs();
  const newItem = {
    id: utilityItem.id || `util_${Date.now()}`,
    type: utilityItem.type || 'wifi',
    title: utilityItem.title || 'Utility QR',
    payload: utilityItem.payload || '',
    color: utilityItem.color || '#00C9A7',
    dateCreated: new Date().toLocaleDateString()
  };
  items.unshift(newItem);
  localStorage.setItem(STORAGE_KEYS.UTILITY_QRS, JSON.stringify(items));
  logAnalyticsEvent('utility_qr_created', utilityItem.type);
  return newItem;
}

export function deleteUtilityQR(id) {
  const items = loadUtilityQRs().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.UTILITY_QRS, JSON.stringify(items));
}

export function getAnalytics() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    if (!data) {
      const defaultAnalytics = {
        totalShares: 1,
        whatsappClicks: 0,
        telegramClicks: 0,
        wallpaperViews: 0,
        contactsSaved: 0,
        utilityQRsCreated: 0,
        lastSharedDate: new Date().toLocaleDateString()
      };
      localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(defaultAnalytics));
      return defaultAnalytics;
    }
    return JSON.parse(data);
  } catch (e) {
    return { totalShares: 1, whatsappClicks: 0, telegramClicks: 0, wallpaperViews: 0, contactsSaved: 0 };
  }
}

export function logAnalyticsEvent(eventType, channel = 'general') {
  const analytics = getAnalytics();
  
  if (eventType === 'share' || eventType === 'qr_view') {
    analytics.totalShares = (analytics.totalShares || 0) + 1;
  } else if (eventType === 'whatsapp') {
    analytics.whatsappClicks = (analytics.whatsappClicks || 0) + 1;
  } else if (eventType === 'telegram') {
    analytics.telegramClicks = (analytics.telegramClicks || 0) + 1;
  } else if (eventType === 'wallpaper_view') {
    analytics.wallpaperViews = (analytics.wallpaperViews || 0) + 1;
  } else if (eventType === 'contact_saved') {
    analytics.contactsSaved = (analytics.contactsSaved || 0) + 1;
  } else if (eventType === 'utility_qr_created') {
    analytics.utilityQRsCreated = (analytics.utilityQRsCreated || 0) + 1;
  }

  analytics.lastSharedDate = new Date().toLocaleDateString();
  localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
}
