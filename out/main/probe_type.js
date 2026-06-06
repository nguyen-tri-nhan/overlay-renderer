const desc = Object.getOwnPropertyDescriptor(process, 'type')
console.log('process.type descriptor:', JSON.stringify(desc, null, 2))
console.log('process.type value:', process.type)

// Check if there are any setup callbacks pending
process.nextTick(() => {
  console.log('nextTick - process.type:', process.type)
})
setImmediate(() => {
  console.log('setImmediate - process.type:', process.type)
  
  // Check electron module loading in setImmediate
  const e = require('electron')
  console.log('electron in setImmediate:', typeof e)
  
  process.exit(0)
})
