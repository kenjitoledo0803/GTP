import { Ship, Search, Users, ClipboardCheck, BarChart3, Truck } from 'lucide-react'
import { services } from '../../data/services'
import Card from '../ui/Card'
import Button from '../ui/Button'
import SectionTitle from '../ui/SectionTitle'

const iconMap = {
  Ship,
  Search,
  Users,
  ClipboardCheck,
  BarChart3,
  Truck,
}

export default function ServicesSection() {
  return (
    <section className="py-20 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          title="Nuestros Servicios"
          subtitle="Herramientas y recursos para impulsar tus exportaciones y fortalecer tu presencia en mercados internacionales."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = iconMap[service.icon]
            return (
              <Card key={service.id} hover>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  {Icon && <Icon size={28} className="text-primary" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{service.description}</p>
                <Button variant="ghost" size="sm" href={service.link}>
                  Más información →
                </Button>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
