import { useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { topSectors } from '../../data/stats'
import SectionTitle from '../ui/SectionTitle'

export default function TradeDataSection() {
  const [activeTab, setActiveTab] = useState('todos')

  const filtered = activeTab === 'todos'
    ? topSectors
    : topSectors.filter((s) => s.type === activeTab)

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          title="Datos de Comercio Exterior"
          subtitle="Principales sectores de exportación del Perú con valores FOB y tendencias recientes."
        />

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'tradicional', label: 'Tradicionales' },
            { key: 'no-tradicional', label: 'No Tradicionales' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
                ${activeTab === tab.key
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Sector</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Partida</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Valor FOB (USD M)</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Variación %</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sector) => (
                  <tr key={sector.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{sector.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{sector.partida}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      ${sector.fobValue.toLocaleString('es-PE')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${sector.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                        {sector.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {sector.change > 0 ? '+' : ''}{sector.change}%
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
  )
}
