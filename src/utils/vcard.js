/**
 * Utility functions for generating, parsing, and exporting vCard (vCF) contact files,
 * as well as generating WhatsApp & Telegram direct messaging deep links.
 */

export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  // Keep digits and optional leading plus sign
  return phone.replace(/[^\d+]/g, '');
}

export function getWhatsAppLink(phone, text = 'Hi! I connected with you via Connect app.') {
  const cleaned = cleanPhoneNumber(phone);
  if (!cleaned) return '#';
  const numberOnly = cleaned.replace('+', '');
  return `https://wa.me/${numberOnly}?text=${encodeURIComponent(text)}`;
}

export function getTelegramLink(phone) {
  const cleaned = cleanPhoneNumber(phone);
  if (!cleaned) return '#';
  const numberOnly = cleaned.replace('+', '');
  return `https://t.me/+${numberOnly}`;
}

export function generateVCardString(profile) {
  const name = profile.name || '';
  const parts = name.trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  const cleanedPhone = cleanPhoneNumber(profile.phone);

  let vcard = `BEGIN:VCARD\nVERSION:3.0\n`;
  vcard += `N:${lastName};${firstName};;;\n`;
  vcard += `FN:${name}\n`;

  if (profile.phone) {
    vcard += `TEL;TYPE=CELL,VOICE:${profile.phone}\n`;
  }
  if (profile.email) {
    vcard += `EMAIL;TYPE=INTERNET:${profile.email}\n`;
  }
  if (profile.title) {
    vcard += `TITLE:${profile.title}\n`;
  }
  if (profile.company) {
    vcard += `ORG:${profile.company}\n`;
  }
  if (profile.linkedin) {
    let url = profile.linkedin;
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    vcard += `URL;TYPE=LINKEDIN:${url}\n`;
  }
  if (profile.website) {
    let url = profile.website;
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    vcard += `URL;TYPE=WORK:${url}\n`;
  }

  if (profile.momoNetwork && profile.momoNumber) {
    vcard += `NOTE:Mobile Money (${profile.momoNetwork}): ${profile.momoNumber}\n`;
  }

  // Add WhatsApp & Telegram vCard Social Extensions
  if (cleanedPhone) {
    vcard += `X-SOCIALPROFILE;TYPE=whatsapp:https://wa.me/${cleanedPhone.replace('+', '')}\n`;
    vcard += `X-SOCIALPROFILE;TYPE=telegram:https://t.me/+${cleanedPhone.replace('+', '')}\n`;
  }


  vcard += `REV:${new Date().toISOString()}\n`;
  vcard += `END:VCARD`;

  return vcard;
}

export function parseVCardText(text) {
  if (!text) return null;

  // Check if raw text is just a phone number
  const trimmed = text.trim();
  if (/^(\+?\d[\d\s\-()]{6,})$/.test(trimmed)) {
    return {
      name: 'Scanned Contact',
      phone: trimmed,
      email: '',
      title: '',
      company: '',
      linkedin: ''
    };
  }

  // Parse vCard text format
  const result = {
    name: 'Scanned Contact',
    phone: '',
    email: '',
    title: '',
    company: '',
    linkedin: '',
    website: ''
  };

  const lines = text.split(/\r\n|\r|\n/);
  lines.forEach(line => {
    if (line.startsWith('FN:')) {
      result.name = line.substring(3).trim();
    } else if (line.startsWith('TEL')) {
      const idx = line.indexOf(':');
      if (idx !== -1) result.phone = line.substring(idx + 1).trim();
    } else if (line.startsWith('EMAIL')) {
      const idx = line.indexOf(':');
      if (idx !== -1) result.email = line.substring(idx + 1).trim();
    } else if (line.startsWith('TITLE:')) {
      result.title = line.substring(6).trim();
    } else if (line.startsWith('ORG:')) {
      result.company = line.substring(4).trim();
    } else if (line.startsWith('URL;TYPE=LINKEDIN:') || (line.startsWith('URL:') && line.includes('linkedin'))) {
      const idx = line.indexOf(':');
      if (idx !== -1) result.linkedin = line.substring(idx + 1).trim();
    }
  });

  return result;
}

export function downloadVCardFile(profile) {
  const vcardContent = generateVCardString(profile);
  const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const fileName = `${(profile.name || 'contact').replace(/\s+/g, '_').toLowerCase()}.vcf`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
