import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import OpportunitiesPage from './pages/OpportunitiesPage'
import PromotionPage from './pages/PromotionPage'
import CapacityPage from './pages/CapacityPage'
import StatsPage from './pages/StatsPage'
import ContactPage from './pages/ContactPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/oportunidades" element={<OpportunitiesPage />} />
        <Route path="/promocion" element={<PromotionPage />} />
        <Route path="/capacidades" element={<CapacityPage />} />
        <Route path="/estadisticas" element={<StatsPage />} />
        <Route path="/contacto" element={<ContactPage />} />
      </Route>
    </Routes>
  )
}
