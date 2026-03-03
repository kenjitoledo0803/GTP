import { useState } from 'react'
import { Search } from 'lucide-react'

export default function SearchBar({ placeholder = 'Buscar partidas arancelarias, productos...', variant = 'hero', onSearch }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch?.(query)
  }

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-6 py-4 pr-14 rounded-full text-gray-800 text-lg bg-white/95 backdrop-blur shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 placeholder-gray-400"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-dark text-white p-3 rounded-full transition-colors cursor-pointer"
          >
            <Search size={20} />
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
      />
      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary cursor-pointer">
        <Search size={16} />
      </button>
    </form>
  )
}
