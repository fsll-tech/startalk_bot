## introduction
机器人自动发送图片给某人 for nodejs
- 获取xmpp服务器返回的key_value
- 通过key_value生成ckey
- 存储两者
- 通过ckey和key_value调用星语图片上传接口 todo
- 通过图片上传接口地址下载图片并存储到本机 todo
- 通过图片名称和远程图片地址组合发送图片给某个用户并显示 todo

## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org