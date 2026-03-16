// Avatar — yellow square with initials, per Section 5.5

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?'

  const sizeClasses = {
    xs:  'w-6 h-6 text-[9px]',
    sm:  'w-8 h-8 text-[11px]',
    md:  'w-10 h-10 text-[14px]',
    lg:  'w-14 h-14 text-[20px]',
    xl:  'w-20 h-20 text-[28px]',
  }

  return (
    <div
      className={`
        bg-yellow border-[2.5px] border-black
        flex items-center justify-center flex-shrink-0
        font-mono font-bold text-black
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
    >
      {initial}
    </div>
  )
}
