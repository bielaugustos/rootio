import { getHabitDB } from './habitDB'

// ── Separação clara ───────────────────────────────────────────────────────────
//
//  IO  = moeda gastável
//       · Sobe quando hábitos são concluídos (pts do histórico)
//       · Pode diminuir quando o usuário gastar no shop (futuro)
//       · Representa "o que você tem disponível"
//
//  XP  = experiência permanente
//       · Sobe quando hábitos são concluídos (mesmo valor que IO)
//       · NUNCA diminui — não é afetado por gastos no shop
//       · Define o nível do usuário
//
// Na fase atual ambos crescem juntos. A diferença aparece quando o shop
// for implementado: gastar IO não afeta XP nem o nível.
//
// ─────────────────────────────────────────────────────────────────────────────

const LOCAL_USER = 'local-user'

// ── Thresholds de nível (XP necessário para cada nível) ──────────────────────
//
// Fórmula: cada nível exige 20% mais XP que o anterior.
// Nível 1 começa em 0 XP.
// Nível 2 começa em 100 XP.
// Nível 3 começa em 220 XP. etc.
//
const BASE_XP = 100
const GROWTH  = 1.2 // 20% a mais por nível

export function xpParaNivel(nivel: number): number {
  if (nivel <= 1) return 0
  let total = 0
  for (let i = 2; i <= nivel; i++) {
    total += Math.round(BASE_XP * Math.pow(GROWTH, i - 2))
  }
  return total
}

export interface EconomyData {
  xp_total: number       // XP permanente acumulado
  io_ganho: number       // IO total ganho (histórico)
  io_gasto: number       // IO gasto no shop (futuro)
  io_saldo: number       // io_ganho - io_gasto
  nivel: number          // nível atual (derivado do XP)
  xp_nivel_atual: number // XP no início do nível atual
  xp_proximo_nivel: number // XP necessário para o próximo nível
  progresso_nivel: number  // 0–100% de progresso no nível atual
}

// ── Calcula economia a partir do habit_history ────────────────────────────────

export async function getEconomy(): Promise<EconomyData> {
  const db = await getHabitDB()
  const allHistory = await db.getAllFromIndex('habit_history', 'by-user', LOCAL_USER)

  // Soma todos os pts de hábitos concluídos no histórico
  let totalPts = 0
  for (const entry of allHistory) {
    for (const h of Object.values(entry.habits)) {
      if (h.done) totalPts += h.pts
    }
  }

  // Includes bonus XP from rewards/challenges
  const bonusStored = localStorage.getItem('io_bonus')
  const bonus = bonusStored ? JSON.parse(bonusStored).xp_bonus ?? 0 : 0
  totalPts += bonus

  // XP = total de pts ganhos (nunca diminui)
  const xp_total = totalPts

  // IO gasto
  const spentStored = localStorage.getItem('io_spent')
  const io_gasto = spentStored ? JSON.parse(spentStored).io_spent ?? 0 : 0

  // IO saldo = pts ganhos - gastos
  const io_ganho = xp_total
  const io_saldo = io_ganho - io_gasto

  // Calcula nível a partir do XP
  let nivel = 1
  while (xpParaNivel(nivel + 1) <= xp_total) {
    nivel++
  }

  const xp_nivel_atual    = xpParaNivel(nivel)
  const xp_proximo_nivel  = xpParaNivel(nivel + 1)
  const xp_no_nivel       = xp_total - xp_nivel_atual
  const xp_necessario     = xp_proximo_nivel - xp_nivel_atual
  const progresso_nivel   = Math.min(100, Math.round((xp_no_nivel / xp_necessario) * 100))

  return {
    xp_total,
    io_ganho,
    io_gasto,
    io_saldo,
    nivel,
    xp_nivel_atual,
    xp_proximo_nivel,
    progresso_nivel,
  }
}

// Rótulo do nível baseado em thresholds
export function labelNivel(nivel: number): string {
  if (nivel >= 50) return 'Lendário'
  if (nivel >= 30) return 'Mestre'
  if (nivel >= 20) return 'Experiente'
  if (nivel >= 10) return 'Avançado'
  if (nivel >= 5)  return 'Regular'
  if (nivel >= 2)  return 'Iniciante'
  return 'Novato'
}

export async function addIO(pts: number): Promise<void> {
  const stored = localStorage.getItem('io_bonus')
  const bonus = stored ? JSON.parse(stored) : { xp_bonus: 0 }
  bonus.xp_bonus = (bonus.xp_bonus || 0) + pts
  localStorage.setItem('io_bonus', JSON.stringify(bonus))
}

export async function removeIO(pts: number): Promise<void> {
  const stored = localStorage.getItem('io_bonus')
  const bonus = stored ? JSON.parse(stored) : { xp_bonus: 0 }
  bonus.xp_bonus = Math.max(0, (bonus.xp_bonus || 0) - pts)
  localStorage.setItem('io_bonus', JSON.stringify(bonus))
}

export async function spendIO(pts: number): Promise<void> {
  const stored = localStorage.getItem('io_spent')
  const spent = stored ? JSON.parse(stored).io_spent ?? 0 : 0
  const newSpent = spent + pts
  localStorage.setItem('io_spent', JSON.stringify({ io_spent: newSpent }))
}
