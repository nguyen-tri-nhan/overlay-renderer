# Circle Display

Overlay drawing tool — vẽ hình tròn, ellipse, và điểm lên màn hình trong khi vẫn dùng các app khác bình thường.

## Features

- Vẽ Circle, Ellipse, Dot trực tiếp lên màn hình
- Move và resize shape sau khi vẽ
- Chọn màu tùy ý
- Toggle giữa Edit và Display mode bằng hotkey
- Display mode: hình vẫn hiện, click xuyên qua được
- Save / Load file JSON

## Tech Stack

- [Electron 30](https://www.electronjs.org/) — desktop shell
- [electron-vite](https://electron-vite.org/) — build tooling
- [React 18](https://react.dev/) + TypeScript — renderer UI
- [electron-builder](https://www.electron.build/) — packaging

## Keyboard Shortcuts

| Action | Mac | Windows / Linux |
|---|---|---|
| Toggle Edit / Display | `⌘⌥⇧1` | `Ctrl+Alt+Shift+1` |
| Save | `⌘S` | `Ctrl+S` |
| Open | `⌘O` | `Ctrl+O` |
| Delete selected | `Del` | `Del` |

## Development

```bash
npm install
npm run dev
```

> **Note (macOS + VSCode):** VSCode sets `ELECTRON_RUN_AS_NODE=1` which breaks Electron's
> main process APIs. The `dev` script clears this automatically via `ELECTRON_RUN_AS_NODE=`.

## Build

```bash
# Build all platforms
npm run dist

# Build specific platform
npx electron-builder --win    # → .exe (NSIS installer)
npx electron-builder --mac    # → .dmg
npx electron-builder --linux  # → .AppImage
```

Output files are in `release/`.

## Project Structure

```
src/
├── main/         Electron main process (window, hotkey, IPC)
├── preload/      Context bridge (IPC API exposed to renderer)
├── renderer/     React app (Canvas, Toolbar, hooks)
└── shared/       Config shared between main and renderer
specs/            Requirements and use cases
```
