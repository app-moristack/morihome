import { Mail, MessageCircle, Smartphone } from 'lucide-react'
import { Link } from 'react-router'
import { bootstrap } from '@/lib/bootstrap'
import { useCategories } from '@/hooks/useSearchQueries'
import { Brand } from './Brand'
import island from '../../../images/mauritius-island-map-silhouette.webp'

export function Footer() {
  const { data: categories = [] } = useCategories(true)
  return (
    <footer className="site-footer" style={{ paddingBottom: 'var(--safe-bottom)' }}>
      <div className="footer-main container-page grid items-start gap-6 py-5 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.1fr_0.8fr]">
        <div className="footer-brand flex flex-col items-center text-center">
          <Brand footer />
          <p className="mt-3 max-w-52 text-xs leading-relaxed text-white/60">
            Build. Renovate. Rent. Buy.
            <br />
            Everything for home in Mauritius.
          </p>
        </div>
        <nav aria-label="Quick links">
          <h2 className="mb-2 text-sm font-bold">Quick Links</h2>
          <ul className="footer-links">
            {[
              { to: '/', label: 'Home' },
              { to: '/search', label: 'Find a Pro' },
              { to: '/properties', label: 'Find Property' },
              { to: '/for-professionals', label: 'For Professionals' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
            ].map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Popular services">
          <h2 className="mb-2 text-sm font-bold">Popular Services</h2>
          <ul className="footer-links">
            {categories.slice(0, 6).map((category) => (
              <li key={category.id}>
                <Link to={`/search?category_id=${category.id}&radius=${bootstrap.defaultRadiusKm}`}>
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/search">All services</Link>
            </li>
          </ul>
        </nav>
        <div className="footer-contact">
          <h2 className="mb-2 text-sm font-bold">Stay Connected</h2>
          <ul className="footer-links">
            <li>
              <Link to="/contact">
                <MessageCircle className="size-4" aria-hidden />
                Contact us
              </Link>
            </li>
            <li>
              <a href={`mailto:${bootstrap.supportEmail}`}>
                <Mail className="size-4 shrink-0" aria-hidden />
                <span className="break-all">{bootstrap.supportEmail}</span>
              </a>
            </li>
            <li>
              <Link to="/install">
                <Smartphone className="size-4" aria-hidden />
                Get the app
              </Link>
            </li>
          </ul>
        </div>
        <div className="footer-origin flex items-center gap-3 self-start">
          <img
            src={island}
            alt="Silhouette of the island of Mauritius"
            width={55}
            height={56}
            loading="lazy"
            className="h-14 w-11 shrink-0 object-contain opacity-65"
          />
          <div className="flex flex-col gap-1 text-xs leading-tight">
            <span>
              Proudly built
              <br />
              in Mauritius
            </span>
            <span className="mauritius-flag" role="img" aria-label="Mauritius flag">
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
        </div>
      </div>
      <div className="footer-bottom container-page flex flex-col gap-2 border-t border-white/10 py-2 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} MoriHome. All rights reserved.</p>
        <div className="flex gap-5">
          <Link to="/privacy" className="inline-flex min-h-9 items-center hover:text-white">
            Privacy
          </Link>
          <Link to="/terms" className="inline-flex min-h-9 items-center hover:text-white">
            Terms
          </Link>
        </div>
        <p>Services and property. One local platform.</p>
      </div>
    </footer>
  )
}
