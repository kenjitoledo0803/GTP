import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Phone, Mail } from 'lucide-react'
import useScrollPosition from '../../hooks/useScrollPosition'
import Navbar from './Navbar'
import MobileMenu from './MobileMenu'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const scrollY = useScrollPosition()
  const isScrolled = scrollY > 50

  return (
    <>
      {/* Top Bar */}
      <div className="bg-secondary text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-8">
          <div className="flex items-center gap-4">
            <a href="tel:+5116167300" className="flex items-center gap-1 hover:text-accent transition-colors">
              <Phone size={12} />
              <span>(01) 616-7300</span>
            </a>
            <a href="mailto:siicex@promperu.gob.pe" className="hidden sm:flex items-center gap-1 hover:text-accent transition-colors">
              <Mail size={12} />
              <span>siicex@promperu.gob.pe</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-300">PROMPERÚ</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="text-primary">SII</span>
                <span className="text-secondary">CEX</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <Navbar />

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
        </div>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  )
}
