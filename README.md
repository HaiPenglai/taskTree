# 🌳 taskTree - 缓解拖延/ADHD/选择困难

### 📌 项目介绍
taskTree是一个为了缓解`拖延症`/`ADHD`/`选择困难症`设计的任务管理工具。通过树状`任务分解`/`任务计时`/`任务推荐`，帮助处理`不想做`/`不知道怎么做`/`不是不得不做`的任务，并可视化每天的`计划完成情况`和`时间估计合理度`。

### ⬇️ 如何下载
• 点击网页中的`Code`按钮 → 选择`Download ZIP`

• 或使用git命令克隆项目：

```shell
git clone https://github.com/HaiPenglai/taskTree.git
```

### 🔧 如何安装

1. 首先安装Node.js运行环境，安装后检查版本号：
```shell
npm -v
```

2. 初始化项目依赖：
```shell
npm install
```

### 🚀 开发与构建命令
| 命令                | 用途                           |
|---------------------|-------------------------------|
| `npm run ui`        | 启动`Vue`服务器，可用`http://127.0.0.1:xxx`查看 |
| `npm run build`     | 把`Vue`前端代码构建到`dist`目录，可用`index.html`查看 |
| `npm start`  | 启动`electron`应用显示`dist`目录中的前端代码 |
| `npm run pack`      | 把`electron`应用生成一个包，点击.exe可运行 |
| `npm run installer` | 把`electron`应用生成安装包，点击.exe可安装 |
