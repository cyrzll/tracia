import React, { useEffect, useState } from 'react';

interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: 'R' | 'G' | 'B';
  yChannel?: 'R' | 'G' | 'B';
  mixBlendMode?: string;
  className?: string;
  style?: React.CSSProperties;
}

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isDark;
};

const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  width = '100%',
  height = 'auto',
  borderRadius = 20,
  className = '',
  style = {},
  blur = 12,
  saturation = 1,
  backgroundOpacity = 0.1,
  brightness = 1
}) => {
  const isDarkMode = useDarkMode();

  const containerStyles: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    backdropFilter: `blur(${blur}px) saturate(${saturation * 150}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation * 150}%)`,
    background: isDarkMode 
      ? `rgba(255, 255, 255, ${backgroundOpacity || 0.05})` 
      : `rgba(255, 255, 255, ${backgroundOpacity || 0.1})`,
    border: 'none',
    boxShadow: isDarkMode 
      ? '0 8px 32px 0 rgba(0, 0, 0, 0.4)' 
      : '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style
  };

  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={containerStyles}
    >
      <div className="w-full h-full flex items-center justify-center relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassSurface;
