import { useEffect, useRef } from 'react'

export function useRevealAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    if (!els) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('animate') }),
      { threshold },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [threshold])

  return ref
}
