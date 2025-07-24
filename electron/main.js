import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';

// Import url module for __dirname and __filename in ES Modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Modülleri için __filename ve __dirname'e erişim
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;

function createWindow() {
  console.log("Creating main window... ", {
    dirname: __dirname,
    env: process.env.NODE_ENV,
  });

  // Preload script yolu. electron/main.js ile electron/preload.js'nin aynı dizinde olduğunu varsayar.
  const preloadPath = path.join(__dirname, 'preload.js');

  mainWindow = new BrowserWindow({
    height: 800,
    icon: path.join(__dirname, "../public/icon.png"), // public klasörü electron klasörünün bir üstünde varsayılır
    show: false,
    titleBarStyle: "default",
    webPreferences: {
      contextIsolation: true, // Güvenlik için açık kalsın
      nodeIntegration: false, // Güvenlik için kapalı kalsın
      preload: preloadPath,    // Preload script yolunu belirtin
      // Sandbox: true, // Daha fazla güvenlik için sandbox'ı etkinleştirebilirsiniz (eğer gerekirse)
    },
    width: 1200,
  });

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.log("Loading development URL: http://localhost:3000");
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools(); // Geliştirme modunda DevTools'u aç

    // Renderer süreci hazır olduğunda DevTools'u açmayı geciktirebilirsiniz
    // mainWindow.webContents.once('dom-ready', () => {
    //     mainWindow.webContents.openDevTools();
    // });

  } else {
    console.log("Loading production build...");
    // Build sonrası Next.js App Router çıktısı yolu.
    // package.json build yapılandırmanıza göre:
    // .next klasörü dist'in köküne kopyalanır.
    // main.js dist/electron içinde.
    // App Router HTML'i dist/.next/server/app içinde (genellikle page.html veya index.html).
    // Dolayısıyla dist/electron/main.js'den dist/.next/server/app/page.html'e gitmek için:
    // ../../.next/server/app/page.html yolu kullanılır.
    // LÜTFEN BUILD ALDIKTAN SONRA dist KLASÖRÜNE BAKARAK HTML DOSYASININ ADINI VE YOLUNU TEYİT EDİN.
    const indexPath = path.join(__dirname, "../../.next/server/app/page.html"); // App Router için olası yol
    // const indexPath = path.join(__dirname, "../../.next/server/app/index.html"); // Bazı Next.js versiyonları/yapılandırmaları için olası yol
    // Eğer root page farklı bir klasör altındaysa (örneğin `app/(root)/page.js`):
    // const indexPath = path.join(__dirname, "../../.next/server/app/(root)/page.html");

    console.log("Loading file:", indexPath);
    mainWindow.loadFile(indexPath).catch(error => {
      console.error("Failed to load file:", indexPath, error);
      // Hata durumunda bir hata sayfası yükleyebilirsiniz
      // mainWindow.loadURL('about:blank');
      // mainWindow.webContents.html = '<h1>Error loading application</h1><p>' + error.message + '</p>';
    });
  }

  mainWindow.once("ready-to-show", () => {
    console.log("Main window ready to show.");
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    console.log("Main window closed.");
    mainWindow = null;
  });

  // Yeni pencere açılmasını engelle veya kontrol et (güvenlik için iyi uygulama)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log("Window open requested for URL:", url);
    // Dış linkler için varsayılan tarayıcıda aç
    if (!url.startsWith('file://') && !url.startsWith('http://localhost')) {
      require('electron').shell.openExternal(url);
      return { action: 'deny' }; // Yeni pencere açılmasını engelle
    }
    // Uygulama içi linklere izin ver
    return { action: 'allow' };
  });
}

// Uygulama hazır olduğunda pencereyi oluştur
app.whenReady().then(() => {
  console.log("Electron app ready.");
  createWindow();

  // macOS Dock ikonuna tıklama durumunda pencereyi yeniden aç (eğer kapalıysa)
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      console.log("App activated, creating new window.");
      createWindow();
    }
  });
});

// Tüm pencereler kapandığında uygulamayı kapat (macOS hariç)
app.on("window-all-closed", () => {
  console.log("All windows closed.");
  if (process.platform !== "darwin") {
    console.log("Quitting app.");
    app.quit();
  }
});

// CommonJS'den ES Modüllerine geçerken oluşabilecek diğer hataları yakalamak için
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception in main process:', error);
  // Uygulamayı güvenli bir şekilde kapatmayı düşünebilirsiniz
  // app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection in main process:', reason);
  // Uygulamayı güvenli bir şekilde kapatmayı düşünebilirsiniz
  // app.quit();
});


