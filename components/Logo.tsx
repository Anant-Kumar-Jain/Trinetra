import React from 'react';

export const TrinetraLogo: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
        <defs>
          <filter id="neonGlow">
             <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>
             <feMerge>
                 <feMergeNode in="coloredBlur"/>
                 <feMergeNode in="SourceGraphic"/>
             </feMerge>
          </filter>
          <path id="topCurve" d="M 20 50 A 30 30 0 0 1 80 50" />
          <path id="bottomCurve" d="M 20 50 A 30 30 0 0 0 80 50" />
        </defs>

        {/* Outer Tech Ring (Cyan/Blue) */}
        <circle cx="50" cy="50" r="48" fill="#020617" stroke="#06b6d4" strokeWidth="1" />
        
        {/* Decorative Notches */}
        <path d="M 50 2 L 50 8 M 50 92 L 50 98 M 2 50 L 8 50 M 92 50 L 98 50" stroke="#06b6d4" strokeWidth="2" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />

        {/* Text Ring Background */}
        <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="12" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="#06b6d4" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="32" fill="none" stroke="#06b6d4" strokeWidth="0.5" />

        {/* Text Labels */}
        <text fontSize="5.5" fontWeight="900" fill="#22d3ee" letterSpacing="1.2" textAnchor="middle" filter="url(#neonGlow)">
             <textPath href="#topCurve" startOffset="50%">TRINETRA</textPath>
        </text>
        
        <text fontSize="4" fontWeight="bold" fill="#94a3b8" letterSpacing="0.8" textAnchor="middle">
             <textPath href="#bottomCurve" startOffset="50%" side="right">INVESTIGATE</textPath>
        </text>

        <text x="16" y="51" fontSize="3" fontWeight="bold" fill="#64748b" transform="rotate(-90 16 51)" textAnchor="middle">INFILTRATE</text>
        <text x="84" y="51" fontSize="3" fontWeight="bold" fill="#64748b" transform="rotate(90 84 51)" textAnchor="middle">INFORM</text>

        {/* Center Background */}
        <circle cx="50" cy="50" r="31" fill="#0f172a" />

        {/* Laurel Wreath */}
        <path d="M 30 65 Q 15 45 35 25" stroke="#e2e8f0" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d="M 70 65 Q 85 45 65 25" stroke="#e2e8f0" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
        
        {/* Leaf Details */}
        <path d="M 28 60 L 24 55 M 26 50 L 22 45 M 28 40 L 25 35" stroke="#cbd5e1" strokeWidth="0.8" />
        <path d="M 72 60 L 76 55 M 74 50 L 78 45 M 72 40 L 75 35" stroke="#cbd5e1" strokeWidth="0.8" />

        {/* Central Eye */}
        <g transform="translate(50 50) scale(0.9)">
            <path d="M -15 0 Q 0 -15 15 0 Q 0 15 -15 0" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" filter="url(#neonGlow)" />
            <circle cx="0" cy="0" r="6" fill="url(#eyeGradient)" />
            <path d="M 0 -6 L 0 6" stroke="#000" strokeWidth="2" opacity="0.5" />
            <circle cx="2" cy="-2" r="2" fill="#fff" opacity="0.9" />
        </g>
        
        <defs>
             <radialGradient id="eyeGradient">
                 <stop offset="0%" stopColor="#22d3ee" />
                 <stop offset="100%" stopColor="#0891b2" />
             </radialGradient>
        </defs>
      </svg>
    </div>
  );
};