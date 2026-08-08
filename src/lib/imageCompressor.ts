/**
 * Utility to compress images (Data URLs or File objects) on an HTML5 Canvas.
 * Ensures Base64 data URLs stay well under Firestore's 1MB document size limit (typically < 150KB).
 */

export async function compressImageDataUrl(
  dataUrl: string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75
): Promise<string> {
  // If it's not a data URL or small enough (< 200KB), return as is
  if (!dataUrl || !dataUrl.startsWith('data:image/') || dataUrl.length < 250000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Scale down dimensions if greater than max bounds
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          maxHeight = height;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Fill white background for transparent PNGs converted to JPEG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG with given quality
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

export async function compressImageFile(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Failed to read file'));
        return;
      }
      try {
        const compressed = await compressImageDataUrl(result, maxWidth, maxHeight, quality);
        resolve(compressed);
      } catch (err) {
        resolve(result);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
