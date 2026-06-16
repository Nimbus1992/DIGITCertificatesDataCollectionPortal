import { hero } from '@/data/content'

export default function Hero() {
  return (
    <section className="bg-eg-surface pt-20 px-4 sm:px-6 pb-0">
      <div className="container mx-auto">
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="px-8 sm:px-12 lg:px-16 py-16 sm:py-20 grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-eg-light text-eg text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border border-eg/20 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-eg-accent inline-block" />
                {hero.eyebrow}
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-eg-slate leading-[1.06] tracking-tight mb-6">
                <span className="block">Go live in</span>
                <span className="block text-eg">30 days.</span>
                <span className="block">Own it</span>
                <span className="block text-eg-accent">forever.</span>
              </h1>

              <p className="text-base sm:text-lg text-eg-muted leading-relaxed mb-8 max-w-lg">
                {hero.subheadline}
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <a
                  href={hero.primaryCta.href}
                  className="inline-flex items-center gap-2 bg-eg text-white font-semibold px-6 py-3 rounded-full hover:bg-eg2 transition-colors text-sm"
                >
                  {hero.primaryCta.label} →
                </a>
                <a
                  href={hero.secondaryCta.href}
                  className="inline-flex items-center gap-2 border border-gray-300 text-eg-muted font-medium px-6 py-3 rounded-full hover:border-eg hover:text-eg transition-colors text-sm"
                >
                  {hero.secondaryCta.label}
                </a>
              </div>

              <div className="flex flex-wrap gap-2">
                {hero.chips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-eg-light text-eg border border-eg/20"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-eg-accent inline-block" />
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: browser mockup */}
            <div className="hidden lg:block">
              <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="flex-1 mx-3 bg-white rounded text-gray-400 text-xs px-3 py-1 font-mono border border-gray-200 text-center">
                    admin.digit-lpc.gov
                  </div>
                </div>
                <img
                  src={hero.screenshot}
                  alt={hero.screenshotAlt}
                  className="w-full block"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
