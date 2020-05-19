/* xmpp create. */
/* 负责xmpp相关操作 */

const Service = require('egg').Service;

class XMPPService extends Service {
    // 发送消息.
    async sendMsg(msg, target, current) {
        let { xmpp, xml, to, address } = this.ctx.app;

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
            id: this.ctx.helper.createUUID()
        }, msg), xml('active', {
            xmlns: 'http://jabber.org/protocol/chatstates'
        }));
        await xmpp.send(messageTag);
    };

    // 创建群.
    async createGroup(users) {
        const { xmpp, xml, config } = this.ctx.app;
        const { host } = config.xmppConfig;
        const id = this.ctx.helper.createUUID();

        const xmppTag = xml('iq', {
            id: id,
            type: 'set',
            to: `${id}@conference.${host}`
        }, xml('query', {
            xmlns: 'http://jabber.org/protocol/create_muc'
        }));

        await xmpp.send(xmppTag);

        // 监听创建群的结果, 成功的话将成员拉进去.
        xmpp.on('stanza', async (stanza) => {
            if (stanza.is('iq') && stanza.attrs.id === id) {
                if (stanza.children[0].children[0].attrs.result === 'success') {
                    const groupTag = xml('iq', {
                        id: id,
                        type: 'set',
                        to: `${id}@conference.${host}`
                    }, xml('query', {
                        xmlns: 'http://jabber.org/protocol/muc#invite_v2'
                    }, users.map(user => xml('invite', {
                        nick: user,
                        jid: `${user}@${host}`
                    }))));
                    await xmpp.send(groupTag);
                    this.sendMsg('"群聊已创建成功"');
                }
            }
        });
    };

    // 发送心跳信息.
    async pingPong() {
        const { xmpp, xml, to } = this.ctx.app;
        const id = this.ctx.helper.createUUIDForXMPP('ping');
        const pingTag = xml('iq', {
            type: 'get',
            to: to,
            id: id
        }, xml('ping', {
            xmlns: 'urn:xmpp:ping'
        }));
        await xmpp.send(pingTag);

        // 监听ping发送结果, 成功则发送一个pong信息.
        xmpp.on('stanza', async (stanza) => {
            if (stanza.is('iq') && stanza.attrs.id === id && stanza.attrs.id.indexOf(':ping') > -1) {
                const pongTag = xml('iq', {
                    type: 'result',
                    to: stanza.attrs.from,
                    id: stanza.attrs.id
                });
                await xmpp.send(pongTag);
            }
        });
    };
}

module.exports = XMPPService;