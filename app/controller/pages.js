'use strict';

const Controller = require('egg').Controller;

class PagesController extends Controller {
    async chat() {
        await this.ctx.render('chat/chat-html.njk');
    };
}

module.exports = PagesController;
