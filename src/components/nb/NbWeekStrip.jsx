import './NbWeekStrip.css'

const DIAS = ['D','S','T','Q','Q','S','S']
const ORDER = [1,2,3,4,5,6,0] // Seg → Dom

export function NbWeekStrip({ activeDays = [], compact = false, weekDates, className = '' }) {
  const today = new Date().getDay()

  return (
    <div className={['nb-week', compact ? 'nb-week--compact' : '', className].filter(Boolean).join(' ')}>
      {ORDER.map((dayIndex, pos) => {
        const isToday = dayIndex === today
        const isDone  = activeDays.includes(dayIndex) && !isToday
        return (
          <div
            key={dayIndex}
            className={[
              'nb-week__day',
              isToday ? 'nb-week__day--today' : '',
              isDone  ? 'nb-week__day--done'  : '',
            ].filter(Boolean).join(' ')}
          >
            <span className="nb-week__d">{DIAS[pos]}</span>
            {weekDates?.[pos] != null && (
              <span className="nb-week__n">{weekDates[pos]}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}