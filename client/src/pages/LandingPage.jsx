import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ThumbsUp, MessageSquare, Zap, Link, CheckSquare, Plus, ShoppingBag } from 'lucide-react'
import { stagger, slideUp } from '../animations/variants'

const STEPS = [
  { num: '01', icon: Plus,         title: 'Create a Room',  desc: 'Name it, pick an icon, set the vibe.',      accent: 'bg-yellow' },
  { num: '02', icon: ShoppingBag,  title: 'Add Products',   desc: 'Paste links or add manually. Any platform.', accent: 'bg-lime' },
  { num: '03', icon: ThumbsUp,     title: 'Vote Together',  desc: 'Everyone votes. Best products rise up.',     accent: 'bg-blue' },
  { num: '04', icon: CheckSquare,  title: 'Decide',         desc: 'Mark as bought. Close the deal.',            accent: 'bg-coral' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cream">

      {/* Black navbar */}
      <nav className="bg-black border-b-[2.5px] border-black px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow flex items-center justify-center border-[2px] border-yellow/50">
            <span className="font-display text-sm font-black text-black">C</span>
          </div>
          <span className="font-display text-xl font-bold text-white">CartCrew</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="font-body text-sm text-white/60 hover:text-white transition-colors px-4 py-2"
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="font-body text-sm font-semibold bg-yellow text-black border-[2.5px] border-yellow px-4 py-2 shadow-brut hover:shadow-brut-lg transition-shadow"
          >
            Sign up free
          </button>
        </div>
      </nav>

      {/* Hero — cream background, oversized type */}
      <section className="px-8 py-24 max-w-6xl mx-auto">
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={slideUp} className="mb-6">
            <span className="font-mono text-xs uppercase tracking-widest border-[2.5px] border-black px-3 py-1 bg-yellow">
              Real-time collaborative shopping
            </span>
          </motion.div>
          <motion.h1
            variants={slideUp}
            className="font-display text-6xl lg:text-8xl font-black leading-[0.9] mb-6"
          >
            Shop Together.<br />
            <span className="relative inline-block">
              Decide
              <span className="absolute bottom-1 left-0 w-full h-3 bg-lime -z-10" />
            </span>{' '}
            Faster.
          </motion.h1>
          <motion.p variants={slideUp} className="font-body text-lg text-black/70 font-medium max-w-xl mb-10 leading-relaxed">
            Create group shopping rooms, share products, vote on purchases,
            and decide together — replacing scattered WhatsApp threads.
          </motion.p>
          <motion.div variants={slideUp} className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/signup')}
              className="font-body font-semibold bg-yellow border-[2.5px] border-black px-8 py-4 text-base shadow-brut hover:shadow-brut-lg transition-shadow"
            >
              Get started free →
            </button>
            <button
              onClick={() => navigate('/login')}
              className="font-body text-sm border-[2.5px] border-black px-6 py-4 hover:bg-black hover:text-white transition-colors"
            >
              Log in
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Problem — cream background, colored cards */}
      <section className="bg-cream border-y-[2.5px] border-black px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-[11px] uppercase tracking-widest text-black/60 mb-10">
            Sound familiar?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { num: '01', text: 'Sending product links over WhatsApp in a messy thread nobody can follow', bg: 'bg-yellow', numColor: 'text-black/40', textColor: 'text-black' },
              { num: '02', text: 'No way to vote or compare — just conflicting opinions in chat', bg: 'bg-coral', numColor: 'text-white/40', textColor: 'text-white' },
              { num: '03', text: 'Decisions get lost and nobody remembers what was decided', bg: 'bg-blue', numColor: 'text-white/40', textColor: 'text-white' },
            ].map((item) => (
              <div key={item.num} className={`border-[2.5px] border-black p-8 shadow-brut ${item.bg} hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-lg transition-all`}>
                <span className={`font-mono text-3xl font-bold block mb-4 ${item.numColor}`}>
                  {item.num}
                </span>
                <p className={`font-display text-xl font-bold leading-snug ${item.textColor}`}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — cream with colorful step accents */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-widest text-black/60 mb-2">How it works</p>
        <h2 className="font-display text-5xl font-black mb-12">Four steps.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step) => (
            <div key={step.num} className="border-[2.5px] border-black bg-white shadow-brut hover:-translate-y-1 hover:shadow-brut-lg transition-all p-6">
              <div className={`w-10 h-10 ${step.accent} border-[2.5px] border-black flex items-center justify-center mb-4`}>
                <step.icon size={16} className="text-black" />
              </div>
              <span className="font-mono text-xs text-black/60 block mb-1">{step.num}</span>
              <h3 className="font-display text-lg font-bold mb-2">{step.title}</h3>
              <p className="font-body text-sm font-medium text-black/70 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features — white background */}
      <section className="bg-white border-y-[2.5px] border-black px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-[11px] uppercase tracking-widest text-black/60 mb-2">Features</p>
          <h2 className="font-display text-5xl font-black mb-12">Everything your group needs.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Home,          title: 'Group Rooms',      desc: 'Create a room for any shopping occasion.',     cardBg: 'bg-yellow', textColor: 'text-black', descColor: 'text-black/70', iconBg: 'bg-black',  iconColor: 'text-yellow' },
              { icon: ThumbsUp,      title: 'Real-time Voting', desc: 'Upvote or downvote. See counts update live.', cardBg: 'bg-lime',   textColor: 'text-black', descColor: 'text-black/70', iconBg: 'bg-black',  iconColor: 'text-lime' },
              { icon: MessageSquare, title: 'Comments',         desc: 'Discuss each product in its own thread.',     cardBg: 'bg-blue',   textColor: 'text-white', descColor: 'text-white/70', iconBg: 'bg-white',  iconColor: 'text-blue' },
              { icon: Zap,           title: 'Live Updates',     desc: 'Everything syncs instantly. No refreshing.',  cardBg: 'bg-coral',  textColor: 'text-white', descColor: 'text-white/70', iconBg: 'bg-white',  iconColor: 'text-coral' },
              { icon: Link,          title: 'Easy Invites',     desc: 'Share a link or code. One click to join.',    cardBg: 'bg-purple', textColor: 'text-white', descColor: 'text-white/70', iconBg: 'bg-white',  iconColor: 'text-purple' },
              { icon: CheckSquare,   title: 'Track Decisions',  desc: 'Mark products as bought or skipped.',         cardBg: 'bg-black',  textColor: 'text-white', descColor: 'text-white/70', iconBg: 'bg-yellow', iconColor: 'text-black' },
            ].map((f) => (
              <div key={f.title} className={`border-[2.5px] border-black p-6 shadow-brut ${f.cardBg} hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-lg transition-all`}>
                <div className={`w-10 h-10 ${f.iconBg} border-[2.5px] border-black flex items-center justify-center mb-4`}>
                  <f.icon size={16} className={f.iconColor} />
                </div>
                <h3 className={`font-display text-lg font-bold mb-2 ${f.textColor}`}>{f.title}</h3>
                <p className={`font-body text-sm font-medium leading-relaxed ${f.descColor}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — yellow */}
      <section className="bg-yellow border-y-[2.5px] border-black px-8 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-black/50 mb-4">Get started today</p>
        <h2 className="font-display text-6xl font-black text-black mb-4 leading-tight">
          Ready to shop<br />smarter?
        </h2>
        <p className="font-body text-black/75 mb-10 text-lg font-semibold">
          Free forever. No credit card required.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="font-body font-semibold bg-black text-white border-[2.5px] border-black px-12 py-5 text-base shadow-brut-xl hover:shadow-none transition-shadow"
        >
          Create your first room →
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-black px-8 py-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-yellow flex items-center justify-center">
              <span className="font-display text-xs font-black text-black">C</span>
            </div>
            <span className="font-display text-lg font-bold text-yellow">CartCrew</span>
          </div>
          <span className="font-mono text-xs text-white/20">
            Built with React + Node.js + Socket.io
          </span>
        </div>
      </footer>

    </div>
  )
}