import { ArrowRight, ChevronRight } from 'lucide-react'
import { hero } from '@/data/content'
import { useRevealAnimation } from '@/hooks/useRevealAnimation'

export function PartnerHero() {
  const ref = useRevealAnimation(0.05)

  return (
    <section ref={ref} className="relative bg-eg-dark overflow-hidden">
      {/* City background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/hero-bg.jpg)', opacity: 0.28 }}
      />
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(14,22,93,0.5),transparent)]" />
      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-white to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-0 text-center">

        {/* Eyebrow */}
        <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-eg-accent" />
          <span className="text-white/90 text-xs font-semibold uppercase tracking-[0.15em]">
            {hero.eyebrow}
          </span>
        </div>

        {/* Headline */}
        <h1 className="reveal reveal-delay-1 text-5xl sm:text-6xl lg:text-[82px] font-bold leading-[1.05] tracking-tight mb-7">
          {hero.h1Lines.map((line, i) => (
            <span
              key={i}
              className={
                i === hero.accentLineIndex
                  ? 'block text-eg-accent'
                  : 'block text-white'
              }
            >
              {line}
            </span>
          ))}
        </h1>

        {/* Subheadline */}
        <p className="reveal reveal-delay-2 text-white/60 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
          {hero.subheadline}
        </p>

        {/* CTAs */}
        <div className="reveal reveal-delay-3 flex flex-wrap gap-3 justify-center mb-14">
          <a
            href={hero.ctaPrimary.href}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-eg-accent text-white font-semibold text-sm hover:bg-eg-accent/90 transition-all shadow-lg shadow-eg-accent/30"
          >
            {hero.ctaPrimary.label}
            <ArrowRight size={16} />
          </a>
          <a
            href={hero.ctaSecondary.href}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all"
          >
            {hero.ctaSecondary.label}
            <ChevronRight size={16} />
          </a>
        </div>

        {/* Stats row */}
        <div className="reveal grid grid-cols-3 border border-white/15 rounded-2xl overflow-hidden mb-16">
          {hero.stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center px-8 py-4 ${
                i < hero.stats.length - 1 ? 'border-r border-white/15' : ''
              }`}
            >
              <span className="text-3xl font-bold text-white tracking-tight">{stat.value}</span>
              <span className="text-white/50 text-xs mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Product screenshot — peeking into next section */}
        <div className="reveal reveal-delay-4 relative z-10 mx-auto" style={{ maxWidth: '900px' }}>
          <div className="rounded-t-2xl overflow-hidden border border-white/10 border-b-0 shadow-xl shadow-black/25">
            <div className="bg-eg-dark border-b border-white/10 px-4 py-2.5 flex items-center gap-3">
              <div className="flex-1 bg-white/10 rounded px-2.5 py-1 text-xs text-white/40 font-mono truncate">
                admin.digit-lpc.gov / dashboard
              </div>
            </div>
            <img
              src={hero.screenshot}
              alt={hero.screenshotAlt}
              className="w-full object-cover object-top block"
              style={{ maxHeight: '480px' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
