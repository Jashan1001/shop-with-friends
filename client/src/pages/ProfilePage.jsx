import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateProfile, changePassword } from '../api/users.api'
import { useAuthStore } from '../store/authStore'
import errorMessage from '../utils/errorMessage'
import { slideUp, stagger } from '../animations/variants'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  bio: z.string().max(160).optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
})

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', bio: user?.bio || '' },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  })

  const onProfileSubmit = async (data) => {
    setProfileLoading(true)
    try {
      const res = await updateProfile(data)
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setProfileLoading(false)
    }
  }

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true)
    try {
      await changePassword(data)
      toast.success('Password changed!')
      passwordForm.reset()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">

      {/* Navbar */}
      <div className="border-b-[2.5px] border-black bg-white px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 font-body text-sm border-[2.5px] border-black px-3 py-1.5 shadow-brut hover:shadow-brut-lg transition-shadow"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <span className="font-display text-xl font-bold">Profile</span>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-10">

        {/* Avatar */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-6 mb-10"
        >
          <motion.div
            variants={slideUp}
            className="w-20 h-20 bg-yellow border-[2.5px] border-black shadow-brut flex items-center justify-center"
          >
            <span className="font-display text-3xl font-black">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </motion.div>
          <motion.div variants={slideUp}>
            <h1 className="font-display text-2xl font-bold">{user?.name}</h1>
            <p className="font-mono text-sm text-muted">@{user?.username}</p>
            <p className="font-mono text-xs text-muted">{user?.email}</p>
          </motion.div>
        </motion.div>

        {/* Profile form */}
        <div className="bg-white border-[2.5px] border-black shadow-brut p-6 mb-6">
          <h2 className="font-display text-xl font-bold mb-5">Edit Profile</h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>

            <div className="mb-4">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Display Name
              </label>
              <input
                {...profileForm.register('name')}
                className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
              />
              {profileForm.formState.errors.name && (
                <p className="font-mono text-[11px] text-coral uppercase mt-1">
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="mb-5">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Bio
              </label>
              <textarea
                {...profileForm.register('bio')}
                rows={3}
                placeholder="Tell your friends something about yourself"
                className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow resize-none"
              />
              <p className="font-mono text-[10px] text-muted mt-1">
                {profileForm.watch('bio')?.length || 0}/160
              </p>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="bg-yellow border-[2.5px] border-black font-body font-semibold text-sm px-6 py-2.5 shadow-brut hover:shadow-brut-lg transition-shadow disabled:opacity-50"
            >
              {profileLoading ? '...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password form */}
        <div className="bg-white border-[2.5px] border-black shadow-brut p-6 mb-6">
          <h2 className="font-display text-xl font-bold mb-5">Change Password</h2>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>

            <div className="mb-4">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                Current Password
              </label>
              <input
                {...passwordForm.register('currentPassword')}
                type="password"
                className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="font-mono text-[11px] text-coral uppercase mt-1">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="mb-5">
              <label className="font-mono text-[11px] font-bold uppercase tracking-widest block mb-1.5">
                New Password
              </label>
              <input
                {...passwordForm.register('newPassword')}
                type="password"
                className="w-full border-[2.5px] border-black bg-white font-body text-sm px-3 py-2.5 outline-none focus:shadow-brut transition-shadow"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="font-mono text-[11px] text-coral uppercase mt-1">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-black text-white border-[2.5px] border-black font-body font-semibold text-sm px-6 py-2.5 shadow-brut hover:shadow-brut-lg transition-shadow disabled:opacity-50"
            >
              {passwordLoading ? '...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="border-[2.5px] border-coral p-6">
          <h2 className="font-display text-xl font-bold text-coral mb-2">Danger Zone</h2>
          <p className="font-body text-sm text-muted mb-4">
            Once you delete your account, there is no going back.
          </p>
          <button
            className="bg-coral text-white border-[2.5px] border-black font-body font-semibold text-sm px-6 py-2.5 shadow-brut hover:shadow-brut-lg transition-shadow"
            onClick={() => toast.error('Account deletion coming in v2')}
          >
            Delete Account
          </button>
        </div>

      </div>
    </div>
  )
}