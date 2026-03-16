import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateProfile, changePassword, uploadAvatar } from '../api/users.api'
import { useAuthStore } from '../store/authStore'
import errorMessage from '../utils/errorMessage'
import { slideUp, stagger } from '../animations/variants'
import { updateProfile, changePassword, uploadAvatar, deleteAccount } from '../api/users.api'
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  bio:  z.string().max(160).optional(),
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
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null)
  const fileInputRef = useRef(null)

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', bio: user?.bio || '' },
  })

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) })

  // Handle file selection → preview + upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)

    // Upload to Cloudinary via server
    setAvatarLoading(true)
    try {
      const res = await uploadAvatar(file)
      updateUser(res.data.user)
      toast.success('Avatar updated!')
    } catch (err) {
      toast.error(errorMessage(err))
      setAvatarPreview(user?.avatar || null) // revert preview
    } finally {
      setAvatarLoading(false)
    }
  }

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

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-cream">

      {/* Navbar */}
      <div className="border-b-[2.5px] border-black bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 font-body text-sm border-[2.5px] border-black px-3 py-1.5 shadow-brut hover:shadow-brut-lg transition-shadow hover:-translate-x-0.5 hover:-translate-y-0.5"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <span className="font-display text-xl font-bold">Profile</span>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Avatar + name header */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="flex items-center gap-6 mb-10">
          <motion.div variants={slideUp} className="relative group">
            {/* Avatar square */}
            <div
              className="w-20 h-20 bg-yellow border-[2.5px] border-black shadow-brut flex items-center justify-center overflow-hidden relative cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-3xl font-black text-black">{initial}</span>
              )}

              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {avatarLoading
                  ? <Loader2 size={20} className="text-white animate-spin" />
                  : <Camera size={20} className="text-white" />
                }
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </motion.div>

          <motion.div variants={slideUp}>
            <h1 className="font-display text-2xl font-bold">{user?.name}</h1>
            <p className="font-mono text-sm text-muted">@{user?.username}</p>
            <p className="font-mono text-xs text-muted">{user?.email}</p>
            <p className="font-mono text-[10px] text-muted/60 mt-1">Click avatar to change</p>
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

        {/* Danger Zone */}
        <div className="border-[2.5px] border-coral p-6">
          <h2 className="font-display text-xl font-bold text-coral mb-2">Danger Zone</h2>
          <p className="font-body text-sm text-muted mb-4">
            Permanently deletes your account, all rooms you own, and all your content.
            This cannot be undone.
          </p>
          <button
            className="bg-coral text-white border-[2.5px] border-black font-body font-semibold text-sm px-6 py-2.5 shadow-brut hover:shadow-brut-lg transition-shadow"
            onClick={() => {
              if (window.confirm('This will permanently delete your account and everything you own. Are you absolutely sure?')) {
                deleteAccount()
                  .then(() => {
                    useAuthStore.getState().logout()
                    window.location.href = '/'
                  })
                  .catch(() => toast.error('Failed to delete account'))
              }
            }}
          >
            Delete Account
          </button>
        </div>

      </div>
    </div>
  )
}
