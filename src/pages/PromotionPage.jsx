import { Calendar, ShoppingBag, Shirt, Monitor } from 'lucide-react'
import Card from '../components/ui/Card'
import SectionTitle from '../components/ui/SectionTitle'

const programs = [
  {
    icon: Calendar,
    title: 'Calendario de Eventos',
    description: 'Consulta las ferias internacionales, misiones comerciales y ruedas de negocios programadas por PROMPERÚ.',
  },
  {
    icon: ShoppingBag,
    title: 'Peru Marketplace',
    description: 'Plataforma digital para conectar exportadores peruanos con compradores internacionales.',
  },
  {
    icon: Shirt,
    title: 'Plataforma de Moda',
    description: 'Espacio dedicado a la industria de moda peruana con herramientas para promocionar colecciones.',
  },
  {
    icon: Monitor,
    title: 'Programa de E-commerce',
    description: 'Capacitación y acompañamiento para que empresas peruanas vendan sus productos en plataformas digitales globales.',
  },
]

export default function PromotionPage() {
  return (
    <>
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Promueve Tu Oferta</h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto">
            Herramientas y programas para promocionar tus productos y servicios en mercados internacionales.
          </p>
        </div>
      </section>

      <section className="py-20 bg-bg-light">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle
            title="Programas de Promoción"
            subtitle="PROMPERÚ te ofrece múltiples canales para dar a conocer tu oferta exportable al mundo."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs.map((program) => (
              <Card key={program.title} hover>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <program.icon size={28} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{program.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
