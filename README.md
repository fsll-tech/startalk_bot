# startalk_bot 项目介绍

## introduction
该分支包含了所有基础功能, 包括:
- 机器人每隔5秒自动给指定用户发送消息
- 机器人每隔5秒自动给指定群发送消息
- 机器人自动创建群并发送一条初始化消息
- 机器人自动上传图片到星语服务器同时将图片发送给指定用户
- 机器人自动回复消息, 对于群机器人将返回一条带有消息来源用户名的消息; 对于用户, 机器人随机发送一条问候语
- 机器人通过botkit进行交互式操作

## 目录结构
- auto_create_group  机器人自动创建群
- auto_reply 机器人自动回复
- auto_send_group_chat 机器人自动发送群消息
- auto_send_img 机器人自动发送图片
- auto_send_single_chat 机器人自动发送单聊消息
- botkit_interaction 机器人操作botkit