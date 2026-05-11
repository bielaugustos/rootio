import { useState } from 'react'
import { Button } from '../../components/Button'
import { PageWrapper } from '../../components/PageWrapper'
import { getHabits } from '../../engine/habitDB'
import { getProfile } from '../../engine/profileDB'
import { getEconomy } from '../../engine/economyDB'
import { getTransactions, getGoals } from '../../engine/walletDB'
import { useNavigate } from 'react-router-dom'
import { Section } from '../settings/Section'
import { Row } from '../settings/Row'
import { Toggle } from '../settings/Toggle'

export function PrivacidadePage() {
  const navigate = useNavigate()
  const [perfilPublico, setPerfilPublico] = useState(false)
  const [rastreamentoHabitos, setRastreamentoHabitos] = useState(false)
  const [conquistasFinanceiras, setConquistasFinanceiras] = useState(false)
  const [expandedLegal, setExpandedLegal] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDeleteAccount = async () => {
    indexedDB.deleteDatabase('theme-db')
    indexedDB.deleteDatabase('habit-db')
    indexedDB.deleteDatabase('wallet-db')
    navigate('/')
  }

  const LEGAL_SECTIONS = [
    {
      id: 'termos',
      icon: 'ph-file-text',
      title: 'Termos de uso',
      content: `Os Termos de Serviço do Rootio estruturam a relação software-usuário ao definir responsabilidades sobre a prestação de serviços, conduta do usuário, propriedade intelectual e limitações de responsabilidade.

O escopo de entrega cobre o acesso ao aplicativo Rootio para gerenciamento pessoal de hábitos, metas e tarefas. O usuário concorda em não utilizar o serviço para fins ilícitos, não tentar reverter engenharia do software e não redistribuir o aplicativo ou seus componentes.

A propriedade intelectual — incluindo código, design, marca e conteúdo — pertence exclusivamente ao Rootio. O uso do aplicativo não transfere quaisquer direitos de propriedade ao usuário.`,
    },
    {
      id: 'privacidade',
      icon: 'ph-shield-check',
      title: 'Privacidade e LGPD',
      content: `Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), o Rootio coleta apenas os dados estritamente necessários para o funcionamento do serviço.

Na versão local, todos os dados são armazenados exclusivamente no dispositivo do usuário via IndexedDB. Nenhum dado pessoal é enviado a servidores externos. Na versão com Supabase (plano Pro), os dados são sincronizados de forma criptografada e o usuário mantém o direito de exportar, corrigir ou excluir seus dados a qualquer momento.

Não vendemos, alugamos nem compartilhamos dados pessoais com terceiros para fins comerciais.`,
    },
    {
      id: 'seguranca',
      icon: 'ph-lock-key',
      title: 'Segurança',
      content: `Os dados armazenados localmente são protegidos pelo sandbox do navegador/dispositivo. Na sincronização via Supabase, utilizamos criptografia TLS em trânsito e Row Level Security (RLS) no banco de dados.

O Rootio não se responsabiliza por perdas de dados decorrentes de falhas no dispositivo do usuário, desinstalação do aplicativo ou limpeza de dados do navegador na versão web local.

Para a versão Pro com sincronização ativa, mantemos backups automáticos e o usuário pode exportar todos os seus dados a qualquer momento nas configurações.`,
    },
    {
      id: 'limitacoes',
      icon: 'ph-scales',
      title: 'Limitações e indenização',
      content: `O Rootio é fornecido "como está", sem garantias expressas ou implícitas de disponibilidade contínua. Não nos responsabilizamos por danos indiretos, perda de dados ou lucros cessantes decorrentes do uso ou incapacidade de uso do serviço.

O usuário concorda em indenizar e isentar o Rootio de quaisquer reclamações, danos ou despesas decorrentes do uso indevido da plataforma, violação destes termos ou infração de direitos de terceiros.

Disputas serão regidas pela legislação brasileira, com foro na comarca de São Paulo/SP.`,
    },
  ]

  return (
    <PageWrapper>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/settings')}
          style={{
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--background)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '4px 4px 0 var(--border)',
            cursor: 'pointer',
            color: 'var(--foreground)',
            fontSize: 16,
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = 'none' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)' }}
        >
          <i className="ph ph-arrow-left" />
        </button>
        <div>
          <h1 style={{ fontSize: 24, color: 'var(--t1)', fontFamily: 'var(--font-title)' }}>Privacidade</h1>
          <p style={{ fontSize: 13, color: 'var(--t3)', marginTop: 2 }}>Controle total sobre seus dados</p>
        </div>
      </div>

      <div style={{
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-base)',
        boxShadow: '4px 4px 0 var(--border)',
        overflow: 'hidden',
        marginBottom: 32,
        position: 'relative',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #4947D9, #7B68EE)',
          padding: '40px 28px',
          minHeight: 160,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
          <h2 style={{
            fontSize: 28, fontWeight: 900, color: '#fff',
            margin: 0, lineHeight: 1.2,
          }}>
            Controle Total
          </h2>
          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,0.75)',
            marginTop: 6, maxWidth: 360,
          }}>
            Gerencie como seus dados são usados.
          </p>
        </div>
      </div>

      <Section title="Perfil & Comunidade">
        <Row label="Perfil Público" desc="Permitir que outros membros encontrem seu perfil na rede Social.">
          <Toggle value={perfilPublico} onChange={setPerfilPublico} />
        </Row>
        <Row label="Rastreamento de Hábitos" desc="Compartilhar progresso diário anonimamente para métricas globais.">
          <Toggle value={rastreamentoHabitos} onChange={setRastreamentoHabitos} />
        </Row>
        <Row label="Conquistas Financeiras" desc="Mostrar medalhas de marcos financeiros alcançados no seu perfil." last>
          <Toggle value={conquistasFinanceiras} onChange={setConquistasFinanceiras} />
        </Row>
      </Section>

      <div style={{
        background: 'var(--secondary-background)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-base)',
        boxShadow: '4px 4px 0 var(--border)',
        padding: 20,
        marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <i className="ph ph-psychology" style={{ fontSize: 20, color: 'var(--t1)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', margin: 0 }}>
            Permissões de Aprendizado
          </h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.5, marginBottom: 16, marginTop: 0 }}>
          O Mentor IA pode analisar seus hábitos e progresso para oferecer recomendações
          personalizadas. Controle quais dados ele pode acessar para aprendizado.
        </p>
        <Button label="Configurar permissões" variant="default" onClick={() => navigate('/mentor/settings')} style={{ width: '100%' }} />
      </div>

      <Section title="Gerenciamento de Dados">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 16 }}>
          <div style={{
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            boxShadow: '4px 4px 0 var(--border)',
            background: 'var(--secondary-background)',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
            onClick={async () => {
              const [profile, habits, economy, transactions, goals] = await Promise.all([
                getProfile(),
                getHabits(),
                getEconomy(),
                getTransactions(),
                getGoals(),
              ])
              const data = { profile, habits, economy, transactions, goals, exportedAt: new Date().toISOString() }
              const json = JSON.stringify(data, null, 2)
              const blob = new Blob([json], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = `rootio-dados-${new Date().toISOString().slice(0, 10)}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <i className="ph ph-database" style={{ fontSize: 24, color: 'var(--main)' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>Exportar JSON</span>
          </div>
          <div style={{
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            boxShadow: '4px 4px 0 var(--border)',
            background: 'var(--secondary-background)',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
            onClick={() => alert('Exportação CSV será implementada em breve.')}
          >
            <i className="ph ph-table" style={{ fontSize: 24, color: 'var(--main)' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>Exportar CSV</span>
          </div>
        </div>
      </Section>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{
          fontSize: 11, fontWeight: 700, color: 'var(--t3)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
        }}>
          Termos Legais
        </h2>
        {LEGAL_SECTIONS.map(section => {
          const isOpen = expandedLegal === section.id
          return (
            <div key={section.id} style={{
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-base)',
              boxShadow: '4px 4px 0 var(--border)',
              overflow: 'hidden',
              marginBottom: 8,
            }}>
              <div
                onClick={() => setExpandedLegal(isOpen ? null : section.id)}
                style={{
                  padding: '12px 20px',
                  background: 'var(--bg3, #e8e4dc)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
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

      <div style={{
        border: '2px solid var(--destructive)',
        borderRadius: 'var(--radius-base)',
        boxShadow: '4px 4px 0 var(--destructive)',
        padding: 20,
        marginBottom: 32,
        background: 'var(--secondary-background)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <i className="ph ph-warning" style={{ fontSize: 20, color: 'var(--destructive)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--destructive)', margin: 0 }}>
            Zona de Perigo
          </h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.5, marginBottom: 16, marginTop: 0 }}>
          Ao excluir sua conta, todos os seus dados — incluindo hábitos, metas, progresso financeiro
          e configurações — serão permanentemente removidos. Esta ação não pode ser desfeita.
        </p>
        {confirmDelete ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--destructive)', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
              Tem certeza? Todos os seus dados serão permanentemente removidos. Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button label="Sim, excluir tudo" variant="destructive" onClick={handleDeleteAccount} style={{ flex: 1 }} />
              <Button label="Cancelar" variant="neutral" onClick={() => setConfirmDelete(false)} style={{ flex: 1 }} />
            </div>
          </div>
        ) : (
          <Button label="Excluir minha conta" variant="destructive" onClick={() => setConfirmDelete(true)} style={{ width: '100%' }} />
        )}
      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--t3)' }}>Última atualização: Janeiro 2025 · Rootio v1.0.0</span>
      </div>
    </PageWrapper>
  )
}
