import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { productIntro, userRoles } from '@/data/content'
import { useRevealAnimation } from '@/hooks/useRevealAnimation'
import { cn } from '@/lib/utils'

const INTERVAL_MS = 3500

const ECOSYSTEM_ICONS = [
  'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  'M22 12h-4l-3 9L9 3l-3 9H2',
  'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
  'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  'M18 20V10M12 20V4M6 20v-6',
  'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',
  'M12 2a10 10 0 110 20 10 10 0 010-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z',
]

export function ProductOverview() {
  const sectionRef = useRevealAnimation(0.05)
  const [activeTab, setActiveTab] = useState(0)
  const [animating, setAnimating] = useState(false)
  const pausedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((idx: number) => {
    setAnimating(false)
    setTimeout(() => {
      setActiveTab(idx)
      setAnimating(true)
    }, 20)
  }, [])

  const advanceRef = useRef(0)
  advanceRef.current = activeTab

  const advance = useCallback(() => {
    if (!pausedRef.current) {
      goTo((advanceRef.current + 1) % userRoles.length)
    }
  }, [goTo])

  useEffect(() => {
    setAnimating(true)
    timerRef.current = setInterval(advance, INTERVAL_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [advance])

  const handleTabClick = (idx: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    goTo(idx)
    timerRef.current = setInterval(advance, INTERVAL_MS)
  }

  const activeRole = userRoles[activeTab]

  return (
    <section
      id="product"
      ref={sectionRef}
      className="pt-24 pb-24 md:pt-28 md:pb-32 bg-white"
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="reveal mb-12">
          <span className="section-eyebrow text-eg-accent">
            {productIntro.eyebrow}
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-eg-slate tracking-tight leading-[1.1] mb-5">
            {productIntro.h2}
          </h2>
          <p className="text-eg-muted text-xl leading-relaxed max-w-2xl">
            {productIntro.body}
          </p>
        </div>

        {/* Tabbed showcase */}
        <div className="reveal reveal-delay-1 flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Left: tabs with inline capabilities ── */}
          <div className="lg:w-[45%]">

            {/* Mobile: horizontal scrollable pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
              {userRoles.map((role, i) => (
                <button
                  key={role.role}
                  onClick={() => handleTabClick(i)}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border',
                    i === activeTab
                      ? 'bg-eg text-white border-eg'
                      : 'bg-eg-light text-eg-muted border-eg-light hover:bg-eg-light',
                  )}
                >
                  {role.role}
                </button>
              ))}
            </div>

            {/* Desktop: vertical tab list with expanded capabilities */}
            <div className="hidden lg:flex flex-col gap-1">
              {userRoles.map((role, i) => (
                <button
                  key={role.role}
                  onClick={() => handleTabClick(i)}
                  className={cn(
                    'group relative w-full text-left px-5 py-4 rounded-xl transition-all duration-200 border-l-2 overflow-hidden',
                    i === activeTab
                      ? 'bg-eg-light border-eg'
                      : 'bg-transparent border-transparent hover:bg-eg-light hover:border-eg/30',
                  )}
                >
                  {/* Progress bar for active tab */}
                  {i === activeTab && (
                    <span
                      key={`progress-${activeTab}`}
                      className="absolute bottom-0 left-0 h-0.5 bg-eg-accent"
                      style={{ animation: `progress-bar ${INTERVAL_MS}ms linear forwards` }}
                    />
                  )}

                  {/* Role name */}
                  <p className={cn(
                    'font-semibold text-sm transition-colors duration-200',
                    i === activeTab ? 'text-eg' : 'text-eg-muted group-hover:text-eg',
                  )}>
                    {role.role}
                  </p>

                  {/* Tagline + capabilities — expand when active */}
                  <div className={cn(
                    'transition-all duration-300 overflow-hidden',
                    i === activeTab ? 'max-h-64 opacity-100 mt-2' : 'max-h-0 opacity-0',
                  )}>
                    <p className="text-eg-muted text-xs leading-relaxed mb-3">
                      {role.tagline}
                    </p>
                    <ul className="space-y-2">
                      {role.capabilities.map((cap, ci) => (
                        <li
                          key={cap}
                          className={cn(
                            'flex items-start gap-2 text-xs text-eg-slate transition-all duration-300',
                            animating && i === activeTab ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1',
                          )}
                          style={{ transitionDelay: `${ci * 60 + 80}ms` }}
                        >
                          <CheckCircle2 size={13} className="text-eg mt-0.5 flex-shrink-0" />
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Right: screenshot only (or Ecosystem placeholder) ── */}
          <div className="lg:w-[55%]">
            <div
              key={activeTab}
              className={cn(
                'transition-all duration-300',
                animating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
              )}
            >
              {activeRole.placeholder ? (
                /* Ecosystem placeholder */
                <div className="rounded-2xl border-2 border-dashed border-eg-light bg-eg-surface flex flex-col items-center justify-center py-16 px-8 text-center gap-4" style={{ minHeight: '380px' }}>
                  <div className="grid grid-cols-3 gap-3 mb-1">
                    {ECOSYSTEM_ICONS.map((d, i) => (
                      <div key={i} className="w-12 h-12 rounded-xl bg-white border border-eg-light flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-eg-muted">
                          <path strokeLinecap="round" strokeLinejoin="round" d={d} />
                        </svg>
                      </div>
                    ))}
                  </div>
                  <p className="text-eg font-bold text-lg mt-2">API & Ecosystem</p>
                  <p className="text-eg-muted text-sm max-w-xs leading-relaxed">
                    Connects to payment gateways, ERP systems, GIS platforms, and third-party verifiers via open APIs.
                  </p>
                  <span className="px-3 py-1 rounded-full bg-eg-accent-bg text-eg-accent text-xs font-semibold">
                    Coming soon
                  </span>
                </div>
              ) : (
                /* Browser chrome mockup */
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-eg-surface border-b border-eg-light px-4 py-2.5 flex items-center gap-3">
                    <div className="flex-1 bg-white rounded px-2.5 py-1 text-xs text-eg-hint font-mono truncate">
                      digit-lpc.gov / {activeRole.role.toLowerCase().replace(/\s+/g, '-')}
                    </div>
                  </div>
                  <img
                    src={activeRole.screenshot!}
                    alt={`${activeRole.role} interface`}
                    className="w-full object-cover object-top block"
                    style={{ maxHeight: '420px' }}
                  />
                </div>
              )}
            </div>

            {/* Mobile capabilities — below screenshot */}
            <div className={cn(
              'lg:hidden mt-4 bg-eg-surface rounded-2xl border border-eg-light px-5 py-4 transition-all duration-300',
              animating ? 'opacity-100' : 'opacity-0',
            )}>
              <p className="text-xs font-semibold text-eg-accent uppercase tracking-[0.15em] mb-3">
                What {activeRole.role} can do
              </p>
              <ul className="space-y-2.5">
                {activeRole.capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-3 text-sm text-eg-slate">
                    <CheckCircle2 size={15} className="text-eg mt-0.5 flex-shrink-0" />
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
