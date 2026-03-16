interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

const sizes = {
  sm: { svg: 32, text: 'text-lg', sub: 'text-[8px]' },
  md: { svg: 48, text: 'text-2xl', sub: 'text-[10px]' },
  lg: { svg: 64, text: 'text-3xl', sub: 'text-xs' },
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const { svg: svgSize, text: textClass, sub: subClass } = sizes[size]

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {/* Glow effect behind logo */}
        <div className="absolute inset-0 bg-dox-red/20 rounded-full blur-xl scale-150 animate-pulse-glow" />
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="DOX English Logo"
          className="relative z-10 drop-shadow-[0_0_10px_rgba(204,0,0,0.3)]"
        >
          {/* Outer triangle */}
          <path
            d="M50 8 L92 82 H8 Z"
            fill="none"
            stroke="url(#logoGradient)"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {/* Inner triangle */}
          <path
            d="M50 24 L76 72 H24 Z"
            fill="none"
            stroke="url(#logoGradient)"
            strokeWidth="4"
            strokeLinejoin="round"
            opacity="0.6"
          />
          {/* Impossible triangle illusion */}
          <path d="M50 8 L35 35 L65 35 Z" fill="#CC0000" opacity="0.95" />
          <path d="M20 65 L35 35 L50 65 Z" fill="#880000" opacity="0.95" />
          <path d="M80 65 L65 35 L50 65 Z" fill="#AA0000" opacity="0.95" />
          {/* Center void */}
          <path d="M50 38 L40 55 H60 Z" fill="#0A0A0A" />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="logoGradient" x1="10" y1="10" x2="90" y2="90">
              <stop offset="0%" stopColor="#ff3333" />
              <stop offset="50%" stopColor="#CC0000" />
              <stop offset="100%" stopColor="#880000" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textClass} font-display font-bold text-gradient-red tracking-tight`}>
            DOX
          </span>
          <span className={`${subClass} text-dox-muted tracking-[0.25em] uppercase`}>
            English
          </span>
        </div>
      )}
    </div>
  )
}
