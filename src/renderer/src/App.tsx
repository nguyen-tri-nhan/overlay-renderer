import { useState, useEffect, useCallback } from 'react'
import { Canvas } from './components/Canvas'
import { Toolbar } from './components/Toolbar'
import { useShapes } from './hooks/useShapes'
import { Mode, Tool, Shape } from './types'
import { SHORTCUTS } from '@shared/config'

declare global {
  interface Window {
    api: {
      quit: () => void
      onModeChanged: (cb: (mode: 'edit' | 'display') => void) => () => void
      saveFile: (json: string) => Promise<{ success: boolean; filePath?: string }>
      openFile: () => Promise<{ success: boolean; data?: string }>
    }
  }
}

export default function App() {
  const [mode, setMode] = useState<Mode>('edit')
  const [tool, setTool] = useState<Tool>('select')
  const [color, setColor] = useState('#ff0000')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { shapes, addShape, deleteShape, updateShape, clearAll, loadShapes } = useShapes()

  useEffect(() => {
    if (!window.api) return
    const cleanup = window.api.onModeChanged((m) => {
      setMode(m)
      if (m === 'display') setSelectedId(null)
    })
    return cleanup
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const mod = (e: KeyboardEvent) => e.ctrlKey || e.metaKey
    const handler = (e: KeyboardEvent) => {
      if (mode !== 'edit') return
      if (e.key === SHORTCUTS.delete.key && selectedId) {
        deleteShape(selectedId)
        setSelectedId(null)
      }
      if (mod(e) && e.key === SHORTCUTS.save.key) {
        e.preventDefault()
        handleSave()
      }
      if (mod(e) && e.key === SHORTCUTS.open.key) {
        e.preventDefault()
        handleLoad()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mode, selectedId, shapes])

  const handleSave = useCallback(async () => {
    if (!window.api) return
    await window.api.saveFile(JSON.stringify(shapes, null, 2))
  }, [shapes])

  const handleLoad = useCallback(async () => {
    if (!window.api) return
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
        onUpdateShape={updateShape}
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
        onQuit={() => window.api?.quit()}
      />
    </>
  )
}
