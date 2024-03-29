var shortcuts = [
  {
    title: "常规操作",
    table: [
      {  desc: "剪切选定项", key: [["Ctrl", "X"]] },
      {
        desc: "复制选定项",
        key: [
          ["Ctrl", "C"],
          ["Ctrl", "Insert"],
        ],
      },
      {
        desc: "粘贴选定项",
        key: [
          ["Ctrl", "V"],
          ["Shift", "Insert"],
        ],
      },
      {  desc: "撤消操作", key: [["Ctrl", "Z"]] },
      {
        desc: "在打开的应用之间切换",
        key: [["Alt", "Tab"]],
      },
      {
        desc: "关闭活动项，或者退出活动应用",
        key: [["Alt", "F4"]],
      },
      {
        desc: "锁定你的电脑",
        key: [["Win", "L"]],
      },
      {
        desc: "显示/隐藏桌面",
        key: [["Win", "D"]],
      },
      {  desc: "重命名选定项目", key: [["F2"]] },
      {
        desc: "在文件资源管理器中搜索文件或文件夹",
        key: [["F3"]],
      },
      {
        desc: "在文件资源管理器中显示地址栏列表",
        key: [["F4"]],
      },
      {
        desc: "循环浏览窗口中或桌面上的屏幕元素",
        key: [["F6"]],
      },
      {  desc: "激活活动应用中的菜单栏", key: [["F10"]] },
      {
        desc: "在登录屏幕上显示你的密码",
        key: [["Alt", "F8"]],
      },
      {
        desc: "按应用打开顺序在应用之间切换",
        key: [["Alt", "Esc"]],
      },
      {
        desc: "执行可与该（带下划线的）字母相关的命令（或选择该选项）",
        key: [["Alt", "字母"]],
      },
      {
        desc: "显示所选项目的属性",
        key: [["Alt", "Enter"]],
      },
      {
        desc: "打开活动窗口的快捷菜单",
        key: [["Alt", "Space"]],
      },
      {  desc: "返回", key: [["Alt", "←"]] },
      {  desc: "前进", key: [["Alt", "→"]] },
      {
        desc: "向上移动一个屏幕",
        key: [["Alt", "PageUp"]],
      },
      {
        desc: "向下移动一个屏幕",
        key: [["Alt", "PageDn"]],
      },
      {
        desc: "关闭活动文档（在可全屏显示并允许你同时打开多个文档的应用中）",
        key: [["Ctrl", "F4"]],
      },
      {
        desc: "选择文档或窗口中的所有项目",
        key: [["Ctrl", "A"]],
      },
      {
        desc: "删除选定项，将其移至回收站",
        key: [["Ctrl", "D"], ["Delete"]],
      },
      {
        desc: "打开搜索（在大多数应用中）",
        key: [["Ctrl", "F"]],
      },
      {
        desc: "刷新活动窗口",
        key: [["F5"], ["Ctrl", "R"]],
      },
      {  desc: "恢复操作", key: [["Ctrl", "Y"]] },
      {
        desc: "将光标移动到下一个字词的起始处",
        key: [["Ctrl", "→"]],
      },
      {
        desc: "将光标移动到上一个字词的起始处",
        key: [["Ctrl", "←"]],
      },
      {
        desc: "将光标移动到下一段落的起始处",
        key: [["Ctrl", "↓"]],
      },
      {
        desc: "将光标移动到上一段落的起始处",
        key: [["Ctrl", "↑"]],
      },
      {
        desc: "使用箭头键在所有打开的应用之间进行切换",
        key: [["Ctrl", "Alt", "Tab"]],
      },
      {
        desc: "选择窗口中或桌面上的多个单独项目（先用方向键移动，再用空格键选中）",
        key: [["Ctrl", "方向键", "then", "Space"]],
      },
      {
        desc: "选择文本块",
        key: [["Ctrl", "Shift", "方向键"]],
      },
      {
        desc: "打开“开始”菜单",
        key: [["Ctrl", "Esc"]],
      },
      {
        desc: "打开任务管理器",
        key: [["Ctrl", "Shift", "Esc"]],
      },
      {
        desc: "如果多种键盘布局可用，则可切换键盘布局",
        key: [["Ctrl", "Shift"]],
      },
      {
        desc: "打开或关闭中文输入法编辑器 (IME)",
        key: [["Ctrl", "Space"]],
      },
      {
        desc: "显示选定项的快捷菜单",
        key: [["Shift", "F10"]],
      },
      {
        desc: "在窗口中或桌面上选择多个项目，或在文档中选择文本",
        key: [["Shift", "方向键"]],
      },
      {
        desc: "彻底删除选定项，不经过回收站（无法恢复）",
        key: [["Shift", "Delete"]],
      },
      {
        desc: "打开右侧的下一个菜单，或打开子菜单",
        key: [["→"]],
      },
      {
        desc: "打开左侧的下一个菜单，或关闭子菜单",
        key: [["←"]],
      },
      {  desc: "停止或离开当前任务", key: [["Esc"]] },
      {
        desc: "捕获整个屏幕的屏幕截图并将其复制到剪贴板",
        key: [["PrtScn"]],
      },
    ],
  },
  {
    title: "Windows 徽标键",
    table: [
      {
        desc: "打开或关闭“开始”菜单",
        key: [["Win"]],
      },
      {
        desc: "打开快速设置",
        key: [["Win", "A"]],
      },
      {
        desc: "将焦点设置为任务栏角落的第一个图标",
        key: [["Win", "B"]],
      },
      {
        desc: "从 Microsoft Teams 打开聊天",
        key: [["Win", "C"]],
      },
      {
        desc: "打开颜色筛选器（在颜色筛选器设置中首先启用此快捷方式）",
        key: [["Win", "Ctrl", "C"]],
      },
      {
        desc: "显示和隐藏桌面",
        key: [["Win", "D"]],
      },
      {
        desc: "打开文件资源管理器",
        key: [["Win", "E"]],
      },
      {
        desc: "打开反馈中心并获取屏幕截图",
        key: [["Win", "F"]],
      },
      {
        desc: "打开 Xbox Game Bar（当游戏处于打开状态时）",
        key: [["Win", "G"]],
      },
      {
        desc: "打开或关闭 HDR。注意: 适用于 Xbox 游戏栏应用版本 5.721.7292.0 或更高版本",
        key: [["Win", "Alt", "B"]],
      },
      {
        desc: "启动语音键入",
        key: [["Win", "H"]],
      },
      {
        desc: "打开设置",
        key: [["Win", "I"]],
      },
      {
        desc: "请将焦点设置到可用的 Windows 提示。当出现 Windows 提示时，请将焦点移到提示上。  再次按下键盘快捷方式，将焦点放在屏幕上 Windows 提示所固定的元素上",
        key: [["Win", "J"]],
      },
      {
        desc: "从“快速设置”打开“投放”",
        key: [["Win", "K"]],
      },
      {
        desc: "锁定你的电脑或切换帐户",
        key: [["Win", "L"]],
      },
      {
        desc: "最小化所有窗口",
        key: [["Win", "M"]],
      },
      {
        desc: "还原桌面上的最小化窗口",
        key: [["Win", "Shift", "M"]],
      },
      {
        desc: "打开通知中心和日历",
        key: [["Win", "N"]],
      },
      {
        desc: "锁定设备方向",
        key: [["Win", "O"]],
      },
      {
        desc: "选择演示显示模式",
        key: [["Win", "P"]],
      },
      {
        desc: "打开快速助手",
        key: [["Win", "Ctrl", "Q"]],
      },
      {
        desc: "打开“运行”对话框",
        key: [["Win", "R"]],
      },
      {
        desc: "在焦点中录制游戏窗口的视频（使用 Xbox Game Bar）",
        key: [["Win", "Alt", "R"]],
      },
      {
        desc: "打开搜素",
        key: [["Win", "S"]],
      },
      {
        desc: "获取部分屏幕的屏幕截图",
        key: [["Win", "Shift", "S"]],
      },
      {
        desc: "循环浏览任务栏上的应用",
        key: [["Win", "T"]],
      },
      {
        desc: "打开辅助功能设置",
        key: [["Win", "U"]],
      },
      {
        desc: "打开剪贴板历史记录。 注意默认情况下，剪贴板历史记录未打开。 如果要打开它，请使用此键盘快捷方式，然后选择提示以打开历史记录。 或者，可以选择开始>设置>系统>剪贴板，然后打开剪贴板历史记录下的开关",
        key: [["Win", "V"]],
      },
      {
        desc: "将焦点设置到通知",
        key: [["Win", "Shift", "V"]],
      },
      {
        desc: "打开小组件",
        key: [["Win", "W"]],
      },
      {
        desc: "打开“快速链接”菜单",
        key: [["Win", "X"]],
      },
      {
        desc: "在 Windows Mixed Reality 与桌面之间切换输入",
        key: [["Win", "Y"]],
      },
      {
        desc: "打开对齐布局",
        key: [["Win", "Z"]],
      },
      {
        desc: "打开表情符号面板",
        key: [["Win", "."], ["Win", ";"]],
      },
      {
        desc: "临时速览桌面",
        key: [["Win", ","]],
      },
      {
        desc: "打开设置>系统>关于",
        key: [["Win", "Pause"]],
      },
      {
        desc: "搜索电脑（如果已连接到网络）",
        key: [["Win", "Ctrl", "F"]],
      },
      {
        desc: "打开桌面，然后启动固定到任务栏的应用（位于数字所指明的位置）。 如果应用已处于运行状态，则切换至该应用",
        key: [["Win", "1~9"]],
      },
      {
        desc: "打开桌面，然后启动固定到任务栏的应用新实例（位于数字所指明的位置）",
        key: [["Win", "Shift", "1~9"]],
      },
      {
        desc: "打开桌面，然后切换至固定到任务栏的应用的最后活动窗口（位于数字所指明的位置）",
        key: [["Win", "Ctrl", "1~9"]],
      },
      {
        desc: "打开桌面，然后打开固定到任务栏的应用的“跳转列表”（位于数字所指明的位置）",
        key: [["Win", "Alt", "1~9"]],
      },
      {
        desc: "打开桌面，然后以管理员身份打开位于任务栏上指定位置的应用新实例",
        key: [["Win", "Ctrl", "Shift", "1~9"]],
      },
      {
        desc: "打开任务视图",
        key: [["Win", "Tab"]],
      },
      {
        desc: "最大化活动窗口",
        key: [["Win", "↑"]],
      },
      {
        desc: "将活动窗口贴靠到屏幕的上半部分",
        key: [["Win", "Alt", "↑"]],
      },
      {
        desc: "最小化活动窗口",
        key: [["Win", "↓"]],
      },
      {
        desc: "将活动窗口贴靠到屏幕的下半部分",
        key: [["Win", "Alt", "↓"]],
      },
      {
        desc: "将活动窗口贴靠到屏幕的左半部分",
        key: [["Win", "←"]],
      },
      {
        desc: "将活动窗口贴靠到屏幕的右半部分",
        key: [["Win", "→"]],
      },
      {
        desc: "最小化活动窗口之外的所有窗口（第二次还原所有窗口）",
        key: [["Win", "Home"]],
      },
      {
        desc: "将活动窗口的高度调整为最大",
        key: [["Win", "Shift", "↑"]],
      },
      {
        desc: "将活动窗口的高度从最大还原",
        key: [["Win", "Shift", "↓"]],
      },
      {
        desc: "将活动窗口从一个屏幕移动至另一个屏幕",
        key: [["Win", "Shift", "← 或 →"]],
      },
      {
        desc: "在语言和键盘布局中向后循环",
        key: [["Win", "Shift", "Space"]],
      },
      {
        desc: "切换输入语言和键盘布局",
        key: [["Win", "Space"]],
      },
      {
        desc: "打开“讲述人”",
        key: [["Win", "Ctrl", "Enter"]],
      },
      {
        desc: "打开放大镜并放大",
        key: [["Win", "+"]],
      },
      {
        desc: "缩小放大镜",
        key: [["Win", "-"]],
      },
      {
        desc: "关闭放大镜",
        key: [["Win", "Esc"]],
      },
      {
        desc: "从空白或黑屏唤醒电脑",
        key: [["Win", "Ctrl", "Shift", "B"]],
      },
      {
        desc: "将全屏屏幕截图保存到文件",
        key: [["Win", "PrtScn"]],
      },
      {
        desc: "将焦点中的游戏窗口的屏幕截图保存到文件（使用 Xbox Game Bar）",
        key: [["Win", "Alt", "PrtScn"]],
      },
    ],
  },
  {
    title: "命令提示符",
    table: [
      {
        desc: "复制选定文本",
        key: [
          ["Ctrl", "C"],
          ["Ctrl", "Insert"],
        ],
      },
      {
        desc: "粘贴选定文本",
        key: [
          ["Ctrl", "V"],
          ["Shift", "Insert"],
        ],
      },
      {  desc: "进入标记模式", key: [["Ctrl", "M"]] },
      {
        desc: "开始在块模式下选择",
        key: [["Alt", "鼠标左键"]],
      },
      {  desc: "按指定方向移动光标", key: [["方向键"]] },
      {
        desc: "将光标向上移动一个页面",
        key: [["PageUp"]],
      },
      {
        desc: "将光标向下移动一个页面",
        key: [["PageDn"]],
      },
      {
        desc: "（标记模式）将光标移动到缓冲区的起始处。<br>（历史记录导航）如果命令行为空，则将视区移动到缓冲区顶部。 否则，请删除命令行中光标左侧的所有字符",
        key: [["Ctrl", "Home"]],
      },
      {
        desc: "（标记模式）将光标移动到缓冲区的结尾处。<br>（历史记录导航）如果命令行为空，则将视区移动到命令行。 否则，请删除命令行中光标右侧的所有字符",
        key: [["Ctrl", "End"]],
      },
      {
        desc: "在输出历史记录中上移一行",
        key: [["Ctrl", "↑"]],
      },
      {
        desc: "在输出历史记录中下移一行",
        key: [["Ctrl", "↓"]],
      },
    ],
  },
  {
    title: "对话框",
    table: [
      {  desc: "显示活动列表中的项目", key: [["F4"]] },
      {
        desc: "在选项卡中向前移动",
        key: [["Ctrl", "Tab"]],
      },
      {
        desc: "在选项卡中向后移动",
        key: [["Ctrl", "Shift", "Tab"]],
      },
      {
        desc: "移动到第 n 个选项卡",
        key: [["Ctrl", "1~9"]],
      },
      {  desc: "在选项中向前移动", key: [["Tab"]] },
      {
        desc: "在选项中向后移动",
        key: [["Shift", "Tab"]],
      },
      {
        desc: "执行可与该（带下划线的）字母相关的命令（或选择该选项）",
        key: [["Alt", "字母"]],
      },
      {
        desc: "如果活动选项为复选框，则选择或清除复选框",
        key: [["Space"]],
      },
      {
        desc: "如果在“另存为”或“打开”对话框中选择文件夹，则打开上一级别的文件夹",
        key: [["Backspace"]],
      },
      {
        desc: "如果活动选项是一组选项按钮，请选择一个按钮",
        key: [["方向键"]],
      },
    ],
  },
  {
    title: "文件资源管理器",
    table: [
      {  desc: "选择地址栏", key: [["Alt", "D"]] },
      {  desc: "选择搜索框", key: [["Ctrl", "E"]] },
      {  desc: "选择搜索框", key: [["Ctrl", "F"]] },
      {  desc: "打开新窗口", key: [["Ctrl", "N"]] },
      {  desc: "关闭活动窗口", key: [["Ctrl", "W"]] },
      {
        desc: "更改文件和文件夹图标的大小和外观",
        key: [["Ctrl", "鼠标滚轮"]],
      },
      {
        desc: "在左侧文件树中展开当前选中文件所有祖先层级",
        key: [["Ctrl", "Shift", "E"]],
      },
      {
        desc: "创建新文件夹",
        key: [["Ctrl", "Shift", "N"]],
      },
      {
        desc: "显示选定文件夹下的所有子文件夹",
        key: [["NumLock", "*"]],
      },
      {
        desc: "显示选定文件夹中的内容",
        key: [["NumLock", "+"]],
      },
      {
        desc: "折叠选定文件夹",
        key: [["NumLock", "-"]],
      },
      {  desc: "显示预览面板", key: [["Alt", "P"]] },
      {
        desc: "打开选定项的“属性”对话框",
        key: [["Alt", "Enter"]],
      },
      {
        desc: "查看下一个文件夹",
        key: [["Alt", "→"]],
      },
      {
        desc: "查看该文件夹所在的文件夹",
        key: [["Alt", "↑"]],
      },
      {
        desc: "查看上一个文件夹",
        key: [["Alt", "←"], ["Backspace"]],
      },
      {
        desc: "显示当前选择内容（如果已折叠），或选择第一个子文件夹",
        key: [["→"]],
      },
      {
        desc: "折叠当前选择内容（如果已展开），或选择该文件夹所在的文件夹",
        key: [["←"]],
      },
      {  desc: "显示活动窗口底部", key: [["End"]] },
      {  desc: "显示活动窗口顶部", key: [["Home"]] },
      {  desc: "最大化或最小化活动窗口", key: [["F11"]] },
    ],
  },
  {
    title: "虚拟桌面",
    table: [
      {
        desc: "打开任务视图",
        key: [["Win", "Tab"]],
      },
      {
        desc: "添加虚拟桌面",
        key: [["Win", "Ctrl", "D"]],
      },
      {
        desc: "在你于右侧创建的虚拟桌面之间切换",
        key: [["Win", "Ctrl", "→"]],
      },
      {
        desc: "在你于左侧创建的虚拟桌面之间切换",
        key: [["Win", "Ctrl", "←"]],
      },
      {
        desc: "关闭你正在使用的虚拟桌面",
        key: [["Win", "Ctrl", "F4"]],
      },
    ],
  },
  {
    title: "任务栏",
    table: [
      {
        desc: "打开应用或快速打开另一个应用实例",
        key: [["Shift", "鼠标左键"]],
      },
      {
        desc: "以管理员身份打开应用",
        key: [["Ctrl", "Shift", "鼠标左键"]],
      },
      {
        desc: "显示应用的窗口菜单",
        key: [["Shift", "鼠标右键"]],
      },
      {
        desc: "显示组的窗口菜单",
        key: [["Shift", "鼠标右键"]],
      },
      {
        desc: "循环浏览组的窗口",
        key: [["Ctrl", "鼠标左键"]],
      },
    ],
  },
  {
    title: "设置",
    table: [
      {
        desc: "打开设置",
        key: [["Win", "I"]],
      },
      {
        desc: "返回到设置主页",
        key: [["Backspace"]],
      },
    ],
  },
];
document.title += ' for Win11'
showShortcuts();
