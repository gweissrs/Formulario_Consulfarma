export function Card({ children, className = '', onClick, selecionado = false }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm border transition-all duration-150 p-4
        ${onClick ? 'cursor-pointer' : ''}
        ${selecionado
          ? 'border-primary bg-red-50 shadow-md'
          : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
        }
        ${className}
      `}
    >
      {children}
    </div>
  )
}
