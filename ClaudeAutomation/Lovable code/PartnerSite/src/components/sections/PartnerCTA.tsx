import { ContactForm } from '@/components/ContactForm'
import { footer } from '@/data/content'
import { useRevealAnimation } from '@/hooks/useRevealAnimation'

export function PartnerCTA() {
  const ref = useRevealAnimation()

  return (
    <section id="contact" ref={ref} className="py-24 md:py-32 bg-eg-dark relative overflow-hidden">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">

          {/* Left — copy */}
          <div>
            <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 mb-7">
              <span className="text-white text-xs font-semibold uppercase tracking-[0.15em]">Become a Partner</span>
            </div>
            <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl lg:text-[56px] font-bold text-white tracking-tight leading-[1.1] mb-6">
              Ready to build your DIGIT License, Permits and Certificates practice?
            </h2>
            <p className="reveal reveal-delay-2 text-white/55 text-xl leading-relaxed mb-10">
              Whether you are a regional SI, a DPI consultancy, or a GovTech company — tell us about your market and let's talk.
            </p>

            <div className="reveal reveal-delay-3 space-y-3.5">
              {[
                'Partner-led delivery — you own the client',
                'eGov provides technical backstop and enablement',
                '730+ cities already live on DIGIT',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-white/75 text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-eg-accent flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <p className="reveal mt-10 text-white/45 text-xs tracking-wider">{footer.badge}</p>
          </div>

          {/* Right — form */}
          <div className="reveal reveal-delay-1">
            <div className="bg-white rounded-2xl shadow-lg shadow-black/10 p-8 sm:p-9">
              <h3 className="text-eg-slate font-bold text-xl mb-1.5">Get in touch</h3>
              <p className="text-eg-muted text-sm mb-7">We'll respond within 2 business days.</p>
              <ContactForm />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
