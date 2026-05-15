import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '../../components'
import { auth } from '../../engine/supabase'
import { useToast } from '../../components/useToast'
import { ToastContainer } from '../../components/Toast'

type AuthMode = 'login' | 'signup'

export function LoginPage() {
  const navigate = useNavigate()
  const { toast, toasts, remove } = useToast()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleMode = () => setMode(m => m === 'login' ? 'signup' : 'login')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await auth.signUp(email, password, { name })
        if (error) throw error
        toast('Conta criada! Verifique seu email.', 'success')
      } else {
        const { error } = await auth.signIn(email, password)
        if (error) throw error
        navigate('/', { replace: true })
      }
    } catch (error) {
      toast((error as Error).message || 'Erro na autenticação', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, background: 'var(--foreground)', border: '3px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: '4px 4px 0 var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.svg" alt="Logo" style={{ width: 24, height: 24 }} />
            </div>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--t1)' }}>Rootio</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--foreground)', margin: 0 }}>
            {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--t3)', marginTop: 6 }}>
            {mode === 'login' ? 'Entre para continuar sua jornada' : 'Comece sua jornada rumo ao topo'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: '6px 6px 0 var(--border)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nome</label>
              <Input placeholder="Seu nome" value={name} onChange={setName} disabled={loading} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</label>
            <Input placeholder="seu@email.com" value={email} onChange={setEmail} type="email" disabled={loading} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Senha</label>
            <Input placeholder="••••••••" value={password} onChange={setPassword} type="password" disabled={loading} />
          </div>

          {mode === 'login' && (
            <div style={{ textAlign: 'right' }}>
              <button style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--t3)', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-sans)' }}>
                Esqueceu a senha?
              </button>
            </div>
          )}

          <Button variant="default" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Carregando...' : (mode === 'login' ? 'Entrar' : 'Criar conta')}
          </Button>

          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--t3)' }}>
            {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
            <button onClick={toggleMode} style={{ background: 'none', border: 'none', color: 'var(--main)', fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'var(--font-sans)', fontSize: 13 }}>
              {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
            </button>
          </div>

          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{ height: 1, background: 'var(--b2)', position: 'absolute', inset: '12px 0' }} />
            <span style={{ position: 'relative', background: 'var(--secondary-background)', padding: '0 8px', fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ou</span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { icon: 'ph-google-logo', label: 'Google', provider: 'google' },
              { icon: 'ph-apple-logo', label: 'Apple', provider: 'apple' },
            ].map(p => (
              <button
                key={p.label}
                onClick={async () => {
                  setLoading(true)
                  try {
                    if (p.provider === 'google') {
                      const { error } = await auth.signInWithGoogle()
                      if (error) throw error
                    } else if (p.provider === 'apple') {
                      const { error } = await auth.signInWithApple()
                      if (error) throw error
                    }
                  } catch (error) {
                    toast((error as Error).message || 'Erro na autenticação', 'error')
                    setLoading(false)
                  }
                }}
                disabled={loading}
                style={{
                  flex: 1, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: 'var(--secondary-background)', border: '2px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', boxShadow: '2px 2px 0 var(--border)',
                  cursor: loading ? 'not-allowed' : 'pointer', color: 'var(--t2)', fontSize: 13, fontFamily: 'var(--font-sans)',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <i className={`ph ${p.icon}`} style={{ fontSize: 16 }} />
                {p.label}
              </button>
            ))}
          </div>
        </form>

        {/* Skip link */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--t3)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Pular login e usar offline →
          </button>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={remove} />
    </div>
  )
}
