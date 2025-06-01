const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  fileSystem: {
    ensureDir: (path) => ipcRenderer.invoke("fs:ensureDir", path),
    writeFile: (path, data) => ipcRenderer.invoke("fs:writeFile", path, data),
    readFile: (path) => ipcRenderer.invoke("fs:readFile", path),
    deleteFile: (path) => ipcRenderer.invoke("fs:deleteFile", path),
    deleteDir: (path) => ipcRenderer.invoke("fs:deleteDir", path),
    listDir: (path) => ipcRenderer.invoke("fs:listDir", path),
    exists: (path) => ipcRenderer.invoke("fs:exists", path),
    getHomePath: () => ipcRenderer.invoke("fs:getHomePath"),
    joinPath: (...paths) => ipcRenderer.invoke("fs:joinPath", ...paths),
  },
})
