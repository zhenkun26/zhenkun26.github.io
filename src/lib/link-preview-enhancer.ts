/**
 * Link preview image error handling
 * Handles image load failures by showing graceful fallback UI
 */

import { $locale } from '@store/locale';
import { t } from '@/i18n/utils';

const enhancedImages = new WeakSet<HTMLImageElement>();

/**
 * Create error placeholder for failed link preview images
 */
function createErrorPlaceholder(title: string): HTMLElement {
  const placeholder = document.createElement('div');
  placeholder.className = 'link-preview-image-error';
  placeholder.setAttribute('role', 'img');
  placeholder.setAttribute('aria-label', `${t($locale.get(), 'image.previewFailed')}: ${title}`);

  // Icon
  const icon = document.createElement('span');
  icon.className = 'link-preview-image-error-icon';
  icon.setAttribute('aria-hidden', 'true');

  // Text
  const text = document.createElement('span');
  text.className = 'link-preview-image-error-text';
  text.textContent = t($locale.get(), 'image.loadError');

  placeholder.appendChild(icon);
  placeholder.appendChild(text);

  return placeholder;
}

/**
 * Handle image load error
 */
function handleImageError(img: HTMLImageElement): void {
  img.classList.add('error');

  // Get fallback title from data attribute
  const title = img.getAttribute('data-fallback-title') || t($locale.get(), 'image.preview');

  // Add error placeholder
  const imageContainer = img.parentElement;

  if (imageContainer && !imageContainer.querySelector('.link-preview-image-error')) {
    const placeholder = createErrorPlaceholder(title);
    imageContainer.appendChild(placeholder);
  }
}

/**
 * Enhance all link preview images in container
 */
export function enhanceLinkPreviews(container: Element): void {
  const images = container.querySelectorAll<HTMLImageElement>('.link-preview-image');

  images.forEach((img) => {
    // Skip if already enhanced
    if (enhancedImages.has(img)) return;
    enhancedImages.add(img);

    // Check if already errored (cached broken image)
    if (img.complete && img.naturalWidth === 0) {
      handleImageError(img);
      return;
    }

    // Handle future errors
    img.addEventListener('error', () => handleImageError(img), { once: true });
  });
}
