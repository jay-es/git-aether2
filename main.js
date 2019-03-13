const carlo = require('carlo')
const path = require('path')

;(async () => {
  const isDev = process.argv.includes('dev')

  // Chrome起動オプション
  const chromeOptions = []
  if (isDev) {
    const vueDevtoolsPath = require('./carlo/vueDevtoolsPath')
    chromeOptions.push(
      '--allow-insecure-localhost',
      '--auto-open-devtools-for-tabs',
      `--disable-extensions-except=${vueDevtoolsPath}`
    )
  }

  // Launch the browser.
  const app = await carlo.launch({ args: chromeOptions })

  // Terminate Node.js process on app window closing.
  app.on('exit', () => process.exit())
  app.mainWindow().on('close', () => process.exit())

  // Tell carlo where your web files are located.
  if (isDev) {
    app.serveOrigin('https://localhost:8080')
  } else {
    app.serveFolder(path.resolve(__dirname, 'dist'))
  }

  await app.exposeFunction('exec', require('./carlo/exec'))
  await app.exposeFunction('git', require('./carlo/git'))

  // Navigate to the main page of your app.
  await app.load('index.html')
})()
