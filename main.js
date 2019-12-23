const { resolve, basename } = require('path');
const {app, Menu, Tray, MenuItem, dialog} = require('electron')
const spawn = require('cross-spawn');

const Store = require('electron-store');

const scheme = {
  projects: {
    type: 'string',
  },
}

const store = new Store({ scheme });

let tray = null;

function render() {

  /*if(!tray.isDestroyed()){
    tray.destroy();
    tray = new Tray(resolve(__dirname, 'assets', 'tray-icon.png'));
  }*/

const storeProjects = store.get('projects');
const projects = storeProjects ? JSON.parse(storeProjects) : [];

const items = projects.map(project => ({
  label: project.name,
  submenu:[{
    label: 'Abrir no VSCode',
    click: () => spawn.sync('code', [project.path])
  },
  {
    label: 'Remover',
    click: () => {
      store.set('projects', JSON.stringify(projects.filter(item => { item.path != projects.path } )));
      render();
    }
  }
]
}));


//INSTANCIA CONFIGURANDO O MENU/ITENS
const contextMenu = Menu.buildFromTemplate([
  ... items,
  {
    type: 'separator',
  },
  {
    type: 'normal',
    label: 'Sair',
    role: 'quit',
    enabled: true,
  }
]);

contextMenu.insert(0, new MenuItem({ 
  label: 'Adicionar Projeto..', click: () => { 
    const [path] = dialog.showOpenDialogSync(null, { properties: ['openDirectory']});
    const name = basename(path);
    
  
    store.set('projects', JSON.stringify([ ... projects, {
      path, 
      name,
    }]));

      render();

   }
   
}));

tray.setToolTip('VSCode Projects');
tray.setContextMenu(contextMenu);

}

app.on('ready', () => {
    tray = new Tray(resolve(__dirname, 'assets', 'tray-icon.png'));
    render();
  }
);


