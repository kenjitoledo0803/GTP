import { Route, Calendar, Video, FlaskConical, Banknote } from 'lucide-react'
import Card from '../components/ui/Card'
import SectionTitle from '../components/ui/SectionTitle'

const programs = [
  {
    icon: Route,
    title: 'Ruta Exportadora',
    description: 'Programa integral que guía a las empresas peruanas en cada etapa del proceso de internacionalización, desde la preparación hasta la consolidación.',
  },
  {
    icon: Calendar,
    title: 'Calendario de Capacitaciones',
    description: 'Talleres, seminarios y cursos presenciales y virtuales sobre comercio exterior, logística internacional y normativa.',
  },
  {
    icon: Video,
    title: 'Webinars Semanales',
    description: 'Sesiones virtuales semanales con expertos en comercio internacional, tendencias de mercado y casos de éxito.',
  },
  {
    icon: FlaskConical,
    title: 'Laboratorio de Exportación',
    description: 'Espacio de experimentación y aprendizaje práctico para desarrollar productos con potencial exportador.',
  },
  {
    icon: Banknote,
    title: 'Financiamiento para Exportar',
    description: 'Información sobre líneas de crédito, seguros y opciones de financiamiento disponibles para exportadores peruanos.',
  },
]

export default function CapacityPage() {
  return (
    <>
      <section className="bg-gradient-to-r from-secondary to-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Fortalece Capacidades</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Programas de capacitación y recursos para desarrollar tus competencias exportadoras.
          </p>
        </div>
      </section>

      <section className="py-20 bg-bg-light">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle
            title="Programas de Fortalecimiento"
            subtitle="Desarrolla las capacidades de tu empresa para competir exitosamente en mercados internacionales."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Card key={program.title} hover>
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <program.icon size={28} className="text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{program.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
