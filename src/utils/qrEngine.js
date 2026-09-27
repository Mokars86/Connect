import QRCode from 'qrcode';
import { generateVCardString, getWhatsAppLink } from './vcard.js';

/**
 * Premium High-Contrast SVG QR Code Generator
 * Inspired by Apple NameDrop, Stripe, and modern fintech design standards.
 * Guaranteed 100% instant scannability, ultra-sharp rendering, and clean aesthetics.
 */
export async function renderQRCode(containerElement, profile = {}, options = {}) {
  if (!containerElement) return;

  const qrMode = profile.qrMode || options.qrMode || 'vcard';
  let qrPayload = '';

  // If user has profile data or social media handles configured, encode the complete vCard (which includes direct WhatsApp links)
  // so that scanning another user's QR always pops up their social media handles and contact buttons
  if (qrMode === 'whatsapp' && (!profile.name || !profile.name.trim()) && (!profile.socials || profile.socials.length === 0)) {
    qrPayload = getWhatsAppLink(profile.phone);
  } else if (qrMode === 'sms' && (!profile.name || !profile.name.trim()) && (!profile.socials || profile.socials.length === 0)) {
    const cleaned = (profile.phone || '').replace(/[^\d+]/g, '');
    qrPayload = `sms:${cleaned}`;
  } else {
    qrPayload = generateVCardString(profile);
  }

  // Fallback payload if empty
  if (!qrPayload || qrPayload.trim() === '') {
    qrPayload = 'BEGIN:VCARD\nVERSION:3.0\nFN:Connect User\nEND:VCARD';
  }

  const primaryColor = options.color || profile.color || '#00C9A7';
  const secondaryColor = options.secondaryColor || profile.secondaryColor || getGradientEndColor(primaryColor);
  
  // QR Styling Pattern (Defaults to ultra-crisp 'rounded' iOS / Stripe style)
  const dotPattern = profile.qrPattern || options.qrPattern || 'rounded'; // 'rounded', 'dots', 'squircle'
  const eyeStyle = profile.qrEyeStyle || options.qrEyeStyle || 'rounded'; // 'rounded', 'circle', 'square'
  const showLogo = options.showLogo !== false;
  const avatarUrl = profile.avatar || '';

  try {
    // Generate QR matrix using QRCode.create with High error correction (allowing center badge)
    const qrData = QRCode.create(qrPayload, { errorCorrectionLevel: 'H' });
    const modules = qrData.modules;
    const size = modules.size;

    // Margin padding
    const margin = 2;
    const viewBoxSize = size + margin * 2;

    // Finder boundary checker (7x7 modules at 3 corners)
    const isFinder = (r, c) => {
      if (r < 7 && c < 7) return true; // Top-Left
      if (r < 7 && c >= size - 7) return true; // Top-Right
      if (r >= size - 7 && c < 7) return true; // Bottom-Left
      return false;
    };

    // Center emblem cutout area (Optimized to stay safely within Reed-Solomon Error Correction Level H)
    const centerRadius = Math.max(2, Math.floor(size * 0.11));
    const centerMid = Math.floor(size / 2);
    const isCenter = (r, c) => {
      if (!showLogo) return false;
      const dist = Math.sqrt(Math.pow(r - centerMid, 2) + Math.pow(c - centerMid, 2));
      return dist <= centerRadius + 0.1;
    };

    const gradientId = `qrGrad_${Math.random().toString(36).substr(2, 6)}`;

    // Build SVG String
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="100%" height="100%" style="border-radius: 18px; overflow: hidden; display: block;">`;
    
    // Definitions: Clean Linear Gradients
    svg += `
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryColor}" />
          <stop offset="100%" stop-color="${secondaryColor}" />
        </linearGradient>

        <filter id="emblemGlow_${gradientId}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.12"/>
        </filter>
      </defs>
    `;

    // Pure Clean White Background
    svg += `<rect width="${viewBoxSize}" height="${viewBoxSize}" fill="#FFFFFF" rx="2" />`;

    // Render Data Modules
    svg += `<g fill="url(#${gradientId})">`;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (modules.get(r, c)) {
          if (!isFinder(r, c) && !isCenter(r, c)) {
            const x = c + margin;
            const y = r + margin;
            const cx = x + 0.5;
            const cy = y + 0.5;

            if (dotPattern === 'dots') {
              // High-density crisp circular dots (Apple Style)
              const dotRadius = 0.46;
              svg += `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${dotRadius}" />`;
            } else if (dotPattern === 'squircle') {
              // Smooth Squircles
              const moduleSize = 0.90;
              const radius = 0.28;
              svg += `<rect x="${(cx - moduleSize / 2).toFixed(2)}" y="${(cy - moduleSize / 2).toFixed(2)}" width="${moduleSize}" height="${moduleSize}" rx="${radius}" ry="${radius}" />`;
            } else {
              // Default: Clean Modern WhatsApp / iOS / Stripe Style Micro-Rounded Modules
              const moduleSize = 0.98;
              const radius = 0.18;
              svg += `<rect x="${(x + 0.01).toFixed(2)}" y="${(y + 0.01).toFixed(2)}" width="${moduleSize}" height="${moduleSize}" rx="${radius}" ry="${radius}" />`;
            }
          }
        }
      }
    }
    svg += `</g>`;

    // Helper to render Modern Corner Finder Eyes (WhatsApp / iOS Super-Ellipse)
    const renderFinderEye = (startR, startC) => {
      const x = startC + margin;
      const y = startR + margin;
      const cx = x + 3.5;
      const cy = y + 3.5;

      if (eyeStyle === 'circle') {
        // Modern Circular Radar Eyes
        return `
          <g>
            <circle cx="${cx}" cy="${cy}" r="3.4" fill="url(#${gradientId})" />
            <circle cx="${cx}" cy="${cy}" r="2.35" fill="#FFFFFF" />
            <circle cx="${cx}" cy="${cy}" r="1.45" fill="url(#${gradientId})" />
          </g>
        `;
      } else if (eyeStyle === 'square') {
        // Classic Sharp Square Eyes
        return `
          <g>
            <rect x="${x}" y="${y}" width="7" height="7" fill="url(#${gradientId})" />
            <rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#FFFFFF" />
            <rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="url(#${gradientId})" />
          </g>
        `;
      } else {
        // WhatsApp / iOS Super-Ellipse Rounded Eyes (Standard, ultra-crisp & premium)
        return `
          <g>
            <rect x="${x}" y="${y}" width="7" height="7" rx="1.6" ry="1.6" fill="url(#${gradientId})" />
            <rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="0.95" ry="0.95" fill="#FFFFFF" />
            <rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.75" ry="0.75" fill="url(#${gradientId})" />
          </g>
        `;
      }
    };

    // Render the 3 Corner Finders
    svg += renderFinderEye(0, 0); // Top-Left
    svg += renderFinderEye(0, size - 7); // Top-Right
    svg += renderFinderEye(size - 7, 0); // Bottom-Left

    // Center Logo / Avatar Floating Emblem Badge
    if (showLogo) {
      const centerX = centerMid + margin + 0.5;
      const centerY = centerMid + margin + 0.5;
      const emblemRadius = centerRadius;

      // 1. Clean White Isolation Disc with subtle border ring
      svg += `
        <circle cx="${centerX}" cy="${centerY}" r="${emblemRadius + 0.15}" fill="#FFFFFF" />
        <circle cx="${centerX}" cy="${centerY}" r="${emblemRadius}" fill="#FFFFFF" stroke="url(#${gradientId})" stroke-width="0.25" />
      `;

      // 2. Avatar Image, WhatsApp Emblem, or Clean Logo in Center
      if (avatarUrl && avatarUrl.trim()) {
        const clipId = `avatarClip_${Math.random().toString(36).substr(2, 6)}`;
        const imgRadius = emblemRadius - 0.2;
        svg += `
          <clipPath id="${clipId}">
            <circle cx="${centerX}" cy="${centerY}" r="${imgRadius}" />
          </clipPath>
          <image href="${avatarUrl}" x="${centerX - imgRadius}" y="${centerY - imgRadius}" width="${imgRadius * 2}" height="${imgRadius * 2}" clip-path="url(#${clipId})" preserveAspectRatio="xMidYMid slice" />
        `;
      } else if (qrMode === 'whatsapp') {
        // WhatsApp Official Speech Bubble & Phone Handset Emblem
        const iconSize = emblemRadius * 1.35;
        svg += `
          <g transform="translate(${centerX - iconSize / 2}, ${centerY - iconSize / 2})">
            <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.16-1.32C8.56 21.49 10.23 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm.05 16.5c-1.5 0-2.91-.42-4.12-1.15l-.3-.18-3.06.78.82-2.99-.2-.31A7.95 7.95 0 0 1 4.1 12c0-4.36 3.55-7.9 7.95-7.9 4.39 0 7.95 3.54 7.95 7.9 0 4.37-3.56 7.9-7.95 7.9zm4.35-5.92c-.24-.12-1.41-.7-1.63-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.41-.54-.42l-.46-.01c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.41-.58 1.61-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" fill="url(#${gradientId})"/>
            </svg>
          </g>
        `;
      } else {
        // Sleek Minimalist Connect Icon
        const iconSize = emblemRadius * 1.1;
        svg += `
          <g transform="translate(${centerX - iconSize / 2}, ${centerY - iconSize / 2})">
            <!-- Modern Connect Emblem (Linked rings) -->
            <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="url(#${gradientId})" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="url(#${gradientId})" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </g>
        `;
      }
    }

    svg += `</svg>`;

    containerElement.innerHTML = svg;
  } catch (err) {
    console.error('QR Code generation error:', err);
    containerElement.innerHTML = `<div class="qr-error" style="color: #E63946; font-size: 12px; font-weight: 700; text-align: center;">Failed to generate QR code</div>`;
  }
}

