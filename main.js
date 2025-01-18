const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let prefWindow;

const brcpDataPath = path.join(__dirname, 'BRCP/pickerData.json');
const fnfsDataPath = path.join(__dirname, 'FNFSPicker/pickerData.json');
const wheelSpinDataPath = path.join(__dirname, 'wheelSpin/pickerData.json');

// Load or Initialize Data
let pickerData = {
    BRCP: loadData(brcpDataPath),
    FNFSPicker: loadData(fnfsDataPath),
    WheelSpin: loadData(wheelSpinDataPath)
};

// Helper Function to Load Data
function loadData(filePath) {
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath));
    }
    return {};
}

// Save Updated Data for Specific Picker
ipcMain.on('save-picker-data', (event, { pickerType, data }) => {
    pickerData[pickerType] = data;

    if (pickerType === 'BRCP') {
        fs.writeFileSync(brcpDataPath, JSON.stringify(data, null, 2));
    } else if (pickerType === 'FNFSPicker') {
        fs.writeFileSync(fnfsDataPath, JSON.stringify(data, null, 2));
    } else if (pickerType === 'WheelSpin') {
        fs.writeFileSync(wheelSpinDataPath, JSON.stringify(data, null, 2));
    }

    mainWindow.webContents.send('update-picker-data', pickerData[pickerType]);
    updateSoftware(); // Trigger update after saving
});

// Send Data to Preferences Window for a Specific Picker
ipcMain.on('get-picker-data', (event, pickerType) => {
    event.reply('update-picker-data', pickerData[pickerType] || {});
});

// Handle preferences-updated message
ipcMain.on('preferences-updated', () => {
    mainWindow.webContents.send('preferences-updated');
});

// Handle close-preferences message
ipcMain.on('close-preferences', () => {
    if (prefWindow) {
        prefWindow.close();
    }
});

// Create Main Application Window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    mainWindow.loadFile('index.html');

    const menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                { label: 'Preferences', click: openPreferencesWindow },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Check for Updates', click: checkForUpdates },
                { label: 'Update Software', click: updateSoftware }
            ]
        },
        {
            label: 'Other Programs',
            submenu: [
                { label: 'BR Challenge Picker', click: () => openProgram('BRCP/index.html') },
                { label: 'The Button Picker', click: () => openProgram('buttonPicker/index.html') },
                { label: 'The Fortnite Fashion Show Picker', click: () => openProgram('FNFSPicker/index.html') },
                { label: 'Coin Flip', click: () => openProgram('coinflip/index.html') },
                { label: 'Wheel Spin', click: () => openProgram('wheelSpin/index.html') }
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);

    autoUpdater.checkForUpdatesAndNotify();  // Check for updates at startup
}

// Open Preferences Window
function openPreferencesWindow() {
    prefWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Preferences',
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    prefWindow.loadFile('preferences/preferences.html');

    prefWindow.on('close', () => {
        mainWindow.webContents.send('preferences-updated');
    });
}

// Reload Main Window (Update Software)
function updateSoftware() {
    mainWindow.reload();
}

// Open Program Pages
function openProgram(url) {
    mainWindow.loadFile(url);
}

// Trigger Software Update
ipcMain.on('update-software', () => {
    updateSoftware();
});

// Manual check for updates
function checkForUpdates() {
    autoUpdater.checkForUpdates();
}

// Auto-Update Event Handlers
autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: `Version ${info.version} is available. Downloading now...`
    });
});

autoUpdater.on('update-not-available', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'No Update Available',
        message: 'You are using the latest version.'
    });
});

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. Restart now to apply the update.',
        buttons: ['Restart', 'Later']
    }).then(result => {
        if (result.response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
});

autoUpdater.on('error', (error) => {
    console.error(`Update error: ${error}`);
    dialog.showErrorBox('Update Error', error == null ? "Unknown Error" : (error.stack || error).toString());
});

// App Lifecycle Management
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});