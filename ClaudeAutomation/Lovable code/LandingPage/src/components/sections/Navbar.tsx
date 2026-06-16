import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { nav } from '@/data/content'
import { cn } from '@/lib/utils'

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export default function Navbar() {
  const { isScrolled, activeSection } = useScrollSpy()
  const [open, setOpen] = useState(false)

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-200',
        isScrolled ? 'shadow-sm border-b border-gray-100' : '',
      )}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded bg-eg flex items-center justify-center">
            <span className="text-white font-bold text-xs">D</span>
          </div>
          <span className="text-eg font-semibold text-sm leading-tight hidden sm:block">
            DIGIT License, Permits<br />& Certificates
          </span>
          <span className="text-eg font-semibold text-sm sm:hidden">DIGIT LPC</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {nav.links.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                activeSection === link.id
                  ? 'bg-eg-light text-eg font-semibold'
                  : 'text-eg-muted hover:text-eg hover:bg-eg-light',
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-3">
          <a
            href={nav.cta.href}
            className="hidden md:inline-flex items-center gap-2 bg-eg-accent text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-orange-600 transition-colors"
          >
            {nav.cta.label}
          </a>
          <button
            className="md:hidden p-2 rounded-md text-eg-muted hover:bg-eg-light"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 bg-white border-t border-gray-100',
          open ? 'max-h-96' : 'max-h-0',
        )}
      >
        <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
          {nav.links.map((link) => (
            <button
              key={link.id}
              onClick={() => { scrollTo(link.id); setOpen(false) }}
              className="text-left px-3 py-2.5 rounded-md text-sm font-medium text-eg-muted hover:text-eg hover:bg-eg-light transition-colors"
            >
              {link.label}
            </button>
          ))}
          <a
            href={nav.cta.href}
            className="mt-2 text-center bg-eg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-orange-600 transition-colors"
          >
            {nav.cta.label}
          </a>
        </div>
      </div>
    </header>
  )
}
