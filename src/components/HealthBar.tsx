interface HealthBarProps {
  label: string
  current: number
  max: number
  color: string
}

export function HealthBar({ label, current, max, color }: HealthBarProps) {
  const percent = max <= 0 ? 0 : Math.max(0, Math.min(100, (current / max) * 100))

  return (
    <div className="bar-wrap">
      <span>{label}</span>
      <div className="bar-shell">
        <div className="bar-fill" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
