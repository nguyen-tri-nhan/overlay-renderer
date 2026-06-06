import { useRef, useState, useCallback, useEffect } from 'react'
import { Shape, Tool, Point, CircleShape, EllipseShape, DotShape } from '../types'

interface Props {
  shapes: Shape[]
  tool: Tool
  color: string
  selectedId: string | null
  onAddShape: (shape: Shape) => void
  onSelectShape: (id: string | null) => void
  isEditMode: boolean
}

function nanoid() {
  return Math.random().toString(36).slice(2, 10)
}

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape, selected: boolean) {
  ctx.save()
  ctx.strokeStyle = shape.color
  ctx.fillStyle = shape.color
  ctx.lineWidth = selected ? 3 : 2

  if (selected) {
    ctx.setLineDash([6, 3])
  }

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

function hitTest(shape: Shape, x: number, y: number): boolean {
  const THRESHOLD = 8
  switch (shape.type) {
    case 'circle': {
      const dist = Math.hypot(x - shape.cx, y - shape.cy)
      return Math.abs(dist - shape.r) < THRESHOLD
    }
    case 'ellipse': {
      const nx = (x - shape.cx) / shape.rx
      const ny = (y - shape.cy) / shape.ry
      const val = Math.sqrt(nx * nx + ny * ny)
      return Math.abs(val - 1) < THRESHOLD / Math.min(shape.rx, shape.ry)
    }
    case 'dot':
      return Math.hypot(x - shape.x, y - shape.y) < THRESHOLD
  }
}

export function Canvas({ shapes, tool, color, selectedId, onAddShape, onSelectShape, isEditMode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dragStart, setDragStart] = useState<Point | null>(null)
  const [preview, setPreview] = useState<Shape | null>(null)

  const getPos = (e: React.MouseEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  // Redraw whenever shapes, preview or selection changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const shape of shapes) {
      drawShape(ctx, shape, shape.id === selectedId)
    }
    if (preview) {
      ctx.globalAlpha = 0.5
      drawShape(ctx, preview, false)
      ctx.globalAlpha = 1
    }
  }, [shapes, preview, selectedId])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isEditMode) return
      const pos = getPos(e)

      if (tool === 'dot') {
        const dot: DotShape = { id: nanoid(), type: 'dot', x: pos.x, y: pos.y, color }
        onAddShape(dot)
        return
      }

      // Try selecting existing shape
      for (let i = shapes.length - 1; i >= 0; i--) {
        if (hitTest(shapes[i], pos.x, pos.y)) {
          onSelectShape(shapes[i].id)
          return
        }
      }

      onSelectShape(null)
      setDragStart(pos)
    },
    [isEditMode, tool, color, shapes, onAddShape, onSelectShape]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragStart) return
      const pos = getPos(e)
      const dx = pos.x - dragStart.x
      const dy = pos.y - dragStart.y

      if (tool === 'circle') {
        const r = Math.hypot(dx, dy)
        setPreview({ id: 'preview', type: 'circle', cx: dragStart.x, cy: dragStart.y, r, color })
      } else if (tool === 'ellipse') {
        setPreview({
          id: 'preview',
          type: 'ellipse',
          cx: dragStart.x + dx / 2,
          cy: dragStart.y + dy / 2,
          rx: Math.abs(dx) / 2,
          ry: Math.abs(dy) / 2,
          color
        })
      }
    },
    [dragStart, tool, color]
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!dragStart) return
      const pos = getPos(e)
      const dx = pos.x - dragStart.x
      const dy = pos.y - dragStart.y

      if (tool === 'circle') {
        const r = Math.hypot(dx, dy)
        if (r > 3) {
          onAddShape({ id: nanoid(), type: 'circle', cx: dragStart.x, cy: dragStart.y, r, color })
        }
      } else if (tool === 'ellipse') {
        const rx = Math.abs(dx) / 2
        const ry = Math.abs(dy) / 2
        if (rx > 3 && ry > 3) {
          onAddShape({
            id: nanoid(),
            type: 'ellipse',
            cx: dragStart.x + dx / 2,
            cy: dragStart.y + dy / 2,
            rx,
            ry,
            color
          })
        }
      }

      setDragStart(null)
      setPreview(null)
    },
    [dragStart, tool, color, onAddShape]
  )

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: isEditMode ? 'auto' : 'none',
        cursor: isEditMode ? (tool === 'dot' ? 'crosshair' : 'crosshair') : 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  )
}
