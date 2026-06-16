import { useEffect, useRef } from 'react'
import { phases, speedReasons } from '@/data/content'

const SELF_TOTAL = 120
const HOSTED_TOTAL = 30

export default function SaaSValue() {
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
    <section id="speed" className="bg-eg-surface" ref={ref}>
      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <div className="max-w-2xl mb-14 reveal">
          <p className="text-xs font-semibold tracking-widest uppercase text-eg-muted mb-3">Speed</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-eg-slate leading-tight mb-4">
            Go live in 30 days, not 120.
          </h2>
          <p className="text-lg text-eg-muted leading-relaxed">
            Pre-configured environments, ready-made templates, and business-user configuration
            remove every bottleneck.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 items-start">
          {/* Timeline comparison — takes 3/5 columns */}
          <div className="lg:col-span-3 reveal">
            {/* 75% faster badge */}
            <div className="inline-flex items-center gap-2 bg-eg-accent text-white text-sm font-bold px-4 py-1.5 rounded-full mb-8">
              75% faster with the hosted platform
            </div>

            {/* Rows */}
            <div className="space-y-6">
              {/* Self hosted row */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-eg-muted">Self Hosted</span>
                  <span className="font-mono text-sm font-bold text-eg-slate">120 days</span>
                </div>
                <div className="h-10 rounded-lg bg-eg/15 w-full relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-eg/30 rounded-lg flex items-center justify-end pr-3"
                    style={{ width: '100%' }}
                  >
                    <span className="text-xs font-semibold text-eg">120 days</span>
                  </div>
                </div>
              </div>

              {/* Hosted platform row */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-eg">Hosted Platform</span>
                  <span className="font-mono text-sm font-bold text-eg-accent">30 days</span>
                </div>
                <div className="h-10 rounded-lg bg-gray-100 w-full relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-eg-accent rounded-lg flex items-center justify-end pr-3"
                    style={{ width: `${(HOSTED_TOTAL / SELF_TOTAL) * 100}%` }}
                  >
                    <span className="text-xs font-bold text-white">30 days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase breakdown */}
            <div className="mt-8 rounded-xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-3 text-xs font-semibold text-eg-muted uppercase tracking-wide bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                <span>Phase</span>
                <span className="text-center">Self Hosted</span>
                <span className="text-right text-eg-accent">Hosted</span>
              </div>
              {phases.map((p) => (
                <div
                  key={p.label}
                  className="grid grid-cols-3 text-sm px-4 py-3 border-b border-gray-100 last:border-0"
                >
                  <span className="text-eg-slate font-medium">{p.label}</span>
                  <span className="text-center text-eg-muted font-mono">{p.selfDays}d</span>
                  <span className="text-right text-eg-accent font-mono font-semibold">
                    {p.hostedDays}d
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: why faster + screenshot */}
          <div className="lg:col-span-2 space-y-6 reveal reveal-delay-2">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-eg-muted mb-4">
                Why it&apos;s faster
              </p>
              <div className="flex flex-wrap gap-2">
                {speedReasons.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-eg-light text-eg border border-eg/20"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-eg-accent inline-block" />
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Go-live screenshot */}
            <div className="rounded-xl border border-gray-200 shadow-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-xs text-eg-muted font-medium border-b border-gray-200">
                Ready to go live?
              </div>
              <img
                src="/screenshots/admin-golive.png"
                alt="Go-live checklist screen showing required and optional setup steps"
                className="w-full block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
