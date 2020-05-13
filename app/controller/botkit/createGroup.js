module.exports = app => {
    let originMsg, users;
    const CREATE_GROUP_OPT = new app.BotkitConversation(app.config.botkitSessionId.DIALOG_ID_FOR_AUTO_SEND_CREATE_GROUP, app.bkController);

    // 对指定用户发送消息.
    app.bkController.hears(['创建群聊', '建群'], 'message', async (bot, message) => {
        originMsg = message;
        await bot.beginDialog(app.config.botkitSessionId.DIALOG_ID_FOR_AUTO_SEND_CREATE_GROUP);
    });
    CREATE_GROUP_OPT.say('收到指令, 接下来准备创建群聊.');
    CREATE_GROUP_OPT.ask('请输入您要加入群聊的用户, 用逗号分隔:', async (response, convo, bot) => {
        users = convo.vars.users.split(':').pop();
        await bot.reply(originMsg, { text: `create____group:::${users}` });
    }, 'users');

    app.bkController.addDialog(CREATE_GROUP_OPT);
};