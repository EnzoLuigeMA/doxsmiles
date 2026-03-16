interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

const sizes = {
  sm: { svg: 32, text: 'text-lg' },
  md: { svg: 48, text: 'text-2xl' },
  lg: { svg: 64, text: 'text-3xl' },
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const { svg: svgSize, text: textClass } = sizes[size]

  return (
    <div className="flex items-center gap-3">
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="DOX English Logo"
      >
        {/* Penrose-style impossible triangle in DOX red */}
        <path
          d="M50 8 L92 82 H8 Z"
          fill="none"
          stroke="#CC0000"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          d="M50 24 L76 72 H24 Z"
          fill="none"
          stroke="#CC0000"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Impossible triangle illusion - overlapping segments */}
        <path
          d="M50 8 L35 35 L65 35 Z"
          fill="#CC0000"
          opacity="0.9"
        />
        <path
          d="M20 65 L35 35 L50 65 Z"
          fill="#880000"
          opacity="0.9"
        />
        <path
          d="M80 65 L65 35 L50 65 Z"
          fill="#AA0000"
          opacity="0.9"
        />
        {/* Center void */}
        <path
          d="M50 38 L40 55 H60 Z"
          fill="#0A0A0A"
        />
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textClass} font-display font-bold text-dox-white tracking-tight`}>
            DOX
          </span>
          <span className="text-xs text-dox-muted tracking-widest uppercase">
            English
          </span>
        </div>
      )}
    </div>
  )
}
