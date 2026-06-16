import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { nav } from '@/data/content'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { isScrolled, activeSection } = useScrollSpy()
  const [open, setOpen] = useState(false)

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-black/[0.06] shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px]">

          {/* Logo */}
          <a href="#" className="flex items-center gap-3 flex-shrink-0">
            <img
              src="https://egov-website-content.s3.ap-south-1.amazonaws.com/wp-content/uploads/2024/08/25123706/eGov-Foundation.png"
              alt="eGov Foundation"
              className={cn(
                'h-7 w-auto transition-all duration-300',
                isScrolled ? 'opacity-90' : 'brightness-0 invert opacity-85',
              )}
            />
            <span className={cn(
              'font-semibold text-sm hidden sm:block transition-colors duration-300 border-l pl-3',
              isScrolled
                ? 'text-eg-slate border-eg-mid'
                : 'text-white/90 border-white/20',
            )}>
              DIGIT LP&amp;C
            </span>
          </a>

          {/* Desktop nav — centered */}
          <nav className="hidden lg:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
            {nav.links.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-sm transition-all duration-200',
                  activeSection === link.id
                    ? isScrolled
                      ? 'text-eg font-medium bg-eg-light'
                      : 'text-white font-medium bg-white/15'
                    : isScrolled
                      ? 'text-eg-muted hover:text-eg-slate hover:bg-eg-surface'
                      : 'text-white/70 hover:text-white hover:bg-white/10',
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-eg-accent text-white hover:bg-eg-accent/90"
            >
              {nav.cta}
            </a>
            <button
              className={cn(
                'lg:hidden p-2 rounded-md transition-colors',
                isScrolled
                  ? 'text-eg-muted hover:text-eg-slate hover:bg-eg-surface'
                  : 'text-white/80 hover:text-white hover:bg-white/10',
              )}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-black/[0.06] px-4 pb-4 pt-2">
          {nav.links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={() => setOpen(false)}
              className={cn(
                'block px-3 py-2.5 rounded-md text-sm transition-colors',
                activeSection === link.id
                  ? 'text-eg font-medium bg-eg-light'
                  : 'text-eg-muted hover:text-eg-slate hover:bg-eg-surface',
              )}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-2 block w-full text-center px-4 py-2.5 rounded-lg bg-eg text-white text-sm font-semibold hover:bg-eg2 transition-colors"
          >
            {nav.cta}
          </a>
        </div>
      )}
    </header>
  )
}
