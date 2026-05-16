import { useState, type ReactNode } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const WIDGET_HEIGHTS = {
  streak: 170,
  'io-hoje': 210,
  progresso: 230,
  habitos: 220,
  carteira: 310,
}

const STEP = 20
const MIN_H = 120
const MAX_H = 600

function clamp(v: number) { return Math.max(MIN_H, Math.min(MAX_H, v)) }

function SortableItem({
  id,
  children,
  height,
  editMode,
  onResize,
}: {
  id: string
  children: ReactNode
  height: number
  editMode: boolean
  onResize: (id: string, delta: number) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !editMode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        height,
        border: '3px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--secondary-background)',
        boxShadow: '6px 6px 0 var(--border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative',
        transition: 'height 0.15s',
      }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {children}
        </div>

        {editMode && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 10px',
            borderTop: '2px solid var(--border)',
            background: 'var(--bg3)',
          }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => onResize(id, -STEP)}
                disabled={height <= MIN_H}
                style={{
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg2)', cursor: 'pointer',
                  color: 'var(--t1)', fontSize: 16, opacity: height <= MIN_H ? 0.3 : 1,
                }}
              >
                <i className="ph ph-minus" />
              </button>
              <button
                onClick={() => onResize(id, STEP)}
                disabled={height >= MAX_H}
                style={{
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg2)', cursor: 'pointer',
                  color: 'var(--t1)', fontSize: 16, opacity: height >= MAX_H ? 0.3 : 1,
                }}
              >
                <i className="ph ph-plus" />
              </button>
            </div>

            <div
              {...attributes}
              {...listeners}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', cursor: 'grab',
                borderRadius: 'var(--radius-sm)',
                border: '2px solid var(--border)', background: 'var(--bg2)',
                color: 'var(--t3)', fontSize: 11, fontWeight: 500,
                userSelect: 'none',
                touchAction: 'none',
              }}
            >
              <i className="ph ph-dots-six-vertical" style={{ fontSize: 14 }} />
              Arrastar
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function MobileSortableWidgets({
  order,
  heights,
  editMode,
  widgets,
  onOrderChange,
  onHeightChange,
}: {
  order: string[]
  heights: Record<string, number>
  editMode: boolean
  widgets: Record<string, ReactNode>
  onOrderChange: (order: string[]) => void
  onHeightChange: (id: string, height: number) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = order.indexOf(active.id as string)
      const newIndex = order.indexOf(over.id as string)
      onOrderChange(arrayMove(order, oldIndex, newIndex))
    }
  }

  const handleResize = (id: string, delta: number) => {
    const current = heights[id] ?? WIDGET_HEIGHTS[id as keyof typeof WIDGET_HEIGHTS] ?? 200
    onHeightChange(id, clamp(current + delta))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {order.map(key => (
            <SortableItem
              key={key}
              id={key}
              editMode={editMode}
              height={heights[key] ?? WIDGET_HEIGHTS[key as keyof typeof WIDGET_HEIGHTS] ?? 200}
              onResize={handleResize}
            >
              {widgets[key]}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
