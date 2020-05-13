/* xmpp create. */
/* 负责xmpp相关操作 */

const Service = require('egg').Service;

class XMPPService extends Service {
    // 发送消息.
    async sendMsg(msg, target, current) {
        let { xmpp, xml, to, address } = this.ctx.app;

        if(target) to = target;
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
        const { xmpp, xml } = this.ctx.app;
        const id = this.ctx.helper.createUUID();

        const xmppTag = xml('iq', {
            id: id,
            type: 'set',
            to: `${id}@conference.${this.ctx.app.config.xmppConfig.host}`
        }, xml('query', {
            xmlns: 'http://jabber.org/protocol/create_muc'
        }));

        xmpp.send(xmppTag).then(res => {
            console.log(res);
        });
    };
}

module.exports = XMPPService;