const os = require('os');
const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, Menu, ipcMain , shell} = require('electron');
const resizeImg  = require('resize-img');

process.env.NODE_ENV = 'production';
const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin'; //is on a mac

let mainWindow;
//Creates main window
function createMainWindow() {
        mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1000: 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });


    //open devtools if in dev env

    if (isDev){
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}


//create about window

function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width: 300,
        height: 300
    });


    //open devtools if in dev env



    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}


// App is ready
app.whenReady().then(() => {
    createMainWindow();


    // Implement Menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    //Remove mainWindow from memory on close
    mainWindow.on('closed', ()=> (mainWindow=null))
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createMainWindow();
        }
      })
});


//Menu template
const menu = [
    ...(isMac ? [
        {
            label:app.name,
            submenu: [
                {
                    label: 'About',
                    click: createAboutWindow
                }
            ]
        }
    ]: []),
    {
        role: 'fileMenu',
        // label: 'File',
        // submenu: [
        //     {
        //         label:'Quit',
        //         click: () => app.quit(),
        //         accelerator: 'CmdOrCtrl+W'

        //     }
        // ]
    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            },
        ],
    }] : [])
]

//Respond to ipcRenderer
ipcMain.on('image:resize', (e, options)=> {
    options.dest = path.join(os.homedir(), 'imageResizer');
    resizeImage(options);
});

async function resizeImage({
    imgPath, width, height, dest
}){
    try{
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height
        });

        const { name } = path.parse(imgPath);
        const filename = `${name}_${width}_${height}${path.extname(imgPath)}`;

        //create dest folder if it does not exist
        if (!fs.existsSync(dest)){
            fs.mkdirSync(dest);
        }

        //write file to dest
        fs.writeFileSync(path.join(dest, filename), newPath);

        //send success messahe
        mainWindow.webContents.send('image:done');
        //Open dest folder
        shell.openPath(dest);
    }catch (error){
        console.log(error);
    }
}


app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit();
    }
  })