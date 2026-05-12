import { useState, useCallback } from 'react'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, variant: ToastVariant = 'default') => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, variant }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, toast, remove }
}