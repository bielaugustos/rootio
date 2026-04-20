// Conquista — desbloqueada ou locked (hachura diagonal)
export function NbAchievementCard({
  icon, title, desc, locked = false, raro = false,
  size = 'md',   // sm | md
  className = '',
}) {
  return (
    <div className={[
      'nb-ach',
      locked ? 'nb-ach--lock' : '',
      raro && !locked ? 'nb-ach--raro' : '',
      `nb-ach--${size}`,
      className,
    ].filter(Boolean).join(' ')}>
      <span className="nb-ach__icon">{icon}</span>
      <p className="nb-ach__title">{title}</p>
      {desc && <p className="nb-ach__desc">{desc}</p>}
    </div>
  )
}