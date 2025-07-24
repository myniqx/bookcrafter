import { contextBridge, ipcRenderer } from 'electron';
import path from 'path'; // path modülünü preload'da kullanmak istiyorsanız import edin
import os from 'os';   // os modülünü preload'da kullanmak istiyorsanız import edin
// process global bir objedir, import etmeye gerek yok

// Renderer'a güvenli bir API açığa çıkarma
contextBridge.exposeInMainWorld('electronAPI', {
  // Ortam değişkenlerine güvenli erişim
  // Sadece renderer'ın ihtiyaç duyduğu bilgileri açığa çıkarın
  env: {
    isDev: process.env.NODE_ENV === 'development',
    NODE_ENV: process.env.NODE_ENV,
    // Güvenliyse ve gerekliyse başka değişkenleri de ekleyebilirsiniz, örneğin:
    // MY_APP_DATA_PATH: process.env.MY_APP_DATA_PATH
  },

  // File system IPC handler'larını açığa çıkarma
  // Renderer'dan main process'e çağrı yapmak için ipcRenderer.invoke kullanılır
  fs: {
    deleteDir: (dirPath) => ipcRenderer.invoke('fs:deleteDir', dirPath),
    deleteFile: (filePath) => ipcRenderer.invoke('fs:deleteFile', filePath),
    ensureDir: (dirPath) => ipcRenderer.invoke('fs:ensureDir', dirPath),
    exists: (filePath) => ipcRenderer.invoke('fs:exists', filePath),
    getHomePath: () => ipcRenderer.invoke('fs:getHomePath'),
    joinPath: (...paths) => ipcRenderer.invoke('fs:joinPath', ...paths),
    listDir: (dirPath) => ipcRenderer.invoke('fs:listDir', dirPath),
    readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath, data) => ipcRenderer.invoke('fs:writeFile', filePath, data),
  },

  // Gelecekte eklemek isteyebileceğiniz diğer Electron API'leri buraya eklenebilir
  // Örneğin, dialog kutuları, shell işlemleri vb.
  // openDialog: (options) => ipcRenderer.invoke('dialog:open', options),
});
