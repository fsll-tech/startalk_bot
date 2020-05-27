module.exports = app => {
    return {
        schedule: {
            cron: app.config.chatRecordTick, 
            type: 'all',
        },
        async task(ctx) {
            ctx.service.record.getChatDbIns();
        },
    };
};