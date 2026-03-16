import { motion } from 'framer-motion'

const VARIANTS = {
  primary:   'bg-yellow border-black text-black',
  secondary: 'bg-white border-black text-black',
  danger:    'bg-coral border-black text-white',
  ghost:     'bg-transparent border-black text-black',
  blue:      'bg-blue border-black text-white',
  purple:    'bg-purple border-black text-white',
}

const SIZES = {
  sm: 'text-[13px] py-1.5 px-3',
  md: 'text-[15px] py-2.5 px-5',
  lg: 'text-[17px] py-3.5 px-7',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { x: -2, y: -2 } : {}}
      whileTap={!isDisabled ? { x: 2, y: 2 } : {}}
      className={`
        inline-flex items-center justify-center gap-2
        border-[2.5px] font-body font-semibold
        shadow-brut
        transition-shadow duration-[120ms]
        hover:shadow-brut-lg
        active:shadow-none
        disabled:opacity-40 disabled:cursor-not-allowed
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size] || SIZES.md}
        ${className}
      `}
      {...props}
    >
      {loading ? <span className="font-mono">...</span> : children}
    </motion.button>
  )
}
