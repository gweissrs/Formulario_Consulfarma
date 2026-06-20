export function Badge({ children, variante = 'default', className = '' }) {
  const variantes = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-red-100 text-primary',
    warning: 'bg-yellow-100 text-yellow-800',
    success: 'bg-green-100 text-green-800',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variantes[variante]} ${className}`}
    >
      {children}
    </span>
  )
}
