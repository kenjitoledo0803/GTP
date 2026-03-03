import { Search, Globe, FileText, BarChart3, Handshake, ShieldCheck } from 'lucide-react'
import Card from '../components/ui/Card'
import SectionTitle from '../components/ui/SectionTitle'

const features = [
  {
    icon: Search,
    title: 'Información por Producto',
    description: 'Consulta información detallada sobre productos de exportación, incluyendo partidas arancelarias, requisitos y estadísticas.',
  },
  {
    icon: Globe,
    title: 'Información por Mercado',
    description: 'Explora mercados internacionales con datos sobre demanda, regulaciones, logística y oportunidades comerciales.',
  },
  {
    icon: FileText,
    title: 'Documentos de Inteligencia Comercial',
    description: 'Accede a estudios de mercado, perfiles de productos, guías de exportación y reportes sectoriales.',
  },
  {
    icon: BarChart3,
    title: 'Estadísticas de Exportación',
    description: 'Datos actualizados de exportaciones peruanas por sector, producto, mercado destino y periodo.',
  },
  {
    icon: Handshake,
    title: 'Acuerdos Comerciales',
    description: 'Información sobre tratados de libre comercio y acuerdos comerciales vigentes del Perú con otros países.',
  },
  {
    icon: ShieldCheck,
    title: 'Normas y Regulaciones',
    description: 'Requisitos técnicos, sanitarios y fitosanitarios por país y producto de exportación.',
  },
]

export default function OpportunitiesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-r from-secondary to-secondary-light text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Descubre Oportunidades</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Encuentra información estratégica para identificar y aprovechar oportunidades en mercados internacionales.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-bg-light">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle
            title="Herramientas Disponibles"
            subtitle="Accede a recursos de inteligencia comercial para planificar y ejecutar tu estrategia de exportación."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} hover>
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <feature.icon size={28} className="text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
