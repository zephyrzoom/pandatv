const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const {ipcMain} = electron;

let danmu;
let login;

function createWindow() {
    login = new BrowserWindow({
        width: 300,
        height: 200,
        autoHideMenuBar: true,
        icon: __dirname + '/assets/favicon.ico',
    });
    login.loadURL(`file://${__dirname}/login.html`);

    login.on('closed', () => {
        login = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (danmu === null) {
        createWindow();
    }
});

ipcMain.on('login', (event, arg) => {
    danmu = new BrowserWindow({
        width: 300,
        height: 500,
        autoHideMenuBar: true,
        icon: __dirname + '/assets/favicon.ico',
    });
    danmu.loadURL(`file://${__dirname}/danmu.html`);

    danmu.on('closed', () => {
        danmu = null;
    });
    danmu.webContents.on('did-finish-load', () => {
        danmu.webContents.send('roomid', arg);
    });
    login.close();
});
