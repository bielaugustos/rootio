// Card de item do Hub IO — thumb + body + row de ação
import { NbTag } from './NbTag'
import { NbTicker } from './NbTicker'
import { NbButton } from './NbButton'

export function NbShopItem({
  icon, name, desc, cost = 0, raro = false,
  thumbBg = '#FFD23F',  // sun | amber | violet | grass | ink
  owned = false, canBuy = false, locked = false,
  onBuy, onApply, className = '',
}) {
  return (
    <div className={['nb-shop-item', raro ? 'nb-shop-item--raro' : '', className].filter(Boolean).join(' ')}>
      {/* Thumb */}
      <div className="nb-shop-item__thumb" style={{ background: thumbBg }}>
        <span className="nb-shop-item__icon">{icon}</span>
        {raro && <span className="nb-shop-item__raro-badge">LENDÁRIO</span>}
        {locked && <div className="nb-shop-item__lock">🔒</div>}
      </div>

      {/* Body */}
      <div className="nb-shop-item__body">
        <h6 className="nb-shop-item__name">{name}</h6>
        {desc && <p className="nb-shop-item__desc">{desc}</p>}

        <div className="nb-shop-item__row">
          {cost === 0
            ? <span className="nb-tag nb-tag--grass" style={{fontSize:9}}>GRÁTIS</span>
            : locked
              ? <span className="nb-tag" style={{fontSize:9}}>BLOQUEADO</span>
              : <NbTicker value={`${cost}`} size="sm" />
          }

          {owned ? (
            <button
              className="nb-btn nb-btn--grass nb-btn--sm"
              style={{ width: 'auto', fontSize: 11 }}
              onClick={onApply}
            >
              Aplicar
            </button>
          ) : locked ? (
            <button className="nb-btn nb-btn--ghost nb-btn--sm" style={{ width:'auto', fontSize:11 }} disabled>
              Bloqueado
            </button>
          ) : (
            <button
              className="nb-btn nb-btn--primary nb-btn--sm"
              style={{ width: 'auto', fontSize: 11 }}
              onClick={onBuy}
              disabled={!canBuy}
            >
              Comprar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}