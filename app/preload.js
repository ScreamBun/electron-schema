const { remote } = require('electron')
// set global objects on window
window.electron_store = remote.getGlobal('store')

window.onload = () => {
  console.log(`load env: ${process.env.NODE_ENV}`)
  const head = []
  const scripts = []

  if (!process.env.HOT) {
    console.log('cold')
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = './dist/css/styles.css'
    head.push(link)
  }

  // Dynamically insert the DLL script in development env in the renderer process
  if (process.env.NODE_ENV === 'development') {
    const script = document.createElement('script')
    script.src = '../dll/renderer.dev.dll.js'
    scripts.push(script)
  }

  // Dynamically insert the bundled app script in the renderer process
  const port = process.env.PORT || 1212
  if (process.env.HOT) {
    const script = document.createElement('script')
    script.src = 'http://localhost:' + port + '/dist/renderer.dev.js'
    scripts.push(script)
  } else {
    const script = document.createElement('script')
    script.src = './dist/renderer.prod.js'
    scripts.push(script)
  }

  head.map(tag => document.getElementsByTagName('head')[0].appendChild(tag))
  scripts.map(script => document.getElementsByTagName('body')[0].appendChild(script))
}