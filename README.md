# 🌳 taskTree - 缓解拖延/ADHD/选择困难/完美主义

## 记录每一天/不用动脑/不怕不在状态

### 📌 项目介绍
taskTree是为`拖延症`/`ADHD`/`选择困难症`/`完美主义`设计的辅助工具。含`任务分解`/`任务计时`/`任务推荐`功能，可视化每天的`计划完成度`和`时间估计合理度`，对`长期`和`短期`目标规划总结。

### 📦 安装包安装

点击右侧release，下载exe文件，点击安装，选择安装路径，安装后点击快捷方式即可使用。

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
| `npm run ui`        | 启动`Vue`服务器，可用`http://127.0.0.1:xxx`访问网页 |
| `npm run build`     | 把`Vue`前端代码构建到`dist-vue`目录，可用`index.html`查看 |
| `npm start`  | 启动`electron`应用显示`dist-vue`目录中的前端代码 |
| `npm run pack`      | 把`electron`应用生成一个包到dist，点击.exe可运行 |
| `npm run installer` | 把`electron`应用生成安装包到dist，点击.exe可安装 |

### 📁 项目结构

```shell
TaskTree/  
├── public/  
│   └── icon.ico  
├── dist-vue/...
├── dist/...
├── src/  
│   ├── components/
│   │   ├── task-tree/...
│   │   └── ...
│   ├── utils/  
│   │   └── ...
│   ├── App.vue
│   └── main.js
├── server
│   ├── taskTreeAPI.js
│   └──...
├── .gitignore  
├── main.js  
├── package.json  
├── README.md  
└── vue.config.js  
```

### 💡 我的思考：存在即合理

1. 拖延症来自对`未知`的恐惧，是`进化`出的一种`自保机制`。事后来看，有的拖延确实规避了危险行动。

2. ADHD是`注意力`分散在`感兴趣`的事上，对不感兴趣的事没有注意力。事后来看，有的不感兴趣的事确实可以不做或有更优做法。

3. 选择困难症是对选择的`恐惧`。事后来看，当初最优的选择未必最优，没有走过的路被美化了。

4. 完美主义是想要做到`认知内的完美`。事后来看，完美主义把很多事做好了，只是从认知外来看差别不大。

5. 动机无法凭空产生，人只对`感觉有意义`，`知道怎么做`，`不得不做`的事情有动机。

### 解决方案： 顺应情绪 + 保持进度感

对于一件`没有意义`而且`不知道怎么做`而且`不做没影响`的事，是无解的，`强迫自己`/`辅助工具`是无用的，那就不做了，即顺势而为。

如果想做一件`感觉有点意义`或者`想好了一部分做法`或者`早做早收工`的事，是有解的，`顺应情绪`/`辅助工具`是有用的，那就做，即顺势而为。

要顺应情绪，因为一件真正值得做的事做起来不应该太难受。

高难度目标对应庞大任务树的某条很长的主干，很难直接点亮。但是可以尝试从广度突破/先做有进度的/耗时短的，保持进度感。

### 设计思路：不解决无解的事，但让有解的事更顺应情绪

对无解的事缺乏动力是合理的，是进化的一种保护机制。

对有解的事缺乏动力，大多是因为`不知道怎么做`，即使做法足够具体，也`不知道先做什么`，即使都知道也感觉`没有意义`或`不做没影响`。

其中`不知道怎么做`可以被`任务分解`缓解，`不知道先做什么`可以被`任务推荐`缓解，感觉`没有意义`可被`计划完成度`可视化缓解，感觉不做没影响可被`时间估计合理度`缓解。

