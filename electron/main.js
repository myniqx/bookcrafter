const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs").promises
const os = require("os")

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../public/icon.png"),
    titleBarStyle: "default",
    show: false,
  })

  const isDev = process.env.NODE_ENV === "development"

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000")
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"))
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
  })

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// File system IPC handlers
ipcMain.handle("fs:ensureDir", async (event, dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true })
    return true
  } catch (error) {
    console.error("Error creating directory:", error)
    return false
  }
})

ipcMain.handle("fs:writeFile", async (event, filePath, data) => {
  try {
    await fs.writeFile(filePath, data, "utf8")
    return true
  } catch (error) {
    console.error("Error writing file:", error)
    return false
  }
})

ipcMain.handle("fs:readFile", async (event, filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8")
    return data
  } catch (error) {
    console.error("Error reading file:", error)
    return null
  }
})

ipcMain.handle("fs:deleteFile", async (event, filePath) => {
  try {
    await fs.unlink(filePath)
    return true
  } catch (error) {
    console.error("Error deleting file:", error)
    return false
  }
})

ipcMain.handle("fs:deleteDir", async (event, dirPath) => {
  try {
    await fs.rmdir(dirPath, { recursive: true })
    return true
  } catch (error) {
    console.error("Error deleting directory:", error)
    return false
  }
})

ipcMain.handle("fs:listDir", async (event, dirPath) => {
  try {
    const items = await fs.readdir(dirPath)
    return items
  } catch (error) {
    console.error("Error listing directory:", error)
    return []
  }
})

ipcMain.handle("fs:exists", async (event, filePath) => {
  try {
    await fs.access(filePath)
    return true
  } catch (error) {
    return false
  }
})

ipcMain.handle("fs:getHomePath", async () => {
  return os.homedir()
})

ipcMain.handle("fs:joinPath", async (event, ...paths) => {
  return path.join(...paths)
})
