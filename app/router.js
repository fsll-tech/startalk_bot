'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, controller } = app;

    // render.
    router.get('/', controller.pages.chat);

    // api.
    router.post('/reply', controller.chat.reply);
    router.post('/leave', controller.chat.leave);
    router.post('/back', controller.chat.back);
    router.post('/send', controller.chat.sendMsg);
};
