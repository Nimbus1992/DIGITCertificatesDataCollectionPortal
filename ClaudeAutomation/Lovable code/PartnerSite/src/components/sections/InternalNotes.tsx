import { AlertTriangle } from 'lucide-react'

const notes = [
  'Not mentioning open source specifically as this may be used across markets.',
  'This is a website targeted to partners.',
  'We are giving partners all options — Implementation, SaaS and managed service.',
]

export function InternalNotes() {
  return (
    <section className="py-10 bg-amber-50 border-t-4 border-amber-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 flex items-center gap-2 mt-0.5">
            <AlertTriangle size={18} className="text-amber-600" />
            <span className="text-amber-800 font-bold text-xs uppercase tracking-widest whitespace-nowrap">
              Internal Notes — Not for Distribution
            </span>
          </div>
          <ul className="space-y-2">
            {notes.map((note) => (
              <li key={note} className="flex items-start gap-2 text-amber-900 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
