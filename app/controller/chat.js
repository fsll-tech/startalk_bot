'use strict';
const Controller = require('egg').Controller;

class ChatController extends Controller {
    async reply() {
        const d = new Date();
        this.ctx.body = {
            msg: `正常轮询回复 ${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
        };
    };

    async leave() {
        this.ctx.body = {
            msg: '离开了页面, 暂停轮询'
        };
    };

    async back() {
        this.ctx.body = {
            msg: '重新回来了, 轮询继续'
        };
    };

    async sendMsg() {
        const { xmpp, xml, address } = this.ctx.app;
        const params = this.ctx.request.body;
        
        // 给test02发送一条消息.
        const message = xml('message', {
            from: address,
            type: 'chat',
            isHiddenMsg: '0',
            to: 'test02@dev.fsll.tech',
        }, xml('body', {
            maType: 6,
            msgType: 1,
            id: this.ctx.helper.createUUID()
        }, params.msg), xml('active', {
            xmlns: 'http://jabber.org/protocol/chatstates'
        }));
        await xmpp.send(message);

        this.ctx.body = {
            msg: 'ok'
        };
    };
}

module.exports = ChatController;
