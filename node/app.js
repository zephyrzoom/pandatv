var http = require('http');
var net = require('net');

const CHATROOM = 'http://riven.panda.tv/chatroom/getinfo?roomid=';

function getChatInfo(roomid) {
    http.get(CHATROOM + roomid, function(res) {
        res.on('data', function(chunk) {
            var json = JSON.parse(chunk);
            var jsonData = json.data;
            var chatAddr = jsonData.chat_addr_list[0];
            var socketIP = chatAddr.split(':')[0];
            var socketPort = chatAddr.split(':')[1];
            var rid = jsonData.rid;
            var appid = jsonData.appid;
            var authtype = jsonData.authType;
            var sign = jsonData.sign;
            var ts = jsonData.ts;
            //console.log(socketIP, socketPort, rid, appid, authtype, sign, ts);

            var chatInfo = {
                "socketIP": socketIP,
                "socketPort": socketPort,
                "rid": rid,
                "appid": appid,
                "authtype": authtype,
                "sign": sign,
                "ts": ts
            };
            start(chatInfo);
        });
    });
}

function start(chatInfo) {
    var s = net.connect({
      port: chatInfo['socketPort'],
      host: chatInfo['socketIP']
    }, function() {
      console.log('connect success');
    });

    var msg = 'u:' + chatInfo['rid']
                   + '@' + chatInfo['appid']
                   + '\nk:1\nt:300\nts:' + chatInfo['ts']
                   + '\nsign:' + chatInfo['sign']
                   + '\nauthtype:' + chatInfo['authtype'];
    sendData(s, msg);

    var completeMsg = [];
    s.on('data', function(chunk) {
        completeMsg.push(chunk);
        chunk = Buffer.concat(completeMsg);
        if (chunk.readInt16BE(0) == 6 && chunk.readInt16BE(2) == 6) {
            console.log('login');
            completeMsg = [];
        } else if (chunk.readInt16BE(0) == 6 && chunk.readInt16BE(2) == 3) {
            var msg = getMsg(chunk);
            if (msg[0].length < msg[1]) {
                console.log('parted');
            } else {
                analyseMsg(msg[0]);
                completeMsg = [];
            }
        } else if (chunk.readInt16BE(0) == 6 && chunk.readInt16BE(2) == 1) {
            console.log('keepalive');
            completeMsg = [];
        }else {
            console.log('error');
            console.log(chunk);
            completeMsg = [];
        }
    });

    setInterval(function() {
        sendKeepalive(s);
    }, 150000);
}


function sendData(s, msg) {
    var data = new Buffer(msg.length + 6);
    data.writeInt16BE(6, 0);
    data.writeInt16BE(2, 2);
    data.writeInt16BE(msg.length, 4);
    data.write(msg, 6);
    s.write(data);
}

function sendKeepalive(s) {
    var data = new Buffer(4);
    data.writeInt16BE(6, 0);
    data.writeInt16BE(0, 2);
    s.write(data);
}

function getMsg(chunk) {
    var msgLen = chunk.readInt16BE(4);
    var msg = chunk.slice(6, 6 + msgLen);
    var offset = 6 + msgLen;
    msgLen = chunk.readInt32BE(offset);
    offset += 4;
    msgInfo = [];
    msgInfo.push(chunk.slice(offset, offset + msgLen));
    msgInfo.push(msgLen);
    return msgInfo;
}

function analyseMsg(totalMsg) {
    while (totalMsg.length > 0) {
        var IGNORE_LEN = 12;
        totalMsg = totalMsg.slice(IGNORE_LEN);
        var msgLen = totalMsg.readInt32BE(0);
        var msg = totalMsg.slice(4, 4 + msgLen);
        formatMsg(msg);
        totalMsg = totalMsg.slice(4 + msgLen);
    }
}

function formatMsg(msg) {
    var DANMU_TYPE = '1'
    var BAMBOO_TYPE = '206'
    var AUDIENCE_TYPE = '207'
    var TU_HAO_TYPE = '306'
    var MANAGER = '60'
    var SP_MANAGER = '120'
    var HOSTER = '90'
    msg = JSON.parse(msg);
    var content = msg.data.content;
    if (msg.type == DANMU_TYPE) {
        var identity = msg.data.from.identity;
        var nickName = msg.data.from.nickName;
        if (msg.data.from.sp_identity == SP_MANAGER) {
            nickName = '*超管*' + nickName;
        }
        if (identity == MANAGER) {
            nickName = '*房管*' + nickName;
        } else if (identity == HOSTER) {
            nickName = '*主播*' + nickName;
        }
        console.log(nickName + ':' + content);
    } else if (msg.type == BAMBOO_TYPE) {
        nickName = msg.data.from.nickName;
        console.log(nickName + '送给主播[' + content + ']个竹子');
    } else if (msg.type == TU_HAO_TYPE) {
        nickName = msg.data.from.nickName;
        price = msg.data.content.price;
        console.log('*******' + nickName + '送给主播[' + price + ']个猫币' + '*******');
    } else if (msg.type == AUDIENCE_TYPE) {
        console.log('==========观众人数' + content + '==========');
    }
}
getChatInfo(89757);
