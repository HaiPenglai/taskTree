// main.js
const { app, BrowserWindow } = require('electron')
const path = require('path')

process.env.IS_PACKAGED = app.isPackaged ? 'true' : 'false';
function getAPIPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'server', 'taskTreeAPI')
  } else {
    return path.join(__dirname, 'server', 'taskTreeAPI')
  }
}

require(getAPIPath())

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'public', 'favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  win.loadFile(path.join(__dirname, 'dist-vue', 'index.html'))
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})