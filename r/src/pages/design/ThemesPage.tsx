import { useState } from 'react'
import { useTheme } from '../../engine/useTheme'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Pill } from '../../components/Pill'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Modal } from '../../components/Modal'
import { ToastContainer } from '../../components/Toast'
import { useToast } from '../../components/useToast'
import { PageWrapper } from '../../components/PageWrapper'
import { Checkbox } from '../../components/Checkbox'
import { Radio } from '../../components/Radio'
import { Toggle } from '../../components/Toggle'
import { Slider } from '../../components/Slider'
import { DatePicker } from '../../components/DatePicker'
import { DateRangePicker, DEFAULT_SHORTCUTS } from '../../components/DateRangePicker'
import { TimePicker, type TimeValue } from '../../components/TimePicker'
import { NumberField } from '../../components/NumberField'


const icons = [
  'ph-house', 'ph-squares-four', 'ph-paint-bucket', 'ph-text-aa', 'ph-swatches',
  'ph-star', 'ph-play-circle', 'ph-gear', 'ph-lightning', 'ph-user',
  'ph-heart', 'ph-arrow-left', 'ph-arrow-right', 'ph-magnifying-glass',
  'ph-download-simple', 'ph-upload-simple', 'ph-trash', 'ph-pencil',
  'ph-plus', 'ph-minus', 'ph-x', 'ph-check', 'ph-warning', 'ph-info',
  'ph-bell', 'ph-chat', 'ph-envelope', 'ph-phone', 'ph-calendar',
  'ph-clock', 'ph-tag', 'ph-folder', 'ph-file', 'ph-image',
  'ph-link', 'ph-copy', 'ph-share', 'ph-bookmark', 'ph-flag',
  'ph-eye', 'ph-eye-slash', 'ph-lock', 'ph-unlock', 'ph-key',
  'ph-moon', 'ph-sun', 'ph-cloud', 'ph-wifi', 'ph-bluetooth',
  'ph-chart-bar', 'ph-chart-line', 'ph-chart-pie', 'ph-table', 'ph-list',
  'ph-grid-four', 'ph-sidebar', 'ph-layout', 'ph-rows', 'ph-columns',
  'ph-paint-brush', 'ph-palette', 'ph-drop', 'ph-pencil-simple', 'ph-eraser',
]

const presets = [
  { name: 'Amber', main: '#ffbf00', bg: '#f7f4ec', border: '#000000' },
  { name: 'Ocean', main: '#0ea5e9', bg: '#f0f9ff', border: '#0c4a6e' },
  { name: 'Forest', main: '#22c55e', bg: '#f0fdf4', border: '#14532d' },
  { name: 'Rose', main: '#f43f5e', bg: '#fff1f2', border: '#881337' },
  { name: 'Violet', main: '#8b5cf6', bg: '#f5f3ff', border: '#4c1d95' },
  { name: 'Slate', main: '#64748b', bg: '#f8fafc', border: '#0f172a' },
]

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--t1)' }}>
      {children}
    </h2>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section style={{
      marginBottom: 'var(--section-gap, 40px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      {children}
    </section>
  )
}

