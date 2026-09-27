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

export function getSocialLink(platform, handle) {
  if (!handle) return '#';
  const clean = handle.trim().replace(/^@/, '');
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;

  switch ((platform || '').toLowerCase()) {
    case 'whatsapp': {
      const numOnly = clean.replace(/[^\d+]/g, '').replace('+', '');
      return `https://wa.me/${numOnly}`;
    }
    case 'instagram':
      return `https://instagram.com/${clean}`;
    case 'linkedin':
      return `https://linkedin.com/in/${clean}`;
    case 'twitter':
    case 'x':
      return `https://x.com/${clean}`;
    case 'tiktok':
      return `https://tiktok.com/@${clean}`;
    case 'telegram': {
      const isNum = /^(\+?\d+)$/.test(clean);
      return isNum ? `https://t.me/+${clean.replace('+', '')}` : `https://t.me/${clean}`;
    }
    case 'facebook':
      return `https://facebook.com/${clean}`;
    case 'youtube':
      return `https://youtube.com/@${clean}`;
    case 'github':
      return `https://github.com/${clean}`;
    case 'snapchat':
      return `https://snapchat.com/add/${clean}`;
    default:
      return clean.startsWith('http') ? clean : `https://${clean}`;
  }
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

  // Social Media Handles (1 for Free, up to 4 for Pro)
  if (Array.isArray(profile.socials)) {
    profile.socials.forEach(s => {
      if (s && s.handle && s.platform) {
        const link = getSocialLink(s.platform, s.handle);
        const p = s.platform.toLowerCase();
        vcard += `X-SOCIALPROFILE;TYPE=${p}:${link}\n`;
        vcard += `URL;TYPE=${p.toUpperCase()}:${link}\n`;
        vcard += `X-${p.toUpperCase()}:${s.handle}\n`;
      }
    });
  }

  if (profile.momoNetwork && profile.momoNumber) {
    vcard += `NOTE:Mobile Money (${profile.momoNetwork}): ${profile.momoNumber}\n`;
  }

  // Add WhatsApp & Telegram vCard Social Extensions if phone is set
  if (cleanedPhone) {
    vcard += `X-SOCIALPROFILE;TYPE=whatsapp:https://wa.me/${cleanedPhone.replace('+', '')}\n`;
    vcard += `X-SOCIALPROFILE;TYPE=telegram:https://t.me/+${cleanedPhone.replace('+', '')}\n`;
  }

  vcard += `REV:${new Date().toISOString()}\n`;
  vcard += `END:VCARD`;

  return vcard;
}

