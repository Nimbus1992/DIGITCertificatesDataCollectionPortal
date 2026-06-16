import { useState } from 'react'
import { CheckCircle2, ChevronDown } from 'lucide-react'
import { deploymentSection, deploymentModels, comparisonRows } from '@/data/content'
import { useRevealAnimation } from '@/hooks/useRevealAnimation'
import { cn } from '@/lib/utils'

export function DeploymentModels() {
  const ref = useRevealAnimation()
  const [tableOpen, setTableOpen] = useState(false)

  return (
    <section id="deployment" ref={ref} className="py-24 md:py-32 bg-eg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="reveal mb-14">
          <span className="section-eyebrow text-eg-accent-lt">{deploymentSection.eyebrow}</span>
          <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white tracking-tight leading-[1.1] mb-5">
            {deploymentSection.h2}
          </h2>
          <p className="text-white/55 text-xl leading-relaxed max-w-2xl">
            {deploymentSection.sub}
          </p>
        </div>

        {/* Model cards */}
        <div className="reveal reveal-delay-1 grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {deploymentModels.map((model) => (
            <div
              key={model.name}
              className={cn(
                'rounded-2xl p-7 flex flex-col relative',
                model.highlight
                  ? 'bg-white/[0.1] border border-white/20'
                  : 'bg-white/[0.05] border border-white/10',
              )}
            >
              {model.badge && (
                <span className="absolute -top-3.5 left-6 px-3 py-1 rounded-full text-xs font-bold bg-eg-accent text-white shadow-md">
                  {model.badge}
                </span>
              )}

              <div
                className="w-8 h-1 rounded-full mb-5"
                style={{ backgroundColor: model.borderColor }}
              />

              <h3 className="font-bold text-white text-xl mb-2.5">{model.name}</h3>
              <p className="text-white/55 text-sm leading-relaxed mb-6">{model.descriptor}</p>

              <div className="mb-6">
                <p className="text-xs font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">
                  How it works
                </p>
                <ul className="space-y-2.5">
                  {model.howItWorks.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/70">
                      <CheckCircle2 size={14} className="text-white/65 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-5 border-t border-white/10">
                <p className="text-xs font-bold uppercase tracking-[0.15em] mb-3" style={{ color: model.borderColor }}>
                  Revenue for you
                </p>
                <ul className="space-y-2.5">
                  {model.revenueStreams.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: model.borderColor }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-4 border-t border-white/8">
                <p className="text-xs text-white/35">
                  <span className="font-semibold text-white/55">Best for:</span> {model.bestFor}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="reveal reveal-delay-2 bg-white/[0.04] rounded-2xl border border-white/10 overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-6 py-4 text-left lg:pointer-events-none"
            onClick={() => setTableOpen(!tableOpen)}
          >
            <span className="font-semibold text-white/70 text-sm">Model comparison</span>
            <ChevronDown
              size={18}
              className={cn('text-white/30 transition-transform lg:hidden', tableOpen && 'rotate-180')}
            />
          </button>

          <div className={cn('overflow-x-auto', !tableOpen && 'hidden lg:block')}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-white/8">
                  <th className="text-left px-6 py-3 text-white/30 font-medium text-xs">Dimension</th>
                  {deploymentModels.map((m) => (
                    <th key={m.name} className="text-left px-4 py-3 font-semibold text-xs whitespace-nowrap" style={{ color: m.borderColor }}>
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.label} className={cn('border-t border-white/8', i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]')}>
                    <td className="px-6 py-3 text-white/60 font-medium text-xs">{row.label}</td>
                    <td className="px-4 py-3 text-white/40 text-xs">{row.saas}</td>
                    <td className="px-4 py-3 text-white/40 text-xs">{row.managed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  )
}
