import React, { useState } from 'react';

interface PrimaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  animated?: boolean;
  variant?: 'full' | 'mark-only';
}

export const PrimaLogo: React.FC<PrimaLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  animated = true,
  variant = 'full',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeMap = {
    sm: { box: 'w-9 h-9 sm:w-10 sm:h-10', svgSize: 40, font: 'text-sm' },
    md: { box: 'w-12 h-12', svgSize: 48, font: 'text-base' },
    lg: { box: 'w-20 h-20', svgSize: 80, font: 'text-xl' },
    xl: { box: 'w-28 h-28', svgSize: 112, font: 'text-2xl' },
    hero: { box: 'w-36 h-36 sm:w-48 sm:h-48 md:w-52 md:h-52', svgSize: 208, font: 'text-4xl' },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative ${currentSize.box} flex items-center justify-center shrink-0`}>
        {/* Ambient Multi-Layer Glow Halo */}
        {animated && (
          <>
            {/* Deep Water Aura */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#003b73]/30 via-[#00aded]/35 to-[#f59e0b]/25 blur-xl transition-all duration-700 pointer-events-none ${
                isHovered ? 'scale-125 opacity-90 blur-2xl' : 'scale-100 opacity-60'
              }`}
            />
            {/* Core Golden Shimmer Pulse */}
            <div
              className={`absolute inset-2 rounded-full bg-gradient-to-r from-cyan-400/20 via-amber-400/25 to-blue-600/20 blur-md pointer-events-none transition-transform duration-500 ${
                isHovered ? 'scale-110' : 'scale-95'
              }`}
              style={{
                animation: 'primaAuraPulse 4s ease-in-out infinite',
              }}
            />
          </>
        )}

        {/* Embedded Scoped Keyframe Animations */}
        <style>{`
          @keyframes primaSpinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes primaSpinReverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          @keyframes primaAuraPulse {
            0%, 100% { opacity: 0.45; transform: scale(0.96); }
            50% { opacity: 0.85; transform: scale(1.05); }
          }
          @keyframes primaWaveFlow {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-4px) translateY(-2px); }
            100% { transform: translateX(0) translateY(0); }
          }
          @keyframes primaShineGleam {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 6px #ffffff); }
          }
          @keyframes primaRadarSweep {
            0% { transform: rotate(0deg); opacity: 0.35; }
            50% { opacity: 0.75; }
            100% { transform: rotate(360deg); opacity: 0.35; }
          }
          @keyframes primaFloatGentle {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .prima-anim-spin, .prima-anim-reverse, .prima-anim-radar, .prima-anim-wave, .prima-anim-float {
              animation: none !important;
            }
          }
        `}</style>

        {/* High-Precision Master SVG Emblem */}
        <svg
          viewBox="0 0 240 240"
          className={`w-full h-full relative z-10 drop-shadow-md transition-transform duration-500 ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Primary Air Bersih Jakarta Gradient (Deep Blue to Dynamic Teal) */}
            <linearGradient id="abjPrimaryGrad" x1="20" y1="20" x2="220" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#002b5c" />
              <stop offset="35%" stopColor="#004690" />
              <stop offset="70%" stopColor="#0054a6" />
              <stop offset="100%" stopColor="#00aded" />
            </linearGradient>

            {/* Radiant Pure Water Gradient */}
            <linearGradient id="abjCyanWaterGrad" x1="50" y1="220" x2="190" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0077b6" />
              <stop offset="40%" stopColor="#00b4d8" />
              <stop offset="80%" stopColor="#48cae4" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>

            {/* Golden Sunlight & Assurance Gradient */}
            <linearGradient id="abjGoldenAssuranceGrad" x1="60" y1="50" x2="200" y2="190" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="45%" stopColor="#fbbf24" />
              <stop offset="85%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#fffbeb" />
            </linearGradient>

            {/* Specular Liquid Highlight Gradient */}
            <linearGradient id="abjLiquidSpecular" x1="120" y1="40" x2="120" y2="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Core Radial Shimmer */}
            <radialGradient id="abjCenterLuminescence" cx="120" cy="115" r="75" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#0054a6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#002b5c" stopOpacity="0" />
            </radialGradient>

            {/* Radar Sweep Gradient */}
            <radialGradient id="abjRadarBeam" cx="120" cy="120" r="105" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00aded" stopOpacity="0" />
              <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
            </radialGradient>

            {/* Shield Glass Surface Fill */}
            <linearGradient id="abjShieldFill" x1="120" y1="20" x2="120" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0054a6" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#00aded" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#002b5c" stopOpacity="0.18" />
            </linearGradient>

            {/* Filter for Drop Shadow on Inner Elements */}
            <filter id="primaGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. LAYER ONE: Hexagonal Shield of Assurance (Structural Frame) */}
          <polygon
            points="120,24 198,68 198,158 120,202 42,158 42,68"
            fill="url(#abjShieldFill)"
            stroke="url(#abjPrimaryGrad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-opacity duration-300"
            opacity={isHovered ? 0.95 : 0.75}
          />

          {/* Subtle Inner Concentric Facet Lines of Shield */}
          <polygon
            points="120,36 186,74 186,152 120,190 54,152 54,74"
            fill="none"
            stroke="url(#abjCyanWaterGrad)"
            strokeWidth="1"
            strokeDasharray="6 8"
            opacity="0.4"
          />

          {/* 2. LAYER TWO: Outer Technical Audit Compass & Reticle Rings */}
          {/* Ring A: Precision Clockwise Ticks and Arc Segment */}
          <g
            className={animated ? "prima-anim-spin" : ""}
            style={{
              animation: animated ? 'primaSpinSlow 28s linear infinite' : 'none',
              transformOrigin: '120px 120px',
            }}
          >
            {/* Outer dotted orbit */}
            <circle
              cx="120"
              cy="120"
              r="104"
              stroke="url(#abjPrimaryGrad)"
              strokeWidth="1.8"
              strokeDasharray="4 8"
              opacity="0.65"
            />
            {/* Primary Accent Arcs */}
            <path
              d="M 120 16 A 104 104 0 0 1 208 64"
              stroke="url(#abjCyanWaterGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M 120 224 A 104 104 0 0 1 32 176"
              stroke="url(#abjCyanWaterGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Orbital Satellite Node 1 (Teal) */}
            <circle cx="208" cy="64" r="3.5" fill="#00aded" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="32" cy="176" r="3.5" fill="#00aded" stroke="#ffffff" strokeWidth="1.5" />
          </g>

          {/* Ring B: Counter-Rotating Golden Assurance Ring */}
          <g
            className={animated ? "prima-anim-reverse" : ""}
            style={{
              animation: animated ? 'primaSpinReverse 18s linear infinite' : 'none',
              transformOrigin: '120px 120px',
            }}
          >
            <circle
              cx="120"
              cy="120"
              r="92"
              stroke="url(#abjGoldenAssuranceGrad)"
              strokeWidth="2"
              strokeDasharray="8 14 2 14"
              opacity="0.8"
            />
            {/* Golden Star/Intelligence Satellite Nodes */}
            <circle cx="120" cy="28" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="185" cy="165" r="3.8" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.2" />
            <circle cx="55" cy="165" r="3.8" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.2" />
          </g>

          {/* 3. LAYER THREE: Radar / Intelligence Sweep Beam (Dynamic AI Monitoring) */}
          {animated && (
            <g
              className="prima-anim-radar"
              style={{
                animation: 'primaRadarSweep 8s linear infinite',
                transformOrigin: '120px 120px',
              }}
            >
              <path
                d="M 120 120 L 210 90 A 100 100 0 0 1 210 150 Z"
                fill="url(#abjRadarBeam)"
                pointerEvents="none"
              />
            </g>
          )}

          {/* 4. LAYER FOUR: Core Emblem Floating Group */}
          <g
            className={animated ? "prima-anim-float" : ""}
            style={{
              animation: animated ? 'primaFloatGentle 4.5s ease-in-out infinite' : 'none',
            }}
          >
            {/* Central Ambient Glow Core */}
            <circle cx="120" cy="122" r="54" fill="url(#abjCenterLuminescence)" pointerEvents="none" />

            {/* Aerodynamic Water Droplet Shape (Air Bersih Jakarta) */}
            {/* Outer Drop Contour with Deep Blue to Cyan Gradient */}
            <path
              d="M 120 48 
                 C 142 76, 172 108, 172 135 
                 C 172 166, 148 188, 120 188 
                 C 92 188, 68 166, 68 135 
                 C 68 108, 98 76, 120 48 Z"
              fill="url(#abjPrimaryGrad)"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinejoin="round"
              filter="url(#primaGlowFilter)"
            />

            {/* Specular Light Reflection on Upper Left Shoulder of Droplet */}
            <path
              d="M 120 54 
                 C 106 74, 78 104, 78 132 
                 C 78 138, 80 144, 83 150 
                 C 80 142, 82 128, 92 108 
                 C 102 88, 115 66, 120 54 Z"
              fill="url(#abjLiquidSpecular)"
              opacity="0.85"
              pointerEvents="none"
            />

            {/* Dynamic Water Wave Ripple at Droplet Bottom */}
            <g className={animated ? "prima-anim-wave" : ""} style={{ animation: animated ? 'primaWaveFlow 3.5s ease-in-out infinite' : 'none' }}>
              <path
                d="M 72 138 
                   C 88 126, 104 150, 120 138 
                   C 136 126, 152 150, 168 138 
                   C 170 148, 160 172, 120 184 
                   C 80 172, 70 148, 72 138 Z"
                fill="url(#abjCyanWaterGrad)"
                opacity="0.75"
              />
              <path
                d="M 78 146 
                   C 94 136, 108 156, 120 146 
                   C 132 136, 146 156, 162 146 
                   C 156 164, 142 180, 120 184 
                   C 98 180, 84 164, 78 146 Z"
                fill="#38bdf8"
                opacity="0.5"
              />
            </g>

            {/* 5. LAYER FIVE: Golden Assurance Wings & Central Verification Crest (No Letter P) */}
            {/* Symmetrical Golden Assurance Wings Framing the Droplet */}
            <path
              d="M 80 116 
                 C 80 144, 98 164, 120 170 
                 C 102 163, 90 146, 88 124 Z"
              fill="url(#abjGoldenAssuranceGrad)"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path
              d="M 160 116 
                 C 160 144, 142 164, 120 170 
                 C 138 163, 150 146, 152 124 Z"
              fill="url(#abjGoldenAssuranceGrad)"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Central Precision Assurance Shield / Diamond Crystal */}
            <g
              style={{
                animation: animated ? 'primaShineGleam 2.8s ease-in-out infinite' : 'none',
                transformOrigin: '120px 114px',
              }}
            >
              {/* Diamond Crystal Core Frame */}
              <polygon
                points="120,92 142,114 120,136 98,114"
                fill="url(#abjGoldenAssuranceGrad)"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinejoin="round"
                filter="url(#primaGlowFilter)"
              />
              {/* Inner Facet of Diamond */}
              <polygon
                points="120,97 137,114 120,131 103,114"
                fill="#003b73"
                stroke="#bae6fd"
                strokeWidth="1"
              />

              {/* Sparkling Central Star Core */}
              <polygon
                points="120,103 123,111 131,114 123,117 120,125 117,117 109,114 117,111"
                fill="#ffffff"
                stroke="#38bdf8"
                strokeWidth="0.6"
              />

              {/* Luminous Center Node */}
              <circle cx="120" cy="114" r="3.2" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
            </g>

            {/* Precision Quality Audit Checkmark Emblem */}
            <g
              className="drop-shadow-sm"
              style={{
                animation: animated ? 'primaAuraPulse 3s ease-in-out infinite' : 'none',
                transformOrigin: '120px 148px',
              }}
            >
              <circle cx="120" cy="148" r="9" fill="#0054a6" stroke="url(#abjGoldenAssuranceGrad)" strokeWidth="1.5" />
              <path
                d="M 115.5 148 L 118.5 151.2 L 124.5 144.5"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>

          {/* 6. Precision Corner Vertices on Hexagon (Tech Assurance Indicators) */}
          <circle cx="120" cy="24" r="3" fill="#00aded" stroke="#ffffff" strokeWidth="1" />
          <circle cx="198" cy="68" r="3" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
          <circle cx="198" cy="158" r="3" fill="#00aded" stroke="#ffffff" strokeWidth="1" />
          <circle cx="120" cy="202" r="3" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
          <circle cx="42" cy="158" r="3" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
          <circle cx="42" cy="68" r="3" fill="#00aded" stroke="#ffffff" strokeWidth="1" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="font-black tracking-wider bg-gradient-to-r from-[#003b73] via-[#0054a6] to-[#00aded] bg-clip-text text-transparent text-xl sm:text-2xl font-mono leading-none">
              PRIMA
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
              Air Bersih Jakarta
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight mt-0.5 leading-tight">
            Project Records, Intelligence, Monitoring &amp; Assurance
          </span>
        </div>
      )}
    </div>
  );
};
