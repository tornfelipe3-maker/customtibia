
import React, { useState, useEffect } from 'react';
import { ITEM_PLACEHOLDER } from '../../constants/config';
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
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Se a fonte mudar, tentamos carregar novamente
  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [src]);

  const handleError = () => {
    setError(true);
    setLoading(false);
    console.warn(`Failed to load sprite: ${src}`);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  // Se não houver src ou deu erro, mostramos o fallback
  if (!src || error) {
    if (type === 'monster') {
      return (
        <div className={`flex items-center justify-center bg-black/20 rounded ${className}`} style={{ width: size, height: size, ...style }}>
          <Skull size={size ? size * 0.6 : 24} className="text-red-900/50" />
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
    <div className="relative inline-flex items-center justify-center overflow-visible">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-white/5 rounded-sm"></div>
      )}
      <img
        src={src}
        alt={alt || 'sprite'}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        style={{ 
          imageRendering: 'pixelated', 
          ...style 
        }}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        referrerPolicy="no-referrer" // Força o navegador a ignorar a origem para evitar bloqueios do Fandom
      />
    </div>
  );
};
