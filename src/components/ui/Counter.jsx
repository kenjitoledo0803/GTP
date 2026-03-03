import useCountUp from '../../hooks/useCountUp'

export default function Counter({ end, duration = 2000, prefix = '', suffix = '', decimals = 0, isVisible = false }) {
  const value = useCountUp(end, duration, isVisible)

  const formatted = decimals > 0
    ? value.toFixed(decimals)
    : Math.floor(value).toLocaleString('es-PE')

  return (
    <span className="tabular-nums">
      {prefix}{formatted}{suffix}
    </span>
  )
}
