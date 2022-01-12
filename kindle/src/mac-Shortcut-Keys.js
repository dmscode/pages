var shortcuts = [
  {
    title: "常用",
    table: [
      {
        keySource: "Command-X",
        key: [["Command", "X"]],
        desc: "剪切所选项并拷贝到剪贴板",
      },
      {
        keySource: "Command-C",
        key: [["Command", "C"]],
        desc: "将所选项拷贝到剪贴板。这同样适用于“访达”中的文件",
      },
      {
        keySource: "Command-V",
        key: [["Command", "V"]],
        desc: "将剪贴板的内容粘贴到当前文稿或应用中。这同样适用于“访达”中的文件",
      },
      {
        keySource: "Command-Z",
        key: [["Command", "Z"]],
        desc: "撤销上一个命令",
      },
      {
        keySource: "Command-Z",
        key: [["Shift", "Command", "Z"]],
        desc: "重做，从而反向执行撤销命令。在某些应用中，您可以撤销和重做多个命令",
      },
      { keySource: "Command-A", key: [["Command", "A"]], desc: "全选各项" },
      {
        keySource: "Command-F",
        key: [["Command", "F"]],
        desc: "查找文稿中的项目或打开“查找”窗口",
      },
      {
        keySource: "Command-G",
        key: [["Command", "G"]],
        desc: "再次查找：查找之前所找到项目出现的下一个位置",
      },
      {
        keySource: "Command-G",
        key: [["Shift", "Command", "G"]],
        desc: "再次查找：查找之前所找到项目出现的上一个位置",
      },
      {
        keySource: "Command-H",
        key: [["Command", "H"]],
        desc: "隐藏最前面的应用的窗口",
      },
      {
        keySource: "Command-H",
        key: [["Option", "Command", "H"]],
        desc: "查看最前面的应用但隐藏所有其他应用",
      },
      {
        keySource: "Command-M",
        key: [["Command", "M"]],
        desc: "将最前面的窗口最小化至“程序坞”",
      },
      {
        keySource: "Command-M",
        key: [["Option", "Command", "M"]],
        desc: "最小化最前面的应用的所有窗口",
      },
      {
        keySource: "Command-O",
        key: [["Command", "O"]],
        desc: "打开所选项，或打开一个对话框以选择要打开的文件",
      },
      {
        keySource: "Command-P",
        key: [["Command", "P"]],
        desc: "打印当前文稿",
      },
      {
        keySource: "Command-S",
        key: [["Command", "S"]],
        desc: "存储当前文稿",
      },
      {
        keySource: "Command-T",
        key: [["Command", "T"]],
        desc: "打开新标签页",
      },
      {
        keySource: "Command-W",
        key: [["Command", "W"]],
        desc: "关闭最前面的窗口",
      },
      {
        keySource: "Command-W",
        key: [["Option", "Command", "W"]],
        desc: "关闭应用的所有窗口",
      },
      {
        keySource: "Option-Command-Esc",
        key: [["Option", "Command", "Esc"]],
        desc: "强制退出应用",
      },
      {
        keySource: "Command-空格键",
        key: [["Command", "Space"]],
        desc: "显示或隐藏“聚焦”搜索栏",
      },
      {
        keySource: "Command-空格键",
        key: [["Command", "Option", "Space"]],
        desc: "从“访达”窗口进行“聚焦”搜索",
      },
      {
        keySource: "Control-Command–空格键",
        key: [["Control", "Command", "Space"]],
        desc: "显示字符检视器，您可以从中选择表情符号和其他符号",
      },
      {
        keySource: "Control-Command-F",
        key: [["Control", "Command", "F"]],
        desc: "全屏使用应用（如果应用支持）",
      },
      {
        keySource: "Space",
        key: [["Space"]],
        desc: "使用“快速查看”来预览所选项",
      },
      {
        keySource: "Command-Tab",
        key: [["Command", "Tab"]],
        desc: "在多个打开的 App 之间切换到下一个最近使用的 App",
      },
      {
        keySource: "Shift-Command-5",
        key: [["Shift", "Command", "5"], ["Shift", "Command", "3"], ["Shift", "Command", "4"]],
        desc: "在 macOS Mojave 或更高版本中，拍摄截屏或录制屏幕",
      },
      {
        keySource: "Shift-Command-N",
        key: [["Shift", "Command", "N"]],
        desc: "在“访达”中创建一个新文件夹",
      },
      {
        keySource: "Command-逗号 (,)",
        key: [["Command", ","]],
        desc: "打开最前面的应用的偏好设置",
      },
    ],
  },
  {
    title: "电源",
    table: [
      {
        keySource: "电源按钮",
        key: [["电源按钮"]],
        desc: "短按开机或从睡眠状态唤醒。按住 1.5 秒进入睡眠状态（非触控式）。继续按住则会强制关机",
      },
      {
        keySource:
          "Option–Command–电源按钮*或 Option–Command–Media Eject（Option–Command–介质推出键）",
        key: [
          ["Option", "Command", "电源按钮"],
          ["Option", "Command", "Media Eject"],
          ["Option", "Command", "介质推出键"],
        ],
        desc: "将您的 Mac 置于睡眠状态",
      },
      {
        keySource:
          "Control–Shift–电源按钮*或 Control–Shift–Media Eject（Control–Shift–介质推出键）",
        key: [
          ["Control", "Shift", "电源按钮"],
          ["Control", "Shift", "Media Eject"],
          ["Control", "Shift", "介质推出键"],
        ],
        desc: "将显示器置于睡眠状态",
      },
      {
        keySource: "Control–电源按钮* 或 Control–介质推出键",
        key: [
          ["Control", "电源按钮"],
          ["Control", "介质推出键"],
        ],
        desc: "显示一个对话框，询问您是要重新启动、睡眠还是关机",
      },
      {
        keySource: "Control–Command–电源按钮*",
        key: [["Control", "Command", "电源按钮"]],
        desc: "强制 Mac 重新启动，系统不会提示是否要存储任何打开且未存储的文稿",
      },
      {
        keySource: "Control–Command–Media Eject（Control–Command–介质推出键）",
        key: [
          ["Control", "Command", "Media Eject"],
          ["Control", "Command", "介质推出键"],
        ],
        desc: "退出所有应用，然后重新启动您的 Mac。如果任何打开的文稿有未存储的更改，系统会询问您是否要存储这些更改",
      },
      {
        keySource:
          "Control–Option–Command–电源按钮* 或 Control–Option–Command–介质推出键",
        key: [
          ["Control", "Option", "Command", "电源按钮"],
          ["Control", "Option", "Command", "介质推出键"],
        ],
        desc: "退出所有 App，然后将您的 Mac 关机。如果任何打开的文稿有未存储的更改，系统会询问您是否要存储这些更改",
      },
      {
        keySource: "Control-Command-Q",
        key: [["Control", "Command", "Q"]],
        desc: "立即锁定屏幕",
      },
      {
        keySource: "Shift–Command–Q",
        key: [["Shift", "Command", "Q"]],
        desc: "退出登录您的 macOS 用户帐户。系统将提示您确认",
      },
      {
        keySource: "Shift–Command–Q",
        key: [["Option", "Shift", "Command", "Q"]],
        desc: "在不确认的情况下立即退出登录您的 macOS 用户帐户",
      },
    ],
  },
  {
    title: "访达和系统",
    table: [
      {
        keySource: "Command-D",
        key: [["Command", "D"]],
        desc: "复制所选文件",
      },
      {
        keySource: "Command-E",
        key: [["Command", "E"]],
        desc: "推出所选磁盘或宗卷",
      },
      {
        keySource: "Command-F",
        key: [["Command", "F"]],
        desc: "在“访达”窗口中开始“聚焦”搜索",
      },
      {
        keySource: "Command-I",
        key: [["Command", "I"]],
        desc: "显示所选文件的“显示简介”窗口",
      },
      {
        keySource: "Command-R",
        key: [["Command", "R"]],
        desc: "(1) 如果在“访达”中选择了某个别名：显示所选别名对应的原始文件。<br>(2) 在某些应用（如“日历”或 Safari 浏览器）中，刷新或重新载入页面。<br>(3) 在“软件更新”偏好设置中，再次检查有没有软件更新",
      },
      {
        keySource: "Shift-Command-C",
        key: [["Shift", "Command", "C"]],
        desc: "打开“电脑”窗口",
      },
      {
        keySource: "Shift-Command-D",
        key: [["Shift", "Command", "D"]],
        desc: "打开“桌面”文件夹",
      },
      {
        keySource: "Shift-Command-F",
        key: [["Shift", "Command", "F"]],
        desc: "打开“最近使用”窗口，其中显示了您最近查看或更改过的所有文件",
      },
      {
        keySource: "Shift-Command-G",
        key: [["Shift", "Command", "G"]],
        desc: "打开“前往文件夹”窗口",
      },
      {
        keySource: "Shift-Command-H",
        key: [["Shift", "Command", "H"]],
        desc: "打开当前 macOS 用户帐户的个人文件夹",
      },
      {
        keySource: "Shift-Command-I",
        key: [["Shift", "Command", "I"]],
        desc: "打开 iCloud 云盘",
      },
      {
        keySource: "Shift-Command-K",
        key: [["Shift", "Command", "K"]],
        desc: "打开“网络”窗口",
      },
      {
        keySource: "Option-Command-L",
        key: [["Option", "Command", "L"]],
        desc: "打开“下载”文件夹",
      },
      {
        keySource: "Shift-Command-N",
        key: [["Shift", "Command", "N"]],
        desc: "新建文件夹",
      },
      {
        keySource: "Shift-Command-O",
        key: [["Shift", "Command", "O"]],
        desc: "打开“文稿”文件夹",
      },
      {
        keySource: "Shift-Command-P",
        key: [["Shift", "Command", "P"]],
        desc: "在“访达”窗口中显示或隐藏预览面板",
      },
      {
        keySource: "Shift-Command-R",
        key: [["Shift", "Command", "R"]],
        desc: "打开“隔空投送”窗口",
      },
      {
        keySource: "Shift-Command-T",
        key: [["Shift", "Command", "T"]],
        desc: "显示或隐藏“访达”窗口中的标签栏",
      },
      {
        keySource: "Ctrl-Shift-Command-T",
        key: [["Ctrl", "Shift", "Command", "T"]],
        desc: "将所选的“访达”项目添加到“程序坞”（OS X Mavericks 或更高版本）",
      },
      {
        keySource: "Shift-Command-U",
        key: [["Shift", "Command", "U"]],
        desc: "打开“实用工具”文件夹",
      },
      {
        keySource: "Option-Command-D",
        key: [["Option", "Command", "D"]],
        desc: "显示或隐藏“程序坞”",
      },
      {
        keySource: "Control-Command-T",
        key: [["Control", "Command", "T"]],
        desc: "将所选项添加到边栏（OS X Mavericks 或更高版本）",
      },
      {
        keySource: "Option-Command-P",
        key: [["Option", "Command", "P"]],
        desc: "隐藏或显示“访达”窗口中的路径栏",
      },
      {
        keySource: "Option-Command-S",
        key: [["Option", "Command", "S"]],
        desc: "隐藏或显示“访达”窗口中的边栏",
      },
      {
        keySource: "Command–斜线 (/)",
        key: [["Command", "/"]],
        desc: "隐藏或显示“访达”窗口中的状态栏",
      },
      {
        keySource: "Command-J",
        key: [["Command", "J"]],
        desc: "显示“显示”选项",
      },
      {
        keySource: "Command-K",
        key: [["Command", "K"]],
        desc: "打开“连接服务器”窗口",
      },
      {
        keySource: "Control-Command-A",
        key: [["Control", "Command", "A"]],
        desc: "为所选项制作替身",
      },
      {
        keySource: "Command-N",
        key: [["Command", "N"]],
        desc: "打开一个新的“访达”窗口",
      },
      {
        keySource: "Option-Command-N",
        key: [["Option", "Command", "N"]],
        desc: "新建智能文件夹",
      },
      {
        keySource: "Command-T",
        key: [["Command", "T"]],
        desc: "在当前“访达”窗口中有单个标签页开着的状态下显示或隐藏标签页栏",
      },
      {
        keySource: "Option-Command-T",
        key: [["Option", "Command", "T"]],
        desc: "在当前“访达”窗口中有单个标签页开着的状态下显示或隐藏工具栏",
      },
      {
        keySource: "Option-Command-V",
        key: [["Option", "Command", "V"]],
        desc: "将剪贴板中的文件从原始位置移动到当前位置",
      },
      {
        keySource: "Command-Y",
        key: [["Command", "Y"]],
        desc: "使用“快速查看”预览所选文件",
      },
      {
        keySource: "Option-Command-Y",
        key: [["Option", "Command", "Y"]],
        desc: "显示所选文件的快速查看幻灯片显示",
      },
      {
        keySource: "Command-1",
        key: [["Command", "1"]],
        desc: "以图标方式显示“访达”窗口中的项目",
      },
      {
        keySource: "Command-2",
        key: [["Command", "2"]],
        desc: "以列表方式显示“访达”窗口中的项目",
      },
      {
        keySource: "Command-3",
        key: [["Command", "3"]],
        desc: "以分栏方式显示“访达”窗口中的项目",
      },
      {
        keySource: "Command-4",
        key: [["Command", "4"]],
        desc: "以画廊方式显示“访达”窗口中的项目",
      },
      {
        keySource: "Command–左中括号 ([)",
        key: [["Command", "["]],
        desc: "前往上一文件夹",
      },
      {
        keySource: "Command–右中括号 (])",
        key: [["Command", "]"]],
        desc: "前往下一个文件夹",
      },
      {
        keySource: "Command–上箭头",
        key: [["Command", "↑"]],
        desc: "打开包含当前文件夹的文件夹",
      },
      {
        keySource: "Command–Control–上箭头",
        key: [["Command", "Control", "↑"]],
        desc: "在新窗口中打开包含当前文件夹的文件夹",
      },
      {
        keySource: "Command–下箭头",
        key: [["Command", "↓"]],
        desc: "打开所选项",
      },
      {
        keySource: "右箭头",
        key: [["→"]],
        desc: "打开所选文件夹。这个快捷键仅在列表视图中有效",
      },
      {
        keySource: "左箭头",
        key: [["←"]],
        desc: "关闭所选文件夹。这个快捷键仅在列表视图中有效",
      },
      {
        keySource: "Command-Delete",
        key: [["Command", "Delete"]],
        desc: "将所选项移到废纸篓",
      },
      {
        keySource: "Shift-Command-Delete",
        key: [["Shift", "Command", "Delete"]],
        desc: "清倒废纸篓",
      },
      {
        keySource: "Option-Shift-Command-Delete",
        key: [["Option", "Shift", "Command", "Delete"]],
        desc: "清倒废纸篓而不显示确认对话框",
      },
      {
        keySource: "Command-调低亮度",
        key: [["Command", "调低亮度"]],
        desc: "当 Mac 连接到多台显示器时，打开或关闭视频镜像功能",
      },
      {
        keySource: "Option–调高亮度",
        key: [["Option", "调高亮度"]],
        desc: "打开“显示器”偏好设置。这个快捷键可与任一亮度键搭配使用",
      },
      {
        keySource: "Control–调高亮度或 Control–调低亮度",
        key: [
          ["Control", "调高亮度"],
          ["Control", "调低亮度"],
        ],
        desc: "更改外部显示器的亮度（如果显示器支持）",
      },
      {
        keySource: "Option-Shift–调高亮度或 Option-Shift–调低亮度",
        key: [
          ["Option", "Shift", "调高亮度"],
          ["Option", "Shift", "调低亮度"],
        ],
        desc: "以较小的步幅调节显示器亮度",
      },
      {
        keySource: "Option-Shift–调高亮度或 Option-Shift–调低亮度",
        key: [
          ["Option", "Control", "Shift", "调高亮度"],
          ["Option", "Control", "Shift", "调低亮度"],
        ],
        desc: "在外置显示器上以较小的步幅调节显示器亮度",
      },
      {
        keySource: "Option–“调度中心”",
        key: [["Option", "调度中心"]],
        desc: "打开“调度中心”偏好设置",
      },
      {
        keySource: "Command-调度中心",
        key: [["Command", "调度中心"]],
        desc: "显示桌面",
      },
      {
        keySource: "Control–下箭头",
        key: [["Control", "↓"]],
        desc: "显示最前面的应用的所有窗口",
      },
      {
        keySource: "Option–调高音量",
        key: [["Option", "调高音量"]],
        desc: "打开“声音”偏好设置。这个快捷键可与任一音量键搭配使用",
      },
      {
        keySource: "Option-Shift–调高音量或 Option-Shift–调低音量",
        key: [
          ["Option", "Shift", "调高音量"],
          ["Option", "Shift", "调低音量"],
        ],
        desc: "以较小的步幅调节音量",
      },
      {
        keySource: "Option–键盘调高亮度",
        key: [["Option", "键盘调高亮度"]],
        desc: "打开“键盘”偏好设置。这个快捷键可与任一键盘亮度键搭配使用",
      },
      {
        keySource: "Option-Shift–键盘调高亮度或 Option-Shift–键盘调低亮度",
        key: [
          ["Option", "Shift", "键盘调高亮度"],
          ["Option", "Shift", "键盘调低亮度"],
        ],
        desc: "以较小的步幅调节键盘亮度",
      },
      {
        keySource: "连按 Option 键",
        key: [["Option"]],
        desc: "【连按】在单独的窗口中打开项目，然后关闭原始窗口",
      },
      {
        keySource: "连按 Command 键",
        key: [["Command"]],
        desc: "【连按】在单独的标签页或窗口中打开文件夹",
      },
      {
        keySource: "按住 Command 键拖移到另一个宗卷",
        key: [["Command"]],
        desc: "【按住】将拖移的项目移到另一个宗卷，而不是拷贝它",
      },
      {
        keySource: "按住 Option 键拖移",
        key: [["Option"]],
        desc: "【按住】拷贝托移的项目。拖移项目时指针会随之变化",
      },
      {
        keySource: "拖移时按住 Option-Command",
        key: [["Option", "Command"]],
        desc: "【按住】为拖移的项目制作替身。拖移项目时指针会随之变化",
      },
      {
        keySource: "按住 Option 键点按开合三角",
        key: [["Option"]],
        desc: "【按住】在列表视图中点按开合三角，打开所选文件夹内的所有文件夹",
      },
      {
        keySource: "按住 Command 键点按窗口标题",
        key: [["Command"]],
        desc: "【按住】点按窗口标题，查看包含当前文件夹的文件夹",
      },
    ],
  },
  {
    title: "文稿",
    table: [
      {
        keySource: "Command-B",
        key: [["Command", "B"]],
        desc: "以粗体显示所选文本，或者打开或关闭粗体显示功能",
      },
      {
        keySource: "Command-I",
        key: [["Command", "I"]],
        desc: "以斜体显示所选文本，或者打开或关闭斜体显示功能",
      },
      {
        keySource: "Command-K",
        key: [["Command", "K"]],
        desc: "添加网页链接",
      },
      {
        keySource: "Command-U",
        key: [["Command", "U"]],
        desc: "对所选文本加下划线，或者打开或关闭加下划线功能",
      },
      {
        keySource: "Command-T",
        key: [["Command", "T"]],
        desc: "显示或隐藏“字体”窗口",
      },
      {
        keySource: "Command-D",
        key: [["Command", "D"]],
        desc: "从“打开”对话框或“存储”对话框内选择“桌面”文件夹",
      },
      {
        keySource: "Control-Command-D",
        key: [["Control", "Command", "D"]],
        desc: "显示或隐藏所选字词的定义",
      },
      {
        keySource: "Shift-Command–冒号 (:)",
        key: [["Shift", "Command", ":"]],
        desc: "显示“拼写和语法”窗口",
      },
      {
        keySource: "Command–分号 (;)",
        key: [["Command", ";"]],
        desc: "查找文稿中拼写错误的字词",
      },
      {
        keySource: "Option-Delete",
        key: [["Option", "Delete"]],
        desc: "删除插入点左边的字词",
      },
      {
        keySource: "Control-H",
        key: [["Control", "H"], ["Delete"]],
        desc: "删除插入点左边的字符",
      },
      {
        keySource: "Control-D",
        key: [["Control", "D"], ["Fn", "Delete"]],
        desc: "删除插入点右边的字符，或在没有向前删除键的键盘上向前删除",
      },
      {
        keySource: "Control-K",
        key: [["Control", "K"]],
        desc: "删除插入点与行或段落末尾处之间的文本",
      },
      {
        keySource: "Fn-上箭头",
        key: [["Fn", "↑"]],
        desc: "Page Up：向上滚动一页",
      },
      {
        keySource: "Fn–下箭头",
        key: [["Fn", "↓"]],
        desc: "Page Down：向下滚动一页",
      },
      {
        keySource: "Fn–左箭头",
        key: [["Fn", "←"]],
        desc: "Home：滚动到文稿开头",
      },
      {
        keySource: "Fn–右箭头",
        key: [["Fn", "→"]],
        desc: "End：滚动到文稿末尾",
      },
      {
        keySource: "Command–上箭头",
        key: [["Command", "↑"]],
        desc: "将插入点移至文稿开头",
      },
      {
        keySource: "Command–下箭头",
        key: [["Command", "↓"]],
        desc: "将插入点移至文稿末尾",
      },
      {
        keySource: "Command–左箭头",
        key: [["Command", "←"]],
        desc: "将插入点移至当前行的行首",
      },
      {
        keySource: "Command–右箭头",
        key: [["Command", "→"]],
        desc: "将插入点移至当前行的行尾",
      },
      {
        keySource: "Option–左箭头",
        key: [["Option", "←"]],
        desc: "将插入点移至上一字词的词首",
      },
      {
        keySource: "Option–右箭头",
        key: [["Option", "→"]],
        desc: "将插入点移至下一字词的词尾",
      },
      {
        keySource: "Shift-Command–上箭头",
        key: [["Shift", "Command", "↑"]],
        desc: "选中插入点与文稿开头之间的文本",
      },
      {
        keySource: "Shift-Command–下箭头",
        key: [["Shift", "Command", "↓"]],
        desc: "选中插入点与文稿末尾之间的文本",
      },
      {
        keySource: "Shift-Command–左箭头",
        key: [["Shift", "Command", "←"]],
        desc: "选中插入点与当前行行首之间的文本",
      },
      {
        keySource: "Shift-Command–右箭头",
        key: [["Shift", "Command", "→"]],
        desc: "选中插入点与当前行行尾之间的文本",
      },
      {
        keySource: "Shift–上箭头",
        key: [["Shift", "↑"]],
        desc: "将文本选择范围扩展到上一行相同水平位置的最近字符处",
      },
      {
        keySource: "Shift–下箭头",
        key: [["Shift", "↓"]],
        desc: "将文本选择范围扩展到下一行相同水平位置的最近字符处",
      },
      {
        keySource: "Shift–左箭头",
        key: [["Shift", "←"]],
        desc: "将文本选择范围向左扩展一个字符",
      },
      {
        keySource: "Shift–右箭头",
        key: [["Shift", "→"]],
        desc: "将文本选择范围向右扩展一个字符",
      },
      {
        keySource: "Option–Shift–上箭头",
        key: [["Option", "Shift", "↑"]],
        desc: "将文本选择范围扩展到当前段落的段首，再按一次则扩展到下一段落的段首",
      },
      {
        keySource: "Option–Shift–下箭头",
        key: [["Option", "Shift", "↓"]],
        desc: "将文本选择范围扩展到当前段落的段尾，再按一次则扩展到下一段落的段尾",
      },
      {
        keySource: "Option–Shift–左箭头",
        key: [["Option", "Shift", "←"]],
        desc: "将文本选择范围扩展到当前字词的词首，再按一次则扩展到后一字词的词首",
      },
      {
        keySource: "Option–Shift–左箭头",
        key: [["Option", "Shift", "←"]],
        desc: "将文本选择范围扩展到当前字词的词尾，再按一次则扩展到后一字词的词尾",
      },
      {
        keySource: "Control–A",
        key: [["Control", "A"]],
        desc: "移至行或段落的开头",
      },
      {
        keySource: "Control–E",
        key: [["Control", "E"]],
        desc: "移至行或段落的末尾",
      },
      {
        keySource: "Control–F",
        key: [["Control", "F"]],
        desc: "向前移动一个字符",
      },
      {
        keySource: "Control–B",
        key: [["Control", "B"]],
        desc: "向后移动一个字符",
      },
      {
        keySource: "Control–L",
        key: [["Control", "L"]],
        desc: "将光标或所选内容置于可见区域中央",
      },
      { keySource: "Control–P", key: [["Control", "P"]], desc: "上移一行" },
      { keySource: "Control–N", key: [["Control", "N"]], desc: "下移一行" },
      {
        keySource: "Control–O",
        key: [["Control", "O"]],
        desc: "在插入点后新插入一行",
      },
      {
        keySource: "Control–T",
        key: [["Control", "T"]],
        desc: "将插入点后面的字符与插入点前面的字符交换",
      },
      {
        keySource: "Command–左花括号 ({)",
        key: [["Command", "{"]],
        desc: "左对齐",
      },
      {
        keySource: "Command–右花括号 (})",
        key: [["Command", "}"]],
        desc: "右对齐",
      },
      {
        keySource: "Shift-Command–竖线 (|)",
        key: [["Shift", "Command", "|"]],
        desc: "居中对齐",
      },
      {
        keySource: "Option-Command-F",
        key: [["Option", "Command", "F"]],
        desc: "前往搜索栏",
      },
      {
        keySource: "Option-Command-T",
        key: [["Option", "Command", "T"]],
        desc: "显示或隐藏应用中的工具栏",
      },
      {
        keySource: "Option-Command-C",
        key: [["Option", "Command", "C"]],
        desc: "拷贝样式：将所选项的格式设置拷贝到剪贴板",
      },
      {
        keySource: "Option-Command-V",
        key: [["Option", "Command", "V"]],
        desc: "粘贴样式：将拷贝的样式应用到所选项",
      },
      {
        keySource: "Option-Shift-Command-V",
        key: [["Option", "Shift", "Command", "V"]],
        desc: "粘贴并匹配样式：将周围内容的样式应用到粘贴在该内容中的项目",
      },
      {
        keySource: "Option-Command-I",
        key: [["Option", "Command", "I"]],
        desc: "显示或隐藏检查器窗口",
      },
      {
        keySource: "Shift-Command-P",
        key: [["Shift", "Command", "P"]],
        desc: "页面设置：显示用于选择文稿设置的窗口",
      },
      {
        keySource: "Shift-Command-S",
        key: [["Shift", "Command", "S"]],
        desc: "显示“存储为”对话框或复制当前文稿",
      },
      {
        keySource: "Shift-Command-减号 (-)",
        key: [["Shift", "Command", "-"]],
        desc: "缩小所选项",
      },
      {
        keySource: "Shift-Command-加号 (+)",
        key: [
          ["Shift", "Command", "+"],
          ["Command", "="],
        ],
        desc: "放大所选项",
      },
      {
        keySource: "Shift-Command–问号 (?)",
        key: [["Shift", "Command", "?"]],
        desc: "打开“帮助”菜单",
      },
    ],
  },
  {
    title: "辅助功能选项",
    table: [
      {
        keySource:
          "Option-Command-F5<br>或在受支持的机型上1，连按三次触控 ID（电源按钮）",
        key: [
          ["Option", "Command", "F5"],
          ["连按三次 touch ID"],
        ],
        desc: "显示辅助功能选项",
      },
      {
        keySource:
          "Command-F5 或 Fn-Command-F5<br>或在受支持的机型上1，按住 Command 键并连按三次触控 ID（电源按钮）",
        key: [
          ["Command", "F5"],
          ["Fn", "Command", "F5"],
          ["Command", "连按三次 touch ID"],
        ],
        desc: "开启或关闭旁白",
      },
      {
        keySource: "Control-Option-F8 或 Fn-Control-Option-F8",
        key: [
          ["Control", "Option", "F8"],
          ["Fn", "Control", "Option", "F8"],
        ],
        desc: "打开旁白实用工具（如果旁白已开启）",
      },
      {
        keySource: "Option-Command-8",
        key: [["Option", "Command", "8"]],
        desc: "开启或关闭缩放功能",
      },
      {
        keySource: "Option–Command–加号 (+)",
        key: [["Option", "Command", "+"]],
        desc: "放大",
      },
      {
        keySource: "Option–Command–减号 (-)",
        key: [["Option", "Command", "-"]],
        desc: "缩小",
      },
      {
        keySource: "Control-Option-Command-8",
        key: [["Control", "Option", "Command", "8"]],
        desc: "反转颜色",
      },
      {
        keySource: "Control-Option-Command-逗号 (,)",
        key: [["Control", "Option", "Command", ","]],
        desc: "降低对比度",
      },
      {
        keySource: "Control-Option-Command-句号 (.)",
        key: [["Control", "Option", "Command", "."]],
        desc: "增强对比度",
      },
    ],
  },
  {
    title: "替代鼠标",
    table: [
      {
        keySource: "Control-F7 或 Fn-Control-F7",
        key: [
          ["Control", "F7"],
          ["Fn", "Control", "F7"],
        ],
        desc: "在以下两种状态之间切换：在屏幕上导览所有控制项，或仅导览文本框和列表",
      },
      { keySource: "Tab", key: [["Tab"]], desc: "移至下一个控制项" },
      {
        keySource: "Shift-Tab",
        key: [["Shift", "Tab"]],
        desc: "移至上一个控制项",
      },
      {
        keySource: "Control-Tab",
        key: [["Control", "Tab"]],
        desc: "选定文本栏时移至下一个控制项",
      },
      {
        keySource: "Control-Shift-Tab",
        key: [["Control", "Shift", "Tab"]],
        desc: "将焦点移至上一组控制项",
      },
      {
        keySource: "箭头键",
        key: [["方向键"]],
        desc: "移至列表、标签组或菜单中的相邻项<br>移动滑块和调整器（向上箭头可增大值，向下箭头可减小值）",
      },
      {
        keySource: "Control-箭头键",
        key: [["Control", "方向键"]],
        desc: "移至与文本栏相邻的控制项",
      },
      { keySource: "Space", key: [["Space"]], desc: "选取所选菜单项" },
      {
        keySource: "Return 或 Enter",
        key: [["Return"], ["Enter"]],
        desc: "点按默认按钮或完成默认操作",
      },
      {
        keySource: "Esc",
        key: [["Esc"]],
        desc: "点按“取消”按钮，或关闭菜单而不选取项目",
      },
      {
        keySource: "Control-Shift-F6",
        key: [["Control", "Shift", "F6"]],
        desc: "将焦点移至上一个面板",
      },
      {
        keySource: "Control-F8 或 Fn-Control-F8",
        key: [
          ["Control", "F8"],
          ["Fn", "Control", "F8"],
        ],
        desc: "移到菜单栏中的状态菜单",
      },
      {
        keySource: "Command–重音符 (`)",
        key: [["Command", "`"]],
        desc: "激活前台 App 中下一个打开的窗口",
      },
      {
        keySource: "Shift–Command–重音符 (`)",
        key: [["Shift", "Command", "`"]],
        desc: "激活前台 App 中上一个打开的窗口",
      },
      {
        keySource: "Option–Command–重音符 (`)",
        key: [["Option", "Command", "`"]],
        desc: "将焦点移至窗口抽屉",
      },
    ],
  },
  {
    title: "浏览菜单",
    table: [
      {
        keySource: "向左箭头、向右箭头",
        key: [["←", "→"]],
        desc: "从一个菜单移到另一个菜单",
      },
      { keySource: "Return", key: [["Return"]], desc: "打开所选菜单" },
      {
        keySource: "向上箭头、向下箭头",
        key: [["↑", "↓"]],
        desc: "移至所选菜单中的菜单项",
      },
      {
        keySource: "键入菜单项的名称",
        key: [["键入菜单项的名称"]],
        desc: "跳到所选菜单中的菜单项",
      },
      { keySource: "Return", key: [["Return"]], desc: "选取所选菜单项" },
    ],
  },
  {
    title: "移动鼠标指针",
    table: [
      {
        keySource: "8 或数字小键盘上的 8",
        key: [["8"], ["Num8"]],
        desc: "上移",
      },
      {
        keySource: "K 或数字小键盘上的 2",
        key: [["K"], ["Num2"]],
        desc: "下移",
      },
      {
        keySource: "U 或数字小键盘上的 4",
        key: [["U"], ["Num4"]],
        desc: "左移",
      },
      {
        keySource: "O 或数字小键盘上的 6",
        key: [["O"], ["Num6"]],
        desc: "右移",
      },
      {
        keySource: "J 或数字小键盘上的 1",
        key: [["J"], ["Num1"]],
        desc: "沿对角线向左下角移动",
      },
      {
        keySource: "L 或数字小键盘上的 3",
        key: [["L"], ["Num3"]],
        desc: "沿对角线向右下角移动",
      },
      {
        keySource: "7 或数字小键盘上的 7",
        key: [["7"], ["Num7"]],
        desc: "沿对角线向左上角移动",
      },
      {
        keySource: "9 或数字小键盘上的 9",
        key: [["9"], ["Num9"]],
        desc: "沿对角线向右上角移动",
      },
      {
        keySource: "I 或数字小键盘上的 5",
        key: [["I"], ["Num5"]],
        desc: "按下鼠标按钮",
      },
      {
        keySource: "M 或数字小键盘上的 0",
        key: [["M"], ["Num0"]],
        desc: "按住鼠标按钮",
      },
      {
        keySource: ".（句点键）",
        key: [["."]],
        desc: "松开鼠标按钮",
      },
    ],
  },
  {
    title: "滚动",
    table: [
      {
        keySource: "按下箭头键。",
        key: [["方向键"]],
        desc: "向上、向下、向左或向右滚动",
      },
      {
        keySource: "按下箭头键时按住 Option 键。",
        key: [["Option", "方向键"]],
        desc: "大幅度滚动",
      },
      {
        keySource: "Page Down 键<br><br>空格键",
        key: [["PageDn"], ["Space"]],
        desc: "向下滚动屏幕",
      },
      {
        keySource: "Page Up 键<br><br>Shift-空格键",
        key: [["PageUp"], ["Shift", "Space"]],
        desc: "向上滚动屏幕",
      },
      {
        keySource: "Command-上箭头键<br><br>Command-下箭头键",
        key: [["Command", "↑"]],
        desc: "滚动到页面左上角",
      },
      {
        keySource: "Command-上箭头键<br><br>Command-下箭头键",
        key: [["Command", "↓"]],
        desc: "滚动到页面左下角",
      },
    ],
  },
  {
    title: "当前网页",
    table: [
      { keySource: "Command-F", key: [["Command", "F"]], desc: "搜索当前网页" },
      {
        keySource:
          "Tab<br><br>如果在“系统偏好设置”的“键盘”面板的“快捷键”面板中选择了“使用键盘导航在控制间移动焦点”，Tab 键还将高亮显示按钮和其他控制。",
        key: [["Tab"]],
        desc: "高亮显示网页上的下一个栏或弹出式菜单",
      },
      {
        keySource:
          "Option-Tab<br><br>如果在“系统偏好设置”的“键盘”面板的“快捷键”面板中选择了“使用键盘导航在控制间移动焦点”，Option-Tab 还将高亮显示按钮和其他控制。<br><br>若要交换 Tab 和 Option-Tab 的行为，请在 Safari 浏览器偏好设置的“高级”面板中打开“按下 Tab 键以高亮显示网页上的每一项”。",
        key: [
          ["Option", "Tab"],
        ],
        desc: "高亮显示网页上的下一个栏、弹出式菜单或可点按的项目（例如链接）",
      },
      {
        keySource: "Esc 键",
        key: [["Esc"]],
        desc: "在智能搜索栏中键入时，恢复当前网页地址",
      },
      {
        keySource: "Command-L",
        key: [["Command", "L"]],
        desc: "选择智能搜索栏",
      },
      { keySource: "Command-P", key: [["Command", "P"]], desc: "打印当前网页" },
      { keySource: "Command-C", key: [["Command", "C"]], desc: "拷贝所选项目" },
      {
        keySource: "Command-V",
        key: [["Command", "V"]],
        desc: "粘贴最近拷贝的项目",
      },
    ],
  },
  {
    title: "标签页",
    table: [
      {
        keySource: "Shift-Command-\\",
        key: [["Shift", "Command", "\\"]],
        desc: "显示标签页概览",
      },
      {
        keySource:
          "按住 Command 键点按链接<br><br>按住 Command 键点按书签<br><br>在智能搜索栏中键入后，按下 Command-Return。",
        key: [
          ["Command"],
        ],
        desc: "【按住】点击链接、书签、或者在地址栏回车，都会在新标签页中打开页面",
      },
      {
        keySource:
          "按住 Shift-Command 点按链接<br><br>按住 Shift-Command 点按书签<br><br>在智能搜索栏中键入后，按下 Shift-Command-Return。",
        key: [
          ["Shift", "Command"],
        ],
        desc: "【按住】点击链接、书签、或者在地址栏回车，都会在新标签页中打开页面，并使该标签页成为活跃标签页",
      },
      {
        keySource: "Control-Tab 或 Shift-Command-]",
        key: [
          ["Control", "Tab"],
          ["Shift", "Command", "]"],
        ],
        desc: "前往下一个标签页",
      },
      {
        keySource: "Control-Shift-Tab 或 Shift-Command -[",
        key: [
          ["Control", "Shift", "Tab"],
          ["Shift", "Command ", "["],
        ],
        desc: "前往上一个标签页",
      },
      {
        keySource: "Command-1 到 Command-9",
        key: [["Command", "1~9"]],
        desc: "选择前 9 个标签页中的一个",
      },
      {
        keySource: "Command-W",
        key: [["Command", "W"]],
        desc: "关闭活跃的标签页",
      },
      {
        keySource: "按住 Option 键点按您要保持打开的标签页上的“关闭”按钮 ",
        key: [["Option"]],
        desc: "【按住】点按您要保持打开的标签页上的“关闭”按钮，关闭全部其他标签页",
      },
      {
        keySource: "Shift-Command-T",
        key: [["Shift", "Command", "T"]],
        desc: "重新打开上次关闭的标签页",
      },
    ],
  },
  {
    title: "偏好设置",
    table: [
      {
        keySource: "Shift-Command-H",
        key: [["Shift", "Command", "H"]],
        desc: "前往主页",
      },
      {
        keySource: "Command-,",
        key: [["Command", ","]],
        desc: "更改 Safari 浏览器偏好设置",
      },
    ],
  },
  {
    title: "历史记录",
    table: [
      {
        keySource: "Command-[",
        key: [["Command", "["]],
        desc: "返回上一个网页",
      },
      {
        keySource: "Command-]",
        key: [["Command", "]"]],
        desc: "前往下一个网页",
      },
      {
        keySource: "按住“后退” 或“前进” 按钮，直到列表出现",
        key: [["后退"], ["前进"]],
        desc: "【按住】直到列表出现，按名称查看最近访问页面的列表",
      },
      {
        keySource: "按下 Option 键，并按住“后退”或“前进”按钮，直到列表出现",
        key: [["Option", "后退"], ["Option", "前进"]],
        desc: "【按住】直到列表出现，按网址 (URL) 查看最近访问页面的列表",
      },
    ],
  },
  {
    title: "缩放",
    table: [
      { keySource: "Esc 键", key: [["Esc"]], desc: "退出全屏幕视图" },
      {
        keySource: "按下 Command-加号 (+) 或 Command-减号 (–)",
        key: [
          ["Command", "+"],
          ["Command", "-"],
        ],
        desc: "缩放网站内容",
      },
      {
        keySource:
          "选取“显示”>“使文本变大”或“显示”>“使文本变小”时，按下 Option 键。",
        key: [
          ["显示", "then", "Option", "使文本变大"],
          ["显示", "then", "Option", "使文本变小"],
        ],
        desc: "缩放网站文本",
      },
    ],
  },
  {
    title: "下载",
    table: [
      {
        keySource: "按住 Option 键点按文件的链接",
        key: [["Option"]],
        desc: "【按住】点按文件的链接，下载链接文件",
      },
      {
        keySource: "连按下载列表中的文件",
        key: [["双击"]],
        desc: "双击下载列表中的文件，打开下载的文件",
      },
    ],
  },
  {
    title: "窗口",
    table: [
      {
        keySource: "Command-`（Tab 键上方）",
        key: [["Command", "`"]],
        desc: "切换到另一个 Safari 浏览器窗口",
      },
      {
        keySource: "Shift-Command-T",
        key: [["Shift", "Command", "T"]],
        desc: "重新打开上次关闭的窗口",
      },
    ],
  },
  {
    title: "阅读列表",
    table: [
      {
        keySource: "Control-Command-2",
        key: [["Control", "Command", "2"]],
        desc: "显示或隐藏阅读列表边栏",
      },
      {
        keySource: "Shift-Command-D",
        key: [["Shift", "Command", "D"]],
        desc: "添加当前页面",
      },
      {
        keySource: "按住 Shift 键点按页面的链接",
        key: [["Shift"]],
        desc: "【按住】点按页面的链接，可以添加链接页面",
      },
      {
        keySource:
          "按住 Control 键点按边栏中的页面摘要，然后选取“移除项目”。<br><br>您也可以在页面摘要上向左轻扫，然后点按“移除”。或者，一直向左轻扫直至页面摘要消失。",
        key: [
          ["Control"],
        ],
        desc: "【按住】点按边栏中的页面摘要，然后选取“移除项目”，移除页面。<br>您也可以在页面摘要上向左轻扫，然后点按“移除”。或者，一直向左轻扫直至页面摘要消失。",
      },
      {
        keySource: "Shift-Command-R",
        key: [["Shift", "Command", "R"]],
        desc: "打开阅读器",
      },
      { keySource: "Esc 键", key: [["Esc"]], desc: "关闭阅读器" },
    ],
  },
  {
    title: "书签",
    table: [
      {
        keySource:
          "点按智能搜索栏以显示页面的完整地址及其图标，然后将图标拖到“个人收藏”栏",
        key: [],
        desc: "点按智能搜索栏以显示页面的完整地址及其图标，然后将图标拖到“个人收藏”栏，可以将书签添加到“个人收藏”栏",
      },
      {
        keySource: "按住 Command 键点按“个人收藏”栏中的文件夹",
        key: [["Command"]],
        desc: "【按住】点按“个人收藏”栏中的文件夹，打开这个文件夹内的所有书签",
      },
      {
        keySource: "左右拖移书签",
        key: [],
        desc: "左右拖移书签，可以在“个人收藏”栏上移动书签",
      },
      {
        keySource: "将书签拖移到个人收藏栏外",
        key: [],
        desc: "将书签拖移到个人收藏栏外， 可从“个人收藏”栏移除书签",
      },
    ],
  },
  {
    title: "书签边栏和书签视图",
    table: [
      {
        keySource: "Control-Command-1",
        key: [["Control", "Command", "1"]],
        desc: "显示或隐藏书签边栏",
      },
      {
        keySource:
          "按住 Command 键点按每个书签和文件夹<br><br>按住 Shift 键点按以扩展选择",
        key: [
          ["Command"],
        ],
        desc: "【按住】点按每个书签和文件夹，按住 Shift 键点按以扩展选择，对边栏中的书签和文件夹进行多选",
      },
      {
        keySource: "上箭头键或下箭头键",
        key: [["↑"], ["↓"]],
        desc: "选择下一个书签或文件夹",
      },
      { keySource: "Space", key: [["Space"]], desc: "打开所选书签" },
      {
        keySource: "空格键或右箭头键",
        key: [["Space"], ["→"]],
        desc: "打开所选文件夹",
      },
      {
        keySource: "空格键或左箭头键",
        key: [["Space"], ["←"]],
        desc: "关闭所选文件夹",
      },
      {
        keySource: "选择书签，然后按下 Return 键<br><br>您还可以用力点按书签",
        key: [["Return"]],
        desc: "选择书签后，按下 Return，或者用力点按书签，可以更改书签的名称或地址",
      },
      {
        keySource: "Esc 键",
        key: [["Esc"]],
        desc: "取消编辑边栏中的书签名称",
      },
      {
        keySource: "Return 键",
        key: [["Return"]],
        desc: "完成编辑书签名称",
      },
      {
        keySource: "按下 Option 键点按右上角附近的“新建文件夹”按钮",
        key: [["Option"]],
        desc: "【按住】点按右上角附近的“新建文件夹”按钮，可以创建包含书签视图中的所选书签和文件夹的文件夹",
      },
      {
        keySource: "按住 Control 键点按书签，然后选取“删除”",
        key: [["Control"]],
        desc: "【按住】点按书签，然后选取“删除”，可以删除书签",
      },
    ],
  },
  {
    title: "聚焦",
    table: [
      {
        keySource: "Command-空格键",
        key: [["Command", "Space"]],
        desc: "打开或关闭“聚焦”窗口",
      },
      { keySource: "Tab 键", key: [["Tab"]], desc: "显示预览区域" },
      { keySource: "下箭头键", key: [["↓"]], desc: "移到下一个结果" },
      { keySource: "上箭头键", key: [["↑"]], desc: "移到上一个结果" },
      {
        keySource: "Command-下箭头",
        key: [["Command", "↓"]],
        desc: "移到下一个类别中的第一个结果",
      },
      {
        keySource: "Command-上箭头",
        key: [["Command", "↑"]],
        desc: "移到上一个类别中的第一个结果",
      },
      {
        keySource: "Command",
        key: [["Command"]],
        desc: "显示 Mac 上的结果（如文件）路径（如果预览区域已显示，路径会显示在预览底部）",
      },
      { keySource: "Return 键", key: [["Return"]], desc: "打开结果" },
      {
        keySource: "Command-R 或 Command-连按",
        key: [
          ["Command", "R"],
          ["Command", "双击"],
        ],
        desc: "在 App 或“访达”中查看文件",
      },
      {
        keySource: "Option-Command-空格键",
        key: [["Option", "Command", "Space"]],
        desc: "打开搜索结果已选定的“访达”窗口",
      },
    ],
  },
];
document.title += ' for MacOS'
showShortcuts();