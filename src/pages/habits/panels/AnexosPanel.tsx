/**
 * AnexosPanel — Rootio · panels/AnexosPanel.tsx
 * ─────────────────────────────────────────────────────────────────
 * Área de anexos para tarefas e eventos.
 *
 * Funcionalidades:
 *   • Dropzone (drag-and-drop ou clique para selecionar)
 *   • Suporte a imagens, PDF, texto e documentos
 *   • Preview inline para imagens
 *   • Ícone por tipo de arquivo
 *   • Contagem no Pill ("3 arquivos")
 *   • Remoção individual
 *
 * Persistência:
 *   Arquivos são convertidos para base64 e salvos em
 *   habit.attachments[] via updateHabit().
 *   ⚠ Limite recomendado: 2MB por arquivo, 5 arquivos total.
 *   Para produção: migrar para Supabase Storage (@rootio-data v2).
 *
 * Schema novo no Habit:
 *   attachments?: Attachment[]
 *
 * Uso:
 *   <AnexosPanel habit={habit} onRefresh={onRefresh} />
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import type { Habit } from '../../../engine/habitDB'
import { updateHabit } from '../../../engine/habitDB'
import { Pill } from '../../../components/Pill'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Attachment {
  id:       string
  name:     string
  type:     string    // MIME type
  size:     number    // bytes
  data:     string    // base64
  addedAt:  string    // ISO
}

interface PanelProps {
  habit:     Habit
  isMobile?: boolean
  onRefresh: () => void
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_SIZE_MB = 2
const MAX_FILES   = 5
const ACCEPTED    = 'image/*,.pdf,.txt,.md,.doc,.docx,.xls,.xlsx,.csv'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function fileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼'
  if (type === 'application/pdf') return '📄'
  if (type.includes('spreadsheet') || type.includes('csv')) return '📊'
  if (type.includes('word') || type.includes('document')) return '📝'
  return '📎'
}

function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload  = () => res(reader.result as string)
    reader.onerror = rej
    reader.readAsDataURL(file)
  })
}

// ─── AttachmentItem ──────────────────────────────────────────────────────────

function AttachmentItem({
  att,
  onRemove,
}: {
  att:      Attachment
  onRemove: () => void
}) {
  const isImage = att.type.startsWith('image/')

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px',
      border: '1.5px solid var(--b2, #ccc)',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--bg2, #fff)',
    }}>
      {/* Preview or icon */}
      {isImage ? (
        <img
          src={att.data}
          alt={att.name}
          style={{
            width: 40, height: 40, objectFit: 'cover',
            borderRadius: 4, border: '1.5px solid var(--b2)',
            flexShrink: 0,
          }}
        />
      ) : (
        <div style={{
          width: 40, height: 40, flexShrink: 0,
          border: '1.5px solid var(--b2)', borderRadius: 4,
          background: 'var(--bg3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {fileIcon(att.type)}
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--t1)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {att.name}
        </div>
        <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>
          {formatSize(att.size)} · {new Date(att.addedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <a
          href={att.data}
          download={att.name}
          style={{
            width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid var(--b2)', borderRadius: 4,
            background: 'var(--bg3)', fontSize: 11, textDecoration: 'none', color: 'var(--t2)',
          }}
          title="Baixar"
        >
          ↓
        </a>
        <button
          onClick={onRemove}
          title="Remover"
          style={{
            width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid #fca5a5', borderRadius: 4,
            background: '#fef2f2', fontSize: 11, cursor: 'pointer', color: '#ef4444',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// ─── AnexosPanel ─────────────────────────────────────────────────────────────

export function AnexosPanel({ habit, onRefresh }: PanelProps) {
  const [open,        setOpen]        = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>(() =>
    (habit as any).attachments ?? []
  )
  const [dragging, setDragging] = useState(false)
  const [error,    setError]    = useState('')
  const [saving,   setSaving]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync from habit prop
  useEffect(() => {
    setAttachments((habit as any).attachments ?? [])
  }, [habit])

  const persist = useCallback(async (next: Attachment[]) => {
    setSaving(true)
    await updateHabit(habit.id, { ...(habit as any), attachments: next })
    setSaving(false)
    onRefresh()
  }, [habit, onRefresh])

  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError('')

    const current = attachments.length
    const remaining = MAX_FILES - current

    if (remaining <= 0) {
      setError(`Máximo de ${MAX_FILES} arquivos por hábito.`)
      return
    }

    const toAdd = Array.from(files).slice(0, remaining)
    const processed: Attachment[] = []

    for (const file of toAdd) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`"${file.name}" excede ${MAX_SIZE_MB}MB. Redimensione antes de anexar.`)
        continue
      }
      const data = await toBase64(file)
      processed.push({
        id:      crypto.randomUUID(),
        name:    file.name,
        type:    file.type,
        size:    file.size,
        data,
        addedAt: new Date().toISOString(),
      })
    }

    if (processed.length > 0) {
      const next = [...attachments, ...processed]
      setAttachments(next)
      await persist(next)
    }
  }, [attachments, persist])

  const handleRemove = useCallback(async (id: string) => {
    const next = attachments.filter(a => a.id !== id)
    setAttachments(next)
    await persist(next)
  }, [attachments, persist])

  // Drag handlers
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const count = attachments.length
  const pillLabel = count > 0 ? `Anexos · ${count}` : 'Anexos'

  return (
    <div>
      <Pill
        label={pillLabel}
        variant="task"
        size="sm"
        selected={open || count > 0}
        onClick={() => setOpen(o => !o)}
        id="pill-anexos"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        }
      />

      {open && (
        <div style={{
          marginTop: 12,
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          background: 'var(--bg2, #fff)',
          overflow: 'hidden',
          boxShadow: '4px 4px 0 var(--border)',
        }}>
          {/* ── Header ── */}
          <div style={{
            padding: '10px 14px',
            borderBottom: '2px solid var(--border)',
            background: 'var(--c-task, #6FB8FF)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>Anexos</span>
            {saving && <span style={{ fontSize: 10, color: 'var(--t2)' }}>salvando...</span>}
            <span style={{ fontSize: 11, color: 'var(--t2)', fontWeight: 600 }}>
              {count}/{MAX_FILES}
            </span>
          </div>

          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* ── Dropzone ── */}
            {count < MAX_FILES && (
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? 'var(--border)' : 'var(--b2, #ccc)'}`,
                  borderRadius: 'var(--radius-sm)',
                  background: dragging ? 'var(--bg3)' : 'transparent',
                  padding: '20px 14px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all .15s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ fontSize: 24 }}>📎</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>
                    {dragging ? 'Solte aqui' : 'Arraste ou clique para anexar'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>
                    Imagens, PDF, docs · máx. {MAX_SIZE_MB}MB por arquivo
                  </div>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED}
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => processFiles(e.target.files)}
                />
              </div>
            )}

            {/* ── Error ── */}
            {error && (
              <div style={{
                fontSize: 11, fontWeight: 600,
                color: '#c0392b', background: '#fde8e3',
                border: '1.5px solid #ef4444',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
              }}>
                ⚠ {error}
              </div>
            )}

            {/* ── File list ── */}
            {attachments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {attachments.map(att => (
                  <AttachmentItem
                    key={att.id}
                    att={att}
                    onRemove={() => handleRemove(att.id)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--t3)', fontStyle: 'italic', textAlign: 'center', padding: '4px 0' }}>
                Nenhum arquivo anexado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
