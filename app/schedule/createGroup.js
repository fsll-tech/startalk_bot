const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const request = require('request');

module.exports = app => {
    return {
        schedule: {
            interval: '5m',
            type: 'all'
        },
        async task(ctx) {
            // host: 域.
            const { host } = app.config.xmppConfig;
            const { xmpp, xml, address } = app;
            const id = ctx.helper.createUUID(),
                users = ['test01', 'test02', 'test03', 'test04'];

            // 包装xmpp标签.
            const createXmppTag = (msg) => {
                return xml('message', {
                    to: `${id}@conference.${host}`, // 给谁发消息.
                    from: address, // 谁发送的消息.
                    type: 'groupchat', // 消息类型, 单聊固定为chat.
                    isHiddenMsg: '0' // 固定为0
                }, xml('body', {
                    maType: 6, // 固定为6.
                    msgType: 1, // 固定为1.
                    id: ctx.helper.createUUID() // 每条消息的id.
                }, msg), xml('active', {
                    xmlns: 'http://jabber.org/protocol/chatstates'
                }));
            };
            
            /* 机器人创建一个群, 并将指定用户[users]拉进群. */
            
            // 创建群.
            const xmppTag = xml('iq', {
                id: id,
                type: 'set',
                to: `${id}@conference.${host}`
            }, xml('query', {
                xmlns: 'http://jabber.org/protocol/create_muc'
            }));
            await xmpp.send(xmppTag);

            // 监听创建群的结果, 成功的话将成员拉进去.
            xmpp.on('stanza', async (stanza) => {
                if (stanza.is('iq') && stanza.attrs.id === id) {
                    if (stanza.children[0].children[0].attrs.result === 'success') {
                        const groupTag = xml('iq', {
                            id: id,
                            type: 'set',
                            to: `${id}@conference.${host}`
                        }, xml('query', {
                            xmlns: 'http://jabber.org/protocol/muc#invite_v2'
                        }, users.map(user => xml('invite', {
                            nick: user,
                            jid: `${user}@${host}`
                        }))));
                        await xmpp.send(groupTag);
                        
                        // 提示消息.
                        const msgTag = createXmppTag('"群聊已创建成功"');
                        await xmpp.send(msgTag);
                    }
                }
            });
            
        },
    };
};