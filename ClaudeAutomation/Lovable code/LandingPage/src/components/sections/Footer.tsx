import { footer } from '@/data/content'

export default function Footer() {
  return (
    <footer className="bg-eg-slate text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded bg-eg flex items-center justify-center">
                <span className="text-white font-bold text-xs">D</span>
              </div>
              <span className="font-bold text-white">{footer.productName}</span>
            </div>
            <p className="text-white/50 text-sm mb-1">{footer.org}</p>
            <p className="text-white/30 text-xs">{footer.copyright}</p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">
              Product
            </p>
            <ul className="space-y-2">
              {footer.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">
              Connect
            </p>
            <a
              href={`mailto:${footer.contact}`}
              className="text-sm text-white/60 hover:text-white transition-colors block mb-2"
            >
              {footer.contact}
            </a>
            <p className="text-xs text-white/30 mt-4">{footer.license}</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-white/20">
            DIGIT License, Permits &amp; Certificates is an open-source platform maintained by eGovernments Foundation.
          </p>
        </div>
      </div>
    </footer>
  )
}
