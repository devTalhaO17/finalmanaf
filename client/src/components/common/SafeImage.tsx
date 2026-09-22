import React, { useState, useEffect } from 'react';
import { storage, DEFAULT_FALLBACK_IMAGE } from '../../lib/storage';
import { ImageCategory } from '../../types';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  category?: ImageCategory | string;
  fallbackSrc?: string;
  alt: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  category = 'general',
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  alt,
  className = '',
  ...props
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => {
    return storage.resolveImageUrl(src, category);
  });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setResolvedSrc(storage.resolveImageUrl(src, category));
  }, [src, category]);

  useEffect(() => {
    const handleMediaUpdated = () => {
      setHasError(false);
      setResolvedSrc(storage.resolveImageUrl(src, category));
    };

    window.addEventListener('sajks_media_updated', handleMediaUpdated);
    return () => {
      window.removeEventListener('sajks_media_updated', handleMediaUpdated);
    };
  }, [src, category]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setResolvedSrc(fallbackSrc);
    }
  };

  return (
    <img
      {...props}
      src={hasError ? fallbackSrc : resolvedSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};
