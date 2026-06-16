import { useEffect, useRef } from 'react'

export default function CaseStudies() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal') ?? []
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('animate') }),
      { threshold: 0.1 },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="cases" className="bg-white" ref={ref}>
      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <div className="max-w-xl mb-14 reveal">
          <p className="text-xs font-semibold tracking-widest uppercase text-eg-muted mb-3">
            Case Studies
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-eg-slate leading-tight">
            Trusted by governments.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Djibouti */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-t-4 border-eg-accent reveal">
            <div className="p-8">
              <div className="flex flex-wrap gap-2 mb-6">
                {['Africa', 'Building Permits'].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-eg-accent-bg text-eg-accent border border-eg-accent/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-2xl font-bold text-eg-slate mb-2">Djibouti</h3>
              <p className="text-4xl font-bold text-eg-accent mb-4">15 permits. 2.5 months.</p>
              <p className="text-eg-muted leading-relaxed mb-6">
                15 permit types digitalized in Djibouti in under 3 months, backed by the GIZ-ITU
                programme. Delivered with local partners Manelix and Tekdi.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 text-eg-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-eg-accent inline-block" />
                  GIZ-ITU programmatic backing
                </div>
                <div className="flex items-center gap-2 text-eg-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-eg-accent inline-block" />
                  Local partners: Manelix &amp; Tekdi
                </div>
              </div>
            </div>
          </div>

          {/* Greater Chennai Corporation */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-t-4 border-eg reveal reveal-delay-2">
            <div className="p-8">
              <div className="flex flex-wrap gap-2 mb-6">
                {['South Asia', 'Trade License', '10+ Years'].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-eg-light text-eg border border-eg/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-2xl font-bold text-eg-slate mb-2">Greater Chennai Corporation</h3>
              <p className="text-4xl font-bold text-eg mb-4">25,000 → 80,000+ licenses.</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden mb-4">
                <div className="grid grid-cols-3 bg-gray-50 text-xs font-semibold text-eg-muted uppercase tracking-wide px-4 py-2.5 border-b border-gray-200">
                  <span>Metric</span>
                  <span className="text-center">Before</span>
                  <span className="text-right">After</span>
                </div>
                {[
                  { metric: 'Processing time', before: '30–40 days', after: '1–2 days' },
                  { metric: 'License base', before: '25,000', after: '80,000+ (↑220%)' },
                  { metric: 'Renewal rate', before: 'Unknown', after: '72%' },
                ].map((row) => (
                  <div
                    key={row.metric}
                    className="grid grid-cols-3 px-4 py-3 text-sm border-b border-gray-100 last:border-0"
                  >
                    <span className="text-eg-slate font-medium">{row.metric}</span>
                    <span className="text-center text-eg-muted">{row.before}</span>
                    <span className="text-right font-semibold text-eg">{row.after}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-eg-muted">
                2nd Oldest Municipal Corporation in the World · 7M Population
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
