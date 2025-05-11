// main.js
const { app, BrowserWindow } = require('electron')
const path = require('path')

require("./server/taskTreeAPI.js")

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'public', 'favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: true,
    menuBarVisible: false
  })

  win.setMenu(null)

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:8080')
  } else {
    win.loadFile(path.join(__dirname, 'dist-vue', 'index.html'))
  }
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