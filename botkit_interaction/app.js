const crypto = require('crypto');
const dayjs = require('dayjs');
const WebSocket = require('ws');
const debug = require('@xmpp/debug');
const Buffer = require('safe-buffer').Buffer;
const { client, xml } = require('@xmpp/client');
const { Botkit, BotkitConversation } = require('botkit');
const { WebAdapter } = require('botbuilder-adapter-web');

const adapter = new WebAdapter(/* options */);
const controller = new Botkit({ adapter });

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
        const sendMsg = async (msg, target, current) => {
            let { xmpp, xml, to, address } = ctx.app;

            if (target) to = target;
            if (current) address = current;

            const messageTag = xml('message', {
                to: to,
                from: address,
                type: 'chat',
                isHiddenMsg: '0'
            }, xml('body', {
                maType: 6,
                msgType: 1,
                id: ctx.helper.createUUID()
            }, msg), xml('active', {
                xmlns: 'http://jabber.org/protocol/chatstates'
            }));
            await xmpp.send(messageTag);
        };

        /* start the socket service. */
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

            console.log('botkit -->', text);

            // 判断消息类型.
            if (text.startsWith('send____msg')) {
                const info = text.split(':::').pop().split('-');
                sendMsg(`${info[1]}   --来自机器人发送消息[代理自${this.app.to.split('@').shift()}]`, info[0] + '@' + xmppConfig.host);
                sendMsg('"消息发送成功"');
            } else {
                // 发送消息给xmpp服务器.
                sendMsg(text);
            }
        });

        /* link to xmpp server. */
        /* 随时可以在任何挂载了xmpp实例的地方调用xmpp.stop()终止连接. */
        /* xmpp密钥生成 */
        let xmppSetData = await ctx.curl('https://dev.startalk.tech:8443/startalk_nav');
        xmppSetData = JSON.parse(xmppSetData.data.toString());

        // 获取fullkey.
        let FULLKEY = await ctx.curl(`${xmppSetData.baseaddess.javaurl}/qtapi/nck/rsa/get_public_key.do`);
        FULLKEY = JSON.parse(FULLKEY.data.toString());

        const username = `${xmppConfig.robot}@${xmppConfig.host}`;
        const encrypt = raw => (
            ctx.service.xmppEncrypt.create({
                key: FULLKEY.data.pub_key_fullkey,
                padding: 1
            }, raw).toString('base64')
        );
        const uinfo = {
            p: xmppConfig.robotPwd,
            a: 'testapp',
            u: username,
            d: dayjs().format('YYYY-MM-DD HH:mm:ss')
        };
        const encrypted = encrypt(new Buffer(JSON.stringify(uinfo)));

        const xmpp = client({
            service: xmppConfig.url,
            username: username,
            password: encrypted.toString('base64')
        });
        xmpp.start();

        isDev && debug(xmpp, true);

        xmpp.on('error', (err) => {
            console.error('xmpp 连接失败: ', err);
        });

        xmpp.on('offline', () => {
            console.log('xmpp 已离线');
        });

        xmpp.on('stanza', async (stanza) => {
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
                    ws.send(JSON.stringify({
                        type: 'message',
                        text: `普通会员:${stanza.getChild('body').text()}`,
                        user: 'botkit_uuid',
                        channel: 'socket'
                    }));
                }
            }
        });

        xmpp.on('online', async address => {
            console.log('xmpp 连接成功');

            // 挂载xmpp对向用户信息.
            this.app.address = address;

            // 告知xmpp可以收发消息了.
            await xmpp.send(xml('presence', {}, xml('priority', {}, 5), xml('c', {
                ext: 'ca cs ep-notify-2 html',
                node: 'http://psi-im.org/caps',
                ver: 'caps-b75d8d2b25',
                xmlns: 'http://jabber.org/protocol/caps'
            })));
        });

        // 心跳.
        setInterval(() => {
            ctx.service.pingPong.pingPong();
        }, 20000);

        // xmpp和socket相关.
        this.app.ws = ws;
        this.app.xml = xml;
        this.app.xmpp = xmpp;
    };
};

module.exports = AppBootHook;
