import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { signup } from '../api/auth.api'
import { checkUsername } from '../api/users.api'
import { useAuthStore } from '../store/authStore'
import errorMessage from '../utils/errorMessage'
import { useDebounce } from '../hooks/useDebounce'
import { slideUp, stagger } from '../animations/variants'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  username: z
    .string()
    .min(3, 'At least 3 characters')
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain one uppercase letter')
    .regex(/[0-9]/, 'Must contain one number'),
})

// Password strength: 0-4
function getStrength(password = '') {
  let score = 0
  if (password.length >= 8)            score++
  if (/[A-Z]/.test(password))         score++
  if (/[0-9]/.test(password))         score++
  if (/[^a-zA-Z0-9]/.test(password))  score++
  return score
}

const STRENGTH_COLORS = ['bg-coral', 'bg-coral', 'bg-yellow', 'bg-lime', 'bg-lime']
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']

export default function SignupPage() {
  const navigate = useNavigate()
  const { login: storeLogin } = useAuthStore()
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  // Username availability
  const [usernameAvailable, setUsernameAvailable] = useState(null) // null | true | false
  const [checkingUsername, setCheckingUsername] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) })

  const usernameValue = watch('username') || ''
  const passwordValue = watch('password') || ''
  const debouncedUsername = useDebounce(usernameValue, 400)
  const strength = getStrength(passwordValue)

  // Live username availability check
  useEffect(() => {
    if (debouncedUsername.length < 3) {
      setUsernameAvailable(null)
      return
    }
    setCheckingUsername(true)
    checkUsername(debouncedUsername)
      .then((res) => setUsernameAvailable(res.data.available))
      .catch(() => setUsernameAvailable(null))
      .finally(() => setCheckingUsername(false))
  }, [debouncedUsername])

  const onSubmit = async (data) => {
    if (usernameAvailable === false) return
    setLoading(true)
    setServerError('')
    try {
      const res = await signup(data)
      storeLogin(res.data.user, res.data.accessToken, res.data.refreshToken)
      navigate('/dashboard')
    } catch (err) {
      setServerError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left panel — branding */}
      <div className="hidden lg:flex w-1/2 bg-black flex-col justify-between p-12">
        <Link to="/" className="font-display text-2xl font-bold text-yellow hover:opacity-80 transition-opacity">
          CartCrew
        </Link>
        <div>
          <h1 className="font-display text-5xl font-bold text-white leading-tight">
            Shop together.<br />Decide faster.
          </h1>
          <p className="font-body text-white/60 mt-4 text-lg">
            Create rooms, share products, vote together.
          </p>
        </div>
        <div className="font-mono text-white/30 text-xs">CARTCREW © 2025</div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-cream p-8 overflow-y-auto">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="w-full max-w-md">

          {/* Mobile logo */}
          <motion.div variants={slideUp} className="lg:hidden mb-8">
            <Link to="/" className="font-display text-2xl font-bold hover:opacity-80 transition-opacity">
              CartCrew
            </Link>
          </motion.div>

          <motion.h2 variants={slideUp} className="font-display text-3xl font-bold mb-2">
            Create account
          </motion.h2>
          <motion.p variants={slideUp} className="font-body text-muted mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-black font-bold underline">Log in</Link>
          </motion.p>

          {serverError && (
            <motion.div variants={slideUp} className="bg-coral text-white font-body text-sm p-3 mb-6 border-[2.5px] border-black shadow-brut">
              {serverError}
            </motion.div>
          )}

          <motion.form variants={stagger} onSubmit={handleSubmit(onSubmit)}>

            {/* Name */}
            <motion.div variants={slideUp} className="mb-5">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="Jashan"
                className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
              />
              {errors.name && (
                <p className="font-mono text-[11px] text-coral uppercase mt-1">{errors.name.message}</p>
              )}
            </motion.div>

            {/* Username with live availability */}
            <motion.div variants={slideUp} className="mb-5">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Username
              </label>
              <div className={`flex items-center border-[2.5px] bg-white focus-within:shadow-brut transition-shadow
                ${usernameAvailable === false ? 'border-coral' : usernameAvailable === true ? 'border-lime' : 'border-black'}`}
              >
                <span className="font-mono text-sm text-muted px-3 py-2.5 border-r-[2.5px] border-black bg-cream">
                  @
                </span>
                <input
                  {...register('username')}
                  type="text"
                  placeholder="jashan_dev"
                  className="flex-1 bg-transparent font-body text-sm px-3 py-2.5 outline-none"
                />
                {/* Availability indicator */}
                <div className="px-3">
                  {checkingUsername && (
                    <div className="w-3 h-3 border-2 border-muted border-t-transparent rounded-full animate-spin" />
                  )}
                  {!checkingUsername && usernameAvailable === true && (
                    <Check size={14} className="text-lime" />
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <X size={14} className="text-coral" />
                  )}
                </div>
              </div>
              {errors.username && (
                <p className="font-mono text-[11px] text-coral uppercase mt-1">{errors.username.message}</p>
              )}
              {!errors.username && usernameAvailable === false && (
                <p className="font-mono text-[11px] text-coral uppercase mt-1">Username already taken</p>
              )}
              {!errors.username && usernameAvailable === true && (
                <p className="font-mono text-[11px] text-lime uppercase mt-1">Username available</p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div variants={slideUp} className="mb-5">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
              />
              {errors.email && (
                <p className="font-mono text-[11px] text-coral uppercase mt-1">{errors.email.message}</p>
              )}
            </motion.div>

            {/* Password with strength indicator */}
            <motion.div variants={slideUp} className="mb-8">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
              />

              {/* Strength bar — 4 blocks */}
              {passwordValue.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 transition-colors duration-200 ${
                          strength >= level ? STRENGTH_COLORS[strength] : 'bg-black/10'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-muted uppercase">
                    {STRENGTH_LABELS[strength]}
                  </span>
                </div>
              )}

              {errors.password && (
                <p className="font-mono text-[11px] text-coral uppercase mt-1">{errors.password.message}</p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.button
              variants={slideUp}
              type="submit"
              disabled={loading || usernameAvailable === false}
              whileHover={{ x: -2, y: -2 }}
              whileTap={{ x: 2, y: 2 }}
              className="w-full bg-yellow border-[2.5px] border-black font-body font-semibold text-sm py-3 shadow-brut hover:shadow-brut-lg transition-shadow disabled:opacity-50"
            >
              {loading ? '...' : 'Create account'}
            </motion.button>

          </motion.form>
        </motion.div>
      </div>
    </div>
  )
}
