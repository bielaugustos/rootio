export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24,
        borderRadius: 12,
        border: '2px solid var(--border)',
        background: value ? 'var(--main)' : 'var(--bg3, #e8e4dc)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.15s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 2,
        left: value ? 20 : 2,
        width: 16, height: 16,
        borderRadius: '50%',
        background: 'var(--foreground)',
        transition: 'left 0.15s',
      }} />
    </button>
  )
}
