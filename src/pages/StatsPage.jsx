import { useState } from 'react'
import { summaryStats, topSectors } from '../data/stats'
import SectionTitle from '../components/ui/SectionTitle'
import { TrendingUp, TrendingDown, Filter } from 'lucide-react'

export default function StatsPage() {
  const [year, setYear] = useState('2025')
  const [sector, setSector] = useState('todos')

  return (
    <>
      <section className="bg-gradient-to-r from-secondary to-secondary-light text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Estadísticas de Comercio Exterior</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Datos actualizados sobre las exportaciones e importaciones del Perú.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-10">
            <div className="flex items-center gap-2 mb-4 text-gray-700">
              <Filter size={20} />
              <span className="font-semibold">Filtros</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Año</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Sector</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                >
                  <option value="todos">Todos los sectores</option>
                  <option value="tradicional">Tradicional</option>
                  <option value="no-tradicional">No Tradicional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Mercado</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none">
                  <option>Todos los mercados</option>
                  <option>Estados Unidos</option>
                  <option>China</option>
                  <option>Unión Europea</option>
                  <option>Canadá</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {summaryStats.map((stat) => (
              <div key={stat.id} className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-secondary mb-1">
                  {stat.prefix}{stat.value.toLocaleString('es-PE')}{stat.suffix}
                </div>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Chart Placeholders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Evolución Mensual FOB</h3>
              <div className="h-64 bg-gradient-to-t from-primary/5 to-primary/20 rounded-xl flex items-center justify-center text-gray-400">
                Gráfico de evolución mensual
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top 10 Mercados Destino</h3>
              <div className="h-64 bg-gradient-to-t from-secondary/5 to-secondary/20 rounded-xl flex items-center justify-center text-gray-400">
                Gráfico de mercados destino
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Detalle por Sector</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Sector</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Tipo</th>
                    <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">FOB (USD M)</th>
                    <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Var. %</th>
                  </tr>
                </thead>
                <tbody>
                  {topSectors
                    .filter((s) => sector === 'todos' || s.type === sector)
                    .map((s) => (
                      <tr key={s.name} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-gray-900">{s.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-500 capitalize">{s.type.replace('-', ' ')}</td>
                        <td className="px-6 py-3 text-right font-semibold">${s.fobValue.toLocaleString('es-PE')}</td>
                        <td className="px-6 py-3 text-right">
                          <span className={`inline-flex items-center gap-1 text-sm font-medium ${s.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                            {s.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {s.change > 0 ? '+' : ''}{s.change}%
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
