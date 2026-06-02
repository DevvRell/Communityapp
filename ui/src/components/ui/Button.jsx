import { Loader2 } from 'lucide-react'

/**
 * Branded button primitive.
 * Variants:
 *   - primary  → gold on forest (default CTA)
 *   - secondary → forest on cream (interior pages)
 *   - ghost    → transparent with cream/forest hover
 *   - danger   → rose accent
 */
const variants = {
  primary:
    'bg-gold-500 hover:bg-gold-400 text-forest-900 shadow-lg shadow-gold-500/30 hover:shadow-xl hover:shadow-gold-500/40',
  secondary:
    'bg-forest-700 hover:bg-forest-600 text-cream-50 shadow-md shadow-forest-900/20 hover:shadow-lg',
  ghost:
    'bg-transparent hover:bg-forest-100 text-forest-800 border border-forest-200 hover:border-forest-300',
  danger:
    'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 rounded-xl',
  lg: 'px-6 py-3 text-lg rounded-xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  children,
  disabled,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-250 ease-brand hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" /> {children}
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'lg' ? 18 : 16} />}
          {children}
          {IconRight && <IconRight size={size === 'lg' ? 18 : 16} />}
        </>
      )}
    </button>
  )
}
