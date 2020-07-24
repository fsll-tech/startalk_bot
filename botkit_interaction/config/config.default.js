/* eslint valid-jsdoc: "off" */

'use strict';

const path = require('path');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1587541538995_9986';

  // add your middleware config here
  config.middleware = [];

  // botkit对话id.
  exports.botkitSessionId = {
    DIALOG_ID_FOR_AUTO_SEND: 'AUTU_SEND_ID_1'
  }

  // xmpp相关.
  exports.xmppConfig = {
    // 域.
    host: 'dev.startalk.tech',
    // 地址.
    url: 'wss://dev.startalk.tech:8443/websocket/',
    // 机器人账号.
    robot: 'test01',
    // 机器人账号对应密码.
    robotPwd: '1234567',
    // 在线图片目录.
    imgUrl: 'https://dev.startalk.tech:8443/file/v2/download/'
  };

  // 开发环境. 线上环境设置为false.
  exports.isDev = true;

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
