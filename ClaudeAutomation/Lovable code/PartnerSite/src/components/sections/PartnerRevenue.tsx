import { CheckCircle2 } from 'lucide-react'
import { revenueSection, revenueStreams, egovSupport, revenueCallout } from '@/data/content'
import { useRevealAnimation } from '@/hooks/useRevealAnimation'

export function PartnerRevenue() {
  const ref = useRevealAnimation()

  return (
    <section id="partner" ref={ref} className="py-24 md:py-32 bg-eg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="reveal mb-14">
          <span className="section-eyebrow text-eg-accent-lt">{revenueSection.eyebrow}</span>
          <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white tracking-tight leading-[1.1] mb-5">
            {revenueSection.h2}
          </h2>
          <p className="text-white/55 text-xl leading-relaxed max-w-2xl">{revenueSection.sub}</p>
        </div>

        {/* Two-column */}
        <div className="reveal reveal-delay-1 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Revenue streams */}
          <div>
            <p className="text-white/35 text-xs uppercase tracking-[0.15em] mb-5">Revenue streams</p>
            <div className="space-y-3">
              {revenueStreams.map((stream) => (
                <div
                  key={stream.title}
                  className="flex items-start gap-4 bg-white/[0.06] rounded-xl px-5 py-4 border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-eg-accent mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold text-base mb-1">{stream.title}</p>
                    <p className="text-white/55 text-sm leading-relaxed">{stream.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* eGov support */}
          <div>
            <p className="text-white/35 text-xs uppercase tracking-[0.15em] mb-5">What eGov brings</p>
            <div className="bg-white/[0.08] rounded-2xl border border-white/[0.1] p-7 h-full">
              <ul className="space-y-3.5">
                {egovSupport.map((s) => (
                  <li key={s.item} className="flex items-center gap-3 text-sm text-white/75">
                    <CheckCircle2 size={16} className="text-eg-accent flex-shrink-0" />
                    {s.item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Callout */}
        <div className="reveal reveal-delay-2 bg-white rounded-2xl px-8 py-7 text-center">
          <p className="text-eg-slate text-xl font-semibold leading-snug max-w-2xl mx-auto">
            {revenueCallout}
          </p>
        </div>

      </div>
    </section>
  )
}
