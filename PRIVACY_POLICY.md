# Privacy Policy for Connect - Digital Identity & Smart Contact Pass

**Effective Date:** September 27, 2026  
**Developer:** Mokars Tech  
**Contact Email:** support@mokarstech.com / mokarstech@gmail.com  
**Public Privacy Policy URL:** `https://your-domain.com/privacy.html` (or deployed URL)

---

## 1. Overview
This Privacy Policy explains how **Connect** ("the App", "we", "us", or "our"), developed by **Mokars Tech**, collects, uses, stores, and protects your information when you use our mobile application and related services.

Connect is designed with a strict **Privacy-First & Local-First** architecture. We do not sell, rent, or monetize your personal information.

---

## 2. Information We Process
Connect allows you to create and share customizable digital business cards, contact passes, and QR codes. We may process the following categories of information that you explicitly enter into the App:

- **Identity & Contact Details:** Full Name, Phone Number, Job Title, Company / Organization Name, and Email Address.
- **Social Media Profiles & Handles:** Usernames and links to platforms you add (Instagram, WhatsApp, Telegram, TikTok, LinkedIn, 𝕏 / Twitter, Facebook, YouTube, GitHub, Snapchat).
- **Custom Brand Logos & Avatars:** Profile photos or company logos you choose to embed in your card.
- **Payment Details (Optional):** Mobile Money (MoMo) account numbers you provide for direct peer-to-peer payment QR codes.
- **Saved Connections:** Contact cards and QR codes of other users you scan and choose to save into your "Connections Vault".
- **Utility Data:** Wi-Fi network credentials or custom URLs you convert into utility QR codes.

---

## 3. Storage and Data Processing
- **Offline Local Storage:** By default, all profiles, QR code configurations, saved connections, and interaction analytics are stored strictly on your device's local encrypted storage sandbox (HTML5 LocalStorage / IndexedDB). No contact data is transmitted to external servers during regular offline operation.
- **Optional Cloud Sync (Supabase):** If you explicitly enable Cloud Sync, your encrypted profiles and contacts are backed up to your designated cloud database to allow multi-device restore. You can disable this feature at any time.

---

## 4. Device Permissions Requested & Justification

### A. Camera Permission (`android.permission.CAMERA`)
- **Purpose:** Used exclusively in real-time when you open the in-app QR scanner to scan another user's contact QR code.
- **Data Protection:** The camera stream is decoded instantly in local memory and is **never recorded, stored, or transmitted** to any remote server.

### B. Storage & Media Access (`READ_EXTERNAL_STORAGE` / Photos)
- **Purpose:** Used solely when you choose to:
  1. Upload a photo or logo from your gallery for your contact pass.
  2. Select an existing QR image from your gallery to scan.
  3. Save exported lock screen wallpapers and `.vcf` contact files to your device storage.

### C. Internet & Network (`android.permission.INTERNET`)
- **Purpose:** Used to launch external deep-links (such as opening WhatsApp, Instagram, or email when you tap a contact button) and to support optional cloud backup if enabled.

---

## 5. Third-Party Services
When you scan or share a contact card containing external social media links (e.g., `wa.me` for WhatsApp, `t.me` for Telegram, `instagram.com`), clicking those buttons will open the corresponding third-party application or website. Those external services operate under their own independent privacy policies.

---

## 6. User Control, Data Retention & Deletion Rights
You have full ownership and control over your data at all times:
- **Edit / Modify:** You can edit or replace any profile information, social media handle, or contact at any time in the "Customize Card" editor.
- **Individual Deletion:** You can remove saved contacts from your vault or delete custom profiles whenever you wish.
- **Complete Data Erasure:** You can instantly wipe all stored application data, profiles, and cached connections by tapping *"Reset App Data"* in the app's settings menu or by clearing the app data via Android Settings.

---

## 7. Children's Privacy (COPPA Compliance)
Connect is not directed at children under the age of 13. We do not knowingly collect or solicit personal information from children. If you believe that a child has provided us with personal information, please contact us so we can take appropriate action.

---

## 8. Security
We implement strict industry-standard security measures to safeguard your information. Because Connect is architected around on-device processing and client-side QR generation, your contact card data is not susceptible to remote central server database breaches.

---

## 9. Changes to This Privacy Policy
We may update our Privacy Policy periodically to reflect new features or regulatory requirements. Any updates will be published with an updated "Effective Date" and will be accessible directly within the Connect app.

---

## 10. Contact Information
If you have any questions, concerns, or requests regarding this Privacy Policy or your data privacy, please reach out to:

- **Developer:** Mokars Tech
- **Email:** support@mokarstech.com
- **Alternative:** mokarstech@gmail.com
