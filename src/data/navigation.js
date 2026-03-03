export const navigationItems = [
  { label: 'Inicio', path: '/' },
  {
    label: 'Descubre Oportunidades',
    path: '/oportunidades',
    children: [
      { label: 'Información por Producto', path: '/oportunidades#producto' },
      { label: 'Información por Mercado', path: '/oportunidades#mercado' },
      { label: 'Estadísticas de Exportación', path: '/oportunidades#estadisticas' },
      { label: 'Acuerdos Comerciales', path: '/oportunidades#acuerdos' },
      { label: 'Normas y Regulaciones', path: '/oportunidades#normas' },
    ],
  },
  {
    label: 'Promueve Tu Oferta',
    path: '/promocion',
    children: [
      { label: 'Calendario de Eventos', path: '/promocion#eventos' },
      { label: 'Peru Marketplace', path: '/promocion#marketplace' },
      { label: 'Plataforma de Moda', path: '/promocion#moda' },
      { label: 'Programa de E-commerce', path: '/promocion#ecommerce' },
    ],
  },
  {
    label: 'Fortalece Capacidades',
    path: '/capacidades',
    children: [
      { label: 'Ruta Exportadora', path: '/capacidades#ruta' },
      { label: 'Calendario de Capacitaciones', path: '/capacidades#calendario' },
      { label: 'Webinars Semanales', path: '/capacidades#webinars' },
      { label: 'Financiamiento para Exportar', path: '/capacidades#financiamiento' },
    ],
  },
  { label: 'Estadísticas', path: '/estadisticas' },
  { label: 'Contacto', path: '/contacto' },
]
