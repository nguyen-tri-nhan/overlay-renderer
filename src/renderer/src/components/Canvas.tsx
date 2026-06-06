import { useRef, useState, useCallback, useEffect } from 'react'
import { Shape, Tool, Point, CircleShape, EllipseShape, DotShape } from '../types'

interface Props {
  shapes: Shape[]
  tool: Tool
  color: string
  selectedId: string | null
  onAddShape: (shape: Shape) => void
  onSelectShape: (id: string | null) => void
  onUpdateShape: (id: string, updates: Partial<Shape>) => void
  isEditMode: boolean
}

type HandleType = 'resize-r' | 'resize-rx' | 'resize-ry'
interface Handle { pos: Point; type: HandleType }

type DragAction =
  | { type: 'move'; shapeId: string; startPos: Point; orig: Shape }
  | { type: HandleType; shapeId: string; startPos: Point; orig: Shape }

const HANDLE_RADIUS = 6
const HANDLE_HIT = 10

function nanoid() {
  return Math.random().toString(36).slice(2, 10)
}

function getHandles(shape: Shape): Handle[] {
  switch (shape.type) {
    case 'circle':
      return [{ pos: { x: shape.cx + shape.r, y: shape.cy }, type: 'resize-r' }]
    case 'ellipse':
      return [
        { pos: { x: shape.cx + shape.rx, y: shape.cy }, type: 'resize-rx' },
        { pos: { x: shape.cx, y: shape.cy + shape.ry }, type: 'resize-ry' }
      ]
    case 'dot':
      return []
  }
}

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape, selected: boolean) {
  ctx.save()
  ctx.strokeStyle = shape.color
  ctx.fillStyle = shape.color
  ctx.lineWidth = selected ? 3 : 2
  if (selected) ctx.setLineDash([6, 3])

  switch (shape.type) {
    case 'circle':
      ctx.beginPath()
      ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2)
      ctx.stroke()
      break
    case 'ellipse':
      ctx.beginPath()
      ctx.ellipse(shape.cx, shape.cy, shape.rx, shape.ry, 0, 0, Math.PI * 2)
      ctx.stroke()
      break
    case 'dot':
      ctx.beginPath()
      ctx.arc(shape.x, shape.y, 4, 0, Math.PI * 2)
      ctx.fill()
      break
  }
  ctx.restore()
}

