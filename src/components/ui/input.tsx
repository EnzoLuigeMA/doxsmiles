import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-medium text-dox-muted uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-dox-white placeholder:text-dox-muted/50 transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-dox-red/50 focus:border-dox-red/30 focus:bg-white/[0.05]',
            'hover:border-white/15 hover:bg-white/[0.04]',
            error ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/8',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <span>!</span> {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
export type { InputProps }
