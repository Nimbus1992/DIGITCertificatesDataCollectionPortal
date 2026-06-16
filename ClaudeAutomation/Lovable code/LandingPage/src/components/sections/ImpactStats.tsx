import { useEffect, useRef } from 'react'
import { impactStats } from '@/data/content'

export default function ImpactStats() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal') ?? []
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('animate') }),
      { threshold: 0.2 },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="impact" className="bg-eg-surface" ref={ref}>
      <div className="container mx-auto px-6 py-24">
        <div className="text-center mb-14 reveal">
          <p className="text-xs font-semibold tracking-widest uppercase text-eg-muted mb-3">
            Proven at Scale
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-eg-slate">
            Real outcomes for real governments.
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {impactStats.map((stat, i) => (
            <div
              key={stat.unit}
              className={`bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100 reveal reveal-delay-${i + 1}`}
            >
              <div className="text-6xl sm:text-7xl font-bold text-eg leading-none mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-eg-accent mb-2">{stat.unit}</div>
              <div className="text-xs text-eg-muted">{stat.footnote}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
