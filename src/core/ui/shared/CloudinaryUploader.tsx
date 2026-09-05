import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Image as ImageIcon, Loader2, Link, Copy } from 'lucide-react';
import { uploadToCloudinary, getCloudinaryConfig } from '@/src/core/services/cloudinary';

interface CloudinaryUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  label?: string;
}

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  onImageUploaded,
  currentImageUrl,
  label = 'Imagem do Produto'
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { isConfigured } = getCloudinaryConfig();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const result = await uploadToCloudinary(file);
    setUploading(false);

    if (result.error && !result.url) {
      setErrorMessage(result.error);
    } else if (result.url) {
      setPreviewUrl(result.url);
      onImageUploaded(result.url);
      if (isConfigured) {
        setStatusMessage('Imagem enviada com sucesso em alta definição!');
      } else {
        setStatusMessage('Imagem carregada com sucesso (prévia local).');
      }
    }
  };

  const handleCopyLink = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between mb-3">
        <label className="font-medium text-[#5A4A47] flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#D9A89B]" />
          <span>{label}</span>
        </label>
      </div>

      <div className="p-3 rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 flex flex-col sm:flex-row items-center gap-3">
        {/* Preview Thumbnail */}
        <div className="w-20 h-20 rounded-xl bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/30 overflow-hidden shrink-0 flex items-center justify-center relative group">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-8 h-8 text-[var(--color-outline)]" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2 w-full">
          <label className="cursor-pointer inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs hover:opacity-95 transition-all shadow-xs min-h-[38px]">
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? 'Enviando...' : 'Selecionar Imagem do Computador'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>



          {statusMessage && (
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 shrink-0" />
              <span>{statusMessage}</span>
            </p>
          )}

          {errorMessage && (
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errorMessage}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
