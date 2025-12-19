
import React, { useState, useEffect } from 'react';
import { ITEM_PLACEHOLDER, IMG_BASE, OUT_BASE } from '../../constants/config';
import { Skull } from 'lucide-react';

interface SpriteProps {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  type?: 'item' | 'monster' | 'outfit';
}

export const Sprite: React.FC<SpriteProps> = ({ src, alt, className, style, size, type = 'item' }) => {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const [isFallbackAttempted, setIsFallbackAttempted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync internal state with prop changes
  useEffect(() => {
    setCurrentSrc(src);
    setError(false);
    setLoading(true);
    setIsFallbackAttempted(false);
  }, [src]);

  const handleError = () => {
    if (error) return; // Prevent infinite loops

    // If we were using Fandom (IMG_BASE), try TibiaWiki BR (OUT_BASE) as mirror
    if (currentSrc && currentSrc.includes('tibia.fandom.com') && !isFallbackAttempted) {
      const parts = currentSrc.split('/');
      const fileName = parts[parts.length - 1];
      if (fileName) {
        setIsFallbackAttempted(true);
        setCurrentSrc(`${OUT_BASE}${fileName}`);
        return; 
      }
    }

    // Special case for slots: don't show error if it's a known failing slot image, 
    // though the parent component now handles this better.
    if (currentSrc && currentSrc.includes('_Slot.gif')) {
       setError(true);
       setLoading(false);
       return;
    }

    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  if (!currentSrc || error) {
    if (type === 'monster') {
      return (
        <div className={`flex items-center justify-center bg-black/20 rounded ${className}`} style={{ width: size, height: size, ...style }}>
          <Skull size={size ? size * 0.6 : 24} className="text-red-900/50" />
        </div>
      );
    }
    return (
      <div className={`flex items-center justify-center bg-black/10 rounded-sm ${className}`} style={{ width: size, height: size, ...style }}>
          <div className="w-1.5 h-1.5 bg-gray-800 rounded-full opacity-20"></div>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center justify-center overflow-visible">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-white/5 rounded-sm"></div>
      )}
      <img
        src={currentSrc}
        alt={alt || 'sprite'}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        style={{ 
          imageRendering: 'pixelated', 
          ...style 
        }}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
