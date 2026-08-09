import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const SarkariTatthaLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const { settings } = useSettings();
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: { icon: 'w-8 h-8', title: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-11 h-11', title: 'text-xl', sub: 'text-[11px]' },
    lg: { icon: 'w-16 h-16', title: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'w-24 h-24', title: 'text-4xl', sub: 'text-sm' },
  };

  const dim = sizeMap[size];
  const centerName = settings.center_name || 'Sarkari Tattha Digital';
  const tagline = settings.tagline || 'Authorized Digital & Banking Service Center';
  const logoUrl = settings.logo_url;

  useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  // Format brand name cleanly with Deep Blue & Green accent with perfect baseline alignment
  const renderBrandTitle = () => {
    if (!centerName) {
      return (
        <span className={`font-black tracking-tight ${dim.title} uppercase inline-flex items-baseline flex-wrap gap-x-1.5 leading-tight`}>
          <span className="text-slate-900">Sarkari</span>
          <span className="text-[#0066B3]">Tattha</span>
        </span>
      );
    }

    const words = centerName.split(' ');
    return (
      <span className={`font-extrabold tracking-tight ${dim.title} uppercase inline-flex items-baseline flex-wrap gap-x-1.5 leading-tight`}>
        {words.map((word, i) => {
          const lower = word.toLowerCase();
          if (lower === 'tattha' || lower === 'tatha') {
            return <span key={i} className="text-[#0066B3] font-black">{word}</span>;
          }
          if (lower === 'digital') {
            return (
              <span key={i} className="text-[#2E9B45] font-black">
                {word}
              </span>
            );
          }
          return <span key={i} className="text-slate-900 font-extrabold">{word}</span>;
        })}
      </span>
    );
  };

  return (
    <div className={`flex items-center space-x-3.5 ${className}`}>
      {/* Logo Graphic Mark or Custom Image Logo */}
      <div className={`${dim.icon} relative shrink-0 flex items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm p-1.5 overflow-hidden`}>
        {logoUrl && logoUrl.trim() !== '' && !imgError ? (
          <img
            src={logoUrl}
            alt={centerName}
            className="w-full h-full object-contain rounded-xl"
            onError={() => setImgError(true)}
          />
        ) : (
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full shrink-0"
          >
            {/* Outer Shield - Deep Blue */}
            <path
              d="M100 15 L165 40 V105 C165 145 130 175 100 188 C70 175 35 145 35 105 V40 L100 15 Z"
              fill="#0066B3"
              stroke="#004d88"
              strokeWidth="4"
            />

            {/* Bank Pillars inside shield */}
            <path d="M85 70 H135 V105 H85 Z" fill="#ffffff" opacity="0.15" />
            <path d="M80 65 L110 45 L140 65 H80 Z" fill="#ffffff" />
            <rect x="88" y="70" width="6" height="30" fill="#ffffff" />
            <rect x="107" y="70" width="6" height="30" fill="#ffffff" />
            <rect x="126" y="70" width="6" height="30" fill="#ffffff" />
            <rect x="82" y="100" width="56" height="6" fill="#ffffff" />

            {/* Document Sheet with Green Accent */}
            <rect x="52" y="70" width="38" height="48" rx="4" fill="#ffffff" stroke="#2E9B45" strokeWidth="3" />
            <line x1="60" y1="80" x2="80" y2="80" stroke="#2E9B45" strokeWidth="3" strokeLinecap="round" />
            <line x1="60" y1="90" x2="76" y2="90" stroke="#0066B3" strokeWidth="2" strokeLinecap="round" />
            <line x1="60" y1="98" x2="82" y2="98" stroke="#0066B3" strokeWidth="2" strokeLinecap="round" />
            <circle cx="68" cy="107" r="3" fill="#2E9B45" />

            {/* Verified Checkmark across shield */}
            <path
              d="M75 125 L100 150 L170 80"
              fill="none"
              stroke="#ffffff"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M75 125 L100 150 L170 80"
              fill="none"
              stroke="#2E9B45"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Digital Connection Nodes */}
            <circle cx="155" cy="120" r="7" fill="#ffffff" stroke="#2E9B45" strokeWidth="3" />
            <circle cx="140" cy="140" r="5" fill="#ffffff" stroke="#0066B3" strokeWidth="3" />
            <line x1="150" y1="124" x2="143" y2="136" stroke="#2E9B45" strokeWidth="2" />
          </svg>
        )}
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center">
        {renderBrandTitle()}
        {showSubtitle && tagline && (
          <p className={`${dim.sub} text-slate-500 font-bold tracking-wider uppercase flex items-center space-x-1.5 mt-0.5 leading-tight`}>
            <span className="inline-block w-1.5 h-1.5 bg-[#2E9B45] rounded-full shrink-0"></span>
            <span className="truncate">{tagline}</span>
          </p>
        )}
      </div>
    </div>
  );
};


