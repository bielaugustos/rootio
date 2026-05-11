import { useState, useEffect } from 'react'
import { Button } from '../../components/Button'
import { PageWrapper } from '../../components/PageWrapper'
import { Pill } from '../../components/Pill'
import { useNavigate } from 'react-router-dom'

interface Device {
  name: string
  icon: string
  status: string
  isCurrent: boolean
}

function detectDevice(): { name: string; icon: string } {
  const ua = navigator.userAgent.toLowerCase()
  const platform = navigator.platform?.toLowerCase() ?? ''

  if (/iphone|ipad|ipod/.test(ua)) return { name: 'iPhone/iPad', icon: 'ph-smartphone' }
  if (/android/.test(ua)) return { name: 'Android', icon: 'ph-smartphone' }
  if (/mac/.test(platform) || /macintosh/.test(ua)) return { name: 'Mac', icon: 'ph-laptop' }
  if (/win/.test(platform)) return { name: 'Windows', icon: 'ph-laptop' }
  if (/linux/.test(platform)) return { name: 'Linux', icon: 'ph-laptop' }
  return { name: 'Dispositivo', icon: 'ph-devices' }
}

const SYNC_SECTIONS = [
  {
    icon: 'ph-devices',
    title: 'Sync e dispositivos',
    content: `O Rootio armazena todos os dados localmente no dispositivo por padrão, utilizando IndexedDB do navegador. Isso garante que o app funcione offline e que nenhum dado trafegue sem sua autorização.

Com o plano Pro, a sincronização via Supabase é ativada automaticamente. Seus hábitos, metas, histórico e preferências são sincronizados de forma segura entre todos os dispositivos vinculados à sua conta.`,
  },
  {
    icon: 'ph-cloud',
    title: 'Armazenamento na nuvem',
    content: `Os dados sincronizados são armazenados em servidores Supabase com Row Level Security (RLS), garantindo que apenas você acesse seus próprios dados — nem mesmo administradores têm acesso ao seu conteúdo.

A transmissão é protegida por TLS 1.3. Os dados em repouso são criptografados com AES-256. Realizamos backups automáticos diários com retenção de 30 dias.`,
  },
  {
    icon: 'ph-export',
    title: 'Portabilidade dos dados',
    content: `Você pode exportar todos os seus dados a qualquer momento em formato JSON nas configurações (Dados → Exportar). O arquivo contém hábitos, histórico, metas, configurações de tema e preferências.

Também é possível importar dados de um backup anterior ou de outro dispositivo. A importação mescla os dados sem sobrescrever entradas existentes mais recentes.`,
  },
  {
    icon: 'ph-trash',
    title: 'Exclusão de dados',
    content: `Para excluir todos os dados locais, limpe o armazenamento do site nas configurações do seu navegador ou use a opção "Resetar dados" que estará disponível em uma próxima versão.

Para solicitar a exclusão completa da sua conta e todos os dados na nuvem (plano Pro), entre em contato pelo suporte. A exclusão é permanente e processada em até 30 dias conforme a LGPD.`,
  },
]

