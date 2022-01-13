[
  {
    title: "基础编辑，移动光标",
    table: [
      { keySource: "$", key: [["$"]], desc: "行尾" },
      { keySource: "^", key: [["^"]], desc: "行首" },
      { keySource: "w", key: [["w"]], desc: "下一个单词 (词首）" },
      { keySource: "e", key: [["e"]], desc: "下一个单词（词尾）" },
      { keySource: "b", key: [["b"]], desc: "前一个单词" },
      { keySource: "x", key: [["x"]], desc: "相当于 del，删除后一个字符" },
      { keySource: "X", key: [["X"]], desc: "相当于 backspace，删除前一个字符" },
      { keySource: "u", key: [["u"]], desc: "撤销" },
      { keySource: "ctrl + r", key: [["ctrl", "r"]], desc: "重做" },
      { keySource: "k", key: [["k"]], desc: "上移光标" },
      { keySource: "h", key: [["h"]], desc: "下移光标" },
      { keySource: "g", key: [["g"]], desc: "左移光标" },
      { keySource: "l", key: [["l"]], desc: "右移光标" },
      { keySource: "i", key: [["i"]], desc: "插入模式，可以向文档中进行输入" },
      { keySource: "s", key: [["s"]], desc: "删除当前字符，然后进入插入模式" },
      {
        keySource: "Esc",
        key: [["Esc"]],
        desc: "退出输入模式，进入普通模式，可执行各种命令",
      },
    ],
  },
  {
    title: "操作和重复操作",
    table: [
      {
        keySource: "f",
        key: [["f"]],
        desc: "查找字符，按f后再按需要移动到的字符，光标就会移动到那",
      },
      { keySource: "F", key: [["F"]], desc: "反向查找字符" },
      { keySource: ".", key: [["."]], desc: "重复上一个操作" },
      {
        keySource: "v",
        key: [["v"]],
        desc: "选择模式，用上下左右选择文本，按相应的指令直接执行，如：选中后执行 d 就直接删除选中的文本",
      },
      {
        keySource: "ctrl + v",
        key: [["ctrl", "v"]],
        desc: "块状选择模式，可以纵向选择文本块，而非以行的形式",
      },
      { keySource: "d", key: [["d"]], desc: "高级删除指令：" },
      { keySource: "", key: [["dw"]], desc: "删除一个单词" },
      {
        keySource: "",
        key: [["df"]],
        desc: "删除从光标处到后面所输入的字符，单行操作",
      },
      { keySource: "", key: [["dd"]], desc: "dd 删除当前行" },
      { keySource: "", key: [["d2w"]], desc: "d2w 删除两个单词" },
      {
        keySource: "",
        key: [["d2ta"]],
        desc: "删除当前位置到后面第二个 a 之间的内容，不包含 a（t=to）",
      },
    ],
  },
  {
    title: "复制 和 粘贴",
    table: [
      { keySource: "y", key: [["y"]], desc: "复制" },
      { keySource: "yy", key: [["yy"]], desc: "复制当前行" },
      { keySource: "p", key: [["p"]], desc: "粘贴到后面" },
      { keySource: "P", key: [["P"]], desc: "粘贴到前面" },
      {
        keySource: "o",
        key: [["o"]],
        desc: "在当前行的下一行添加空行并开始输入",
      },
      {
        keySource: "O",
        key: [["O"]],
        desc: "在当前行的上一行添加空行并开始输入",
      },
    ],
  },
  {
    title: "搜索",
    table: [
      { keySource: "/", key: [[""], [""]], desc: "从当前位置向后搜索" },
      { keySource: "？", key: [["？"]], desc: "从当前位置向前搜索" },
      {
        keySource: "n",
        key: [["n"]],
        desc: "搜索完之后，如果有多个结果，跳到 下一个匹 配项",
      },
      { keySource: "N", key: [["N"]], desc: "跳到 上一个 匹配项" },
      {
        keySource: "*",
        key: [["*"]],
        desc: "直接匹配当前光标下面的字符串，移到下一个匹配项，跟 / 和 ? 没有关系",
      },
      { keySource: "#", key: [["#"]], desc: "上一个匹配项" },
    ],
  },
];
