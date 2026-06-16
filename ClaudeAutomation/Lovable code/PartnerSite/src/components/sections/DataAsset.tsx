import { BarChart2, Download, Shield, TrendingUp } from 'lucide-react'
import { dataSection, dataFeatures } from '@/data/content'
import { useRevealAnimation } from '@/hooks/useRevealAnimation'

const iconMap: Record<string, React.ReactNode> = {
  BarChart2: <BarChart2 size={24} />,
  Download: <Download size={24} />,
  Shield: <Shield size={24} />,
  TrendingUp: <TrendingUp size={24} />,
}

export function DataAsset() {
  const ref = useRevealAnimation()

  const standardFeatures = dataFeatures.filter(f => !f.wide)
  const wideFeature = dataFeatures.find(f => f.wide)

  return (
    <section id="data" ref={ref} className="py-24 md:py-32 bg-eg-apple-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="reveal mb-14">
          <span className="section-eyebrow text-eg-accent">{dataSection.eyebrow}</span>
          <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-eg-slate tracking-tight leading-[1.1] mb-5 max-w-3xl">
            {dataSection.h2}
          </h2>
          <p className="text-eg-muted text-xl leading-relaxed max-w-2xl">{dataSection.sub}</p>
        </div>

        {/* Bento grid */}
        <div className="reveal reveal-delay-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {standardFeatures.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl bg-eg-light flex items-center justify-center text-eg mb-5">
                {iconMap[f.icon]}
              </div>
              <h3 className="font-bold text-eg-slate text-xl mb-2.5">{f.title}</h3>
              <p className="text-eg-muted text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>

        {/* Wide feature — full-width dark card */}
        {wideFeature && (
          <div className="reveal reveal-delay-2 bg-eg rounded-2xl overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-8 lg:p-10">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white mb-5">
                  {iconMap[wideFeature.icon]}
                </div>
                <h3 className="font-bold text-white text-xl mb-3">{wideFeature.title}</h3>
                <p className="text-white/65 text-base leading-relaxed max-w-lg">{wideFeature.body}</p>
              </div>
              {/* Decorative data visualization */}
              <div className="lg:w-80 flex-shrink-0 bg-white/5 p-8 flex flex-col justify-center gap-4">
                {[
                  { label: 'Renewal rate', value: 87, color: 'bg-eg-accent' },
                  { label: 'Applications filed', value: 94, color: 'bg-white' },
                  { label: 'Revenue collected', value: 72, color: 'bg-eg-accent-lt' },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white/50 text-xs">{bar.label}</span>
                      <span className="text-white/70 text-xs font-semibold">{bar.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
