export default function FinalCTA() {
  return (
    <section id="contact" className="bg-eg-accent overflow-hidden relative">
      {/* Subtle dot grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative container mx-auto px-6 py-28 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-white/50 mb-5">
          Get Started
        </p>
        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.06] tracking-tight mb-6">
          Ready to go live<br />in 30 days?
        </h2>
        <p className="text-lg sm:text-xl text-white/70 mb-12 max-w-lg mx-auto leading-relaxed">
          Whether you&apos;re a government, an implementation partner, or a development agency — let&apos;s talk.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-10">
          <a
            href="mailto:taherabharmal@egovernments.org"
            className="inline-flex items-center gap-2 bg-white text-eg-accent font-bold px-8 py-4 rounded-full hover:bg-orange-50 transition-colors text-sm shadow-lg"
          >
            Get in Touch →
          </a>
          <a
            href="#speed"
            className="inline-flex items-center gap-2 border-2 border-white/50 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-colors text-sm"
          >
            See How It Works
          </a>
        </div>

        <p className="text-white/40 text-xs tracking-wide">
          Open source · Government-owned data · 730 cities live
        </p>
      </div>
    </section>
  )
}
