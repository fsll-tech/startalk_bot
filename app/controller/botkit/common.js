const fs = require('fs');
const path = require('path');
const request = require('request');

module.exports = app => {
    const ctx = app.createAnonymousContext();

    // 监听所有消息(问候或提示).
    app.bkController.on('message', async (bot, message) => {
        console.log(message.text, 'botkit server message event');
        app.chatDbIns.then(dbs => dbs.get('list').push({ user: app.to, message: message.text.split(':').pop() }).write());

        if (message.text.match('管理员:')) {
            await bot.reply(message, {
                text: '值班小助手暂时不能识别，建议您检查或者完善关键字。当前您为管理员，可以进行一系列操作, 请查阅文档'
            })
        } else {
            const TEXT = message.text;

            // 如果消息中包含图片, 则将图片保存下来.
            const IMG_FLAG = TEXT.includes('type="image"');
            const PATH_MAPS = await ctx.service.image.getImgPath();

            if (IMG_FLAG) {
                const IMG_PATH = TEXT.match(/(http[s]?:\/\/([\w-]+.)+([:\d+])?(\/[\w-\.\/\?%&=]*)?)/gi)[0].replace(/\"$/g, '');

                // 先检测图片目录是否存在, 不存在先创建.
                if (!fs.existsSync(PATH_MAPS.imgPath)) {
                    fs.mkdirSync(PATH_MAPS.imgPath);
                }

                // 再检测用户图片目录是否存在, 不存在先创建.
                if (!fs.existsSync(PATH_MAPS.userPath)) {
                    fs.mkdirSync(PATH_MAPS.userPath);
                }

                // 下载图片.
                let imgName = IMG_PATH.split('/').pop().split('?').shift();
                let stream = fs.createWriteStream(path.join(PATH_MAPS.userPath, imgName));
                request(IMG_PATH).pipe(stream).on('close', function (err) {
                    console.log(`"图片${imgName}已保存"`);
                });
                await bot.reply(message, {
                    text: `"图片「${imgName}」已保存"`
                });
            } else {
                const RANDOM_GREETING = ['HI', 'Hello', '您好，我是值班小助手', '忙碌的工作之后一定要注意休息哦', '您好', '愿一个问候带给你一个新的心情，愿一个祝福带给你一个新的出发点', '时间因祝福而流光溢彩，空气因祝福而芬芳袭人，心情因祝福而花开灿烂，当您看到我的时候，愿祝福让您轻松此时此刻!生活愉快!'];
                const IDX = parseInt(Math.random() * (RANDOM_GREETING.length - 0) + 0, 10);
                await bot.reply(message, {
                    text: `${RANDOM_GREETING[IDX]}`
                });
            }
        }
    });

    //中止对话
    app.bkController.interrupts(['quit', 'exit', '退出', '中止'], ['message'], async (bot, message) => {
        app.chatDbIns.then(dbs => dbs.get('list').push({ user: app.to, message: message.text.split(':').pop() }).write());
        await bot.reply(message, '"已退出对话"');
        await bot.cancelAllDialogs();  // cancel any active dialogs
    });
}
