import { useState, useRef, useCallback } from 'react'

interface TimeRangeSliderProps {
  startMinutes?: number
  endMinutes?: number
  step?: number
  onChange?: (start: number, end: number) => void
  onReset?: () => void
  id?: string
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`
}

const TOTAL = 1439
const PIP_INTERVAL = 240  // every 4 hours for labels
const TICK_INTERVAL = 60  // every hour for small ticks

export function TimeRangeSlider({
  startMinutes = 480,
  endMinutes = 960,
  step = 15,
  onChange,
  onReset,
  id,
}: TimeRangeSliderProps) {
  const [start, setStart] = useState(startMinutes)
  const [end, setEnd] = useState(endMinutes)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<'start' | 'end' | 'range' | null>(null)
  const dragStartX = useRef(0)
  const dragStartValues = useRef({ start: 0, end: 0 })

  const getMinutes = useCallback((clientX: number): number => {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const raw = pct * TOTAL
    return Math.round(raw / step) * step
  }, [step])

  const startDrag = (type: 'start' | 'end' | 'range', e: React.MouseEvent | React.TouchEvent) => {
    if (e.cancelable) {
      e.preventDefault()
    }
    dragging.current = type
    dragStartX.current = 'touches' in e ? e.touches[0].clientX : e.clientX
    dragStartValues.current = { start, end }

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in ev ? ev.touches[0].clientX : ev.clientX

      if (type === 'start') {
        const v = getMinutes(clientX)
        const newStart = Math.min(v, end - step)
        setStart(newStart)
        onChange?.(newStart, end)
      } else if (type === 'end') {
        const v = getMinutes(clientX)
        const newEnd = Math.max(v, start + step)
        setEnd(newEnd)
        onChange?.(start, newEnd)
      } else {
        if (!trackRef.current) return
        const rect = trackRef.current.getBoundingClientRect()
        const dx = clientX - dragStartX.current
        const dMinutes = Math.round((dx / rect.width) * TOTAL / step) * step
        const duration = dragStartValues.current.end - dragStartValues.current.start
        let newStart = Math.max(0, Math.min(TOTAL - duration, dragStartValues.current.start + dMinutes))
        newStart = Math.round(newStart / step) * step
        const newEnd = newStart + duration
        setStart(newStart)
        setEnd(newEnd)
        onChange?.(newStart, newEnd)
      }
    }

    const onUp = () => {
      dragging.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onUp)
  }

  // Click on track to set nearest handle
  const handleTrackClick = (e: React.MouseEvent) => {
    if (dragging.current) return
    const v = getMinutes(e.clientX)
    const dStart = Math.abs(v - start)
    const dEnd = Math.abs(v - end)
    if (dStart <= dEnd) {
      const newStart = Math.min(v, end - step)
      setStart(newStart)
      onChange?.(newStart, end)
    } else {
      const newEnd = Math.max(v, start + step)
      setEnd(newEnd)
      onChange?.(start, newEnd)
    }
  }

  // Generate pip ticks
  const pips: { value: number; label: string }[] = []
  for (let v = 0; v <= TOTAL; v += TICK_INTERVAL) {
    if (v % PIP_INTERVAL === 0) {
      pips.push({ value: v, label: minutesToTime(v) })
    } else {
      pips.push({ value: v, label: '' })
    }
  }

  const startPct = (start / TOTAL) * 100
  const endPct = (end / TOTAL) * 100
  const thumbSize = 28
  const TOOLTIP_HALF = 40 // ~half width of the widest tooltip ("12:00 AM" + padding)

  const tooltipStyle = (pct: number): React.CSSProperties => ({
    position: 'absolute',
    left: `clamp(${TOOLTIP_HALF}px, ${pct}%, calc(100% - ${TOOLTIP_HALF}px))`,
    transform: 'translateX(-50%)',
    background: 'var(--secondary-background)',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: '2px 2px 0 var(--border)',
    padding: '4px 10px',
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
    color: 'var(--t1)',
    whiteSpace: 'nowrap' as const,
    pointerEvents: 'none' as const,
    bottom: 0,
  })

  return (
    <div data-comp-id={id} style={{ width: '100%', userSelect: 'none', padding: '32px 0 48px' }}>

      {/* Tooltips */}
      <div style={{ position: 'relative', height: 40, marginBottom: 8 }}>
        <div style={tooltipStyle(startPct)}>{minutesToTime(start)}</div>
        <div style={tooltipStyle(endPct)}>{minutesToTime(end)}</div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        style={{
          position: 'relative',
          height: 20,
          cursor: 'pointer',
        }}
      >
        {/* Track background */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          top: '50%', transform: 'translateY(-50%)',
          height: 8,
          background: 'var(--bg3, #e8e4dc)',
          border: '2px solid var(--border)',
          borderRadius: 4,
        }} />

        {/* Active range */}
        <div
          onMouseDown={e => startDrag('range', e)}
          onTouchStart={e => startDrag('range', e)}
          style={{
            position: 'absolute',
            left: `${startPct}%`,
            width: `${endPct - startPct}%`,
            top: '50%', transform: 'translateY(-50%)',
            height: 8,
            background: 'var(--main)',
            border: '2px solid var(--border)',
            cursor: 'grab',
            touchAction: 'none',
            zIndex: 1,
          }}
        />

        {/* Start thumb */}
        <div
          onMouseDown={e => startDrag('start', e)}
          onTouchStart={e => startDrag('start', e)}
          style={{
            position: 'absolute',
            left: `${startPct}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: thumbSize,
            height: thumbSize,
            background: 'var(--secondary-background)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '3px 3px 0 var(--border)',
            cursor: 'grab',
            touchAction: 'none',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          {[0, 1].map(i => (
            <div key={i} style={{
              width: 2, height: 10,
              background: 'var(--b2)',
              borderRadius: 1,
            }} />
          ))}
        </div>

