import QRCode from 'qrcode';
import { generateVCardString, getWhatsAppLink } from './vcard.js';

/**
 * Modern High-Fidelity SVG QR Code Generator with Rounded Dots & Gradient Styling.
 * Produces ultra-modern, beautiful QR codes matching premium fintech & iOS design systems.
 */
export async function renderQRCode(containerElement, profile = {}, options = {}) {
  if (!containerElement) return;

  const qrMode = profile.qrMode || options.qrMode || 'vcard';
  let qrPayload = '';

  if (qrMode === 'whatsapp') {
    qrPayload = getWhatsAppLink(profile.phone);
  } else if (qrMode === 'sms') {
    const cleaned = (profile.phone || '').replace(/[^\d+]/g, '');
    qrPayload = `sms:${cleaned}`;
  } else {
    qrPayload = generateVCardString(profile);
  }

  const primaryColor = options.color || profile.color || '#00C9A7';
  const secondaryColor = options.secondaryColor || getGradientEndColor(primaryColor);
  const showLogo = options.showLogo !== false;
  const avatarUrl = profile.avatar || '/logo.png';

  try {
    // Generate QR matrix using QRCode.create
    const qrData = QRCode.create(qrPayload, { errorCorrectionLevel: 'H' });
    const modules = qrData.modules;
    const size = modules.size;

    // Margin padding
    const margin = 2;
    const viewBoxSize = size + margin * 2;

    // Finders bounds (7x7 modules at 3 corners)
    const isFinder = (r, c) => {
      if (r < 7 && c < 7) return true; // Top-Left
      if (r < 7 && c >= size - 7) return true; // Top-Right
      if (r >= size - 7 && c < 7) return true; // Bottom-Left
      return false;
    };

    // Center emblem area (cut out center ~25% of grid)
    const centerRadius = Math.floor(size * 0.22);
    const centerMid = Math.floor(size / 2);
    const isCenter = (r, c) => {
      if (!showLogo) return false;
      const dist = Math.sqrt(Math.pow(r - centerMid, 2) + Math.pow(c - centerMid, 2));
      return dist <= centerRadius;
    };

    const gradientId = `qrGrad_${Math.random().toString(36).substr(2, 6)}`;

    // Build SVG String
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="100%" height="100%" style="border-radius: 16px; overflow: hidden;">`;
    
    // Definitions: Gradients & Filters
    svg += `
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryColor}" />
          <stop offset="100%" stop-color="${secondaryColor}" />
        </linearGradient>
        <filter id="glow_${gradientId}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="${primaryColor}" flood-opacity="0.25"/>
        </filter>
      </defs>
    `;

    // Background
    svg += `<rect width="${viewBoxSize}" height="${viewBoxSize}" fill="#FFFFFF" rx="2" />`;

    // Modern Rounded Data Modules Group
    svg += `<g fill="url(#${gradientId})">`;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (modules.get(r, c)) {
          if (!isFinder(r, c) && !isCenter(r, c)) {
            const x = c + margin + 0.08;
            const y = r + margin + 0.08;
            const moduleSize = 0.84;
            const radius = 0.35; // Soft rounded squircle dots
            svg += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${moduleSize}" height="${moduleSize}" rx="${radius}" ry="${radius}" />`;
          }
        }
      }
    }
    svg += `</g>`;

    // Helper to render Modern Rounded Corner Finder Eyes
    const renderFinderEye = (startR, startC) => {
      const x = startC + margin;
      const y = startR + margin;

      // Outer Rounded Square Ring
      let finderSvg = `
        <rect x="${x}" y="${y}" width="7" height="7" rx="2.2" fill="url(#${gradientId})" />
        <rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="1.5" fill="#FFFFFF" />
        <rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="1.1" fill="url(#${gradientId})" />
      `;
      return finderSvg;
    };

    // Render the 3 Corner Finders
    svg += renderFinderEye(0, 0); // Top-Left
    svg += renderFinderEye(0, size - 7); // Top-Right
    svg += renderFinderEye(size - 7, 0); // Bottom-Left

    // Center Logo Emblem Badge
    if (showLogo) {
      const centerX = centerMid + margin + 0.5;
      const centerY = centerMid + margin + 0.5;
      const emblemSize = centerRadius * 2.1;
      const emblemRadius = emblemSize / 2;

      // White Badge Background Circle
      svg += `<circle cx="${centerX}" cy="${centerY}" r="${emblemRadius + 0.4}" fill="#FFFFFF" filter="url(#glow_${gradientId})" />`;
      // Outer Gradient Border Ring
      svg += `<circle cx="${centerX}" cy="${centerY}" r="${emblemRadius}" fill="none" stroke="url(#${gradientId})" stroke-width="0.6" />`;
      
      // Avatar Image inside Clip Path
      const clipId = `avatarClip_${Math.random().toString(36).substr(2, 6)}`;
      svg += `
        <clipPath id="${clipId}">
          <circle cx="${centerX}" cy="${centerY}" r="${emblemRadius - 0.4}" />
        </clipPath>
        <image href="${avatarUrl}" x="${centerX - emblemRadius + 0.4}" y="${centerY - emblemRadius + 0.4}" width="${(emblemRadius - 0.4) * 2}" height="${(emblemRadius - 0.4) * 2}" clip-path="url(#${clipId})" preserveAspectRatio="xMidYMid slice" />
      `;
    }

    svg += `</svg>`;

    containerElement.innerHTML = svg;
  } catch (err) {
    console.error('QR Code generation error:', err);
    containerElement.innerHTML = `<div class="qr-error" style="color: #E63946; font-size: 12px; font-weight: 700; text-align: center;">Failed to generate QR code</div>`;
  }
}

/**
 * Calculates a complementary gradient end color for the primary swatch.
 */
function getGradientEndColor(hexColor) {
  const colorMap = {
    '#00C9A7': '#00B4D8', // Teal -> Cyan
    '#E63946': '#D62828', // Red -> Dark Red
    '#0077B6': '#00B4D8', // Blue -> Cyan
    '#2A9D8F': '#00C9A7', // Green -> Teal
    '#1D3557': '#457B9D', // Slate -> Muted Blue
    '#7209B7': '#4361EE'  // Purple -> Indigo
  };
  return colorMap[hexColor] || '#00B4D8';
}
