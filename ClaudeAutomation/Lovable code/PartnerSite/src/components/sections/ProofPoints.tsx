import { impactStats, caseStudies } from '@/data/content'
import { useRevealAnimation } from '@/hooks/useRevealAnimation'

export function ProofPoints() {
  const ref = useRevealAnimation()

  return (
    <section id="proof" ref={ref} className="py-24 md:py-32 bg-eg-apple-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="reveal mb-16 max-w-3xl">
          <span className="section-eyebrow text-eg-accent">Proven Deployments</span>
          <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-eg-slate tracking-tight leading-[1.1] mb-5">
            Real implementations.<br />Real outcomes.
          </h2>
          <p className="text-eg-muted text-xl leading-relaxed">
            Not a pilot, not a prototype. Governments are live on DIGIT License, Permits and Certificates today.
          </p>
        </div>

        {/* Impact stats — large, bold, Apple-style */}
        <div className="reveal reveal-delay-1 bg-white rounded-2xl border border-eg-light shadow-sm overflow-hidden mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {impactStats.map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center py-10 px-6 ${
                  i < impactStats.length - 1 ? 'border-b sm:border-b-0 sm:border-r border-eg-light' : ''
                }`}
              >
                <p className="text-5xl sm:text-6xl font-bold text-eg tracking-tight mb-2">{stat.value}</p>
                <p className="text-eg-slate font-semibold text-lg mb-1">{stat.label}</p>
                <p className="text-eg-muted text-sm">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Case studies */}
        <div className="reveal reveal-delay-2 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {caseStudies.map((cs) => (
            <div
              key={cs.name}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: cs.borderColor }}
              />
              <div className="p-8">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {cs.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full bg-eg-apple-gray text-eg-muted text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Headline */}
                <div className="mb-4">
                  <span className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: cs.borderColor }}>
                    {cs.headline}
                  </span>
                  <span className="text-4xl sm:text-5xl font-bold tracking-tight text-eg-slate ml-2">{cs.headlineSub}</span>
                </div>

                <p className="text-eg-muted text-base leading-relaxed mb-6">{cs.body}</p>

                {/* Metrics */}
                <div className="rounded-xl overflow-hidden border border-eg-light mb-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-eg-apple-gray">
                        <th className="text-left px-4 py-2.5 text-eg-muted font-medium text-xs">Metric</th>
                        <th className="text-left px-4 py-2.5 text-eg-muted font-medium text-xs">Before</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-xs" style={{ color: cs.borderColor }}>After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cs.metrics.map((m, i) => (
                        <tr key={m.label} className={i % 2 === 0 ? 'bg-white' : 'bg-eg-apple-gray'}>
                          <td className="px-4 py-2.5 text-eg-slate text-xs font-medium">{m.label}</td>
                          <td className="px-4 py-2.5 text-eg-hint text-xs">{m.before}</td>
                          <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: cs.borderColor }}>{m.after}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Partner angle */}
                <div className="rounded-xl bg-eg-accent-bg border border-eg-accent/20 px-5 py-4">
                  <p className="text-xs font-bold text-eg-accent mb-1.5 uppercase tracking-wider">For partners</p>
                  <p className="text-eg-slate text-sm leading-relaxed">{cs.partnerAngle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