export function ThemesPage() {
  const { setGlobalToken, mode } = useTheme()
  const [active, setActive] = useState('Amber')
  const [modalOpen, setModalOpen] = useState(false)
  const { toasts, toast, remove } = useToast()
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState('')
  const [code, setCode] = useState(`<Button label="Clique aqui" />`)
  const [bioFocused, setBioFocused] = useState(false)
  const [sliderValue, setSliderValue] = useState(50)
  const [dateValue, setDateValue] = useState<Date | null>(null)
  const [timeValue, setTimeValue] = useState<TimeValue | null>({ hours: 8, minutes: 0 })
  const [checkboxChecked, setCheckboxChecked] = useState(true)
  const [radioChecked, setRadioChecked] = useState(false)
  const [toggleChecked, setToggleChecked] = useState(false)


  const filtered = icons.filter(i => i.includes(query.toLowerCase()))

  const copy = (icon: string) => {
    navigator.clipboard.writeText(`<i class="${icon} ph" />`)
    setCopied(icon)
    setTimeout(() => setCopied(''), 1500)
  }

  const applyPreset = async (preset: typeof presets[0]) => {
    setActive(preset.name)
    await setGlobalToken('--main', preset.main)
    await setGlobalToken('--background', preset.bg)
    await setGlobalToken('--border', preset.border)
  }

  return (
    <PageWrapper>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>Temas</h1>
      <p style={{ color: 'var(--t2)', fontSize: 15, marginBottom: 32 }}>
        Presets de tema prontos. Clique para aplicar ao vivo.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
        {presets.map(preset => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            style={{
              padding: '20px 16px',
              border: `2px solid ${active === preset.name ? preset.border : 'var(--border)'}`,
              borderRadius: 'var(--radius-base)',
              boxShadow: active === preset.name ? `4px 4px 0 ${preset.border}` : '4px 4px 0 var(--border)',
              background: preset.bg,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'transform 0.1s, box-shadow 0.1s',
              outline: active === preset.name ? `2px solid ${preset.main}` : 'none',
              outlineOffset: 2,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translate(4px,4px)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = active === preset.name ? `4px 4px 0 ${preset.border}` : '4px 4px 0 var(--border)'
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              background: preset.main,
              border: `2px solid ${preset.border}`,
              borderRadius: 'var(--radius-sm)',
              boxShadow: `3px 3px 0 ${preset.border}`,
              marginBottom: 10,
            }} />
            <div style={{ fontSize: 14, fontWeight: 500, color: preset.border, fontFamily: 'var(--font-sans)' }}>
              {preset.name}
            </div>
            <div style={{ fontSize: 11, color: preset.border, opacity: 0.6, fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {preset.main}
            </div>
          </button>
        ))}
      </div>

      <section style={{ padding: 24, border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', boxShadow: '4px 4px 0 var(--border)', background: 'var(--secondary-background)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: 'var(--t1)', marginBottom: 8 }}>Exportar tema atual</h2>
        <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 16 }}>
          Salve as customizações feitas no editor como um arquivo JSON para compartilhar ou fazer backup.
        </p>
        <Button
          label="Exportar como JSON"
          variant="neutral"
          onClick={async () => {
            const { themeEngine } = await import('../../engine/ThemeEngine')
            const json = await themeEngine.exportTheme()
            const blob = new Blob([json], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `nb-theme-${mode}.json`
            a.click()
            URL.revokeObjectURL(url)
          }}
        />
      </section>

      {/* Components */}
      <Section>
        <SectionTitle>Buttons</SectionTitle>
        <div style={{ display: 'flex', gap: 'var(--grid-gap, 12px)', flexWrap: 'wrap' }}>
          <Button label="Primary" id="btn-primary" />
          <Button label="Neutral" variant="neutral" id="btn-neutral" />
          <Button label="Destructive" variant="destructive" id="btn-destructive" />
          <Button label="Ghost" variant="ghost" id="btn-ghost" />
          <Button label="Reverse" variant="reverse" id="btn-reverse" />
          <Button label="Sem sombra" variant="no-shadow" id="btn-noshadow" />
          <Button label="Disabled" disabled id="btn-disabled" />
        </div>
        <SectionTitle>Sizes</SectionTitle>
        <div style={{ display: 'flex', gap: 'var(--grid-gap, 12px)', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button label="Pequeno" size="sm" id="btn-sm" />
          <Button label="Default" id="btn-default" />
          <Button label="Grande" size="lg" id="btn-lg" />
        </div>
        <SectionTitle>With icons</SectionTitle>
          <div style={{ display: 'flex', gap: 'var(--grid-gap, 12px)', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button id="btn-icon-back"><i className="ph ph-arrow-left" style={{ fontSize: 18 }} />Voltar</Button>
            <Button id="btn-icon-next">Próximo<i className="ph ph-arrow-right" style={{ fontSize: 18 }} /></Button>
            <Button variant="neutral" id="btn-icon-home"><i className="ph ph-house" style={{ fontSize: 18 }} />Home</Button>
            <Button id="btn-icon-default" variant='ghost'><i style={{ fontSize: 18 }} /></Button>
          </div>
          <SectionTitle>Only icons</SectionTitle>
          <div style={{ display: 'flex', gap: 'var(--grid-gap, 12px)', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button size="icon" id="btn-icon-only-back"><i className="ph ph-arrow-left" style={{ fontSize: 18 }} /></Button>
            <Button size="icon" id="btn-icon-only-next"><i className="ph ph-arrow-right" style={{ fontSize: 18 }} /></Button>
            <Button size="icon" variant="neutral" id="btn-icon-only-home"><i className="ph ph-house" style={{ fontSize: 18 }} /></Button>
            <Button size="icon" variant="destructive" id="btn-icon-only-star"><i className="ph ph-star" style={{ fontSize: 18 }} /></Button>
            <Button size="icon" variant='ghost' id="btn-icon-only-heart"><i className="ph ph-heart" style={{ fontSize: 18 }} /></Button>
          </div>
      </Section>

      {/* Cards */}
      <Section>
        <SectionTitle>Cards</SectionTitle>
        <div style={{
          display: 'grid',
          gap: 'var(--grid-gap, 16px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        }}>
          <Card title="Habits" content="Track your daily habits and build consistency." id="card-habits" />
          <Card title="Goals" content="Set ambitious goals and break them into actionable steps." id="card-goals" />
          <Card title="Teste" content="Hello World!" id="card-3" />
        </div>
      </Section>

      {/* Shields */}
      <Section>
        <SectionTitle>Shields</SectionTitle>
        <div style={{ display: 'flex', gap: 'var(--grid-gap, 12px)', flexWrap: 'wrap' }}>
          <Badge label="Hábitos: 5" id="shield-habits" />
          <Badge label="Streak: 7 dias" variant="secondary" id="shield-streak" />
          <Badge label="Sprint: Ativo" variant="destructive" id="shield-sprint" />
          <Badge label="Metas: 3/5" variant="secondary" id="shield-goals" />
          <Badge label="IO: +25" variant="outline" id="shield-io" />
          <Badge label="Prioridade: Alta" id="shield-priority" />
          <Badge label="Tempo: 30min" variant="secondary" id="shield-time" />
          <Badge label="Categoria: Produtividade" variant="destructive" id="shield-category" />
        </div>
      </Section>

      {/* Pills */}
      <Section>
        <SectionTitle>Action Pills</SectionTitle>
        <div style={{ display: 'flex', gap: 'var(--grid-gap, 12px)', flexWrap: 'wrap' }}>
          <Pill label="Default" variant="default" id="pill-default"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>}
          />
          <Pill
            label="Streak"
            variant="habit"
            id="pill-habit"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
          />
           <Pill label="Histórico" variant="habit" id="pill-habit-history"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>}
          />
          <Pill label="Lembrete" variant="habit" id="pill-habit-reminder"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
          />
          <Pill label="Progresso" variant="goal" id="pill-goal"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
          />
          <Pill label="Tabela" variant="goal" id="pill-goal-table"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>}
          />
          <Pill label="Aportar" variant="goal" id="pill-goal-aport"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
          />
          <Pill label="Timer" variant="task" id="pill-task-timer"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/></svg>}
          />
          <Pill label="Prioridade" variant="task" id="pill-task"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3h18v10H3z"/><path d="M7 21l5-5 5 5"/></svg>}
          />
          <Pill label="Anexos" variant="task" id="pill-task-attach"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>}
          />
          <Pill label="Agendar" variant="event" id="pill-event"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          />
          <Pill label="Local" variant="event" id="pill-event-local"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>}
          />
          <Pill label="Participantes" variant="event" id="pill-event-people"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
        </div>
      </Section>

      {/* Inputs */}
      <Section>
        <SectionTitle>Inputs</SectionTitle>
        <div style={{
          display: 'grid',
          gap: 'var(--grid-gap, 16px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}>
          <Input label="Nome" placeholder="Digite seu nome" id="input-name" />
          <Input label="Email" placeholder="email@exemplo.com" type="email" id="input-email" />
          <Input label="Com erro" placeholder="Campo obrigatório" error="Este campo é obrigatório" id="input-error" />
          <Input label="Desabilitado" placeholder="Não editável" disabled id="input-disabled" />
        </div>
        <div style={{
          marginTop: 16,
          display: 'grid',
          gap: 'var(--grid-gap, 16px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 400,
              color: 'var(--t1)',
              marginBottom: 6,
            }}>
              Bio
            </label>
            <textarea
              placeholder="Conte um pouco sobre você..."
              maxLength={300}
              onFocus={() => setBioFocused(true)}
              onBlur={() => setBioFocused(false)}
              rows={6}
              style={{
                width: '100%',
                minWidth: '100%',
                maxWidth: '100%',
                display: 'inline-block',
                padding: '10px 12px',
                fontSize: 14,
                fontFamily: 'var(--font-sans)',
                border: bioFocused ? '2px solid var(--main)' : '2px solid var(--border)',
                borderRadius: 'var(--radius-base)',
                background: 'var(--secondary-background)',
                color: 'var(--foreground)',
                resize: 'vertical',
                outline: 'none',
                boxShadow: bioFocused ? 'var(--shadow-x, 4px) var(--shadow-y, 4px) 0 var(--foreground)' : 'none',
                transition: 'border-color 0.2s ease-out, box-shadow 0.2s ease-out',
              }}
            />
            <div style={{ fontSize: 11, color: 'var(--t3)', textAlign: 'right', marginTop: 4 }}>
              0/300
            </div>
          </div>
        </div>
      </Section>

      {/* Select */}
      <Section>
        <SectionTitle>Select</SectionTitle>
        <div style={{
          display: 'grid',
          gap: 'var(--grid-gap, 16px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}>
          <Select
            label="Tema"
            options={[
              { label: 'Claro', value: 'light', type: 'theme' },
              { label: 'Escuro', value: 'dark', type: 'theme' },
              { label: 'Automático', value: 'auto', type: 'theme' },
            ]}
            id="select-theme"
          />
          <Select
            label="Idioma"
            options={[
              { label: 'Português', value: 'pt', type: 'language' },
              { label: 'English', value: 'en', type: 'language' },
              { label: 'Español', value: 'es', type: 'language' },
            ]}
            id="select-lang"
          />
        </div>
      </Section>

      {/* Checkbox and Radio */}
      <Section>
        <SectionTitle>Checkbox and Radio</SectionTitle>
        <div style={{
          display: 'grid',
          gap: 'var(--grid-gap, 16px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}>
          <div style={{
            padding: '16px 20px',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            boxShadow: '4px 4px 0 var(--border)',
            background: 'var(--secondary-background)',
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Checkbox</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Checkbox checked={checkboxChecked} onChange={setCheckboxChecked} id="checkbox-demo" />
                <span style={{ fontSize: 14, color: 'var(--t2)' }}>Aceitar termos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Checkbox checked={false} id="checkbox-unchecked" />
                <span style={{ fontSize: 14, color: 'var(--t2)' }}>Não aceitar</span>
              </div>
            </div>
          </div>
          <div style={{
            padding: '16px 20px',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            boxShadow: '4px 4px 0 var(--border)',
            background: 'var(--secondary-background)',
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Radio</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Radio checked={radioChecked} onChange={(checked) => setRadioChecked(checked)} name="demo" id="radio-1" />
                <span style={{ fontSize: 14, color: 'var(--t2)' }}>Opção 1</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Radio checked={!radioChecked} onChange={(checked) => setRadioChecked(!checked)} name="demo" id="radio-2" />
                <span style={{ fontSize: 14, color: 'var(--t2)' }}>Opção 2</span>
              </div>
            </div>
          </div>
          <div style={{
            padding: '16px 20px',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            boxShadow: '4px 4px 0 var(--border)',
            background: 'var(--secondary-background)',
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Toggle</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Toggle checked={toggleChecked} onChange={setToggleChecked} id="toggle-demo" />
                <span style={{ fontSize: 14, color: 'var(--t2)' }}>Ativar notificação</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Toggle checked={false} id="toggle-off" />
                <span style={{ fontSize: 14, color: 'var(--t2)' }}>Desativar</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Sliders */}
      <Section>
        <SectionTitle>Sliders</SectionTitle>
        <div style={{
          display: 'grid',
          gap: 'var(--grid-gap, 16px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}>
          <div style={{
            padding: '16px 20px',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            boxShadow: '4px 4px 0 var(--border)',
            background: 'var(--secondary-background)',
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Linear Slider</h4>
              <div style={{marginTop:'20px'}}>
                <Slider value={sliderValue} onChange={setSliderValue} min={0} max={100} id="slider-volume" />
              </div>
          </div>
        </div>
      </Section>

      {/* Progress Bars */}
      <Section>
        <SectionTitle>Progress Bars</SectionTitle>
        <div style={{
          display: 'grid',
          gap: 'var(--grid-gap, 16px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}>
          <div style={{
            padding: '16px 20px',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            boxShadow: '4px 4px 0 var(--border)',
            background: 'var(--secondary-background)',
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Progresso</h4>
            <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 12, fontFamily: 'var(--font-sans)' }}>
              Barra de progresso com animação neobrutalism — usada na página de hábitos.
            </p>
            <div style={{
              height: 12, background: 'var(--bg3, #e8e4dc)',
              border: '2px solid var(--border)', borderRadius: 6,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: '67%',
                background: 'var(--b2)',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--font-sans)' }}>0%</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--main)', fontFamily: 'var(--font-sans)' }}>67%</span>
              <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--font-sans)' }}>100%</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Date Pickers */}
      <Section>
        <SectionTitle>Date Pickers</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px', minWidth: 200 }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Padrão</h4>
              <DatePicker
                value={dateValue}
                onChange={setDateValue}
              />
            </div>
            <div style={{ flex: '1 1 200px', minWidth: 200 }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Com label</h4>
              <DatePicker
                label="Data de vencimento"
                value={dateValue}
                onChange={setDateValue}
              />
            </div>
            <div style={{ flex: '1 1 200px', minWidth: 200 }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Desabilitado</h4>
              <DatePicker
                defaultValue={new Date()}
                disabled
              />
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Static</h4>
            <DatePicker
              label="Sempre aberto"
              value={dateValue}
              onChange={setDateValue}
              static
            />
          </div>
        </div>
      </Section>

      {/* Date Range Picker */}
      <Section>
        <SectionTitle>Date Range Picker</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px', minWidth: 200 }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Popup</h4>
              <DateRangePicker label="Selecione um período" />
            </div>
            <div style={{ flex: '1 1 200px', minWidth: 200 }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>2 calendários</h4>
              <DateRangePicker label="Dois meses" calendars={2} />
            </div>
            <div style={{ flex: '1 1 200px', minWidth: 200 }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Desktop + atalhos</h4>
              <DateRangePicker label="Com atalhos" calendars={2} shortcuts={DEFAULT_SHORTCUTS} />
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Static</h4>
            <DateRangePicker label="Sempre aberto" static />
          </div>
        </div>
      </Section>

      {/* Time Pickers */}
      <Section>
        <SectionTitle>Time Pickers</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px', minWidth: 200 }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Padrão</h4>
              <TimePicker
                value={timeValue}
                onChange={setTimeValue}
              />
            </div>
            <div style={{ flex: '1 1 200px', minWidth: 200 }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Com label</h4>
              <TimePicker
                label="Horário de lembrete"
                value={timeValue}
                onChange={setTimeValue}
              />
            </div>
            <div style={{ flex: '1 1 200px', minWidth: 200 }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Desabilitado</h4>
              <TimePicker
                defaultValue={{ hours: 9, minutes: 30 }}
                disabled
              />
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Static</h4>
            <TimePicker
              label="Sempre aberto"
              value={timeValue}
              onChange={setTimeValue}
              static
            />
          </div>
        </div>
      </Section>

      {/* Number */}
      <Section>
        <SectionTitle>Number Field</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Padrão</h4>
            <NumberField
              label="Idade"
              defaultValue={25}
              min={0} max={150}
              helperText="Entre 0 e 150"
            />
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Com prefixo/sufixo</h4>
            <NumberField
              placeholder="0.00"
              prefix="R$"
              suffix="BRL"
              step={0.01}
              min={0}
            />
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Sem spinner</h4>
            <NumberField
              label="Sem setas"
              spinner={false}
              defaultValue={42}
              min={0} max={100}
            />
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Com erro</h4>
            <NumberField
              label="Valor inválido"
              defaultValue={200}
              min={0} max={100}
              error="Deve ser entre 0 e 100"
            />
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Desabilitado</h4>
            <NumberField
              label="Bloqueado"
              defaultValue={25}
              min={0} max={100}
              disabled
            />
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Pequeno</h4>
            <NumberField
              label="Small"
              size="sm"
              defaultValue={10}
              min={0} max={50}
            />
          </div>
        </div>
      </Section>

      {/* Modal */}
      <Section>
        <SectionTitle>Modal</SectionTitle>
        <div style={{ display: 'flex', gap: 'var(--grid-gap, 12px)', flexWrap: 'wrap' }}>
          <Button label="Abrir Modal" onClick={() => setModalOpen(true)} />
        </div>
      </Section>

      {/* Toast */}
      <Section>
        <SectionTitle>Toast</SectionTitle>
        <div style={{ display: 'flex', gap: 'var(--grid-gap, 12px)', flexWrap: 'wrap' }}>
          <Button label="Default" variant="neutral" onClick={() => toast('Operação realizada!')} />
          <Button label="Sucesso" onClick={() => toast('Salvo com sucesso!', 'success')}  />
          <Button label="Erro" variant="destructive" onClick={() => toast('Algo deu errado.', 'error')} />
          <Button label="Aviso" variant="no-shadow" onClick={() => toast('Atenção: verifique os dados.', 'warning')} />
        </div>
        <ToastContainer toasts={toasts} onRemove={remove} />
      </Section>

      {/* Command K */}
      <Section>
        <SectionTitle>CommandK</SectionTitle>
        <p style={{ color: 'var(--t2)', fontSize: 14 }}>
          Pressione{' '}
          <kbd style={{
            fontSize: 12,
            padding: '2px 8px',
            background: 'var(--secondary-background)',
            border: 'var(--border-width, 2px) solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '2px 2px 0 var(--border)',
            fontFamily: 'var(--font-mono)',
          }}>⌘K</kbd>
          {' '}&nbsp;ou&nbsp; {' '}
          <kbd style={{
            fontSize: 12,
            padding: '2px 8px',
            background: 'var(--secondary-background)',
            border: 'var(--border-width, 2px) solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '2px 2px 0 var(--border)',
            fontFamily: 'var(--font-mono)',
          }}>Ctrl+K</kbd>
          {' '}&nbsp;para abrir o command palette.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <p style={{ color: 'var(--t2)', fontSize: 14 }}>
            Em dispositivos touch, clique no botão.</p>
          <Button 
            label="Command+K" 
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))}
            variant='neutral'
          />
        </div>
      </Section>

      {/* Tokens */}
      <Section>
        <SectionTitle>Tokens</SectionTitle>
        <p style={{ color: 'var(--t2)', fontSize: 15, marginBottom: 32 }}>
          Variáveis CSS que compõem o design system. Edite ao vivo pelo painel 🎨.
        </p>

        {[
          { group: 'Cores', tokens: ['--main', '--background', '--secondary-background', '--foreground', '--border', '--destructive'] },
          { group: 'Texto', tokens: ['--t1', '--t2', '--t3'] },
          { group: 'Raios', tokens: ['--radius-base', '--radius-sm', '--radius-lg'] },
          { group: 'Sombras', tokens: ['--shadow-x', '--shadow-y'] },
          { group: 'Espaçamento', tokens: ['--spacing', '--section-gap', '--grid-gap'] },
        ].map(({ group, tokens }) => (
          <section key={group} style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              {group}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', overflow: 'hidden' }}>
              {tokens.map((token, i) => (
                <div key={token} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: i < tokens.length - 1 ? '1px solid var(--b2)' : 'none',
                  background: 'var(--secondary-background)',
                }}>
                  <code style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--t1)' }}>{token}</code>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--font-mono)' }}>
                      {getComputedStyle(document.documentElement).getPropertyValue(token).trim() || '—'}
                    </span>
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--b2)',
                      background: `var(${token})`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </Section>

      {/* Icons */}
      <Section>
        <SectionTitle>Icons</SectionTitle>
        <p style={{ color: 'var(--t2)', fontSize: 15, marginBottom: 24 }}>
          Biblioteca Phosphor Icons via CSS. Clique para copiar o código.
        </p>
        <div style={{
          padding: '16px 20px',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: '4px 4px 0 var(--border)',
          background: 'var(--secondary-background)',
          marginBottom: 16,
        }}>
          <Input
            placeholder="Buscar ícones..."
            value={query}
            onChange={setQuery}
          />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: 12,
        }}>
          {filtered.map(icon => (
            <button
              key={icon}
              onClick={() => copy(icon)}
              title={copied === icon ? 'Copiado!' : `Copiar ${icon}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '12px 8px',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-base)',
                boxShadow: '4px 4px 0 var(--border)',
                background: copied === icon ? 'var(--main)' : 'var(--secondary-background)',
                cursor: 'pointer',
                transition: 'all 0.1s',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translate(4px,4px)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'
              }}
            >
              <i className={`${icon} ph`} style={{ fontSize: 24, color: copied === icon ? 'var(--main-foreground)' : 'var(--t2)' }} />
              <span style={{
                fontSize: 10,
                color: copied === icon ? 'var(--main-foreground)' : 'var(--t3)',
                fontFamily: 'var(--font-mono)',
                textAlign: 'center',
                wordBreak: 'break-all',
              }}>
                {icon}
              </span>
            </button>
          ))}
        </div>
        {copied && (
          <div style={{
            marginTop: 16,
            padding: '8px 16px',
            background: 'var(--main)',
            color: 'var(--main-foreground)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12,
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
          }}>
            Copiado: {copied}
          </div>
        )}
      </Section>

      {/* Playground */}
      <Section>
        <SectionTitle>Playground</SectionTitle>
        <p style={{ color: 'var(--t2)', fontSize: 15, marginBottom: 32 }}>
          Experimente combinações de componentes e variantes lado a lado.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          alignItems: 'start',
        }}>
          {/* Editor */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Código JSX</h3>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              rows={12}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 13,
                fontFamily: 'var(--font-mono)',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-base)',
                boxShadow: '4px 4px 0 var(--border)',
                background: 'var(--secondary-background)',
                color: 'var(--t1)',
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>

          {/* Preview */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Preview</h3>
            <div style={{
              minHeight: 200,
              padding: '16px 20px',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-base)',
              boxShadow: '4px 4px 0 var(--border)',
              background: 'var(--secondary-background)',
            }}>
              <div dangerouslySetInnerHTML={{ __html: code }} />
            </div>
          </div>
        </div>

        {/* Quick examples */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', marginBottom: 12 }}>Exemplos rápidos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <button
              onClick={() => setCode('<Button label="Clique aqui" />')}
              style={{
                padding: '12px 16px',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-base)',
                boxShadow: '4px 4px 0 var(--border)',
                background: 'var(--secondary-background)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translate(4px,4px)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--t1)', marginBottom: 4 }}>Botão simples</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--font-mono)' }}>
                &lt;Button label="Clique aqui" /&gt;
              </div>
            </button>
            <button
              onClick={() => setCode('<Card title="Título" content="Conteúdo do card." />')}
              style={{
                padding: '12px 16px',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-base)',
                boxShadow: '4px 4px 0 var(--border)',
                background: 'var(--secondary-background)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translate(4px,4px)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--t1)', marginBottom: 4 }}>Card básico</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--font-mono)' }}>
                &lt;Card title="Título" content="..." /&gt;
              </div>
            </button>
            <button
              onClick={() => setCode('<Badge label="Novo" />')}
              style={{
                padding: '12px 16px',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-base)',
                boxShadow: '4px 4px 0 var(--border)',
                background: 'var(--secondary-background)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translate(4px,4px)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--t1)', marginBottom: 4 }}>Badge</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--font-mono)' }}>
                &lt;Badge label="Novo" /&gt;
              </div>
            </button>
          </div>
        </div>
      </Section>

      <Modal
        open={modalOpen}
        title="Modal de Exemplo"
        onClose={() => setModalOpen(false)}
      >
        <p style={{ color: 'var(--t2)', fontSize: 14 }}>
          Este é um modal de exemplo. Você pode fechar clicando fora ou no botão ✕.
        </p>
      </Modal>
    </PageWrapper>
  )
}