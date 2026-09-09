import { Link } from 'react-router'
import mark from '../../../images/morihome-house-services-logo.webp'
import wordmark from '../../../images/morihome-wordmark.webp'

export function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="MoriHome home"
      className={`morihome-brand ${footer ? 'morihome-brand-footer' : ''}`}
    >
      <span className="flex items-center gap-1">
        <img src={mark} alt="" width={60} height={42} className="brand-mark" />
        <img src={wordmark} alt="MoriHome" width={166} height={28} className="brand-wordmark" />
      </span>
      <span className="brand-tagline">Local professionals. A stronger tomorrow.</span>
    </Link>
  )
}