export function SyncPage() {
  const navigate = useNavigate()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem('sync-devices')
    if (saved) return JSON.parse(saved) as Device[]
    return []
  })

  useEffect(() => {
    if (devices.length === 0) {
      const current = detectDevice()
      const initial: Device[] = [
        { name: current.name, icon: current.icon, status: 'Este dispositivo', isCurrent: true },
      ]
      setDevices(initial)
      localStorage.setItem('sync-devices', JSON.stringify(initial))
    }
  }, [devices.length])

  return (
    <PageWrapper>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/settings')}
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            boxShadow: '4px 4px 0 var(--border)',
            background: 'var(--secondary-background)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translate(4px, 4px)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'
          }}
        >
          <i className="ph ph-arrow-left" style={{ fontSize: 18 }} />
        </button>
        <div>
          <h1 style={{ fontSize: 28, color: 'var(--t1)', fontFamily: 'var(--font-title)' }}>Sincronização</h1>
          <p style={{ fontSize: 13, color: 'var(--t3)', marginTop: 2 }}>Dados na nuvem via Supabase</p>
        </div>
      </div>

      <div style={{
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-base)',
        boxShadow: '4px 4px 0 var(--border)',
        background: 'var(--secondary-background)',
        padding: 24,
        marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <i className="ph ph-cloud" style={{ fontSize: 24, color: 'var(--main-foreground)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, color: 'var(--t1)', fontFamily: 'var(--font-title)' }}>Backup na Nuvem</h2>
            <p style={{ fontSize: 13, color: 'var(--t3)', marginTop: 2 }}>Última sincronização: —</p>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.5px' }}>ARMAZENAMENTO</span>
            <span style={{ fontSize: 12, color: 'var(--t2)' }}>— / — MB</span>
          </div>
          <div style={{
            width: '100%',
            height: 8,
            borderRadius: 4,
            background: 'var(--b2)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: '0%',
              height: '100%',
              borderRadius: 4,
              background: 'var(--main)',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--main)' }} />
              <span style={{ fontSize: 11, color: 'var(--t3)' }}>Dados IO</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--b2)' }} />
              <span style={{ fontSize: 11, color: 'var(--t3)' }}>Disponível</span>
            </div>
          </div>
        </div>

        <Button label="Sincronizar Agora" variant="default" onClick={() => alert('Sync será implementado com Supabase.')} style={{ width: '100%' }} />
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.5px', marginBottom: 10 }}>DISPOSITIVOS CONECTADOS</div>

      {devices.map(d => (
        <div key={d.name} style={{
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: '4px 4px 0 var(--border)',
          background: 'var(--secondary-background)',
          padding: '14px 20px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-base)',
              border: '2px solid var(--border)',
              background: 'var(--bg3, #e8e4dc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <i className={`ph ${d.icon}`} style={{ fontSize: 22, color: 'var(--t1)' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{d.name}</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{d.status}</div>
            </div>
          </div>
          {d.isCurrent ? (
            <Pill label="ATUAL" size="sm" />
          ) : (
            <button
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-base)',
                background: 'var(--secondary-background)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease',
                boxShadow: '2px 2px 0 var(--border)',
                color: 'var(--t2)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translate(2px, 2px)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.background = 'var(--destructive)'
                e.currentTarget.style.color = 'var(--destructive-foreground)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)'
                e.currentTarget.style.background = 'var(--secondary-background)'
                e.currentTarget.style.color = 'var(--t2)'
              }}
              onClick={() => {
                const updated = devices.filter(d2 => d2.name !== d.name)
                setDevices(updated)
                localStorage.setItem('sync-devices', JSON.stringify(updated))
              }}
              title="Desconectar"
            >
              <i className="ph ph-sign-out" style={{ fontSize: 18 }} />
            </button>
          )}
        </div>
      ))}

      <div style={{
        background: 'var(--secondary-background)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-base)',
        boxShadow: '4px 4px 0 var(--border)',
        padding: 20,
        marginTop: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-base)',
            background: 'var(--bg3, #e8e4dc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <i className="ph ph-shield-check" style={{ fontSize: 20, color: 'var(--t1)' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>Sessões Seguras</div>
            <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, margin: 0 }}>
              Sua conta está protegida com criptografia de ponta a ponta. Se você não reconhece algum dispositivo, encerre a sessão imediatamente.
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 32, marginTop: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.5px', marginBottom: 10 }}>
          TERMOS DE SERVIÇO
        </div>
        {SYNC_SECTIONS.map(section => {
          const isOpen = expandedSection === section.title
          return (
            <div key={section.title} style={{
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-base)',
              boxShadow: '4px 4px 0 var(--border)',
              overflow: 'hidden',
              marginBottom: 8,
            }}>
              <div
                onClick={() => setExpandedSection(isOpen ? null : section.title)}
                style={{
                  padding: '12px 20px',
                  background: 'var(--bg3, #e8e4dc)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  borderBottom: isOpen ? '2px solid var(--border)' : 'none',
                }}
              >
                <i className={`ph ${section.icon}`} style={{ fontSize: 18, color: 'var(--t1)' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', flex: 1 }}>
                  {section.title}
                </span>
                <i className={`ph ${isOpen ? 'ph-caret-up' : 'ph-caret-down'}`} style={{ fontSize: 16, color: 'var(--t2)' }} />
              </div>
              {isOpen && (
                <div style={{ padding: '0 20px 16px', background: 'var(--secondary-background)' }}>
                  {section.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} style={{
                      fontSize: 13,
                      color: 'var(--t2)',
                      lineHeight: 1.6,
                      marginTop: i === 0 ? 12 : 8,
                      marginBottom: 0,
                    }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </PageWrapper>
  )
}
