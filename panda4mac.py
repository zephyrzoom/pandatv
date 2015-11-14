#!/usr/bin/python3
#author=zeek

import urllib.request
import socket
import json
import time
import threading
import re
import os

def notify(title, message):
    t = '-title {!r}'.format(title)
    m = '-message {!r}'.format(message)
    os.system('terminal-notifier {} -sound default'.format(' '.join([m, t])))

def getChatInfo(roomid):
    with urllib.request.urlopen('http://www.panda.tv/ajax_chatinfo?roomid=' + roomid) as f:
        data = f.read().decode('utf-8')
        chatInfo = json.loads(data)
        chatAddr = chatInfo['data']['chat_addr_list'][0]
        socketIP = chatAddr.split(':')[0]
        socketPort = int(chatAddr.split(':')[1])
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((socketIP,socketPort))
        rid      = str(chatInfo['data']['rid']).encode('utf-8')
        appid    = str(chatInfo['data']['appid']).encode('utf-8')
        authtype = str(chatInfo['data']['authtype']).encode('utf-8')
        sign     = str(chatInfo['data']['sign']).encode('utf-8')
        ts       = str(chatInfo['data']['ts']).encode('utf-8')
        secrt = b'\x00\x06\x00\x02'
        msg  = b'u:' + rid + b'@' + appid + b'\nk:1\nt:300\nts:' + ts + b'\nsign:' + sign + b'\nauthtype:' + authtype
        msgLen = len(msg)
        sendMsg = secrt + int.to_bytes(msgLen, 2, 'big') + msg
        s.sendall(sendMsg)
        recvMsg = s.recv(4)
        if recvMsg == b'\x00\x06\x00\x06':
            print('成功连接弹幕服务器')
            recvLen = int.from_bytes(s.recv(2), 'big')
        def keepalive():
            while True:
                s.send(b'\x00\x06\x00\x00')
                time.sleep(300)
        threading.Thread(target=keepalive).start()

        while True:
            recvMsg = s.recv(4)
            if recvMsg == b'\x00\x06\x00\x03':
                recvLen = int.from_bytes(s.recv(2), 'big')
                recvMsg = s.recv(recvLen)   #ack:0
                recvLen = int.from_bytes(s.recv(4), 'big')
                s.recv(16)
                recvLen -= 16
                recvMsg = b''
                flag = 0

                for i in range(recvLen):
                    tmp = s.recv(1)
                    recvMsg += tmp
                    if tmp == b'}':
                        flag += 1
                        if flag == 2:
                            recvLen -= (i+1)
                            if recvLen == 0:
                                flag = 0
                            break
                    elif flag == 1:
                        flag -= 1
                try:
                    jsonMsg = eval(recvMsg)
                    content = jsonMsg['data']['content']
                    if jsonMsg['type'] == '1':
                        nickName = jsonMsg['data']['from']['nickName']
                        print(nickName + ":" + content)
                        notify(nickName, content)
                    elif jsonMsg['type'] == '206':
                        nickName = jsonMsg['data']['from']['nickName']
                        print(nickName + "送给主播" + content + "个竹子")
                        notify(nickName, "送给主播" + content + "个竹子")
                    elif jsonMsg['type'] == '207':
                        print('=========观众人数' + content + '=========')
                    else:
                        pass
                except Exception as e:
                    pass

                if flag == 2:
                    s.recv(16)
                    recvLen -= 16
                    recvMsg = s.recv(recvLen)
                    try:
                        jsonMsg = eval(recvMsg)
                        content = jsonMsg['data']['content']
                        if jsonMsg['type'] == '1':
                            nickName = jsonMsg['data']['from']['nickName']
                            print(nickName + ":" + content)
                            notify(nickName, content)
                        elif jsonMsg['type'] == '206':
                            nickName = jsonMsg['data']['from']['nickName']
                            print(nickName + "送给主播" + content + "竹子")
                            notify(nickName, "送给主播" + content + "竹子")
                        elif jsonMsg['type'] == '207':
                            print('=========观众人数' + content + '=========')
                        else:
                            pass
                    except Exception as e:
                        pass

def main():
    roomid = input('roomid:')
    getChatInfo(roomid)

if __name__ == '__main__':
    main()
