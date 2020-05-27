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

  // 关闭csrf允许访问.
  config.security = {
    csrf: {
      enable: false
    }
  };

  // botkit对话id.
  exports.botkitSessionId = {
    DIALOG_ID_FOR_AUTO_SEND: 'AUTU_SEND_ID_1',
    DIALOG_ID_FOR_IMG_SEND: 'IMG_SEND_ID_1',
    DIALOG_ID_FOR_AUTO_SEND_CREATE_GROUP: 'AUTU_SEND_ID_CREATE_GROUP'
  }

  // xmpp相关.
  exports.xmppConfig = {
    // 域.
    host: 'dev.fsll.tech',
    // 地址.
    url: 'wss://dev.fsll.tech:8443/websocket/',
    // 机器人账号.
    robot: 'test01',
    // 机器人账号对应密码.
    robotPwd: 'chxJhzbjfz6CE1IQsTswlrKd0kfMfkzqZxXw0EWEFNNabnKRjzNYnt+X+oYgqSN72orwqKLLo1lSI/l8cpZNx0KSGGbVIkbBPAi0DB02Mr37CrCeJzBgYJ+6051MJdeyERNJyXMBmOu4jhlBdOhjUjeUybaP9hfsCWZNuPCS9No=',
    // 在线图片目录.
    imgUrl: 'https://dev.fsll.tech:8443/file/v2/download/'
  };

  // 开发环境. 线上环境设置为false.
  exports.isDev = true;

  // static files and cache files
  config.static = {
    // 静态化访问前缀,如：`http://127.0.0.1:7001/static/images/logo.png`
    prefix: '/static',
    dir: path.join(appInfo.baseDir, 'app/public'),
    dynamic: true,
    preload: false,
    maxAge: 31536000, // in prod env, 0 in other envs
    buffer: false, // in prod env, false in other envs
  };

  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.njk': 'nunjucks',
    }
  };

  // 每天23:59:00执行一次聊天记录文件创建.
  config.chatRecordTick = '0 59 23 * * *';

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
