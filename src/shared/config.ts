export const isMac = (() => {
  if (typeof process !== 'undefined' && process.platform) return process.platform === 'darwin'
  return /Mac|iPhone|iPad/i.test(navigator.userAgent)
})()

/**
 * Global hotkey (Electron globalShortcut format)
 * Mac:     Cmd + Option + Shift + 1  (⌘⌥⇧1)
 * Win/Lin: Ctrl + Alt  + Shift + 1
 */
export const GLOBAL_HOTKEY = 'CommandOrControl+Alt+Shift+1'

/**
 * In-app keyboard shortcuts (displayed in UI)
 */
export const SHORTCUTS = {
  toggleMode: {
    display: isMac ? '⌘⌥⇧1' : 'Ctrl+Alt+Shift+1',
    electron: GLOBAL_HOTKEY
  },
  save: {
    display: isMac ? '⌘S' : 'Ctrl+S',
    key: 's',
    mod: true  // Ctrl or Cmd
  },
  open: {
    display: isMac ? '⌘O' : 'Ctrl+O',
    key: 'o',
    mod: true
  },
  delete: {
    display: 'Del',
    key: 'Delete',
    mod: false
  }
} as const
