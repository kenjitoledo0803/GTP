import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { navigationItems } from '../../data/navigation'

export default function Navbar() {
  const location = useLocation()
  const [openDropdown, setOpenDropdown] = useState(null)

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.path
        const hasChildren = item.children?.length > 0

        return (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => hasChildren && setOpenDropdown(item.label)}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <Link
              to={item.path}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'text-primary bg-primary/5' : 'text-gray-700 hover:text-primary hover:bg-gray-50'}`}
            >
              {item.label}
              {hasChildren && <ChevronDown size={14} className={`transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />}
            </Link>

            {hasChildren && openDropdown === item.label && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                {item.children.map((child) => (
                  <Link
                    key={child.label}
                    to={child.path}
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
