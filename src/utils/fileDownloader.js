import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

/**
 * Universal Mobile & Web File/Image Downloader & Exporter
 * Handles Android WebView, iOS Safari, PWA, and Desktop
 */
export async function downloadOrShareImage(canvasOrDataUrl, filename = 'connect_wallpaper.png', title = 'Connect Pass') {
  const isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform();
  
  let dataUrl = '';
  let blob = null;

  if (typeof canvasOrDataUrl === 'string') {
    dataUrl = canvasOrDataUrl;
  } else if (canvasOrDataUrl && typeof canvasOrDataUrl.toDataURL === 'function') {
    dataUrl = canvasOrDataUrl.toDataURL('image/png');
    blob = await new Promise((resolve) => canvasOrDataUrl.toBlob(resolve, 'image/png'));
  }

  // 1. Native Android / iOS via Capacitor Filesystem & Native Share Sheet
  if (isNative) {
    try {
      const base64Data = dataUrl.split(',')[1] || dataUrl;
      const savedFile = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache
      });

      await Share.share({
        title: title,
        text: 'Save or Set Lock Screen Wallpaper',
        url: savedFile.uri,
        dialogTitle: 'Save / Share Wallpaper'
      });
      return { success: true, method: 'native-share' };
    } catch (e) {
      console.warn('Native Capacitor share failed, falling back to Web API:', e);
    }
  }

  // 2. Web Share API (Mobile Browsers with file sharing support)
  if (blob && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title,
          text: 'Save Lock Screen Wallpaper'
        });
        return { success: true, method: 'web-share' };
      }
    } catch (e) {
      console.warn('Web Share API failed, falling back to download:', e);
    }
  }

  // 3. Standard Browser Download Link
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
    }, 1000);
  } catch (e) {
    console.warn('Browser direct link failed:', e);
  }

  // 4. Fallback Modal for WebViews where downloads are silently ignored
  showImagePreviewModal(dataUrl, filename);
  return { success: true, method: 'modal-preview' };
}

/**
 * Fallback Preview Modal for WebViews
 */
export function showImagePreviewModal(imgDataUrl, filename = 'wallpaper.png') {
  const existing = document.getElementById('image-preview-overlay');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'image-preview-overlay';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.95);
    z-index: 100000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    box-sizing: border-box;
    backdrop-filter: blur(12px);
  `;

  modal.innerHTML = `
    <div style="background: #1E293B; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 16px; max-width: 360px; width: 100%; text-align: center; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
      <div style="font-family: var(--font-heading, sans-serif); font-size: 15px; font-weight: 800; color: #FFFFFF; display: flex; align-items: center; gap: 6px;">
        <span>🖼️</span> Wallpaper Ready
      </div>
      <p style="font-size: 12px; color: #94A3B8; margin: 0; line-height: 1.4;">
        Tap and hold the image below, then choose <strong>"Save Image"</strong> or <strong>"Download Image"</strong>.
      </p>
      <div style="width: 180px; max-height: 320px; border-radius: 14px; overflow: hidden; border: 2px solid #00C9A7; box-shadow: 0 8px 24px rgba(0,0,0,0.3);">
        <img src="${imgDataUrl}" alt="${filename}" style="width: 100%; height: auto; display: block;" />
      </div>
      <button id="btn-close-image-preview" style="background: #00C9A7; color: #0F172A; border: none; padding: 10px 24px; border-radius: 999px; font-weight: 800; font-size: 13px; cursor: pointer; width: 100%; margin-top: 4px;">
        DONE
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  document.getElementById('btn-close-image-preview')?.addEventListener('click', () => {
    modal.remove();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}
