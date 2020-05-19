const crypto = require('crypto');

module.exports = {
    md5Pwd(password) {
        var md5 = crypto.createHash('md5');
        return md5.update(password).digest('hex');
    },

    cryptPwd(password, pwdSalt) {
        var md1 = this.md5Pwd(password);
        var md2 = this.md5Pwd(md1 + pwdSalt);
        var md3 = this.md5Pwd(md2);
        return "CRY:" + md3;
    },

    // 接口统一返回数据格式.
    dataFormat(data, msg, flag) {
        if (flag) {
            return {
                msg: msg,
                data: data,
                success: true
            };
        } else {
            return {
                msg: msg,
                data: null,
                success: false
            };
        }
    },

    // 创建UUID.
    createUUID() {
        let d = new Date().getTime();
        const uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid.toUpperCase();
    },

    // 创建xmpp心跳信息的uuid.
    createUUIDForXMPP(t) { 
        let e = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (t) { 
            let e = 16 * Math.random() | 0, n = "x" === t ? e : 3 & e | 8; 
            return n.toString(16)
        }); 
        return "string" == typeof t || "number" == typeof t ? e + ":" + t : e + "";
    }
}
