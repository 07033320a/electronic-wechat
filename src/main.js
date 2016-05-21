/* eslint-disable */
'use strict';

const path = require('path');
const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;

const UpdateHandler = require('./handlers/update');
const Common = require('./common');

const SplashWindow = require('./windows/controllers/splash');
const WeChatWindow = require('./windows/controllers/wechat');
const SettingsWindow = require("./windows/controllers/settings");
const AppTray = require('./windows/controllers/app_tray');

class ElectronicWeChat {
  constructor() {
    this.wechatWindow = null;
    this.splashWindow = null;
    this.settingsWindow = null;
    this.tray = null;
  }

  init() {
    this.initApp();
    this.initIPC();
  }

  initApp() {
    app.on('ready', ()=> {
      this.createSplashWindow();
      this.createWeChatWindow();
      this.createSettingsWindow();
      this.createTray();
    });

    app.on('activate', () => {
      if (this.wechatWindow == null) {
        this.createWeChatWindow();
      } else {
        this.wechatWindow.show();
      }
    });
  };

  initIPC() {
    ipcMain.on('badge-changed', (event, num) => {
      if (process.platform == "darwin") {
        app.dock.setBadge(num);
        if (num) {
          this.tray.setTitle(` ${num}`);
        } else {
          this.tray.setTitle('');
        }
      }
    });

    ipcMain.on('user-logged', () => this.wechatWindow.resizeWindow(true, this.splashWindow));

    ipcMain.on('wx-rendered', (event, isLogged) => this.wechatWindow.resizeWindow(isLogged, this.splashWindow));

    ipcMain.on('log', (event, message) => {
      console.log(message);
    });

    ipcMain.on('reload', (event, repetitive) => {
      this.settingsWindow.reload();
      // if (repetitive) {
      //   this.wechatWindow.loginState.current = this.wechatWindow.loginState.NULL;
      //   this.wechatWindow.connect();
      // } else {
      //   this.wechatWindow.loadURL(Common.WEB_WECHAT);
      // }
    });

    ipcMain.on('update', (event, message) => {
      let updateHandler = new UpdateHandler();
      updateHandler.checkForUpdate(`v${app.getVersion()}`, false);
    });
    
    ipcMain.on('settings', (event, message) => {
      this.settingsWindow.show();
    });
  };

  createTray() {
    this.tray = new AppTray(this.splashWindow, this.wechatWindow);
  }

  createSplashWindow() {
    this.splashWindow = new SplashWindow();
    this.splashWindow.show();
  }

  createWeChatWindow() {
    this.wechatWindow = new WeChatWindow();
  }
  
  createSettingsWindow() {
    this.settingsWindow = new SettingsWindow();
  }
  
}

new ElectronicWeChat().init();