export function parseVCardText(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();

  // 1. WhatsApp direct link: https://wa.me/2330546920418 or https://api.whatsapp.com/send?phone=...
  if (trimmed.includes('wa.me/') || trimmed.includes('whatsapp.com/send')) {
    let phone = '';
    const waMatch = trimmed.match(/wa\.me\/(\+?\d+)/);
    if (waMatch) {
      phone = waMatch[1].startsWith('+') ? waMatch[1] : `+${waMatch[1]}`;
    } else {
      const phoneParamMatch = trimmed.match(/phone=(\+?\d+)/);
      if (phoneParamMatch) {
        phone = phoneParamMatch[1].startsWith('+') ? phoneParamMatch[1] : `+${phoneParamMatch[1]}`;
      }
    }
    return {
      name: 'WhatsApp Contact',
      phone: phone || trimmed,
      email: '',
      title: 'WhatsApp Direct',
      company: '',
      linkedin: '',
      website: '',
      whatsapp: phone || trimmed,
      socials: [{ platform: 'whatsapp', handle: phone || trimmed, url: trimmed }]
    };
  }

  // 2. Telegram direct link: https://t.me/+233... or https://t.me/username
  if (trimmed.includes('t.me/')) {
    const tgMatch = trimmed.match(/t\.me\/(\+?\d+)/);
    const phone = tgMatch ? (tgMatch[1].startsWith('+') ? tgMatch[1] : `+${tgMatch[1]}`) : '';
    const username = !phone ? trimmed.split('t.me/')[1]?.replace(/[\/?].*$/, '') : '';
    return {
      name: username ? `@${username}` : 'Telegram Contact',
      phone: phone,
      email: '',
      title: 'Telegram User',
      company: '',
      linkedin: '',
      website: '',
      telegram: phone || username || trimmed,
      socials: [{ platform: 'telegram', handle: phone || username || trimmed, url: trimmed }]
    };
  }

  // 3. Instagram direct link
  if (trimmed.includes('instagram.com/')) {
    const igUser = trimmed.split('instagram.com/')[1]?.replace(/[\/?].*$/, '') || 'User';
    return {
      name: `@${igUser}`,
      phone: '',
      email: '',
      title: 'Instagram Profile',
      company: '',
      instagram: igUser,
      website: '',
      socials: [{ platform: 'instagram', handle: igUser, url: trimmed }]
    };
  }

  // 4. TikTok direct link
  if (trimmed.includes('tiktok.com/')) {
    const ttUser = trimmed.split('tiktok.com/@')[1]?.replace(/[\/?].*$/, '') || 'User';
    return {
      name: `@${ttUser}`,
      phone: '',
      email: '',
      title: 'TikTok Profile',
      company: '',
      tiktok: ttUser,
      website: '',
      socials: [{ platform: 'tiktok', handle: ttUser, url: trimmed }]
    };
  }

  // 5. SMS / Tel URI: sms:+233... or tel:+233... or SMSTO:+233...
  if (/^(sms|tel|smsto):/i.test(trimmed)) {
    const cleanNum = trimmed.replace(/^(sms|tel|smsto):/i, '').split(/[?:]/)[0].trim();
    return {
      name: 'Phone Contact',
      phone: cleanNum,
      email: '',
      title: '',
      company: '',
      linkedin: '',
      website: '',
      socials: []
    };
  }

  // 6. Raw phone number
  if (/^(\+?\d[\d\s\-()]{6,})$/.test(trimmed)) {
    return {
      name: 'Scanned Contact',
      phone: trimmed.replace(/[\s\-()]/g, ''),
      email: '',
      title: '',
      company: '',
      linkedin: '',
      website: '',
      socials: []
    };
  }

  // 7. JSON Format
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const data = JSON.parse(trimmed);
      const res = {
        name: data.name || data.FN || 'Scanned Contact',
        phone: data.phone || data.tel || '',
        email: data.email || '',
        title: data.title || '',
        company: data.company || data.org || '',
        linkedin: data.linkedin || '',
        website: data.website || data.url || '',
        socials: Array.isArray(data.socials) ? data.socials : []
      };
      if (data.instagram) res.instagram = data.instagram;
      if (data.tiktok) res.tiktok = data.tiktok;
      if (data.twitter || data.x) res.twitter = data.twitter || data.x;
      if (data.telegram) res.telegram = data.telegram;
      if (data.facebook) res.facebook = data.facebook;
      return res;
    } catch (e) {}
  }

  // 8. MECARD format: MECARD:N:Doe,John;TEL:12345;EMAIL:a@b.com;;
  if (/^MECARD:/i.test(trimmed)) {
    const result = {
      name: 'Scanned Contact',
      phone: '',
      email: '',
      title: '',
      company: '',
      linkedin: '',
      website: '',
      socials: []
    };
    const nMatch = trimmed.match(/N:([^;]+)/i);
    if (nMatch) result.name = nMatch[1].replace(',', ' ').trim();
    const telMatch = trimmed.match(/TEL:([^;]+)/i);
    if (telMatch) result.phone = telMatch[1].trim();
    const emailMatch = trimmed.match(/EMAIL:([^;]+)/i);
    if (emailMatch) result.email = emailMatch[1].trim();
    const orgMatch = trimmed.match(/ORG:([^;]+)/i);
    if (orgMatch) result.company = orgMatch[1].trim();
    const urlMatch = trimmed.match(/URL:([^;]+)/i);
    if (urlMatch) result.website = urlMatch[1].trim();
    return result;
  }

  // 9. Standard vCard format (vCard 2.1, 3.0, 4.0) with comprehensive multiline & social parser
  const result = {
    name: '',
    phone: '',
    email: '',
    title: '',
    company: '',
    linkedin: '',
    website: '',
    socials: []
  };

  let isVCard = false;
  const lines = trimmed.split(/\r\n|\r|\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (/^BEGIN:VCARD/i.test(line)) {
      isVCard = true;
      continue;
    }

    // FN (Formatted Name) e.g. FN:John Doe, FN;CHARSET=UTF-8:John Doe
    if (/^FN[;: ]/i.test(line)) {
      const idx = line.indexOf(':');
      if (idx !== -1) result.name = line.substring(idx + 1).trim();
    }
    // N (Name fallback if FN not set) e.g. N:LastName;FirstName;MiddleName;;
    else if (/^N[;: ]/i.test(line) && !result.name) {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const parts = line.substring(idx + 1).split(';');
        const last = (parts[0] || '').trim();
        const first = (parts[1] || '').trim();
        const middle = (parts[2] || '').trim();
        result.name = [first, middle, last].filter(Boolean).join(' ').trim();
      }
    }
    // TEL e.g. TEL:+123, TEL;TYPE=CELL,VOICE:+123
    else if (/^TEL[;: ]/i.test(line)) {
      const idx = line.indexOf(':');
      if (idx !== -1 && !result.phone) {
        result.phone = line.substring(idx + 1).trim();
      }
    }
    // EMAIL e.g. EMAIL;TYPE=INTERNET:user@test.com
    else if (/^EMAIL[;: ]/i.test(line)) {
      const idx = line.indexOf(':');
      if (idx !== -1 && !result.email) {
        result.email = line.substring(idx + 1).trim();
      }
    }
    // TITLE e.g. TITLE:Engineer, TITLE;CHARSET=UTF-8:Engineer
    else if (/^TITLE[;: ]/i.test(line)) {
      const idx = line.indexOf(':');
      if (idx !== -1) result.title = line.substring(idx + 1).trim();
    }
    // ORG e.g. ORG:Acme Corp
    else if (/^ORG[;: ]/i.test(line)) {
      const idx = line.indexOf(':');
      if (idx !== -1) result.company = line.substring(idx + 1).split(';')[0].trim();
    }
    // X-SOCIALPROFILE;TYPE=instagram:... or X-SOCIALPROFILE;TYPE=x:...
    else if (/^X-SOCIALPROFILE/i.test(line)) {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const val = line.substring(idx + 1).trim();
        const typeMatch = line.match(/TYPE=([a-zA-Z0-9_\-]+)/i);
        const platform = typeMatch ? typeMatch[1].toLowerCase() : (val.includes('instagram') ? 'instagram' : (val.includes('linkedin') ? 'linkedin' : (val.includes('tiktok') ? 'tiktok' : (val.includes('twitter') || val.includes('x.com') ? 'x' : (val.includes('telegram') || val.includes('t.me') ? 'telegram' : 'social')))));
        if (!result.socials.some(s => s.platform === platform && s.url === val)) {
          result.socials.push({ platform, handle: val, url: val });
        }
        if (platform === 'linkedin') result.linkedin = val;
        else if (platform === 'instagram') result.instagram = val;
        else if (platform === 'twitter' || platform === 'x') result.twitter = val;
        else if (platform === 'tiktok') result.tiktok = val;
        else if (platform === 'telegram') result.telegram = val;
        else if (platform === 'facebook') result.facebook = val;
        else if (platform === 'github') result.github = val;
        else if (platform === 'youtube') result.youtube = val;
        else if (platform === 'snapchat') result.snapchat = val;
      }
    }
    // Explicit X-INSTAGRAM, X-TIKTOK, X-TWITTER, X-LINKEDIN, X-TELEGRAM, etc.
    else if (/^X-(INSTAGRAM|TIKTOK|TWITTER|X|LINKEDIN|TELEGRAM|FACEBOOK|YOUTUBE|GITHUB|SNAPCHAT|WHATSAPP)[;: ]/i.test(line)) {
      const match = line.match(/^X-([A-Z0-9_\-]+)[;: ](.*)$/i);
      if (match) {
        const rawPlat = match[1].toLowerCase();
        const plat = (rawPlat === 'twitter') ? 'x' : rawPlat;
        let handleVal = match[2].trim();
        if (handleVal.startsWith(':')) handleVal = handleVal.substring(1).trim();
        if (handleVal) {
          const link = getSocialLink(plat, handleVal);
          result[plat] = handleVal;
          if (!result.socials.some(s => s.platform === plat)) {
            result.socials.push({ platform: plat, handle: handleVal, url: link });
          }
        }
      }
    }
    // URL
    else if (/^URL[;: ]/i.test(line)) {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const val = line.substring(idx + 1).trim();
        const lower = line.toLowerCase();
        if (lower.includes('instagram') || val.includes('instagram.com')) {
          result.instagram = val;
          if (!result.socials.some(s => s.platform === 'instagram')) result.socials.push({ platform: 'instagram', handle: val, url: val });
        } else if (lower.includes('linkedin') || val.includes('linkedin.com')) {
          result.linkedin = val;
          if (!result.socials.some(s => s.platform === 'linkedin')) result.socials.push({ platform: 'linkedin', handle: val, url: val });
        } else if (lower.includes('twitter') || lower.includes('type=x') || val.includes('x.com') || val.includes('twitter.com')) {
          result.twitter = val;
          if (!result.socials.some(s => s.platform === 'x' || s.platform === 'twitter')) result.socials.push({ platform: 'x', handle: val, url: val });
        } else if (lower.includes('tiktok') || val.includes('tiktok.com')) {
          result.tiktok = val;
          if (!result.socials.some(s => s.platform === 'tiktok')) result.socials.push({ platform: 'tiktok', handle: val, url: val });
        } else if (lower.includes('telegram') || val.includes('t.me')) {
          result.telegram = val;
          if (!result.socials.some(s => s.platform === 'telegram')) result.socials.push({ platform: 'telegram', handle: val, url: val });
        } else if (lower.includes('facebook') || val.includes('facebook.com')) {
          result.facebook = val;
          if (!result.socials.some(s => s.platform === 'facebook')) result.socials.push({ platform: 'facebook', handle: val, url: val });
        } else if (lower.includes('github') || val.includes('github.com')) {
          result.github = val;
          if (!result.socials.some(s => s.platform === 'github')) result.socials.push({ platform: 'github', handle: val, url: val });
        } else if (lower.includes('youtube') || val.includes('youtube.com')) {
          result.youtube = val;
          if (!result.socials.some(s => s.platform === 'youtube')) result.socials.push({ platform: 'youtube', handle: val, url: val });
        } else if (lower.includes('snapchat') || val.includes('snapchat.com')) {
          result.snapchat = val;
          if (!result.socials.some(s => s.platform === 'snapchat')) result.socials.push({ platform: 'snapchat', handle: val, url: val });
        } else if (!result.website) {
          result.website = val;
        }
      }
    }
    // NOTE (can contain social profile mentions)
    else if (/^NOTE[;: ]/i.test(line)) {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const noteContent = line.substring(idx + 1);
        const socialMatches = noteContent.matchAll(/(instagram|tiktok|twitter|x|linkedin|telegram|snapchat|facebook|youtube|github)\s*[:=]\s*(@?[a-zA-Z0-9_.\-]+)/gi);
        for (const sm of socialMatches) {
          const p = sm[1].toLowerCase() === 'twitter' ? 'x' : sm[1].toLowerCase();
          const h = sm[2].trim();
          result[p] = h;
          if (!result.socials.some(s => s.platform === p)) {
            result.socials.push({ platform: p, handle: h, url: getSocialLink(p, h) });
          }
        }
      }
    }
  }

  if (isVCard || result.name || result.phone || result.email || result.socials.length > 0) {
    if (!result.name) result.name = 'Scanned Contact';
    return result;
  }

  // 8. Generic URL
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      return {
        name: u.hostname.replace(/^www\./, ''),
        phone: '',
        email: '',
        title: 'Web Link',
        company: u.hostname,
        linkedin: trimmed.includes('linkedin') ? trimmed : '',
        website: trimmed
      };
    } catch (e) {}
  }

  // 9. Fallback generic text
  return {
    name: trimmed.length > 40 ? trimmed.substring(0, 40) + '...' : trimmed,
    phone: '',
    email: '',
    title: '',
    company: '',
    linkedin: '',
    website: ''
  };
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
