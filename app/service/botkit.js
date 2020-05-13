/* botkit create. */
/* 负责botkit相关操作 */

const Service = require('egg').Service;

class BotkitService extends Service {
    deliverMessage(message) {
        const { ws } = this.ctx.app;
        ws.send(JSON.stringify({
            type: 'message',
            text: `普通会员:${message}`,
            user: 'botkit_uuid',
            channel: 'socket'
        }));
    }
}

module.exports = BotkitService;