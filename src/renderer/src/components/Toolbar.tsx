import { Tool, Mode } from '../types'

interface Props {
  mode: Mode
  tool: Tool
  color: string
  selectedId: string | null
  onToolChange: (t: Tool) => void
  onColorChange: (c: string) => void
  onDeleteSelected: () => void
  onClearAll: () => void
  onSave: () => void
  onLoad: () => void
}

const TOOLS: { value: Tool; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'ellipse', label: 'Ellipse' },
  { value: 'dot', label: 'Dot' }
]

const PRESET_COLORS = ['#ff0000', '#00ff00', '#0088ff', '#ffff00', '#ff00ff', '#ffffff', '#000000']

export function Toolbar({
  mode,
  tool,
  color,
  selectedId,
  onToolChange,
  onColorChange,
  onDeleteSelected,
  onClearAll,
  onSave,
  onLoad
}: Props) {
  if (mode === 'display') return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(20, 20, 20, 0.92)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: '8px 16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        userSelect: 'none',
        zIndex: 9999,
        WebkitAppRegion: 'drag' as never
      }}
    >
      {/* Mode indicator */}
      <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 600, marginRight: 4 }}>EDIT</span>

      <Divider />

      {/* Tools */}
      {TOOLS.map((t) => (
        <ToolBtn key={t.value} active={tool === t.value} onClick={() => onToolChange(t.value)}>
          {t.label}
        </ToolBtn>
      ))}

      <Divider />

      {/* Color presets */}
      {PRESET_COLORS.map((c) => (
        <ColorSwatch key={c} c={c} selected={color === c} onClick={() => onColorChange(c)} />
      ))}
      <input
        type="color"
        value={color}
        onChange={(e) => onColorChange(e.target.value)}
        title="Custom color"
        style={{
          width: 24,
          height: 24,
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          background: 'none',
          padding: 0,
          WebkitAppRegion: 'no-drag' as never
        }}
      />

      <Divider />

      {/* Actions */}
      <ActionBtn onClick={onDeleteSelected} disabled={!selectedId} title="Delete selected (Del)">
        Del
      </ActionBtn>
      <ActionBtn onClick={onClearAll} title="Clear all">
        Clear
      </ActionBtn>

      <Divider />

      <ActionBtn onClick={onSave} title="Save (Ctrl+S)">
        Save
      </ActionBtn>
      <ActionBtn onClick={onLoad} title="Open (Ctrl+O)">
        Open
      </ActionBtn>

      <Divider />

      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Ctrl+Alt+Shift+1 to hide</span>
    </div>
  )
}

function Divider() {
  return <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />
}

function ToolBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(99,102,241,0.8)' : 'rgba(255,255,255,0.08)',
        border: active ? '1px solid rgba(99,102,241,1)' : '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6,
        color: 'white',
        fontSize: 12,
        padding: '4px 10px',
        cursor: 'pointer',
        WebkitAppRegion: 'no-drag' as never
      }}
    >
      {children}
    </button>
  )
}

function ColorSwatch({ c, selected, onClick }: { c: string; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: c,
        border: selected ? '2px solid white' : '2px solid rgba(255,255,255,0.2)',
        cursor: 'pointer',
        flexShrink: 0,
        WebkitAppRegion: 'no-drag' as never
      }}
    />
  )
}

function ActionBtn({
  onClick,
  disabled,
  title,
  children
}: {
  onClick: () => void
  disabled?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6,
        color: disabled ? 'rgba(255,255,255,0.3)' : 'white',
        fontSize: 12,
        padding: '4px 10px',
        cursor: disabled ? 'default' : 'pointer',
        WebkitAppRegion: 'no-drag' as never
      }}
    >
      {children}
    </button>
  )
}
