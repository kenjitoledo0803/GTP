import { faqs } from '../../data/faq'
import SectionTitle from '../ui/SectionTitle'
import Accordion from '../ui/Accordion'

export default function FAQSection() {
  return (
    <section id="faq" className="py-20">
      <div className="max-w-3xl mx-auto px-4">
        <SectionTitle
          title="Preguntas Frecuentes"
          subtitle="Resolvemos tus dudas sobre SIICEX y el comercio exterior peruano."
        />

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {faqs.map((faq, index) => (
            <Accordion key={index} title={faq.question} defaultOpen={index === 0}>
              {faq.answer}
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  )
}
