const WebSocket = require('ws');
const debug = require('@xmpp/debug');
const { client, xml } = require('@xmpp/client');
const { Botkit, BotkitConversation } = require('botkit');
const { WebAdapter } = require('botbuilder-adapter-web');
const adapter = new WebAdapter(/* options */);
/* WebAdapter options
** host {String} The hostname where to bind the server.
** port {Number} The port where to bind the server.
** backlog {Number} The maximum length of the queue of pending connections.
** server {http.Server|https.Server} A pre-created Node.js HTTP/S server.
** verifyClient {Function} A function which can be used to validate incoming connections.
** handleProtocols {Function} A function which can be used to handle the WebSocket subprotocols. 
** path {String} Accept only connections matching this path.
** noServer {Boolean} Enable no server mode.
** clientTracking {Boolean} Specifies whether or not to track clients.
** perMessageDeflate {Boolean|Object} Enable/disable permessage-deflate.
** maxPayload {Number} The maximum allowed message size in bytes.
*/
const controller = new Botkit({
    adapter,
    // ...other options
});

// mount global variables.
class AppBootHook {
    constructor(app) {
        // 挂载app实例.
        this.app = app;
        // 挂载botkit实例.
        this.app.bkController = controller;
        // 挂载botkit对话对象.
        this.app.BotkitConversation = BotkitConversation;
    }

    async willReady() {
        const ctx = this.app.createAnonymousContext();
        const { xmppConfig, isDev } = this.app.config;

        /* link to botkit server. */
        const ws = new WebSocket('ws://localhost:3000');
        ws.on('open', function () {
            ws.send(JSON.stringify({
                type: 'welcome',
                user: 'botkit_uuid',
                channel: 'socket'
            }));
        });

        ws.on('message', data => {
            data = JSON.parse(data);
            const text = data.text;

            console.log('robot -->', text);

            // 判断消息类型.
            if (text.startsWith('send____msg')) {
                const info = text.split(':::').pop().split('-');
                ctx.service.xmpp.sendMsg(`${info[1]}   --来自机器人发送消息[代理自${this.app.to.split('@').shift()}]`, info[0] + '@' + xmppConfig.host);
                ctx.service.xmpp.sendMsg('"消息发送成功"');
            } else if (text.startsWith('send____image')) {
                const image = text.split(':::').pop();
                ctx.service.xmpp.sendMsg(`[obj type="image" value="${xmppConfig.imgUrl}${image}"]`);
                ctx.service.xmpp.sendMsg('"图片已发送"');
            } else if (text.startsWith('create____group')) {
                const users = text.split(':::').pop().split(',');
                ctx.service.xmpp.createGroup(users);
                console.log(users);
            } else {
                // 发送消息给xmpp服务器.
                ctx.service.xmpp.sendMsg(text);
            }

        });

        /* link to xmpp server. */
        const xmpp = client({
            service: xmppConfig.url,
            username: `${xmppConfig.robot}@${xmppConfig.host}`,
            password: xmppConfig.robotPwd,
        });

        isDev && debug(xmpp, true);

        xmpp.on('error', (err) => {
            console.error('xmpp error: ', err);
        });

        xmpp.on('offline', () => {
            console.log('xmpp offline');
        });

        xmpp.on('stanza', async (stanza) => {
            if(stanza.is('iq')) {
                console.log(stanza, stanza.children, 122111111);
            }

            if (stanza.is('message') && stanza.attrs.type === 'chat') {
                let to;

                if (stanza.attrs.from.match('/')) {
                    to = stanza.attrs.from.split('/')[0];
                } else {
                    to = stanza.attrs.from;
                }

                // 挂载xmpp当前用户信息.
                this.app.to = to;

                // 假设test06没有权限.
                if (to.split('@').shift() !== 'test06') {
                    ctx.service.botkit.deliverMessage(stanza.getChild('body').text());
                }

                // 停止xmpp连接.
                // await xmpp.stop();
            }
        });

        xmpp.on('online', async address => {
            // 挂载xmpp对向用户信息.
            this.app.address = address;

            // 告知xmpp可以收发消息了.
            await xmpp.send(xml('presence', {
                xmlns: 'http://jabber.org/protocol/caps',
                node: 'http://psi-im.org/caps',
                ver: 'caps-b75d8d2b25',
                ext: 'ca cs ep-notify-2 html'
            }));
        });

        xmpp.start();

        // xmpp和botkit socket相关.
        this.app.ws = ws;
        this.app.xml = xml;
        this.app.xmpp = xmpp;
    };
};

module.exports = AppBootHook;
