import { licenseTypes } from '@/data/content'
import { useRevealAnimation } from '@/hooks/useRevealAnimation'

export function LicenseTypes() {
  const ref = useRevealAnimation()

  return (
    <section ref={ref} className="py-24 md:py-32 bg-eg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — copy */}
          <div className="reveal">
            <span className="section-eyebrow text-eg-accent-lt">
              One Product. Multiple License Types.
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white tracking-tight leading-[1.1] mb-6">
              One Product.<br />Multiple License Types.
            </h2>
            <p className="text-white/55 text-xl leading-relaxed mb-8">
              Add a new license type through configuration of a template, not code. A new permit type is new revenue for you — at near-zero delivery cost.
            </p>

            {/* License type tags — flowing, not a grid */}
            <div className="flex flex-wrap gap-2 mb-8">
              {licenseTypes.map((lt) => (
                <span
                  key={lt.name}
                  className="inline-flex px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/20 text-white/75 text-sm font-medium"
                >
                  {lt.name}
                </span>
              ))}
            </div>

            {/* Proof point — no box, inline */}
            <p className="text-white/50 text-sm leading-relaxed">
              <span className="text-eg-accent-lt font-bold text-3xl leading-none mr-2">15</span>
              permit types configured in Djibouti in 2.5 months — delivered by local SI partners.
            </p>
          </div>

          {/* Right — admin configure screenshot in browser chrome */}
          <div className="reveal reveal-delay-1">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
              {/* Chrome bar */}
              <div className="bg-eg-dark border-b border-white/10 px-4 py-2.5 flex items-center gap-3">
                <div className="flex-1 bg-white/10 rounded px-2.5 py-1 text-xs text-white/40 font-mono truncate">
                  admin.digit-lpc.gov / configure / business-license
                </div>
              </div>
              <img
                src="/screenshots/admin-configure.png"
                alt="Configure a license type in the DIGIT admin console"
                className="w-full block object-cover object-top"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
