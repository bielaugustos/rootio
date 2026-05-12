import { useState, useEffect, useCallback } from 'react'
import type { Transaction } from '../../../engine/walletDB'
import { getTransactions, addTransaction, deleteTransaction } from '../../../engine/walletDB'

const TXS_CHANGED = 'transactions-changed'
const emit = () => window.dispatchEvent(new CustomEvent(TXS_CHANGED))

export function useTransactions() {
  const [txs, setTxs] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await getTransactions()
    setTxs(data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    getTransactions().then(data => {
      setTxs(data)
      setIsLoading(false)
    })
    window.addEventListener(TXS_CHANGED, refresh)
    return () => window.removeEventListener(TXS_CHANGED, refresh)
  }, [refresh])

  const add = useCallback(async (tx: { type: string; amount: number; description: string; category: string; date: string }) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await addTransaction(tx as any)
      emit()
    } catch (err) {
      console.error('Error adding transaction:', err)
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteTransaction(id)
    emit()
  }, [])

  return { txs, isLoading, refresh, add, remove }
}