// Bolha de conversa — mentor (paper) ou usuário (ink)
export function NbChatBubble({ role = 'mentor', children, className = '' }) {
  return (
    <div className={['nb-chat', `nb-chat--${role}`, className].filter(Boolean).join(' ')}>
      <p className="nb-chat__from">{role === 'mentor' ? '★ MENTOR' : 'VOCÊ'}</p>
      <p className="nb-chat__text">{children}</p>
    </div>
  )
}