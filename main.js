const { resolve, basename } = require('path');
const {app, Menu, Tray, MenuItem, dialog} = require('electron');
const spawn = require('cross-spawn');
//const spawnChild = require('child_process');

//const root = 'cd ';

const Store = require('electron-store');

const scheme = {
  projects: {
    type: 'string',
  },
}

const store = new Store({ scheme });

let tray = null;

function render() {

  if(!tray.isDestroyed()){
    tray.destroy();
    tray = new Tray(resolve(__dirname, 'build/icons', '512x512.png'));
  }

  const storeProjects = store.get('projects');
  const projects = storeProjects ? JSON.parse(storeProjects) : [];

  const items = projects.map(project => ({
    label: project.name,
    submenu:[
      {
        label: 'Abrir VSCode',
        click: () => spawn.sync('code', [project.path])
      },
      {
        label: 'Abrir Diretório',
        click: () => spawn.sync('xdg-open', [project.path])
      },
      {
        label: 'Abrir Terminal',
        click: () => {
          spawn.sync('x-terminal-emulator', [project.path])
        } 
      },
      {
        type: 'separator',
      },
      {
        label: 'Remover',
        click: () => {
        
          let itens = [];

          projects.map((item) => {
            if (item.path != project.path) {
              itens.push(item);
            }
          });

          store.set('projects', JSON.stringify(itens));
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

  /**
   * ADICIONA UM SEPARADOR APÓS O "ADICIONAR PROJETO"
   */
  contextMenu.insert(0, new MenuItem({
    type: "separator"
  }));

  contextMenu.insert(0, new MenuItem({
    label: 'Adicionar Projeto..', click: () => { 

      try {
        const [path] = dialog.showOpenDialogSync(null, { properties: ['openDirectory']});
        const name = basename(path);
    
        store.set('projects', JSON.stringify([ ... projects, {
          path, 
          name,
        }]));

        render();

      } catch (error) {
        console.log(error);
      }

      
    }   
  }));

  tray.setToolTip('VSCode Projects');
  tray.setContextMenu(contextMenu);

}

app.on('ready', () => {
    //tray = new Tray(resolve(__dirname, 'assets', 'tray-icon.png'));
    tray = new Tray(resolve(__dirname, 'build/icons', '512x512.png'));
    render();
  }
);


