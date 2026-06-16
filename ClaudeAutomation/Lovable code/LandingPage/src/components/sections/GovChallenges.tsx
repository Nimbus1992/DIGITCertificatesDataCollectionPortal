import { useEffect, useRef } from 'react'
import { challenges } from '@/data/content'

export default function GovChallenges() {
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
    <section className="bg-white" ref={ref}>
      <div className="container mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* Left: product screenshot in browser frame */}
          <div className="relative reveal">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 mx-3 bg-white rounded text-gray-400 text-xs px-3 py-1 font-mono border border-gray-200 text-center">
                  citizen.digit-lpc.gov
                </div>
              </div>
              <img
                src="/screenshots/citizen-portal.png"
                alt="Citizen portal showing license application services"
                className="w-full block"
              />
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-5 -right-5 bg-eg-accent text-white rounded-2xl px-5 py-4 shadow-xl max-w-[148px]">
              <div className="text-4xl font-bold leading-none mb-1">3×</div>
              <div className="text-xs text-white/80 leading-snug">avg. cost overrun in traditional gov. projects</div>
            </div>
          </div>

          {/* Right: header + numbered challenges */}
          <div className="reveal reveal-delay-2">
            <p className="text-xs font-semibold tracking-widest uppercase text-eg-muted mb-3">
              The Problem
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-eg-slate leading-tight mb-10">
              12–18 months.<br />Cost overruns.<br />Then you&apos;re locked in.
            </h2>

            <div className="divide-y divide-gray-100">
              {challenges.map((c, i) => (
                <div
                  key={c.number}
                  className={`flex gap-5 py-6 reveal reveal-delay-${i + 1}`}
                >
                  <span className="text-4xl font-bold text-eg-accent/20 font-mono shrink-0 w-12 leading-none pt-0.5">
                    {c.number}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-eg-slate mb-1.5">{c.title}</h3>
                    <p className="text-sm text-eg-muted leading-relaxed">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transition strip */}
      <div className="bg-eg text-white text-center py-4 text-sm font-semibold tracking-wide">
        There is a better approach. ↓
      </div>
    </section>
  )
}
