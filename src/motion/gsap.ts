// Single place where GSAP plugins are registered and shared motion tokens live.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const EASE = {
  out: 'power3.out',
  inOut: 'power3.inOut',
  expo: 'expo.out',
} as const

export const DUR = {
  micro: 0.3,
  ui: 0.45,
  section: 0.9,
  hero: 1.2,
  page: 0.5,
} as const

export const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(REDUCED_QUERY).matches

export { gsap, ScrollTrigger }
