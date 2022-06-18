console.log('💃 hello from ipcpreload')


const {
  contextBridge,
  ipcRenderer,
  shell
} = require("electron")

// https://github.com/thanhlmm/electron-multiple-tabs/blob/main/server/src/client-preload.js
const ipc = require('node-ipc')
//const uuid = require('uuid')


console.log ("preload called");


// https://github.com/thanhlmm/electron-multiple-tabs/blob/main/server/src/client-preload.js
let resolveSocketPromise
let socketPromise = new Promise(resolve => {
  resolveSocketPromise = resolve
})

ipcRenderer.on('set-socket', (event, { name }) => {
  resolveSocketPromise(name)
})


export {}
declare global {
  interface Window {
    api: {
      send: (channel: string, ...arg: any) => void;
      receive: (channel: string, func: (event: any, ...arg: any) => void) => void;
      // https://github.com/frederiksen/angular-electron-boilerplate/blob/master/src/preload/preload.ts
      // https://www.electronjs.org/docs/all#ipcrenderersendtowebcontentsid-channel-args
      electronIpcSendTo: (window_id: string, channel: string, ...arg: any) => void;
      electronIpcSend: (channel: string, ...arg: any) => void;
      giveMeAStream: (eventId: string) => void;
      electronIpcOn: (channel: string, listener: (event: any, ...arg: any) => void) => void;
      electronIpcSendSync: (channel: string, ...arg: any) => void;
      // https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
      electronIpcInvoke: (channel: string, ...arg: any) => void;
      // https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererpostmessagechannel-message-transfer
      electronIpcPostMessage: (channel: string, message: any, transfer?: MessagePort[]) => void;
      electronIpcOnce: (channel: string, listener: (event: any, ...arg: any) => void) => void;
      electronIpcRemoveListener:  (channel: string, listener: (event: any, ...arg: any) => void) => void;
      electronIpcRemoveAllListeners: (channel: string) => void;

      setFullscreen: (flag: any) => void;

      // ------------------------------ tab-preload ----------------------------
      // https://github.com/thanhlmm/electron-multiple-tabs/blob/main/server/src/tab-preload.js
      // https://github.com/thanhlmm/electron-multiple-tabs/blob/main/vite/src/react-app-env.d.ts

      sendTab: SendFuncType;
      listen: ListenFuncType;
      newTab: (url: any) => void;
      onTabChange: (cb: (data: ITabChangeList) => void) => void
      getTabs: () => Promise<ITabChangeList>;
      setTab: (tab: any) => void;
      closeTab: (tab: any) => void;
      closeWindow: () => void;
      minimumWindow: () => void;
      toggleMaximumWindow: () => void;


      // https://github.com/thanhlmm/electron-multiple-tabs/blob/main/server/src/client-preload.js

      openUrl: (url) => void;

      // ---------------------------------------------------------------------------

    };

    attachEvent(event: string, listener: EventListener): boolean;
    detachEvent(event: string, listener: EventListener): void;

    // https://github.com/thanhlmm/electron-multiple-tabs/blob/main/server/src/client-preload.js

    //ipc: {
      //getServerSocket: () => Promise<any>;
      //ipcConnect: (id: number, func: Function, buffer: boolean): void;
    //};

  }
}


declare global {
  interface Window {
    ipc: {
      getServerSocket: () => Promise<any>;
      ipcConnect: (id: number, func: Function, buffer: boolean) => void;

    }
  }
}


const windowLoaded = new Promise(resolve => {
  window.onload = resolve
})


ipcRenderer.on('stream-response', async (event, eventId) => {
  await windowLoaded
  // We use regular window.postMessage to transfer the port from the isolated
  // world to the main world.

  console.log('stream-response', eventId, event.ports)
  window.postMessage(eventId, '*', event.ports)
})


// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: any, text: any) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})


