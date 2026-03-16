import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ onClose, title, children }) {
  const modalRef = useRef(null)

  // Trap focus inside modal
  useEffect(() => {
    const el = modalRef.current
    if (!el) return

    // Focus the modal container on open
    el.focus()

    const focusable = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    el.addEventListener('keydown', handleKeyDown)
    first?.focus()

    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/65 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        ref={modalRef}
        tabIndex={-1}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          exit={{    scale: 0.95, opacity: 0 }}
          className="bg-white border-[2.5px] border-black shadow-brut-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between p-5 border-b-[2.5px] border-black">
              <h2 className="font-display text-xl font-bold">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="w-8 h-8 flex items-center justify-center border-[2.5px] border-black hover:bg-coral hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}