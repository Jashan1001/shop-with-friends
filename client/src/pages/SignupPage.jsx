import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { signup } from '../api/auth.api'
import { useAuthStore } from '../store/authStore'
import errorMessage from '../utils/errorMessage'
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

export default function SignupPage() {
  const navigate = useNavigate()
  const { login: storeLogin } = useAuthStore()
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data) => {
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
        <div>
          <span className="font-display text-2xl font-bold text-yellow">
            CartCrew
          </span>
        </div>
        <div>
          <h1 className="font-display text-5xl font-bold text-white leading-tight">
            Shop together.<br />Decide faster.
          </h1>
          <p className="font-body text-white/60 mt-4 text-lg">
            Create rooms, share products, vote together.
          </p>
        </div>
        <div className="font-mono text-white/30 text-xs">
          CARTCREW © 2025
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-cream p-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <motion.div variants={slideUp} className="lg:hidden mb-8">
            <span className="font-display text-2xl font-bold">CartCrew</span>
          </motion.div>

          <motion.h2 variants={slideUp} className="font-display text-3xl font-bold mb-2">
            Create account
          </motion.h2>
          <motion.p variants={slideUp} className="font-body text-muted mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-black font-bold underline">
              Log in
            </Link>
          </motion.p>

          {/* Server error */}
          {serverError && (
            <motion.div
              variants={slideUp}
              className="bg-coral text-white font-body text-sm p-3 mb-6 border-[2.5px] border-black shadow-brut"
            >
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
                <p className="font-mono text-[11px] text-coral uppercase mt-1">
                  {errors.name.message}
                </p>
              )}
            </motion.div>

            {/* Username */}
            <motion.div variants={slideUp} className="mb-5">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Username
              </label>
              <div className="flex items-center border-[2.5px] border-black bg-white focus-within:shadow-brut transition-shadow">
                <span className="font-mono text-sm text-muted px-3 py-2.5 border-r-[2.5px] border-black bg-cream">
                  @
                </span>
                <input
                  {...register('username')}
                  type="text"
                  placeholder="jashan_dev"
                  className="flex-1 bg-transparent font-body text-sm px-3 py-2.5 outline-none"
                />
              </div>
              {errors.username && (
                <p className="font-mono text-[11px] text-coral uppercase mt-1">
                  {errors.username.message}
                </p>
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
                <p className="font-mono text-[11px] text-coral uppercase mt-1">
                  {errors.email.message}
                </p>
              )}
            </motion.div>

            {/* Password */}
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
              {errors.password && (
                <p className="font-mono text-[11px] text-coral uppercase mt-1">
                  {errors.password.message}
                </p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.button
              variants={slideUp}
              type="submit"
              disabled={loading}
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