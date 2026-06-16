import { licenseTypes, scaleJurisdictions } from '@/data/content'
import { useRevealAnimation } from '@/hooks/useRevealAnimation'

export function ScalingBenefits() {
  const ref = useRevealAnimation()

  return (
    <section id="scale" ref={ref} className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="reveal mb-14">
          <span className="section-eyebrow text-eg-accent">Scale your practice</span>
          <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-eg-slate tracking-tight leading-[1.1] mb-5">
            Grow horizontally and vertically.
          </h2>
          <p className="text-eg-muted text-xl leading-relaxed max-w-2xl">
            Every new license type and every new government is incremental revenue — on the same platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* Horizontal scaling */}
          <div className="reveal bg-eg-dark rounded-2xl p-9 text-white relative overflow-hidden">
            <div className="relative">
              <span className="section-eyebrow text-eg-accent-lt">Horizontal Scale</span>
              <h3 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight tracking-tight">
                More license types.<br />More revenue per government.
              </h3>
              <p className="text-white/55 text-base leading-relaxed mb-7">
                Each government can add new license types without a new implementation. Configuration, not code — every new type is additional revenue with near-zero delivery cost.
              </p>

              <div className="flex flex-wrap gap-2 mb-7">
                {licenseTypes.map((lt) => (
                  <span
                    key={lt.name}
                    className="px-3 py-1.5 rounded-full bg-white/8 text-white/75 text-xs font-medium border border-white/15"
                  >
                    {lt.name}
                  </span>
                ))}
              </div>

              <div className="bg-white/8 rounded-xl px-6 py-4 border border-white/12 inline-block">
                <p className="text-eg-accent-lt font-bold text-2xl leading-none mb-1">15 permit types</p>
                <p className="text-white/45 text-sm">digitized in Djibouti in 2.5 months</p>
              </div>
            </div>
          </div>

          {/* Vertical scaling */}
          <div className="reveal reveal-delay-1 bg-eg-light rounded-2xl p-9 relative overflow-hidden border border-eg-mid">
            <div className="relative">
              <span className="section-eyebrow text-eg-accent">Vertical Scale</span>
              <h3 className="text-3xl sm:text-4xl font-bold text-eg-slate mb-3 leading-tight tracking-tight">
                More cities.<br />Same platform.
              </h3>
              <p className="text-eg-muted text-base leading-relaxed mb-7">
                With SaaS or multi-tenant deployment, onboarding a new government jurisdiction takes days, not months. Your infrastructure cost stays flat while revenue grows.
              </p>

              <div className="space-y-3.5 mb-7">
                {scaleJurisdictions.map((j) => (
                  <div key={j.city} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-eg-slate text-sm font-medium truncate">{j.city}</p>
                      <p className="text-eg-muted text-xs truncate">{j.licenseTypes.join(', ')}</p>
                    </div>
                    <div className="w-28 h-1.5 rounded-full bg-eg-mid overflow-hidden flex-shrink-0">
                      <div
                        className="h-full rounded-full bg-eg-accent"
                        style={{ width: `${j.revenueLevel}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl px-6 py-4 border border-eg-light inline-block shadow-sm">
                <p className="text-eg font-bold text-2xl leading-none mb-1">730+ cities</p>
                <p className="text-eg-muted text-sm">on DIGIT platform today</p>
              </div>
            </div>
          </div>

        </div>

        {/* Callout */}
        <div className="reveal reveal-delay-2 bg-eg-slate rounded-2xl px-8 py-6 text-white text-center">
          <p className="text-xl font-semibold leading-snug">
            The more you deploy, the lower your unit cost —{' '}
            <span className="text-eg-accent">and the stronger your regional lock-in.</span>
          </p>
        </div>

      </div>
    </section>
  )
}
