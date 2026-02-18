
import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Em ES Modules, precisamos recriar o __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Blue Eyes Writer",
    backgroundColor: '#f3f2f1',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: true,
      webSecurity: false // Permitir carregar imagens locais via file:// para AppImage/Linux
    }
  });

  // Em produção, o Vite coloca os arquivos em 'dist'
  // O caminho deve ser absoluto para evitar erros no AppImage
  const indexPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html')
    : path.join(__dirname, 'dist', 'index.html');

  // Tentativa robusta de carregar o arquivo
  win.loadFile(indexPath).catch(() => {
    // Fallback caso o caminho acima falhe em algum ambiente específico
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  });

  Menu.setApplicationMenu(null);

  win.once('ready-to-show', () => {
    win.show();
  });

  // Se precisar depurar no Linux, descomente a linha abaixo:
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
