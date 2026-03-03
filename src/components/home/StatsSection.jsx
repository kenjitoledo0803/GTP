import { useRef } from 'react'
import { DollarSign, Building2, Globe, Package } from 'lucide-react'
import { summaryStats } from '../../data/stats'
import useIntersection from '../../hooks/useIntersection'
import Counter from '../ui/Counter'
import SectionTitle from '../ui/SectionTitle'

const iconMap = {
  DollarSign,
  Building2,
  Globe,
  Package,
}

export default function StatsSection() {
  const sectionRef = useRef(null)
  const isVisible = useIntersection(sectionRef)

  return (
    <section ref={sectionRef} className="py-20 bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          title="Perú en Cifras"
          subtitle="Datos clave del comercio exterior peruano que demuestran el potencial exportador del país."
          light
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryStats.map((stat) => {
            const Icon = iconMap[stat.icon]
            return (
              <div key={stat.id} className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  {Icon && <Icon size={28} className="text-accent" />}
                </div>
                <div className="text-3xl md:text-4xl font-extrabold mb-2">
                  <Counter
                    end={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    isVisible={isVisible}
                  />
                </div>
                <p className="text-gray-300 text-sm">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
