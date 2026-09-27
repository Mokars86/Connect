import { isAutoCloudSyncEnabled, syncAllToSupabase } from './supabaseClient.js';

/**
 * Local Storage State Manager for Connect Application
 */

let syncDebounceTimer = null;
export function triggerBackgroundSync() {
  try {
    if (typeof isAutoCloudSyncEnabled === 'function' && !isAutoCloudSyncEnabled()) return;
    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(async () => {
      try {
        await syncAllToSupabase({
          profiles: loadProfiles(),
          contacts: loadSavedContacts(),
          utilityQRs: loadUtilityQRs(),
          burnerProfiles: loadBurnerProfiles(),
          analytics: getAnalytics(),
          subscription: getSubscriptionState()
        });
      } catch (e) {
        // silent sync catch
      }
    }, 1500);
  } catch (e) {
    // ignore
  }
}

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
  BURNER_PROFILES: 'connect_burner_profiles_v1',
  PRO_SUBSCRIPTION: 'connect_pro_subscription_v1'
};

const DEFAULT_PROFILES = [
  {
    id: 'personal',
    type: 'Personal',
    name: '',
    phone: '',
    email: '',
    title: '',
    company: '',
    linkedin: '',
    website: '',
    color: '#00C9A7',
    avatar: '', // Custom center logo/avatar data URL or Supabase storage URL
    qrMode: 'vcard' // 'vcard', 'whatsapp', 'sms'
  },
  {
    id: 'business',
    type: 'Business',
    name: '',
    phone: '',
    email: '',
    title: '',
    company: '',
    linkedin: '',
    website: '',
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
    const profiles = JSON.parse(data);
    // Sanitize any legacy hardcoded placeholder data
    const cleaned = profiles.map(p => {
      const copy = { ...p };
      if (copy.name === 'Jane Doe') copy.name = '';
      if (copy.phone && copy.phone.startsWith('+1 555-')) copy.phone = '';
      if (copy.email && (copy.email === 'jane.doe@gmail.com' || copy.email === 'jane.doe@company.com')) copy.email = '';
      if (copy.company === 'Google' || copy.company === 'Connect Inc.') copy.company = '';
      if (copy.title === 'Product Manager' || copy.title === 'Senior Solutions Lead') copy.title = '';
      if (copy.linkedin && copy.linkedin.includes('janedoe')) copy.linkedin = '';
      if (copy.website && (copy.website.includes('janedoe.me') || copy.website.includes('connectapp.io'))) copy.website = '';
      return copy;
    });
    return cleaned;
  } catch (e) {
    return DEFAULT_PROFILES;
  }
}

export function saveProfiles(profiles) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    triggerBackgroundSync();
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
    phone: burner.phone || '',
    purpose: burner.purpose || 'Marketplace / Temporary',
    expiresAt: burner.expiresAt || (Date.now() + 24 * 60 * 60 * 1000), // Default 24 hours
    color: '#E63946'
  };
  burners.unshift(newBurner);
  localStorage.setItem(STORAGE_KEYS.BURNER_PROFILES, JSON.stringify(burners));
  triggerBackgroundSync();
  return newBurner;
}

export function deleteBurnerProfile(id) {
  const burners = loadBurnerProfiles().filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEYS.BURNER_PROFILES, JSON.stringify(burners));
  triggerBackgroundSync();
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
  triggerBackgroundSync();
  return newContact;
}

export function deleteContactFromVault(contactId) {
  const contacts = loadSavedContacts().filter(c => c.id !== contactId);
  localStorage.setItem(STORAGE_KEYS.SAVED_CONTACTS, JSON.stringify(contacts));
  triggerBackgroundSync();
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
  triggerBackgroundSync();
  return newItem;
}

export function deleteUtilityQR(id) {
  const items = loadUtilityQRs().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.UTILITY_QRS, JSON.stringify(items));
  triggerBackgroundSync();
}

export function getAnalytics() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    if (!data) {
      const defaultAnalytics = {
        totalShares: 0,
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
    return { totalShares: 0, whatsappClicks: 0, telegramClicks: 0, wallpaperViews: 0, contactsSaved: 0 };
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

// ==========================================
// FEATURE: CONNECT PRO SUBSCRIPTION & PAYWALL
// ==========================================

export function getSubscriptionState() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRO_SUBSCRIPTION);
    if (!data) return { isPro: false, planType: 'free' };
    const sub = JSON.parse(data);
    // Check if expired for recurring subscriptions if expiration date is set
    if (sub.expiresAt && new Date(sub.expiresAt).getTime() < Date.now()) {
      return { isPro: false, planType: 'expired', ref: sub.ref };
    }
    return sub;
  } catch (e) {
    return { isPro: false, planType: 'free' };
  }
}

export function isProSubscribed() {
  const sub = getSubscriptionState();
  return Boolean(sub && sub.isPro);
}

export function saveSubscriptionState(details) {
  const subData = {
    isPro: true,
    planType: details.planType || 'recurring_monthly', // 'recurring_monthly', 'recurring_annual', 'lifetime', 'promo'
    planName: details.planName || 'Connect Pro',
    ref: details.ref || 'SUB_' + Math.floor(Math.random() * 10000000),
    activatedAt: details.activatedAt || new Date().toISOString(),
    expiresAt: details.expiresAt || null, // null for lifetime or active sub
    email: details.email || ''
  };
  localStorage.setItem(STORAGE_KEYS.PRO_SUBSCRIPTION, JSON.stringify(subData));
  logAnalyticsEvent('pro_upgraded', subData.planType);
  triggerBackgroundSync();
  return subData;
}

export function cancelSubscription() {
  localStorage.removeItem(STORAGE_KEYS.PRO_SUBSCRIPTION);
  triggerBackgroundSync();
}

export function redeemPromoCode(inputCode) {
  const code = (inputCode || '').trim().toUpperCase();
  const validCodes = {
    'CONNECTPRO': { planType: 'promo', planName: 'Connect Pro (VIP Access)' },
    'CONNECTPRO2026': { planType: 'promo', planName: 'Connect Pro (2026 Early Adopter)' },
    'VIP2026': { planType: 'promo', planName: 'Connect VIP Lifetime Pass' },
    'PRO30DAYS': { planType: 'promo', planName: 'Connect Pro (30 Days Trial)', durationDays: 30 }
  };

  // 1. Static Code Match
  if (validCodes[code]) {
    const info = validCodes[code];
    let expiresAt = null;
    if (info.durationDays) {
      expiresAt = new Date(Date.now() + info.durationDays * 24 * 60 * 60 * 1000).toISOString();
    }
    const sub = saveSubscriptionState({
      planType: info.planType,
      planName: info.planName,
      ref: 'PROMO_' + code,
      expiresAt: expiresAt
    });
    return { success: true, message: `🎉 Code redeemed! You now have ${info.planName}.`, sub };
  }

  // 2. Dynamic VIP Code Match (e.g. VIP-1234, VIP-MOKARS, PASS-8899)
  if (code.startsWith('VIP-') || code.startsWith('PASS-')) {
    const sub = saveSubscriptionState({
      planType: 'promo',
      planName: `Connect VIP Pass (${code})`,
      ref: 'DYNAMIC_' + code,
      expiresAt: null
    });
    return { success: true, message: `🎉 VIP Code ${code} activated! Full Pro features unlocked.`, sub };
  }

  return { success: false, message: 'Invalid or expired promo code. Please check and try again.' };
}

