import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormState {
  name: string
  organisation: string
  country: string
  message: string
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: '', organisation: '', country: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Partner Inquiry — ${form.organisation}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nOrganisation: ${form.organisation}\nCountry / Region: ${form.country}\n\n${form.message}`,
    )
    window.location.href = `mailto:partnerships@egov.org.in?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  const inputClass = cn(
    'w-full rounded-lg border border-eg-light bg-white px-4 py-3 text-sm text-eg-slate',
    'placeholder:text-eg-hint focus:outline-none focus:ring-2 focus:ring-eg focus:border-transparent transition',
  )

  if (submitted) {
    return (
      <div className="text-center py-10">
        <CheckCircle2 size={40} className="text-eg mx-auto mb-4" />
        <h3 className="text-eg-slate font-bold text-lg mb-2">Your email client should have opened.</h3>
        <p className="text-eg-muted text-sm">
          If it did not,{' '}
          <a href="mailto:partnerships@egov.org.in" className="text-eg underline">
            email us directly at partnerships@egov.org.in
          </a>
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-5 text-xs text-eg-muted underline"
        >
          Back to form
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-eg-slate mb-1.5">Name *</label>
          <input
            required
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-eg-slate mb-1.5">Organisation *</label>
          <input
            required
            type="text"
            placeholder="Company or organisation"
            value={form.organisation}
            onChange={(e) => setForm({ ...form, organisation: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-eg-slate mb-1.5">Country / Region *</label>
        <input
          required
          type="text"
          placeholder="e.g. Kenya, West Africa, South Asia"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-eg-slate mb-1.5">Message (optional)</label>
        <textarea
          rows={3}
          placeholder="Tell us about your market or what you have in mind..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={cn(inputClass, 'resize-none')}
        />
      </div>
      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-eg text-white font-semibold text-sm hover:bg-eg2 transition-colors"
      >
        Send to eGov
        <Send size={15} />
      </button>
    </form>
  )
}
