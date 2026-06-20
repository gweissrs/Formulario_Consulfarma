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
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-medium text-gray-700 mb-1.5"
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
          w-full px-[14px] py-3 rounded bg-surface text-gray-900
          placeholder-gray-400 text-[14px]
          border-[1.5px] transition-colors duration-150
          focus:outline-none
          min-h-[48px]
          ${erro
            ? 'border-error focus:border-error'
            : 'border-border focus:border-primary hover:border-gray-300'
          }
        `}
      />
      {erro && (
        <span className="text-[12px] text-red-600 mt-1">{erro}</span>
      )}
    </div>
  )
}
