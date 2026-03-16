// Toast config — pass to <Toaster> in main.jsx
// Overrides react-hot-toast defaults to match neo-brutalism design system

export const toastOptions = {
  duration: 3000,
  position: 'bottom-right',
  style: {
    background: 'transparent',
    boxShadow: 'none',
    padding: 0,
  },
  success: {
    duration: 3000,
    style: {},
    className: '',
    // Custom component via toast.success('msg', { icon: null })
  },
  error: {
    duration: 5000,
  },
  custom: {
    duration: 4000,
  },
}

// Helpers to fire styled toasts
// Usage: import { showToast } from './Toast'
// showToast.success('Room created!')
// showToast.error('Failed to load')
// showToast.info('Friend added a product')

import toast from 'react-hot-toast'

const base = 'font-body text-sm font-semibold border-[2.5px] border-black shadow-brut px-4 py-3'

export const showToast = {
  success: (msg) =>
    toast.custom(
      (t) => (
        <div
          className={`${base} bg-lime text-black transition-all ${
            t.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
        >
          {msg}
        </div>
      ),
      { duration: 3000 }
    ),

  error: (msg) =>
    toast.custom(
      (t) => (
        <div
          className={`${base} bg-coral text-white transition-all ${
            t.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
        >
          {msg}
        </div>
      ),
      { duration: 5000 }
    ),

  info: (msg) =>
    toast.custom(
      (t) => (
        <div
          className={`${base} bg-blue text-white transition-all ${
            t.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
        >
          {msg}
        </div>
      ),
      { duration: 4000 }
    ),
}
