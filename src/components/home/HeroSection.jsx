import SearchBar from '../ui/SearchBar'
import Button from '../ui/Button'

export default function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary-light to-primary" />

      {/* Decorative shapes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white py-20">
        <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-sm mb-6">
          PROMPERÚ - Comisión de Promoción del Perú para la Exportación y el Turismo
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
          Sistema Integrado de{' '}
          <span className="text-accent">Información</span>
          <br />
          de Comercio Exterior
        </h1>

        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
          Tu plataforma integral para acceder a información estratégica de comercio internacional,
          estadísticas de exportación y herramientas para impulsar tus negocios al mundo.
        </p>

        <div className="mb-10">
          <SearchBar variant="hero" placeholder="Buscar partidas arancelarias, productos, mercados..." />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" size="lg" href="/oportunidades">
            Explorar Oportunidades
          </Button>
          <Button variant="outline" size="lg" href="/estadisticas" className="border-white text-white hover:bg-white hover:text-secondary">
            Ver Estadísticas
          </Button>
        </div>
      </div>
    </section>
  )
}
