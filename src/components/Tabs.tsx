export interface Tab<T extends string> {
  value: T
  label: string
}

interface TabsProps<T extends string> {
  value: T
  onChange: (value: T) => void
  tabs: Tab<T>[]
  id?: string
}

export function Tabs<T extends string>({ value, onChange, tabs, id }: TabsProps<T>) {
  return (
    <div
      id={id}
      data-comp-id={id}
      data-comp-type="tabs"
      style={{
        display: 'flex',
        background: 'var(--secondary-background)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: 3,
        boxShadow: 'var(--shadow-x) var(--shadow-y) 0 var(--border)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.value
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            style={{
              flex: 1,
              padding: '8px 18px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 'calc(var(--radius-sm) - 1px)',
              fontFamily: 'var(--font-sans)',
              border: 'none',
              background: isActive ? 'var(--main)' : 'transparent',
              color: isActive ? 'var(--main-foreground)' : 'var(--t2)',
              transition: 'all 0.1s',
              textTransform: 'lowercase',
            }}
            onMouseEnter={e => {
              if (!isActive) e.currentTarget.style.background = 'var(--bg3)'
            }}
            onMouseLeave={e => {
              if (!isActive) e.currentTarget.style.background = 'transparent'
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
