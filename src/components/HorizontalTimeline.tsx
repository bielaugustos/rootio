import { useMemo } from 'react'

interface HorizontalTimelineProps {
  currentStage: number // 0-based index: 0=Planning, 1=Development, 2=Testing, 3=Launch
}

const stages = ['Planning', 'Development', 'Testing', 'Launch']

const COLORS = {
  complete: '#10B981', // emerald green
  current: '#3B82F6', // vibrant blue
  upcoming: '#9CA3AF'  // muted light gray
}

export function HorizontalTimeline({ currentStage }: HorizontalTimelineProps) {
  const progressPercentage = useMemo(() => {
    if (currentStage >= stages.length - 1) return 100
    return (currentStage / (stages.length - 1)) * 100
  }, [currentStage])

  const getDotColor = (index: number) => {
    if (index < currentStage) return COLORS.complete
    if (index === currentStage) return COLORS.current
    return COLORS.upcoming
  }

  const getDotIcon = (index: number) => {
    if (index < currentStage) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      )
    }
    return null
  }

  return (
    <div style={{
      background: '#000', // solid dark mode background
      padding: '40px 20px',
      borderRadius: '8px',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '80px',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Progress bar background */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '4px',
          background: COLORS.upcoming,
          borderRadius: '2px',
          transform: 'translateY(-50%)'
        }} />
        {/* Progress bar fill */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: `${progressPercentage}%`,
          height: '4px',
          background: COLORS.complete,
          borderRadius: '2px',
          transform: 'translateY(-50%)',
          transition: 'width 0.3s ease'
        }} />
        {/* Dots */}
        {stages.map((stage, index) => {
          const position = (index / (stages.length - 1)) * 100
          return (
            <div
              key={stage}
              style={{
                position: 'absolute',
                left: `${position}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: getDotColor(index),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                {getDotIcon(index)}
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: '500',
                color: index === currentStage ? '#fff' : '#9CA3AF',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                {stage}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}