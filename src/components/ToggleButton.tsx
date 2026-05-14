import React from 'react'

interface ToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export const ToggleButton = ({ children, value, ...props }: ToggleButtonProps) => (
  <button {...props} data-value={value}>
    {children}
  </button>
)

interface ToggleButtonGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string | string[]
  exclusive?: boolean
  onChange?: (event: null, value: string) => void
  size?: 'small' | 'medium' | 'large'
  color?: string
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
}

export const ToggleButtonGroup = ({ children, value, exclusive, onChange, ...props }: ToggleButtonGroupProps) => (
  <div {...props}>
    {React.Children.map(children, (child) =>
      React.cloneElement(child as React.ReactElement<ToggleButtonProps>, {
        onClick: () => onChange && onChange(null, (child as React.ReactElement<ToggleButtonProps>).props.value),
        style: {
          backgroundColor: exclusive && value === (child as React.ReactElement<ToggleButtonProps>).props.value ? 'var(--main)' : 'transparent',
          ...(child as React.ReactElement<ToggleButtonProps>).props.style
        }
      })
    )}
  </div>
)
