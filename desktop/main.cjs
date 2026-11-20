// =====================================================
// برنامج سطح المكتب (Electron): يعرض نفس ملفات الموقع المبنية
// من داخل البرنامج عبر بروتوكول app:// ← دون إنترنت ودون خادم أو قاعدة بيانات
// =====================================================
const {app, BrowserWindow, protocol, net, shell} = require('electron');
const path = require('node:path');
const {pathToFileURL} = require('node:url');

const SCHEME = 'app';
const HOST = 'jummal';

// الملفات المبنية: داخل البرنامج المحزوم (app/) أو من frontend/dist أثناء التطوير
const appRoot = app.isPackaged
  ? path.join(__dirname, 'app')
  : path.join(__dirname, '..', 'frontend', 'dist');

protocol.registerSchemesAsPrivileged([
  {scheme: SCHEME, privileges: {standard: true, secure: true, supportFetchAPI: true, corsEnabled: true}}
]);

function serveAppFiles() {
  protocol.handle(SCHEME, (request) => {
    const url = new URL(request.url);
    let relative = decodeURIComponent(url.pathname);
    if (relative === '/' || relative === '') {
      relative = '/index.html';
    }
    const filePath = path.normalize(path.join(appRoot, relative));
    // منع الخروج من مجلد البرنامج
    if (!filePath.startsWith(appRoot)) {
      return new Response('Not found', {status: 404});
    }
    return net.fetch(pathToFileURL(filePath).toString());
  });
}

function isAppUrl(url) {
  return url.startsWith(`${SCHEME}://${HOST}/`);
}

function createWindow(url = `${SCHEME}://${HOST}/index.html`) {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'جمّل',
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: true
    }
  });

  // روابط "دراسة الرقم" وغيرها تفتح نافذة جديدة داخل البرنامج، والروابط الخارجية في المتصفح
  win.webContents.setWindowOpenHandler(({url: target}) => {
    if (isAppUrl(target)) {
      createWindow(target);
    } else if (/^https?:\/\//.test(target)) {
      shell.openExternal(target);
    }
    return {action: 'deny'};
  });

  win.webContents.on('will-navigate', (event, target) => {
    if (!isAppUrl(target)) {
      event.preventDefault();
    }
  });

  win.loadURL(url);
  return win;
}

app.whenReady().then(() => {
  serveAppFiles();
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
