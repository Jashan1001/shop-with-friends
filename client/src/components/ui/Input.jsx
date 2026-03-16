// Input — all 4 states: default, focus, error, disabled
// Field label: IBM Plex Mono 11px 700 ALL CAPS 0.08em tracking

export function FieldLabel({ children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] block mb-1.5"
    >
      {children}
    </label>
  )
}

export function FieldError({ children }) {
  if (!children) return null
  return (
    <p className="font-mono text-[11px] uppercase text-coral mt-1 tracking-wide">
      {children}
    </p>
  )
}

export default function Input({
  label,
  error,
  id,
  className = '',
  disabled = false,
  textarea = false,
  rows = 3,
  ...props
}) {
  const borderClass = error
    ? 'border-coral focus:shadow-[4px_4px_0_#FF5252]'
    : 'border-black focus:shadow-brut'

  const sharedClass = `
    w-full border-[2.5px] bg-white font-body text-sm px-3 py-2.5
    outline-none transition-shadow
    disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[#F5F5F5]
    ${borderClass}
    ${className}
  `

  return (
    <div>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      {textarea ? (
        <textarea
          id={id}
          disabled={disabled}
          rows={rows}
          className={`${sharedClass} resize-none`}
          {...props}
        />
      ) : (
        <input
          id={id}
          disabled={disabled}
          className={sharedClass}
          {...props}
        />
      )}
      <FieldError>{error}</FieldError>
    </div>
  )
}
