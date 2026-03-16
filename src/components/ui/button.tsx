import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dox-red focus-visible:ring-offset-2 focus-visible:ring-offset-dox-black disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group',
          {
            'bg-gradient-to-r from-dox-red to-red-700 text-white shadow-lg shadow-dox-red/20 hover:shadow-dox-red/40 hover:scale-[1.02] active:scale-[0.98]': variant === 'primary',
            'bg-white/5 hover:bg-white/10 text-dox-white border border-white/10 hover:border-white/20 backdrop-blur-sm': variant === 'secondary',
            'hover:bg-white/5 text-dox-muted hover:text-dox-white': variant === 'ghost',
            'bg-red-950/80 hover:bg-red-900/80 text-red-400 border border-red-900/50 hover:border-red-800/50': variant === 'destructive',
          },
          {
            'h-8 px-3 text-xs gap-1.5': size === 'sm',
            'h-10 px-5 text-sm gap-2': size === 'md',
            'h-12 px-6 text-sm gap-2': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {/* Shimmer effect on primary */}
        {variant === 'primary' && !disabled && !loading && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
        )}
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        <span className="relative z-10">{children}</span>
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
