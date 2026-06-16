import { useEffect, useRef } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { ownershipColumns } from '@/data/content'

export default function ControlModel() {
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
    <section id="control" className="bg-white" ref={ref}>
      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <div className="max-w-2xl mb-14 reveal">
          <p className="text-xs font-semibold tracking-widest uppercase text-eg-muted mb-3">
            Control
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-eg-slate leading-tight mb-4">
            Retain the control.<br />Skip the complexity.
          </h2>
          <p className="text-lg text-eg-muted leading-relaxed">
            You own your data, your users, and your workflows.
            Everything else is handled for you.
          </p>
        </div>

        {/* 3-column ownership model */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {ownershipColumns.map((col, i) => (
            <div
              key={col.owner}
              className={`bg-white rounded-2xl shadow-sm overflow-hidden reveal reveal-delay-${i + 1}`}
              style={{ borderTop: `4px solid ${col.borderColor}` }}
            >
              <div className="p-7">
                <p className="text-xs font-semibold tracking-wide uppercase text-eg-muted mb-1">
                  {col.owner}
                </p>
                <h3 className="text-lg font-bold text-eg-slate mb-5">{col.subtitle}</h3>
                <ul className="space-y-3">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-eg-muted">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0"
                        style={{ color: col.borderColor }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Tagline + sovereignty pill */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 reveal">
          <p className="text-eg-muted text-sm italic">
            Built once. Shared by many. Improved together.
          </p>
          <span className="inline-flex items-center gap-2 bg-white border border-eg text-eg text-sm font-semibold px-5 py-2 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-eg inline-block" />
            Your data never leaves your jurisdiction
          </span>
        </div>

        {/* Configure screenshot */}
        <div className="mt-12 rounded-2xl border border-eg/20 shadow-md overflow-hidden reveal">
          <div className="bg-white px-5 py-3 border-b border-gray-100 text-sm font-medium text-eg-muted">
            Admin Console — Business License Configuration
          </div>
          <img
            src="/screenshots/admin-configure.png"
            alt="Admin console showing service configuration — Forms, Roles, Process Flow"
            className="w-full block"
          />
        </div>
      </div>
    </section>
  )
}
