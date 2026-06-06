import { useState, useCallback } from 'react'
import { Shape } from '../types'

export function useShapes() {
  const [shapes, setShapes] = useState<Shape[]>([])

  const addShape = useCallback((shape: Shape) => {
    setShapes((prev) => [...prev, shape])
  }, [])

  const deleteShape = useCallback((id: string) => {
    setShapes((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setShapes([])
  }, [])

  const updateShape = useCallback((id: string, updates: Partial<Shape>) => {
    setShapes((prev) => prev.map((s) => (s.id === id ? ({ ...s, ...updates } as Shape) : s)))
  }, [])

  const loadShapes = useCallback((newShapes: Shape[]) => {
    setShapes(newShapes)
  }, [])

  return { shapes, addShape, deleteShape, updateShape, clearAll, loadShapes }
}
