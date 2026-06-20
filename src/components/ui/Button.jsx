export function Button({
  children,
  variante = 'primary',
  loading = false,
  disabled = false,
  larguraTotal = false,
  onClick,
  type = 'button',
  className = '',
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variantes = {
    primary:
      'bg-primary text-white hover:bg-primary-light active:bg-primary-dark focus:ring-primary min-h-[48px] px-6 py-3',
    secondary:
      'bg-white text-primary border-2 border-primary hover:bg-red-50 active:bg-red-100 focus:ring-primary min-h-[48px] px-6 py-3',
    ghost:
      'bg-transparent text-primary hover:bg-red-50 active:bg-red-100 focus:ring-primary min-h-[44px] px-4 py-2',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variantes[variante]} ${larguraTotal ? 'w-full' : ''} ${className}`}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
