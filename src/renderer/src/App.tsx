import { useState, useEffect, useCallback } from 'react'
import { Canvas } from './components/Canvas'
import { Toolbar } from './components/Toolbar'
import { useShapes } from './hooks/useShapes'
import { Mode, Tool, Shape } from './types'

declare global {
  interface Window {
    api: {
      onModeChanged: (cb: (mode: 'edit' | 'display') => void) => () => void
      saveFile: (json: string) => Promise<{ success: boolean; filePath?: string }>
      openFile: () => Promise<{ success: boolean; data?: string }>
    }
  }
}

export default function App() {
  const [mode, setMode] = useState<Mode>('display')
  const [tool, setTool] = useState<Tool>('circle')
  const [color, setColor] = useState('#ff0000')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { shapes, addShape, deleteShape, clearAll, loadShapes } = useShapes()

  useEffect(() => {
    const cleanup = window.api.onModeChanged((m) => {
      setMode(m)
      if (m === 'display') setSelectedId(null)
    })
    return cleanup
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (mode !== 'edit') return
      if (e.key === 'Delete' && selectedId) {
        deleteShape(selectedId)
        setSelectedId(null)
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault()
        handleLoad()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mode, selectedId, shapes])

  const handleSave = useCallback(async () => {
    await window.api.saveFile(JSON.stringify(shapes, null, 2))
  }, [shapes])

  const handleLoad = useCallback(async () => {
    const result = await window.api.openFile()
    if (result.success && result.data) {
      try {
        const loaded = JSON.parse(result.data) as Shape[]
        loadShapes(loaded)
      } catch {
        // invalid file
      }
    }
  }, [loadShapes])

  const handleClearAll = useCallback(() => {
    if (shapes.length === 0) return
    if (window.confirm('Xóa tất cả hình?')) {
      clearAll()
      setSelectedId(null)
    }
  }, [shapes, clearAll])

  return (
    <>
      <Canvas
        shapes={shapes}
        tool={tool}
        color={color}
        selectedId={selectedId}
        onAddShape={addShape}
        onSelectShape={setSelectedId}
        isEditMode={mode === 'edit'}
      />
      <Toolbar
        mode={mode}
        tool={tool}
        color={color}
        selectedId={selectedId}
        onToolChange={setTool}
        onColorChange={setColor}
        onDeleteSelected={() => {
          if (selectedId) {
            deleteShape(selectedId)
            setSelectedId(null)
          }
        }}
        onClearAll={handleClearAll}
        onSave={handleSave}
        onLoad={handleLoad}
      />
    </>
  )
}
