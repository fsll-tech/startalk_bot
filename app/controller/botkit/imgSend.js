const fs = require('fs');

module.exports = app => {
    // 生成ctx运行时.
    const ctx = app.createAnonymousContext();

    const IMG_SEND_OPT = new app.BotkitConversation(app.config.botkitSessionId.DIALOG_ID_FOR_IMG_SEND, app.bkController);

    // 发送随机图片给用户.
    app.bkController.hears(new RegExp('发送图片'), 'message', async (bot, message) => {
        app.chatDbIns.then(dbs => dbs.get('list').push({ user: app.to, message: message.text.split(':').pop() }).write());

        const pathMaps = await ctx.service.image.getImgPath();

        // 查看用户图片目录是否存在.
        if (!fs.existsSync(pathMaps.userPath)) {
            await bot.reply(message, { text: JSON.stringify('机器人图片库暂时还没有图片') });
        } else {
            const files = await fs.readdirSync(pathMaps.userPath);
            const idx = parseInt(Math.random() * (files.length - 0) + 0, 10);
            if (files.length) {
                await bot.reply(message, { text: `send____image:::${files[idx]}` });
            } else {
                await bot.reply(message, { text: JSON.stringify('机器人图片库暂时还没有图片') });
            }
        }
    });

    app.bkController.addDialog(IMG_SEND_OPT);
};