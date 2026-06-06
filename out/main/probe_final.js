console.log('PROCESS TYPE:', process.type)
console.log('ELECTRON VER:', process.versions.electron)
console.log('NODE VER:', process.versions.node)

// Try require('electron') with a timeout (in case browser_init runs async)
setTimeout(() => {
  try {
    const e = require('electron')
    console.log('DELAYED electron type:', typeof e)
    console.log('DELAYED electron.app:', typeof e.app)
  } catch(err) {
    console.log('DELAYED error:', err.message)
  }
  process.exit(0)
}, 100)