        {/* End thumb */}
        <div
          onMouseDown={e => startDrag('end', e)}
          onTouchStart={e => startDrag('end', e)}
          style={{
            position: 'absolute',
            left: `${endPct}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: thumbSize,
            height: thumbSize,
            background: 'var(--secondary-background)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '3px 3px 0 var(--border)',
            cursor: 'grab',
            touchAction: 'none',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          {[0, 1].map(i => (
            <div key={i} style={{
              width: 2, height: 10,
              background: 'var(--b2)',
              borderRadius: 1,
            }} />
          ))}
        </div>
      </div>

      {/* Pips — sem labels */}
      <div style={{ position: 'relative', height: 16, marginTop: 2 }}>
        {pips.map(({ value, label }) => {
          const pct = (value / TOTAL) * 100
          const isMajor = label !== ''
          const isMinor = !isMajor
          return (
            <div key={value} style={{
              position: 'absolute',
              left: `${pct}%`,
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }}>
              <div style={{
                width: isMajor ? 1.5 : 1,
                height: isMajor ? 8 : isMinor ? 5 : 3,
                background: isMajor ? '#999' : '#ccc',
              }} />
            </div>
          )
        })}
      </div>

      {/* Intervalo selecionado */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10, gap: 8, alignItems: 'center' }}>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--t2)',
          fontFamily: 'var(--font-sans)',
          background: 'var(--bg3, #e8e4dc)',
          border: '1px solid var(--b2)',
          borderRadius: 'var(--radius-sm)',
          padding: '3px 12px',
        }}>
          {(() => {
            const diff = end - start
            const h = Math.floor(diff / 60)
            const m = diff % 60
            if (h === 0) return `${m}min`
            if (m === 0) return `${h}h`
            return `${h}h ${m}min`
          })()}
        </span>
        {onReset && (end - start) > 0 && (
          <button
            onClick={() => {
              setStart(0)
              setEnd(0)
              onReset()
            }}
            title="Zerar duração"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'var(--font-sans)',
              color: 'var(--t3)',
              background: 'var(--bg3, #e8e4dc)',
              border: '1px solid var(--b2)',
              borderRadius: 'var(--radius-sm)',
              padding: '3px 10px',
              cursor: 'pointer',
              transition: 'all 0.1s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--t1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--b2)'
              e.currentTarget.style.color = 'var(--t3)'
            }}
          >
            <i className="ph ph-arrow-counter-clockwise" style={{ fontSize: 12 }} />
            Zerar
          </button>
        )}
      </div>

      
    </div>
  )
}