// -----------------------------------------------------------------------
// File system IPC handlers (Renderer'dan main process'e çağrılar)
// -----------------------------------------------------------------------

ipcMain.handle("fs:ensureDir", async (event, dirPath) => {
  console.log(`IPC: fs:ensureDir called with ${dirPath}`);
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (error) {
    console.error("Error creating directory:", error);
    return { error: error.message, success: false };
  }
});

ipcMain.handle("fs:writeFile", async (event, filePath, data) => {
  console.log(`IPC: fs:writeFile called with ${filePath}`);
  try {
    await fs.writeFile(filePath, data, "utf8");
    return { success: true };
  } catch (error) {
    console.error("Error writing file:", error);
    return { error: error.message, success: false };
  }
});

ipcMain.handle("fs:readFile", async (event, filePath) => {
  console.log(`IPC: fs:readFile called with ${filePath}`);
  try {
    const data = await fs.readFile(filePath, "utf8");
    return { data: data, success: true };
  } catch (error) {
    console.error("Error reading file:", error);
    // Dosya bulunamadı hatası için özel bir dönüş değeri düşünebilirsiniz
    if (error.code === 'ENOENT') {
      return { error: "File not found", success: false };
    }
    return { error: error.message, success: false };
  }
});

ipcMain.handle("fs:deleteFile", async (event, filePath) => {
  console.log(`IPC: fs:deleteFile called with ${filePath}`);
  try {
    await fs.unlink(filePath);
    return { success: true };
  } catch (error) {
    // ENOENT hatası dosyanın zaten var olmamasıdır
    if (error.code === 'ENOENT') {
      return { success: true }; // Zaten yoksa silme işlemi başarılı kabul edilebilir
    }
    console.error("Error deleting file:", error);
    return { error: error.message, success: false };
  }
});

ipcMain.handle("fs:deleteDir", async (event, dirPath) => {
  console.log(`IPC: fs:deleteDir called with ${dirPath}`);
  try {
    // recursive: true ile klasörün içindekilerle birlikte silinir
    // force: true ile var olmayan klasörler için hata fırlatmaz (Node 14+)
    await fs.rm(dirPath, { force: true, recursive: true });
    return { success: true };
  } catch (error) {
    // ENOENT hatası klasörün zaten var olmamasıdır
    if (error.code === 'ENOENT') {
      return { success: true }; // Zaten yoksa silme işlemi başarılı kabul edilebilir
    }
    console.error("Error deleting directory:", error);
    return { error: error.message, success: false };
  }
});


ipcMain.handle("fs:listDir", async (event, dirPath) => {
  console.log(`IPC: fs:listDir called with ${dirPath}`);
  try {
    const items = await fs.readdir(dirPath);
    return { data: items, success: true };
  } catch (error) {
    console.error("Error listing directory:", error);
    if (error.code === 'ENOENT') {
      return { data: [], success: true }; // Klasör yoksa boş dizi döndür
    }
    return { error: error.message, success: false };
  }
});

ipcMain.handle("fs:exists", async (event, filePath) => {
  console.log(`IPC: fs:exists called with ${filePath}`);
  try {
    await fs.access(filePath); // Dosya/klasöre erişilebiliyorsa var demektir
    return { exists: true, success: true };
  } catch (error) {
    // ENOENT hatası dosya/klasörün var olmamasıdır
    if (error.code === 'ENOENT') {
      return { exists: false, success: true };
    }
    // Diğer hatalar (izin yok vb.) gerçek bir hata olarak ele alınabilir
    console.error("Error checking existence:", error);
    return { error: error.message, success: false };
  }
});


ipcMain.handle("fs:getHomePath", async () => {
  console.log(`IPC: fs:getHomePath called`);
  try {
    return { data: os.homedir(), success: true };
  } catch (error) {
    console.error("Error getting home path:", error);
    return { error: error.message, success: false };
  }
});

ipcMain.handle("fs:joinPath", async (event, ...paths) => {
  console.log(`IPC: fs:joinPath called with ${paths.join(', ')}`);
  try {
    // path.join senkron bir fonksiyondur, async/await gerekli değildir ama IPC handle'ları genelde async'tir.
    return { data: path.join(...paths), success: true };
  } catch (error) {
    console.error("Error joining path:", error);
    return { error: error.message, success: false };
  }
});
