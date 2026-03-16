// Badge — all 10 variants per Section 5.3 of the Frontend Plan
// font: IBM Plex Mono 10px 700 uppercase 0.06em tracking, padding 3px 9px

const BADGE_STYLES = {
  active:   'bg-yellow text-black',
  bought:   'bg-lime text-black',
  skipped:  'bg-coral text-white',
  amazon:   'bg-blue text-white',
  flipkart: 'bg-white text-black',
  myntra:   'bg-[#FF3E8A] text-white',
  other:    'bg-cream text-black',
  owner:    'bg-purple text-white',
  new:      'bg-black text-yellow',
  info:     'bg-blue text-white',
}

export default function Badge({ variant = 'active', children, className = '' }) {
  const style = BADGE_STYLES[variant] || BADGE_STYLES.active

  return (
    <span
      className={`
        inline-block font-mono text-[10px] font-bold uppercase
        tracking-[0.06em] border-[2px] border-black
        px-[9px] py-[3px]
        ${style}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
