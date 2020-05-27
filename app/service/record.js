/* chat record. */
/* 负责生成对应的聊天记录操作句柄 */

const fs = require('fs');
const path = require('path');
const Service = require('egg').Service;

class ChatRecordService extends Service {
    async getChatDbIns() {
        // 检查聊天记录文件是否存在. 不存在的话则创建.
        const chatDir = path.join(__dirname, '../../data/chatRecord'),
            date = new Date;
        const todayFileName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.json`;
        if (!fs.existsSync(chatDir)) {
            fs.mkdirSync(chatDir);
        }

        // 检查今日的聊天记录文件是否存在, 不存在则创建.
        if (!fs.existsSync(`${chatDir}/${todayFileName}`)) {
            fs.writeFileSync(`${chatDir}/${todayFileName}`, '{"list":[]}');
        }

        // 将聊天记录操作句柄挂载到app上.
        this.ctx.app.chatDbIns = this.ctx.service.lowdb.getDbIns(`chatRecord/${todayFileName}`);
    }
}

module.exports = ChatRecordService;