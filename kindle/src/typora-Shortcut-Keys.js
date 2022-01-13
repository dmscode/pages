var shortcuts = [
  {
    title: "文件",
    table: [
      {
        keySource: "Ctrl + N/Command + N",
        key: [
          ["Ctrl", "N"],
          ["Command", "N"],
        ],
        desc: "新建文档",
      },
      {
        keySource: "Ctrl + Shift + N/Command +Shift + N",
        key: [
          ["Ctrl", "Shift", "N"],
          ["Command +Shift", "N"],
        ],
        desc: "新建窗口",
      },
      {
        keySource: "（不支持）/Command + T",
        key: [["Command", "T"]],
        desc: "新建标签（仅 Mac）",
      },
      {
        keySource: "Ctrl + O/Command + O",
        key: [
          ["Ctrl", "O"],
          ["Command", "O"],
        ],
        desc: "打开",
      },
      {
        keySource: "Ctrl + P/Command + Shift + O",
        key: [
          ["Ctrl", "P"],
          ["Command", "Shift", "O"],
        ],
        desc: "快速打开",
      },
      {
        keySource: "Ctrl + Shift + T/Command + Shift + T",
        key: [
          ["Ctrl", "Shift", "T"],
          ["Command", "Shift", "T"],
        ],
        desc: "重新打开关闭的文件",
      },
      {
        keySource: "Ctrl + S/Command + S",
        key: [
          ["Ctrl", "S"],
          ["Command", "S"],
        ],
        desc: "保存",
      },
      {
        keySource: "Ctrl + Shift + S/Command + Shift + S",
        key: [
          ["Ctrl", "Shift", "S"],
          ["Command", "Shift", "S"],
        ],
        desc: "另存为/复制",
      },
      {
        keySource: "Ctrl + ,/Command + ,",
        key: [
          ["Ctrl", ","],
          ["Command", ","],
        ],
        desc: "打开偏好设置",
      },
      {
        keySource: "Ctrl + W/Command + W",
        key: [
          ["Ctrl", "W"],
          ["Command", "W"],
        ],
        desc: "关闭",
      },
    ],
  },
  {
    title: "编辑",
    table: [
      { keySource: "进入/进入", key: [["Enter"]], desc: "新段落" },
      {
        keySource: "Shift + Enter/Shift + Enter",
        key: [["Shift", "Enter"]],
        desc: "换行",
      },
      {
        keySource: "Ctrl + X/Command + X",
        key: [
          ["Ctrl", "X"],
          ["Command", "X"],
        ],
        desc: "剪切",
      },
      {
        keySource: "Ctrl + C/Command + C",
        key: [
          ["Ctrl", "C"],
          ["Command", "C"],
        ],
        desc: "复制",
      },
      {
        keySource: "Ctrl + V/Command + V",
        key: [
          ["Ctrl", "V"],
          ["Command", "V"],
        ],
        desc: "粘贴",
      },
      {
        keySource: "Ctrl + Shift + C/Command + Shift + C",
        key: [
          ["Ctrl", "Shift", "C"],
          ["Command", "Shift", "C"],
        ],
        desc: "复制为 Markdown",
      },
      {
        keySource: "Ctrl + Shift + V/Command + Shift + V",
        key: [
          ["Ctrl", "Shift", "V"],
          ["Command", "Shift", "V"],
        ],
        desc: "粘贴为纯文本",
      },
      {
        keySource: "Ctrl + A/Command + A",
        key: [
          ["Ctrl", "A"],
          ["Command", "A"],
        ],
        desc: "全选",
      },
      {
        keySource: "Ctrl + L/Command + L",
        key: [
          ["Ctrl", "L"],
          ["Command", "L"],
        ],
        desc: "选择行/句子<br>选择行（在表格中）",
      },
      {
        keySource: "Ctrl + Shift + Backspace/Command + Shift + Backspace",
        key: [
          ["Ctrl", "Shift", "Backspace"],
          ["Command", "Shift", "Backspace"],
        ],
        desc: "删除行（在表中）",
      },
      {
        keySource: "Ctrl + E/Command + E",
        key: [
          ["Ctrl", "E"],
          ["Command", "E"],
        ],
        desc: "选择样式范围<br>选择单元格（在表格中）",
      },
      {
        keySource: "Ctrl + D/Command + D",
        key: [
          ["Ctrl", "D"],
          ["Command", "D"],
        ],
        desc: "选择单词",
      },
      {
        keySource: "Ctrl + Shift + D/Command + Shift + D",
        key: [
          ["Ctrl", "Shift", "D"],
          ["Command", "Shift", "D"],
        ],
        desc: "删除单词",
      },
      {
        keySource: "Ctrl + Home/Command + ↑",
        key: [
          ["Ctrl", "Home"],
          ["Command", "↑"],
        ],
        desc: "跳转到顶部",
      },
      {
        keySource: "Ctrl + J/Command + J",
        key: [
          ["Ctrl", "J"],
          ["Command", "J"],
        ],
        desc: "跳转到选中位置",
      },
      {
        keySource: "Ctrl + End/Command + ↓",
        key: [
          ["Ctrl", "End"],
          ["Command", "↓"],
        ],
        desc: "跳转到底部",
      },
      {
        keySource: "Ctrl + F/Command + F",
        key: [
          ["Ctrl", "F"],
          ["Command", "F"],
        ],
        desc: "搜索",
      },
      {
        keySource: "F3 / Enter/Command + G / Enter",
        key: [["F3"], ["Enter"], ["Command", "G"], ["Enter"]],
        desc: "查找下一个",
      },
      {
        keySource:
          "Shift + F3 / Shift + Enter/Command + Shift + G / Shift + Enter",
        key: [
          ["Shift", "F3"],
          ["Shift", "Enter"],
          ["Command", "Shift", "G"],
          ["Shift", "Enter"],
        ],
        desc: "查找上一个",
      },
      {
        keySource: "Ctrl + H/Command + H",
        key: [
          ["Ctrl", "H"],
          ["Command", "H"],
        ],
        desc: "替换",
      },
    ],
  },
  {
    title: "元素",
    table: [
      {
        keySource: "Ctrl + 1/2/3/4/5/6/Command + 1/2/3/4/5/6",
        key: [
          ["Ctrl", "1~6"],
          ["Command", "1~6"],
        ],
        desc: "标题 1 至 6（h1~h6）",
      },
      {
        keySource: "Ctrl + 0/Command + 0",
        key: [
          ["Ctrl", "0"],
          ["Command", "0"],
        ],
        desc: "段落",
      },
      {
        keySource: "Ctrl + =/Command + =",
        key: [
          ["Ctrl", "="],
          ["Command", "="],
        ],
        desc: "增加标题级别",
      },
      {
        keySource: "Ctrl + -/Command + -",
        key: [
          ["Ctrl", "-"],
          ["Command", "-"],
        ],
        desc: "降低标题级别",
      },
      {
        keySource: "Ctrl + T/Command + Option + T",
        key: [
          ["Ctrl", "T"],
          ["Command", "Option", "T"],
        ],
        desc: "表格",
      },
      {
        keySource: "Ctrl + Shift + K/Command + Option + C",
        key: [
          ["Ctrl", "Shift", "K"],
          ["Command", "Option", "C"],
        ],
        desc: "代码区域",
      },
      {
        keySource: "Ctrl + Shift + M/Command + Option + B",
        key: [
          ["Ctrl", "Shift", "M"],
          ["Command", "Option", "B"],
        ],
        desc: "公式区域",
      },
      {
        keySource: "Ctrl + Shift + Q/Command + Option + Q",
        key: [
          ["Ctrl", "Shift", "Q"],
          ["Command", "Option", "Q"],
        ],
        desc: "引用",
      },
      {
        keySource: "Ctrl + Shift + [/Command + Option + O",
        key: [
          ["Ctrl", "Shift", "["],
          ["Command", "Option", "O"],
        ],
        desc: "有序列表",
      },
      {
        keySource: "Ctrl + Shift + ]/Command + Option + U",
        key: [
          ["Ctrl", "Shift", "]"],
          ["Command", "Option", "U"],
        ],
        desc: "无序列表",
      },
      {
        keySource: "Ctrl + [ / Tab/Command + [ / Tab",
        key: [["Ctrl", "["], ["Tab"], ["Command", "["], ["Tab"]],
        desc: "缩进",
      },
      {
        keySource: "Ctrl + ] / Shift + Tab/Command + ] / Shift + Tab",
        key: [
          ["Ctrl", "]"],
          ["Shift", "Tab"],
          ["Command", "]"],
          ["Shift", "Tab"],
        ],
        desc: "取消缩进",
      },
    ],
  },
  {
    title: "格式",
    table: [
      {
        keySource: "Ctrl + B/Command + B",
        key: [
          ["Ctrl", "B"],
          ["Command", "B"],
        ],
        desc: "加粗",
      },
      {
        keySource: "Ctrl + I/Command+I",
        key: [["Ctrl", "I"], ["Command+I"]],
        desc: "强调（斜体）",
      },
      {
        keySource: "Ctrl + U/Command + U",
        key: [
          ["Ctrl", "U"],
          ["Command", "U"],
        ],
        desc: "强调（下划线）",
      },
      {
        keySource: "Ctrl + Shift + `/Command + Shift + `",
        key: [
          ["Ctrl", "Shift", "`"],
          ["Command", "Shift", "`"],
        ],
        desc: "行内代码",
      },
      {
        keySource: "Alt + Shift + 5/Control + Shift + `",
        key: [
          ["Alt", "Shift", "5"],
          ["Control", "Shift", "`"],
        ],
        desc: "删除线",
      },
      {
        keySource: "Ctrl + K/Command + K",
        key: [
          ["Ctrl", "K"],
          ["Command", "K"],
        ],
        desc: "超链接",
      },
      {
        keySource: "Ctrl + Shift + I/Command+Control+I",
        key: [["Ctrl", "Shift", "I"], ["Command+Control+I"]],
        desc: "图片",
      },
      {
        keySource: "Ctrl + \\/Command + \\",
        key: [
          ["Ctrl", "\\"],
          ["Command", "\\"],
        ],
        desc: "清除格式",
      },
    ],
  },
  {
    title: "查看",
    table: [
      {
        keySource: "Ctrl + Shift + L/Command + Shift + L",
        key: [
          ["Ctrl", "Shift", "L"],
          ["Command", "Shift", "L"],
        ],
        desc: "切换侧边栏",
      },
      {
        keySource: "Ctrl + Shift + 1/Command + Control + 1",
        key: [
          ["Ctrl", "Shift", "1"],
          ["Command", "Control", "1"],
        ],
        desc: "切换大纲",
      },
      {
        keySource: "Ctrl + Shift + 2/Command + Control + 2",
        key: [
          ["Ctrl", "Shift", "2"],
          ["Command", "Control", "2"],
        ],
        desc: "切换文章列表",
      },
      {
        keySource: "Ctrl + Shift + 3/Command + Control + 3",
        key: [
          ["Ctrl", "Shift", "3"],
          ["Command", "Control", "3"],
        ],
        desc: "切换文件树",
      },
      {
        keySource: "Ctrl + //Command + /",
        key: [["Ctrl", "/"], ["Command", "/"]],
        desc: "切换源代码模式",
      },
      { keySource: "F8/F8", key: [["F8"]], desc: "切换聚焦模式" },
      { keySource: "F9/F9", key: [["F9"]], desc: "切换打字机模式" },
      {
        keySource: "F11/Command + Option + F",
        key: [["F11"], ["Command", "Option", "F"]],
        desc: "切换全屏",
      },
      {
        keySource: "Ctrl + Shift + 0/（不支持）",
        key: [["Ctrl", "Shift", "0"]],
        desc: "重置缩放（100%）（仅 Windows）",
      },
      {
        keySource: "Ctrl + Shift + =/（不支持）",
        key: [["Ctrl", "Shift", "="]],
        desc: "放大（仅 Windows）",
      },
      {
        keySource: "Ctrl + Shift + -/（不支持）",
        key: [["Ctrl", "Shift", "-"]],
        desc: "缩小（仅 Windows）",
      },
      {
        keySource: "Ctrl + Tab/Command + `",
        key: [
          ["Ctrl", "Tab"],
          ["Command", "`"],
        ],
        desc: "在打开的文档之间切换",
      },
    ],
  },
];
document.title += ' for Typora'
showShortcuts();