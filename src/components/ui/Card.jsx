export default function Card({ children, hover = false, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl' : ''} ${className}`}>
      {children}
    </div>
  )
}
