export const Arrow = ({ className = '' }: { className?: string }) => (
  <svg className={`arrow ${className}`} width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
    <path d="M0 5h12M8 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)
export const Chevron = ({ dir = 'right' }: { dir?: 'left' | 'right' }) => (
  <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true" style={dir === 'left' ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M2 1l7 7-7 7" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)
export const Bookmark = ({ filled }: { filled?: boolean }) => (
  <svg width="14" height="18" viewBox="0 0 14 18" fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
    <path d="M1 1h12v16l-6-4-6 4z" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)
export const Close = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.3" />
  </svg>
)
