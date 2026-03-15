import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeIn, slideUp, stagger } from '../animations/variants'

const FEATURES = [
  { emoji: '🏠', title: 'Group Rooms', desc: 'Create a room for any shopping occasion — gadgets, fashion, home.' },
  { emoji: '🗳️', title: 'Real-time Voting', desc: 'Upvote or downvote products. See counts update live as friends vote.' },
  { emoji: '💬', title: 'Per-product Comments', desc: 'Discuss each product in its own thread. No more buried WhatsApp chats.' },
  { emoji: '⚡', title: 'Live Updates', desc: 'Everything syncs in real-time. No refreshing needed.' },
  { emoji: '🔗', title: 'Easy Invites', desc: 'Share a link or code. Friends join in one click.' },
  { emoji: '✅', title: 'Track Decisions', desc: 'Mark products as bought or skipped. Keep a clean history.' },
]

const STEPS = [
  { num: '01', title: 'Create a Room', desc: 'Name it, pick an emoji, set the vibe.' },
  { num: '02', title: 'Add Products', desc: 'Paste links or add manually. Amazon, Flipkart, anywhere.' },
  { num: '03', title: 'Vote Together', desc: 'Everyone votes. Best products float to the top.' },
  { num: '04', title: 'Decide', desc: 'Mark as bought. Room owner closes the deal.' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cream">

      {/* Navbar */}
      <nav className="border-b-[2.5px] border-black bg-cream sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
        <span className="font-display text-xl font-bold">ShopFriends</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="font-body text-sm border-[2.5px] border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="font-body text-sm font-semibold bg-yellow border-[2.5px] border-black px-4 py-2 shadow-brut hover:shadow-brut-lg transition-shadow"
          >
            Sign up free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 py-24 max-w-6xl mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.div variants={slideUp}>
            <span className="font-mono text-xs uppercase tracking-widest border-[2.5px] border-black px-3 py-1 bg-yellow">
              Real-time collaborative shopping
            </span>
          </motion.div>
          <motion.h1
            variants={slideUp}
            className="font-display text-6xl lg:text-7xl font-black mt-6 mb-6 leading-[0.95]"
          >
            Shop Together.<br />Decide Faster.
          </motion.h1>
          <motion.p
            variants={slideUp}
            className="font-body text-lg text-muted max-w-xl mb-8 leading-relaxed"
          >
            Create group shopping rooms, share products, vote on purchases,
            and decide together — replacing the scattered WhatsApp thread workflow.
          </motion.p>
          <motion.div variants={slideUp} className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/signup')}
              className="font-body font-semibold bg-yellow border-[2.5px] border-black px-8 py-3 shadow-brut hover:shadow-brut-lg transition-shadow text-base"
            >
              Get started free →
            </button>
            <button
              onClick={() => navigate('/login')}
              className="font-body text-sm border-[2.5px] border-black px-6 py-3 hover:bg-black hover:text-white transition-colors"
            >
              Log in
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Problem section */}
      <section className="bg-black px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-white/40 mb-8">
            Sound familiar?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '01', text: 'Sending product links over WhatsApp in a messy thread nobody can follow' },
              { num: '02', text: 'No way to vote or compare — just conflicting opinions in chat' },
              { num: '03', text: 'Decisions get lost and nobody remembers what was actually decided' },
            ].map((item) => (
              <div key={item.num} className="border-[2.5px] border-white/20 p-6">
                <span className="font-mono text-4xl font-bold text-yellow/30 block mb-4">
                  {item.num}
                </span>
                <p className="font-body text-white/80 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
          How it works
        </p>
        <h2 className="font-display text-4xl font-bold mb-12">Four steps to a decision</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => (
            <div key={step.num} className="border-[2.5px] border-black p-6 bg-white shadow-brut">
              <span className="font-mono text-3xl font-bold text-black/20 block mb-3">
                {step.num}
              </span>
              <h3 className="font-display text-lg font-bold mb-2">{step.title}</h3>
              <p className="font-body text-sm text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="px-8 py-20 bg-white border-y-[2.5px] border-black">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
            Features
          </p>
          <h2 className="font-display text-4xl font-bold mb-12">Everything your group needs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="border-[2.5px] border-black p-6 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brut transition-all cursor-default">
                <div className="w-10 h-10 bg-yellow border-[2.5px] border-black flex items-center justify-center text-lg mb-4">
                  {f.emoji}
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
                <p className="font-body text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-yellow border-y-[2.5px] border-black px-8 py-20 text-center">
        <h2 className="font-display text-5xl font-black mb-4">
          Ready to shop smarter?
        </h2>
        <p className="font-body text-muted mb-8 text-lg">
          Free forever. No credit card required.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="font-body font-semibold bg-black text-white border-[2.5px] border-black px-10 py-4 text-base shadow-brut-xl hover:shadow-none transition-shadow"
        >
          Create your first room →
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-black px-8 py-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-display text-lg font-bold text-yellow">ShopFriends</span>
          <span className="font-mono text-xs text-white/30">
            Built with React + Node.js + Socket.io
          </span>
        </div>
      </footer>

    </div>
  )
}