contextBridge.exposeInMainWorld(
  "api", {
      // https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererpostmessagechannel-message-transfer
      electronIpcPostMessage: (channel: string, message: any, transfer?: MessagePort[]) => {
        ipcRenderer.postMessage(channel, message, transfer)
      },
      send: (channel: any, data: any) => {
          console.log("preload-send called: args: ", data);
          ipcRenderer.invoke(channel, data).catch(e => console.log(e))
      },
      receive: (channel: any, func: any) => {
        console.log("preload-receive called. args: ");
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      },
      // https://www.electronjs.org/docs/all#ipcrenderersendtowebcontentsid-channel-args
      electronIpcSendTo: (window_id: number, channel: string, ...arg: any) => {
        ipcRenderer.sendTo(window_id, channel, arg);
      },
      // https://github.com/frederiksen/angular-electron-boilerplate/blob/master/src/preload/preload.ts
      electronIpcSend: (channel: string, ...arg: any) => {
        ipcRenderer.send(channel, arg);
      },

      giveMeAStream: (eventId: string) => {
        ipcRenderer.send('give-me-a-stream', eventId)
      },

      electronIpcSendSync: (channel: string, ...arg: any) => {
        return ipcRenderer.sendSync(channel, arg);
      },
      // https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
      electronIpcInvoke: (channel: string, ...arg: any) => {
        return ipcRenderer.invoke(channel, ...arg)
      },
      electronIpcOn: (channel: string, listener: (event: any, ...arg: any) => void) => {
        ipcRenderer.on(channel, listener);
      },
      electronIpcOnce: (channel: string, listener: (event: any, ...arg: any) => void) => {
        ipcRenderer.once(channel, listener);
      },
      electronIpcRemoveListener:  (channel: string, listener: (event: any, ...arg: any) => void) => {
        ipcRenderer.removeListener(channel, listener);
      },
      electronIpcRemoveAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
      },

      setFullscreen: (flag) => {
        ipcRenderer.invoke('setFullscreen', flag); 
      },

      // ------------------------------ tab-preload ----------------------------
      // https://github.com/thanhlmm/electron-multiple-tabs/blob/main/server/src/tab-preload.js

      newTab: (url) => {
        ipcRenderer.invoke('new-tab', url)
      },

      onTabChange: (cb) => {
        ipcRenderer.on('tabChange', (event, tabList) => {
          if (cb) {
            cb(tabList)
          }
        })
      },

      getTabs: () => {
        return ipcRenderer.invoke('get-tabs');
      },

      setTab: (tab) => {
        return ipcRenderer.invoke('set-tab', tab);
      },

      closeTab: (tab) => {
        return ipcRenderer.invoke('close-tab', tab);
      },

      closeWindow: () => {
        return ipcRenderer.invoke('close-window')
      },

      minimumWindow: () => {
        return ipcRenderer.invoke('minimum-window');
      },

      toggleMaximumWindow: () => {
        return ipcRenderer.invoke('toggle-maximum-window');
      },

      // https://github.com/thanhlmm/electron-multiple-tabs/blob/main/server/src/client-preload.js
      openUrl: (url) => {
        shell.openExternal(url)
      }

     // ---------------------------------------------------------------------------

  },
)

contextBridge.exposeInMainWorld(
  "ipc", {
      getServerSocket: () => {
        return socketPromise
      },

      ipcConnect: (id, func, buffer = false) => {
        ipc.config.silent = true
        ipc.config.rawBuffer = buffer

        ipc.connectTo(id, () => {
          func(ipc.of[id])
        })
      }

  }
)



// https://github.com/electron/electron/blob/v18.2.0/docs/fiddles/ipc/pattern-2/preload.js
contextBridge.exposeInMainWorld('electronAPI',{
  seedCorestore: () => ipcRenderer.invoke('seed-corestore', "seed")
})

contextBridge.exposeInMainWorld('peerElectronAPI',{
  peerCorestore: () => ipcRenderer.invoke('peer-corestore', "peer")
})

contextBridge.exposeInMainWorld('autobaseCausalElectronAPI',{
  orderingAutobase: () => ipcRenderer.invoke('autobase-causal-streams', "causal")
})

contextBridge.exposeInMainWorld('forksreorderElectronAPI',{
  forksreorderAutobase: () => ipcRenderer.invoke('autobase-forks-streams', "forks_reordering")
})

contextBridge.exposeInMainWorld('lockforksElectronAPI',{
  lockforksAutobase: () => ipcRenderer.invoke('autobase-lock-forks-streams', "lock_forks")
})

contextBridge.exposeInMainWorld('linearizedViewsSimplestIndexElectronAPI',{
  simplestIndexLinearizedViews: () => ipcRenderer.invoke('linearized-views-simplest-index', "simplest_index")
})
