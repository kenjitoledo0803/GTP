import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import SectionTitle from '../components/ui/SectionTitle'
import Button from '../components/ui/Button'

const offices = [
  {
    name: 'Sede Central',
    address: 'Calle Uno Oeste N° 50, Piso 14, San Isidro, Lima',
    phone: '(01) 616-7300',
    email: 'postmaster@promperu.gob.pe',
    hours: 'Lun - Vie: 8:30 a.m. - 5:30 p.m.',
  },
  {
    name: 'Oficina de Exportaciones',
    address: 'Av. República de Panamá N° 3647, San Isidro, Lima',
    phone: '(01) 616-7400',
    email: 'siicex@promperu.gob.pe',
    hours: 'Lun - Vie: 8:30 a.m. - 5:30 p.m.',
  },
  {
    name: 'Centro de Información',
    address: 'Calle Uno Oeste N° 50, Piso 1, San Isidro, Lima',
    phone: '(01) 616-7300 Anexo 1530',
    email: 'info@promperu.gob.pe',
    hours: 'Lun - Vie: 9:00 a.m. - 5:00 p.m.',
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.')
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <>
      <section className="bg-gradient-to-r from-secondary to-secondary-light text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Contacto</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            ¿Tienes alguna consulta? Estamos aquí para ayudarte.
          </p>
        </div>
      </section>

      {/* Offices */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle title="Nuestras Oficinas" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offices.map((office) => (
              <div key={office.name} className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-bold text-secondary mb-4">{office.name}</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                    <span>{office.address}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone size={16} className="flex-shrink-0 text-primary" />
                    <span>{office.phone}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail size={16} className="flex-shrink-0 text-primary" />
                    <span>{office.email}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock size={16} className="flex-shrink-0 text-primary" />
                    <span>{office.hours}</span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-bg-light">
        <div className="max-w-2xl mx-auto px-4">
          <SectionTitle
            title="Envíanos un Mensaje"
            subtitle="Completa el formulario y te responderemos lo más pronto posible."
          />
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                placeholder="Asunto de tu consulta"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:outline-none resize-none"
                placeholder="Escribe tu mensaje..."
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full">
              <Send size={18} className="mr-2" />
              Enviar Mensaje
            </Button>
          </form>
        </div>
      </section>
    </>
  )
}
