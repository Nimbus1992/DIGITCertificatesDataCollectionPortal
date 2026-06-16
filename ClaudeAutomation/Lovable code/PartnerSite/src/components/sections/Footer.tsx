import { Mail } from 'lucide-react'
import { footer } from '@/data/content'

export function Footer() {
  return (
    <footer className="bg-eg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

          {/* Brand */}
          <div>
            <img
              src="https://egov-website-content.s3.ap-south-1.amazonaws.com/wp-content/uploads/2024/08/25123706/eGov-Foundation.png"
              alt="eGov Foundation"
              className="h-7 w-auto mb-4 opacity-70"
            />
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-eg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="font-semibold text-white">{footer.brand}</span>
            </div>
            <p className="text-white/45 text-sm leading-relaxed">{footer.tagline}</p>
          </div>

          {/* Links */}
          <div>
            <p className="text-white/30 text-xs uppercase tracking-[0.15em] mb-5">Navigation</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {footer.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-white/55 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-white/30 text-xs uppercase tracking-[0.15em] mb-5">Get in Touch</p>
            <a
              href={`mailto:${footer.contact}`}
              className="inline-flex items-center gap-2 text-eg-accent hover:text-eg-accent-lt text-sm transition-colors"
            >
              <Mail size={14} />
              {footer.contact}
            </a>
          </div>
        </div>

        <div className="border-t border-white/[0.07] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">{footer.copyright}</p>
          <span className="text-white/20 text-xs">{footer.badge}</span>
        </div>
      </div>
    </footer>
  )
}
