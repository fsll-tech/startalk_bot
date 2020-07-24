/* xmpp create. */
/* 负责xmpp相关操作 */

const Service = require('egg').Service;

class XMPPService extends Service {
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