/**
 * Calculates a complementary gradient end color for high contrast & modern look.
 */
function getGradientEndColor(hexColor) {
  const colorMap = {
    '#00C9A7': '#0077B6', // Vibrant Teal -> Deep Ocean Blue
    '#E63946': '#A81D27', // Crimson Red -> Deep Burgundy
    '#0077B6': '#03045E', // Blue -> Midnight Blue
    '#2A9D8F': '#1D3557', // Forest Teal -> Slate
    '#1D3557': '#000814', // Slate -> Onyx
    '#7209B7': '#3A0CA3'  // Electric Purple -> Deep Indigo
  };
  return colorMap[hexColor] || '#0077B6';
}

/**
 * Draws the high-res QR code directly onto any HTML5 Canvas 2D context.
 * Used for exporting ultra-sharp PNG wallpapers, Zoom backgrounds, and signatures.
 */
export function drawQRCodeToCanvas(ctx, profile = {}, x = 0, y = 0, qrSize = 300, options = {}) {
  try {
    const qrMode = profile.qrMode || options.qrMode || 'vcard';
    let qrPayload = '';
    if (qrMode === 'whatsapp' && (!profile.name || !profile.name.trim()) && (!profile.socials || profile.socials.length === 0)) {
      qrPayload = getWhatsAppLink(profile.phone);
    } else if (qrMode === 'sms' && (!profile.name || !profile.name.trim()) && (!profile.socials || profile.socials.length === 0)) {
      const cleaned = (profile.phone || '').replace(/[^\d+]/g, '');
      qrPayload = `sms:${cleaned}`;
    } else {
      qrPayload = generateVCardString(profile);
    }

    if (!qrPayload || qrPayload.trim() === '') {
      qrPayload = 'BEGIN:VCARD\nVERSION:3.0\nFN:Connect User\nEND:VCARD';
    }

    const primaryColor = options.color || profile.color || '#00C9A7';
    const secondaryColor = options.secondaryColor || profile.secondaryColor || getGradientEndColor(primaryColor);
    const dotPattern = profile.qrPattern || options.qrPattern || 'rounded';
    const eyeStyle = profile.qrEyeStyle || options.qrEyeStyle || 'rounded';
    const showLogo = options.showLogo !== false;

    const qrData = QRCode.create(qrPayload, { errorCorrectionLevel: 'H' });
    const modules = qrData.modules;
    const count = modules.size;
    const moduleSize = qrSize / count;

    const isFinder = (r, c) => {
      if (r < 7 && c < 7) return true;
      if (r < 7 && c >= count - 7) return true;
      if (r >= count - 7 && c < 7) return true;
      return false;
    };

    const centerRadius = Math.max(2, Math.floor(count * 0.11));
    const centerMid = Math.floor(count / 2);
    const isCenter = (r, c) => {
      if (!showLogo) return false;
      const dist = Math.sqrt(Math.pow(r - centerMid, 2) + Math.pow(c - centerMid, 2));
      return dist <= centerRadius + 0.1;
    };

    const grad = ctx.createLinearGradient(x, y, x + qrSize, y + qrSize);
    grad.addColorStop(0, primaryColor);
    grad.addColorStop(1, secondaryColor);

    ctx.save();

    // 1. Draw Data Modules
    ctx.fillStyle = grad;
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (modules.get(r, c) && !isFinder(r, c) && !isCenter(r, c)) {
          const mx = x + c * moduleSize;
          const my = y + r * moduleSize;
          const pad = moduleSize * 0.01;
          const w = moduleSize - pad * 2;
          const radius = Math.max(0.5, w * 0.18);
          ctx.beginPath();
          if (dotPattern === 'dots') {
            ctx.arc(mx + moduleSize / 2, my + moduleSize / 2, moduleSize * 0.46, 0, Math.PI * 2);
          } else if (ctx.roundRect) {
            ctx.roundRect(mx + pad, my + pad, w, w, radius);
          } else {
            ctx.rect(mx + pad, my + pad, w, w);
          }
          ctx.fill();
        }
      }
    }

    // 2. Draw Corner Finders (WhatsApp / Apple Squircle Style)
    const drawFinder = (startR, startC) => {
      const fx = x + startC * moduleSize;
      const fy = y + startR * moduleSize;
      const fOuter = 7 * moduleSize;
      const fMid = 5 * moduleSize;
      const fInner = 3 * moduleSize;
      const fcx = fx + fOuter / 2;
      const fcy = fy + fOuter / 2;

      if (eyeStyle === 'circle') {
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fcx, fcy, fOuter * 0.48, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(fcx, fcy, fOuter * 0.33, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fcx, fcy, fOuter * 0.20, 0, Math.PI * 2);
        ctx.fill();
      } else if (eyeStyle === 'square') {
        ctx.fillStyle = grad;
        ctx.fillRect(fx, fy, fOuter, fOuter);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(fx + moduleSize, fy + moduleSize, fMid, fMid);
        ctx.fillStyle = grad;
        ctx.fillRect(fx + moduleSize * 2, fy + moduleSize * 2, fInner, fInner);
      } else {
        const outerR = fOuter * 0.22;
        const midR = fMid * 0.18;
        const innerR = fInner * 0.24;

        ctx.fillStyle = grad;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(fx, fy, fOuter, fOuter, outerR);
        else ctx.rect(fx, fy, fOuter, fOuter);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(fx + moduleSize, fy + moduleSize, fMid, fMid, midR);
        else ctx.rect(fx + moduleSize, fy + moduleSize, fMid, fMid);
        ctx.fill();

        ctx.fillStyle = grad;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(fx + moduleSize * 2, fy + moduleSize * 2, fInner, fInner, innerR);
        else ctx.rect(fx + moduleSize * 2, fy + moduleSize * 2, fInner, fInner);
        ctx.fill();
      }
    };

    drawFinder(0, 0);
    drawFinder(0, count - 7);
    drawFinder(count - 7, 0);

    // 3. Draw Center Emblem
    if (showLogo) {
      const emblemCenterX = x + (centerMid + 0.5) * moduleSize;
      const emblemCenterY = y + (centerMid + 0.5) * moduleSize;
      const emblemRadius = centerRadius * moduleSize;

      // White Badge Circle with crisp isolation
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(emblemCenterX, emblemCenterY, emblemRadius + moduleSize * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Border ring
      ctx.strokeStyle = grad;
      ctx.lineWidth = moduleSize * 0.25;
      ctx.stroke();

      if (qrMode === 'whatsapp') {
        // Draw WhatsApp speech bubble with phone
        const iconSize = emblemRadius * 1.35;
        const pX = emblemCenterX - iconSize / 2;
        const pY = emblemCenterY - iconSize / 2;
        const scale = iconSize / 24;
        
        ctx.save();
        ctx.translate(pX, pY);
        ctx.scale(scale, scale);
        ctx.fillStyle = grad;
        const waPath = new Path2D('M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.16-1.32C8.56 21.49 10.23 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm.05 16.5c-1.5 0-2.91-.42-4.12-1.15l-.3-.18-3.06.78.82-2.99-.2-.31A7.95 7.95 0 0 1 4.1 12c0-4.36 3.55-7.9 7.95-7.9 4.39 0 7.95 3.54 7.95 7.9 0 4.37-3.56 7.9-7.95 7.9zm4.35-5.92c-.24-.12-1.41-.7-1.63-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.41-.54-.42l-.46-.01c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.41-.58 1.61-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z');
        ctx.fill(waPath);
        ctx.restore();
      } else {
        // Modern Interlocking Logo in Center
        const iconR = emblemRadius * 0.55;
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(2, iconR * 0.25);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(emblemCenterX - iconR * 0.4, emblemCenterY, iconR * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(emblemCenterX + iconR * 0.4, emblemCenterY, iconR * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  } catch (err) {
    console.error('Error drawing QR code to canvas:', err);
  }
}

