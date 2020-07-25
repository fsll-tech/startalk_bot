const crypto = require('crypto');
const dayjs = require('dayjs');
const debug = require('@xmpp/debug');
const Buffer = require('safe-buffer').Buffer;
const { client, xml } = require('@xmpp/client');

// mount global variables.
class AppBootHook {
    constructor(app) {
        // 挂载app实例.
        this.app = app;
    }

    async willReady() {
        const ctx = this.app.createAnonymousContext();
        const { xmppConfig, isDev } = this.app.config;

        /* link to xmpp server. */
        /* 随时可以在任何挂载了xmpp实例的地方调用xmpp.stop()终止连接. */
        /* xmpp密钥生成 */
        let xmppSetData = await ctx.curl(nav_url);
        xmppSetData = JSON.parse(xmppSetData.data.toString());

        // 获取fullkey.
        let FULLKEY = await ctx.curl(key_url);
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
                // if (to.split('@').shift() !== 'test06') {
                //     ctx.service.botkit.deliverMessage(stanza.getChild('body').text());
                // }

                // 自动给用户回复一条消息.
                // 包装xmpp标签.
                const createXmppTag = (msg) => {
                    return xml('message', {
                        to: stanza.attrs.from, // 给谁发消息.
                        from: stanza.attrs.to, // 谁发送的消息.
                        type: 'chat', // 消息类型.
                        isHiddenMsg: '0' // 固定为0.
                    }, xml('body', {
                        maType: 6, // 固定为6.
                        msgType: 1, // 固定为1.
                        id: ctx.helper.createUUID() // 每条消息的id.
                    }, msg), xml('active', {
                        xmlns: 'http://jabber.org/protocol/chatstates'
                    }));
                };
                const msgs = ['你好啊', '我在', '有什么事儿吗?'];
                const idx = parseInt(Math.random() * (msgs.length - 0) + 0, 10);
                const autoReplyTag = createXmppTag(msgs[idx]);
                xmpp.send(autoReplyTag);
            }

            // 监听群聊消息并自动回复(自动加上用户名)
            if (stanza.is('message') && stanza.attrs.type === 'groupchat' && stanza.attrs.sendjid !== `${xmppConfig.robot}@${xmppConfig.host}`) {
                const groupid = stanza.attrs.from.split('/').shift();
                // 包装xmpp标签.
                const createXmppTag = (msg) => {
                    return xml('message', {
                        to: groupid, // 给谁发消息.
                        from: stanza.attrs.to, // 谁发送的消息.
                        type: 'groupchat', // 消息类型.
                        isHiddenMsg: '0' // 固定为0.
                    }, xml('body', {
                        maType: 6, // 固定为6.
                        msgType: 1, // 固定为1.
                        id: ctx.helper.createUUID() // 每条消息的id.
                    }, msg), xml('active', {
                        xmlns: 'http://jabber.org/protocol/chatstates'
                    }));
                };
                const autoReplyTag = createXmppTag(`机器人自动回复(用户: ${stanza.attrs.sendjid})`);
                xmpp.send(autoReplyTag);
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

        // xmpp相关.
        this.app.xml = xml;
        this.app.xmpp = xmpp;
    };
};

module.exports = AppBootHook;
