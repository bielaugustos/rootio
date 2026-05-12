export function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div style={{
      flex: '1 1 0',
      minWidth: 0,
      width: '100%',
      boxSizing: 'border-box',
      padding: '14px 16px',
      background: 'var(--secondary-background)',
      border: '2px solid var(--border)',
      borderRadius: 'var(--radius-base)',
      boxShadow: '4px 4px 0 var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--t1)', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
      <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500 }}>{label}</span>
    </div>
  )
}