import { useState } from 'react'
import Hoje      from './pages/Hoje'
import Habitos   from './pages/Habitos'
import Financas  from './pages/Financas'
import Progresso from './pages/Progresso'
import Perfil    from './pages/Perfil'
import './styles/layout.css'

const PAGES = { hoje: Hoje, habitos: Habitos, financas: Financas, progresso: Progresso, perfil: Perfil }

export default function App() {
  const [page, setPage] = useState('hoje')
  const Page = PAGES[page] ?? Hoje

  return (
    <div className="app-shell">
      <Page onNavigate={setPage} />
    </div>
  )
}