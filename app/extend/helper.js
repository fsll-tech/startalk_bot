module.exports = {
    // 创建xmpp心跳信息的uuid.
    createUUIDForXMPP(t) { 
        let e = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (t) { 
            let e = 16 * Math.random() | 0, n = "x" === t ? e : 3 & e | 8; 
            return n.toString(16)
        }); 
        return "string" == typeof t || "number" == typeof t ? e + ":" + t : e + "";
    }
}
