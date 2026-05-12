export interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: SegmentedControlProps<T>) {
  return (
    <div
      style={{
        display: 'inline-flex',
        background: 'var(--secondary-background)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: 2,
      }}
    >
      {options.map((opt) => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm) - 2',
              fontFamily: 'var(--font-sans)',
              border: 'none',
              background: isActive ? 'var(--main)' : 'transparent',
              color: isActive ? 'var(--main-foreground)' : 'var(--t2)',
              transition: 'all 0.1s',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}