/* lowdb create. */
/* 负责生成对应的lowdb操作句柄, 传入文件路径 */

const LOW = require('lowdb');
const Service = require('egg').Service;
const FILE_ASYNC = require('lowdb/adapters/FileAsync');

class LowdbService extends Service {
    async getDbIns(path) {
        const basicPath = './data/';
        const DB_ADAPTER = new FILE_ASYNC(basicPath + path);
        return LOW(DB_ADAPTER);
    }
}

module.exports = LowdbService;