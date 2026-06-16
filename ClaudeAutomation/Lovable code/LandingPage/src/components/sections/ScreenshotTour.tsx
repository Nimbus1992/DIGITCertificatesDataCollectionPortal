import { useEffect, useRef } from 'react'
import { screenshotCards } from '@/data/content'

export default function ScreenshotTour() {
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
    <section className="bg-eg-surface" ref={ref}>
      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <div className="max-w-xl mb-14 reveal">
          <p className="text-xs font-semibold tracking-widest uppercase text-eg-muted mb-3">
            The Platform
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-eg-slate leading-tight mb-4">
            Three portals. One platform.
          </h2>
          <p className="text-lg text-eg-muted leading-relaxed">
            Government admins configure. Citizens apply. Officers process. All connected.
          </p>
        </div>

        {/* Screenshot cards — horizontal scroll on mobile */}
        <div className="grid md:grid-cols-3 gap-6 overflow-x-auto">
          {screenshotCards.map((card, i) => (
            <div
              key={card.title}
              className={`rounded-2xl border border-gray-200 shadow-md overflow-hidden flex-shrink-0 min-w-[280px] reveal reveal-delay-${i + 1}`}
            >
              <img
                src={card.src}
                alt={card.alt}
                className="w-full block border-b border-gray-100"
              />
              <div className="p-5">
                <h3 className="font-bold text-eg-slate text-base mb-1">{card.title}</h3>
                <p className="text-sm text-eg-muted">{card.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
