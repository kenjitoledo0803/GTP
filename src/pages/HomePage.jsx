import HeroSection from '../components/home/HeroSection'
import ServicesSection from '../components/home/ServicesSection'
import StatsSection from '../components/home/StatsSection'
import TradeDataSection from '../components/home/TradeDataSection'
import EventsSection from '../components/home/EventsSection'
import FAQSection from '../components/home/FAQSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <StatsSection />
      <TradeDataSection />
      <EventsSection />
      <FAQSection />
    </>
  )
}
