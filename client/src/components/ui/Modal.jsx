import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { scaleIn } from '../../animations/variants'

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',  // 'sm' | 'md' | 'lg'
  className = '',
}) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const maxW = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-[560px]' }[size] || 'max-w-md'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 z-40"
          />

          {/* Modal box */}
          <motion.div
            key="modal"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className={`
                bg-white border-[2.5px] border-black shadow-brut-xl
                w-full ${maxW} max-h-[90vh] overflow-y-auto
                ${className}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b-[2.5px] border-black sticky top-0 bg-white z-10">
                <h2 className="font-display text-xl font-bold">{title}</h2>
                <motion.button
                  whileHover={{ x: -1, y: -1 }}
                  whileTap={{ x: 1, y: 1 }}
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center border-[2.5px] border-black hover:bg-coral hover:text-white transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>

              {/* Body */}
              <div className="p-5">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
