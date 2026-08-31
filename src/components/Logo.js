/**
 * CONNECT App Logo Component
 * Renders the official high-resolution CONNECT brand logo image.
 */
export function getLogoSVG(size = 40) {
  return `<img src="/logo.png" alt="CONNECT Logo" class="connect-logo-img" style="width: ${size}px; height: ${size}px; object-fit: contain; flex-shrink: 0;" />`;
}

export function getLogoHTML(size = 40) {
  return getLogoSVG(size);
}
