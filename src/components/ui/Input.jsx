export function Input({
  label,
  erro,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  inputMode,
  autoComplete,
  maxLength,
  className = '',
  id,
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 rounded-xl border transition-colors duration-150
          bg-white text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          min-h-[48px]
          ${erro
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-200 hover:border-gray-300'
          }
        `}
      />
      {erro && (
        <span className="text-sm text-red-600">{erro}</span>
      )}
    </div>
  )
}