function drawHandles(ctx: CanvasRenderingContext2D, shape: Shape) {
  for (const h of getHandles(shape)) {
    ctx.beginPath()
    ctx.arc(h.pos.x, h.pos.y, HANDLE_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = 'white'
    ctx.strokeStyle = '#6366f1'
    ctx.lineWidth = 2
    ctx.setLineDash([])
    ctx.fill()
    ctx.stroke()
  }
}

function hitTestShape(shape: Shape, x: number, y: number): boolean {
  const T = 8
  switch (shape.type) {
    case 'circle': {
      const dist = Math.hypot(x - shape.cx, y - shape.cy)
      return Math.abs(dist - shape.r) < T
    }
    case 'ellipse': {
      const nx = (x - shape.cx) / shape.rx
      const ny = (y - shape.cy) / shape.ry
      return Math.abs(Math.sqrt(nx * nx + ny * ny) - 1) < T / Math.min(shape.rx, shape.ry)
    }
    case 'dot':
      return Math.hypot(x - shape.x, y - shape.y) < T
  }
}

function applyDrag(drag: DragAction, pos: Point): Partial<Shape> {
  const dx = pos.x - drag.startPos.x
  const dy = pos.y - drag.startPos.y
  const orig = drag.orig

  if (drag.type === 'move') {
    if (orig.type === 'circle') return { cx: (orig as CircleShape).cx + dx, cy: (orig as CircleShape).cy + dy }
    if (orig.type === 'ellipse') return { cx: (orig as EllipseShape).cx + dx, cy: (orig as EllipseShape).cy + dy }
    if (orig.type === 'dot') return { x: (orig as DotShape).x + dx, y: (orig as DotShape).y + dy }
  }
  if (drag.type === 'resize-r' && orig.type === 'circle') {
    return { r: Math.max(5, Math.hypot(pos.x - orig.cx, pos.y - orig.cy)) }
  }
  if (drag.type === 'resize-rx' && orig.type === 'ellipse') {
    return { rx: Math.max(5, Math.abs(pos.x - (orig as EllipseShape).cx)) }
  }
  if (drag.type === 'resize-ry' && orig.type === 'ellipse') {
    return { ry: Math.max(5, Math.abs(pos.y - (orig as EllipseShape).cy)) }
  }
  return {}
}

export function Canvas({ shapes, tool, color, selectedId, onAddShape, onSelectShape, onUpdateShape, isEditMode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawStart, setDrawStart] = useState<Point | null>(null)
  const [preview, setPreview] = useState<Shape | null>(null)
  const [dragAction, setDragAction] = useState<DragAction | null>(null)
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })

  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const shape of shapes) {
      const selected = shape.id === selectedId
      drawShape(ctx, shape, selected)
      if (selected) drawHandles(ctx, shape)
    }
    if (preview) {
      ctx.globalAlpha = 0.5
      drawShape(ctx, preview, false)
      ctx.globalAlpha = 1
    }
  }, [shapes, preview, selectedId])

  const getPos = (e: React.MouseEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isEditMode) return
      const pos = getPos(e)

      // --- Select / Move / Resize ---
      if (tool === 'select' || selectedId) {
        // 1. Check resize handles on selected shape
        if (selectedId) {
          const sel = shapes.find((s) => s.id === selectedId)
          if (sel) {
            for (const h of getHandles(sel)) {
              if (Math.hypot(pos.x - h.pos.x, pos.y - h.pos.y) < HANDLE_HIT) {
                setDragAction({ type: h.type, shapeId: selectedId, startPos: pos, orig: sel })
                return
              }
            }
          }
        }

        // 2. Check hit on any shape → move
        for (let i = shapes.length - 1; i >= 0; i--) {
          if (hitTestShape(shapes[i], pos.x, pos.y)) {
            onSelectShape(shapes[i].id)
            setDragAction({ type: 'move', shapeId: shapes[i].id, startPos: pos, orig: shapes[i] })
            return
          }
        }

        // 3. Click empty → deselect
        onSelectShape(null)
        if (tool === 'select') return
      }

      // --- Draw ---
      if (tool === 'dot') {
        const dot: DotShape = { id: nanoid(), type: 'dot', x: pos.x, y: pos.y, color }
        onAddShape(dot)
        return
      }
      setDrawStart(pos)
    },
    [isEditMode, tool, color, shapes, selectedId, onAddShape, onSelectShape]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = getPos(e)

      if (dragAction) {
        onUpdateShape(dragAction.shapeId, applyDrag(dragAction, pos))
        return
      }

      if (!drawStart) return
      const dx = pos.x - drawStart.x
      const dy = pos.y - drawStart.y

      if (tool === 'circle') {
        setPreview({ id: 'preview', type: 'circle', cx: drawStart.x, cy: drawStart.y, r: Math.hypot(dx, dy), color })
      } else if (tool === 'ellipse') {
        setPreview({
          id: 'preview',
          type: 'ellipse',
          cx: drawStart.x + dx / 2,
          cy: drawStart.y + dy / 2,
          rx: Math.abs(dx) / 2,
          ry: Math.abs(dy) / 2,
          color
        })
      }
    },
    [dragAction, drawStart, tool, color, onUpdateShape]
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (dragAction) {
        setDragAction(null)
        return
      }

      if (!drawStart) return
      const pos = getPos(e)
      const dx = pos.x - drawStart.x
      const dy = pos.y - drawStart.y

      if (tool === 'circle') {
        const r = Math.hypot(dx, dy)
        if (r > 3) onAddShape({ id: nanoid(), type: 'circle', cx: drawStart.x, cy: drawStart.y, r, color })
      } else if (tool === 'ellipse') {
        const rx = Math.abs(dx) / 2
        const ry = Math.abs(dy) / 2
        if (rx > 3 && ry > 3) {
          onAddShape({
            id: nanoid(),
            type: 'ellipse',
            cx: drawStart.x + dx / 2,
            cy: drawStart.y + dy / 2,
            rx,
            ry,
            color
          })
        }
      }

      setDrawStart(null)
      setPreview(null)
    },
    [dragAction, drawStart, tool, color, onAddShape]
  )

  const cursor = (() => {
    if (!isEditMode) return 'none'
    if (dragAction?.type === 'move') return 'grabbing'
    if (dragAction) return 'nwse-resize'
    if (tool === 'select') return 'default'
    return 'crosshair'
  })()

  return (
    <canvas
      ref={canvasRef}
      width={size.w}
      height={size.h}
      style={{ position: 'fixed', top: 0, left: 0, pointerEvents: isEditMode ? 'auto' : 'none', cursor }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  )
}
