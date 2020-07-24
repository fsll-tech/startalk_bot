module.exports = app => {
    let originMsg, user;

    const AUTO_SEND_OPT = new app.BotkitConversation(app.config.botkitSessionId.DIALOG_ID_FOR_AUTO_SEND, app.bkController);

    // 对指定用户发送消息.
    app.bkController.hears(new RegExp('发送消息'), 'message', async (bot, message) => {
        originMsg = message;
        await bot.beginDialog(app.config.botkitSessionId.DIALOG_ID_FOR_AUTO_SEND);
    });
    AUTO_SEND_OPT.say('收到指令, 接下来准备发送消息.');
    AUTO_SEND_OPT.ask('请输入您要发送消息的用户:', async (response, convo, bot) => {
        user = convo.vars.user.split(':').pop();
    }, 'user');
    AUTO_SEND_OPT.ask('请输入您要发送的消息:', async (response, convo, bot) => {
        const msg = convo.vars.msg.split(':').pop();
        await bot.reply(originMsg, { text: `send____msg:::${user}-${msg}` });
    }, 'msg');

    app.bkController.addDialog(AUTO_SEND_OPT);
};