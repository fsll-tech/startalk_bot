/* Robot local image catalog generation. */
/* 负责机器人图片相关 */

const path = require('path');
const Service = require('egg').Service;

class ImageService extends Service {
    async getImgPath() {
        return {
            imgPath: path.join(__dirname, '../../data/chatImg'),
            userPath: path.join(__dirname, `../../data/chatImg/${this.ctx.app.to}`)
        };
    }
}

module.exports = ImageService;