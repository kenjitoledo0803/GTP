import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, X } from 'lucide-react'
import { navigationItems } from '../../data/navigation'

export default function MobileMenu({ isOpen, onClose }) {
  const [expandedItem, setExpandedItem] = useState(null)

  const toggleExpand = (label) => {
    setExpandedItem(expandedItem === label ? null : label)
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 shadow-2xl transform transition-transform duration-300 lg:hidden overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="text-lg font-bold text-secondary">SIICEX</span>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <nav className="py-4">
          {navigationItems.map((item) => {
            const hasChildren = item.children?.length > 0

            return (
              <div key={item.label}>
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className="w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <span className="font-medium">{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${expandedItem === item.label ? 'rotate-180' : ''}`}
                    />
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className="block px-6 py-3 font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}

                {hasChildren && (
                  <div className={`overflow-hidden transition-all duration-300 ${expandedItem === item.label ? 'max-h-96' : 'max-h-0'}`}>
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.path}
                        onClick={onClose}
                        className="block px-10 py-2.5 text-sm text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors"
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
      </div>
    </>
  )
}
