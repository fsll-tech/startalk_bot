const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const request = require('request');

module.exports = app => {
    return {
        schedule: {
            interval: '5s',
            type: 'all'
        },
        async task(ctx) {
            // host: 域.
            const { host, robot, imgUrl } = app.config.xmppConfig;
            const { xmpp, xml, address, ckey, keyVal } = app;

            // 包装xmpp标签.
            const createXmppTag = (msg) => {
                return xml('message', {
                    to: `test04@${host}`, // 给谁发消息.
                    from: address, // 谁发送的消息.
                    type: 'chat', // 消息类型, 单聊固定为chat.
                    isHiddenMsg: '0' // 固定为0
                }, xml('body', {
                    maType: 6, // 固定为6.
                    msgType: 1, // 固定为1.
                    id: ctx.helper.createUUID() // 每条消息的id.
                }, msg), xml('active', {
                    xmlns: 'http://jabber.org/protocol/chatstates'
                }));
            };
            
            /* 将指定目录的一张图片上传到星语服务器, 再通过xmpp发送给指定的用户. */
            /* 如果图片已经上传过, 则不再重复上传. */
            /* 图片上传成功后, 将图片下载下来保存到本地, 以后发送的图片都用过本地保存的图片副本发送. */
            /* data/img 暂时只支持存放一张样本图片, 可随意替换该图片 */

            const chatImgPath = path.resolve(__dirname, '../../data/chatImg');

            // 先检测是否有本地图片副本.
            if (!fs.existsSync(chatImgPath)) {
                const imgNameArr = fs.readdirSync(path.resolve(__dirname, '../../data/img'));
                const localImgName = imgNameArr[0];

                // 调用星语文件上传接口. k: key_value key: md5(uuid)
                const result = await ctx.curl(`https://${host}:8443/file/v2/upload/img?name=${localImgName}&size=1&u=${robot}&k=${keyVal}&key=${crypto.createHash('md5').update(ctx.helper.createUUID()).digest('hex')}&p=qim_web`, {
                    method: 'POST',
                    dataType: 'json',
                    files: path.resolve(__dirname, `../../data/img/${localImgName}`)
                });

                // 图片上传成功.
                if (result.data.ret) {
                    const imgPath = result.data.data;
                    const imgName = imgPath.split('/').pop().split('?').shift();

                    // 创建本地图片副本目录.
                    fs.mkdirSync(chatImgPath);

                    // 下载星语服务器上的图片并保存到本地副本中.
                    let stream = fs.createWriteStream(path.join(__dirname, `../../data/chatImg/${imgName}`));
                    request(imgPath).pipe(stream).on('close', function (err) {
                        console.log(`"图片${localImgName}已保存"`);
                    });

                    // 读取本地图片副本并发送出去.
                    const imgNameArr = fs.readdirSync(chatImgPath);
                    const imgTag = createXmppTag(`[obj type="image" value="${imgUrl}${imgNameArr[0]}"]`);
                    const msgTag = createXmppTag(`发送时间: ${new Date}`);
                    await xmpp.send(imgTag);
                    await xmpp.send(msgTag);
                }else {
                    // 图片上传失败.
                    // some code.
                }
            } else { // 本地图片副本已有图片, 直接读取发送.
                const imgNameArr = fs.readdirSync(chatImgPath);
                const imgTag = createXmppTag(`[obj type="image" value="${imgUrl}${imgNameArr[0]}"]`);
                const msgTag = createXmppTag(`发送时间: ${new Date}`);
                await xmpp.send(imgTag);
                await xmpp.send(msgTag);
            }
        },
    };
};