/**
 * Cloudinary Helper for Image Uploads
 * Configured via environment variables:
 * - VITE_CLOUDINARY_CLOUD_NAME
 * - VITE_CLOUDINARY_UPLOAD_PRESET
 */

export interface CloudinaryUploadResult {
  url: string | null;
  publicId: string | null;
  error: string | null;
}

export function getCloudinaryConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const isConfigured = Boolean(cloudName && uploadPreset);

  return { cloudName, uploadPreset, isConfigured };
}

/**
 * Uploads a image File to Cloudinary using Unsigned Preset or standard REST endpoint.
 * Fallbacks gracefully to FileReader Data URL if Cloudinary is not configured yet.
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset, isConfigured } = getCloudinaryConfig();

  if (!isConfigured) {
    // Return local Data URL fallback so the application works seamlessly
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          url: reader.result as string,
          publicId: `local-preview-${Date.now()}`,
          error: null
        });
      };
      reader.onerror = () => {
        resolve({
          url: null,
          publicId: null,
          error: 'Falha ao ler arquivo de imagem local.'
        });
      };
      reader.readAsDataURL(file);
    });
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Erro no upload Cloudinary (${response.status})`);
    }

    const data = await response.json();
    return {
      url: data.secure_url || data.url,
      publicId: data.public_id,
      error: null
    };
  } catch (err: any) {
    console.warn('Cloudinary upload failed, falling back to local preview:', err);
    // Fallback to local Data URL on network error or invalid preset
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          url: reader.result as string,
          publicId: `fallback-${Date.now()}`,
          error: err.message || 'Erro ao conectar ao Cloudinary. Exibindo prévia local.'
        });
      };
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Transforms Cloudinary URL with parameters (crop, scale, quality)
 */
export function getOptimizedCloudinaryUrl(url: string, width = 600, quality = 'auto'): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/w_${width},c_limit,q_${quality},f_auto/`);
}
