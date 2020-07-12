module.exports = app => {
    return {
        schedule: {
            interval: '5s',
            type: 'all'
        },
        async task(ctx) {
            // host: 域.
            const { host } = app.config.xmppConfig;
            const { xmpp, xml, address } = app;

            // 包装xmpp标签.
            const messageTag = xml('message', {
                to: `test04@${host}`, // 给谁发消息.
                from: address, // 谁发送的消息.
                type: 'chat', // 消息类型, 单聊固定为chat.
                isHiddenMsg: '0' // 固定为0
            }, xml('body', {
                maType: 6, // 固定为6.
                msgType: 1, // 固定为1.
                id: ctx.helper.createUUID() // 每条消息的id.
            }, `机器人自动发送消息${new Date()}`), xml('active', {
                xmlns: 'http://jabber.org/protocol/chatstates'
            }));

            // 发送xmpp消息.
            await xmpp.send(messageTag);
        },
    };
};