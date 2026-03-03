import { events } from '../../data/events'
import SectionTitle from '../ui/SectionTitle'
import Badge from '../ui/Badge'

const typeColors = {
  feria: 'red',
  mision: 'blue',
  capacitacion: 'green',
}

const typeLabels = {
  feria: 'Feria',
  mision: 'Misión',
  capacitacion: 'Capacitación',
}

export default function EventsSection() {
  return (
    <section className="py-20 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          title="Próximos Eventos"
          subtitle="Ferias internacionales, misiones comerciales y capacitaciones para impulsar tus exportaciones."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex">
                {/* Date Badge */}
                <div className="w-24 flex-shrink-0 bg-primary flex flex-col items-center justify-center text-white p-4">
                  <span className="text-2xl font-extrabold">{event.day}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider">{event.month}</span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1">
                  <div className="mb-2">
                    <Badge color={typeColors[event.type]}>{typeLabels[event.type]}</Badge>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{event.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">{event.location}</p>
                  <p className="text-xs text-gray-400">{event.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a href="#" className="text-primary font-semibold hover:underline">
            Ver todos los eventos →
          </a>
        </div>
      </div>
    </section>
  )
}
