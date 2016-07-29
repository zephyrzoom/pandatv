#PandaTV弹幕助手
该弹幕助手通过分析抓包数据实现，仅供学习参考。
有三个版本可供选择，python、nodejs和electron。
程序已在Linuxmint、OSX、Win8.1下测试。

![login](/docs/static_files/login.png)

![danmu](/docs/static_files/danmu.png)

##下载
- 最新版本[release](https://github.com/zephyrzoom/pandatv/releases)

##如何运行
###python版
- 请确定已经安装了python3以上版本
- 编辑init.properties文件中的房间号
- 若双击无法运行，请从终端进入该程序目录运行命令:`python panda.py`

###node版
- 点开文件最后一行可以改房间号

###electron版
- 将文件部署在electron的resource中即可运行
- 不懂的请参考[electron](https://github.com/electron/electron)帮助文件

##关于MAC
*python版若需要提示框，请先安装[terminal-notifier](https://github.com/julienXX/terminal-notifier)*
