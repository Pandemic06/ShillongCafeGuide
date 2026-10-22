/**
 * What a café's photo tab should say about its photos. A photo is "stock" when it comes from
 * Unsplash (a free stock-photo site); anything else (this site's own saved photos, Google
 * photos) is a real photo of the café.
 */
export const isStockPhoto = (url: string): boolean => url.includes('images.unsplash.com');

export type PhotoKind = 'none' | 'stock' | 'real' | 'mixed';

export interface PhotoNotice {
  kind: PhotoKind;
  heading: string;
  badge: string | null;
  caption: string;
  /** Small label on each photo, e.g. "Stock photo 2" or "Photo 1". */
  label: (url: string, index: number) => string;
  /** Alt text for each photo, for screen readers. */
  alt: (url: string, index: number) => string;
}

const REAL_CAPTION = 'Photos are for reference and may not show the café as it looks today.';
const STOCK_CAPTION = 'These are stock images for illustration. They do not show this café.';

export function describePhotos(urls: string[], cafeName: string): PhotoNotice {
  const stock = urls.filter(isStockPhoto).length;
  const kind: PhotoKind = !urls.length ? 'none' : stock === urls.length ? 'stock' : stock === 0 ? 'real' : 'mixed';
  const perPhoto = (url: string, index: number) => `${isStockPhoto(url) ? 'Stock photo' : 'Photo'} ${index + 1}`;
  const base = {
    label: perPhoto,
    alt: (url: string, index: number) =>
      isStockPhoto(url) ? `Stock image, not a photo of ${cafeName}` : `${cafeName}, photo ${index + 1}`,
  };
  switch (kind) {
    case 'stock':
      return { ...base, kind, heading: 'Illustrative photos', badge: 'Stock images', caption: STOCK_CAPTION };
    case 'real':
      return { ...base, kind, heading: `Photos of ${cafeName}`, badge: 'Real photos', caption: REAL_CAPTION };
    case 'mixed':
      return { ...base, kind, heading: 'Photos', badge: null, caption: `Photos marked "Stock photo" are stock images for illustration and do not show this café. ${REAL_CAPTION}` };
    default:
      return { ...base, kind, heading: '', badge: null, caption: '' };
  }
}
