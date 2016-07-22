const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const {ipcMain} = electron;

let danmu;
let login;

function createWindow() {
    danmu = new BrowserWindow({
        width: 400,
        height: 600,
        autoHideMenuBar: true,
        icon: __dirname + '/assets/favicon.ico',
        show: false
    });
    danmu.loadURL(`file://${__dirname}/danmu.html`);
    danmu.on('closed', () => {
        danmu = null;
        if (login != null) {
            login.close();
        }
    });

    login = new BrowserWindow({
        width: 400,
        height: 200,
        autoHideMenuBar: true,
        icon: __dirname + '/assets/favicon.ico',
    });
    login.loadURL(`file://${__dirname}/login.html`);

    login.on('closed', () => {
        login = null;
        if (danmu != null) {
            danmu.close();
        }
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
    login.hide();
    danmu.show();
    danmu.webContents.send('roomid', arg);
});
