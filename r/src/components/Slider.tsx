import { useState } from 'react'

export interface SliderProps {
  value?: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number) => void
  disabled?: boolean
  id?: string
  showLabel?: boolean
}

export function Slider({
  value: initialValue = 50,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled,
  id,
  showLabel = true,
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(initialValue)

  const currentValue = onChange ? initialValue : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    if (onChange) {
      onChange(newValue)
    } else {
      setInternalValue(newValue)
    }
  }

  const displayValue = max > 100 ? currentValue.toLocaleString('pt-BR') : String(currentValue)

  return (
    <div
      data-comp-id={id}
      data-comp-type="slider"
      data-comp-editable={id ? 'true' : undefined}
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          background: var(--secondary-background);
          border: 2px solid var(--border);
          box-shadow: 3px 3px 0 var(--border);
          cursor: ${disabled ? 'not-allowed' : 'grab'};
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }
        input[type="range"]::-webkit-slider-thumb::before {
          content: '';
          width: 2px;
          height: 10px;
          background: var(--b2);
          border-radius: 1px;
        }
        input[type="range"]::-webkit-slider-thumb::after {
          content: '';
          width: 2px;
          height: 10px;
          background: var(--b2);
          border-radius: 1px;
        }
        input[type="range"]::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          background: var(--secondary-background);
          border: 2px solid var(--border);
          box-shadow: 3px 3px 0 var(--border);
          cursor: ${disabled ? 'not-allowed' : 'grab'};
        }
      `}</style>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        style={{
          flex: 1,
          height: 8,
          background: `linear-gradient(to right, var(--main) 0%, var(--main) ${(currentValue - min) / (max - min) * 100}%, var(--bg3, #e8e4dc) ${(currentValue - min) / (max - min) * 100}%, var(--bg3, #e8e4dc) 100%)`,
          border: '2px solid var(--border)',
          borderRadius: 4,
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
      />
      {showLabel && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: -30,
          fontSize: 12,
          color: 'var(--t3)',
          fontWeight: 'bold'
        }}>
          {displayValue}
        </div>
      )}
    </div>
  )
}