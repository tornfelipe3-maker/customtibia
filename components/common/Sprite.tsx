
import React, { useState, useEffect, useRef } from 'react';
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
  const imgRef = useRef<HTMLImageElement>(null);

  // Sincroniza o src interno com a prop src
  useEffect(() => {
    setCurrentSrc(src);
    setError(false);
    setIsFallbackAttempted(false);
  }, [src]);

  const handleError = () => {
    // Se falhar no Fandom, tenta o mirror do TibiaWiki BR
    if (currentSrc && currentSrc.includes('tibia.fandom.com') && !isFallbackAttempted) {
      const fileName = currentSrc.split('/').pop();
      if (fileName) {
        setIsFallbackAttempted(true);
        setCurrentSrc(`${OUT_BASE}${fileName}`);
        return;
      }
    }

    setError(true);
    console.warn(`Failed to load sprite: ${src}`);
  };

  if (!currentSrc || error) {
    if (type === 'monster') {
      return (
        <div className={`flex items-center justify-center bg-black/10 rounded ${className}`} style={{ width: size, height: size, ...style }}>
          <Skull size={size ? size * 0.6 : 24} className="text-red-900/40" />
        </div>
      );
    }
    return (
      <img 
        src={ITEM_PLACEHOLDER} 
        alt="fallback" 
        className={`${className} opacity-30 grayscale`} 
        style={{ width: size, height: size, imageRendering: 'pixelated', ...style }} 
      />
    );
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt || 'sprite'}
        className={className}
        style={{ 
          imageRendering: 'pixelated', 
          display: 'block',
          ...style 
        }}
        onError={handleError}
        loading="eager"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
