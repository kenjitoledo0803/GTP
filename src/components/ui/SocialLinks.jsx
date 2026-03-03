import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react'

const iconMap = {
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
}

export default function SocialLinks({ links, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {links.map((link) => {
        const Icon = iconMap[link.icon]
        return (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label={link.name}
          >
            {Icon && <Icon size={18} />}
          </a>
        )
      })}
    </div>
  )
}
