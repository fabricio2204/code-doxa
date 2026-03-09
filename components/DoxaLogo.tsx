'use client';

export interface DoxaLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
  color?: 'black' | 'white';
}

export default function DoxaLogo({
  size = 'medium',
  showText = true,
  className = '',
  color = 'black',
}: DoxaLogoProps) {
  const sizeMap = {
    small: { logoHeight: '32px', fontSize: 'text-sm' },
    medium: { logoHeight: '48px', fontSize: 'text-lg' },
    large: { logoHeight: '80px', fontSize: 'text-2xl' },
  };

  const { logoHeight, fontSize } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo DOXA - estilo elegante */}
      <div
        style={{
          height: logoHeight,
          lineHeight: '1',
          letterSpacing: '0.1em',
          color: color === 'white' ? '#fff' : '#000',
          fontFamily: 'Georgia, serif',
          fontSize: logoHeight,
        }}
        className="flex items-center justify-center font-serif font-bold tracking-widest"
      >
        <span>DOXA</span>
      </div>

      {/* Texto "Cafeteria DOXA" */}
      {showText && (
        <div className={`flex flex-col ${fontSize}`}>
          <span className="font-bold tracking-wide">Cafeteria</span>
          <span className="font-semibold text-xs tracking-widest">DOXA</span>
        </div>
      )}
    </div>
  );
}
