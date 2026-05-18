# 项目结构说明

本项目是一个纯静态的算法与数据结构可视化学习站点，使用 HTML/CSS/JavaScript ES Modules 实现。

## 目录结构

```text
/
├── index.html                  # 首页仪表盘
├── css/
│   └── style.css               # 全局样式、组件样式、响应式布局
├── js/
│   ├── modules_data.js         # 模块元数据，驱动首页和侧边栏
│   ├── layout.js               # 公共侧边栏渲染
│   ├── dashboard.js            # 首页模块卡片渲染
│   ├── animation_controller.js # 排序类通用播放控制器
│   ├── utils.js                # 通用工具函数
│   ├── viz_engine.js           # 基础数组可视化引擎
│   └── visualizations/         # 各模块交互逻辑
├── modules/                    # 每个学习模块的 HTML 页面
├── tutorials/                  # 长篇教程补充材料
├── README.md                   # 项目说明
└── start_server.bat            # Windows 本地启动脚本
```

## 当前模块

- 排序：冒泡、选择、插入、快速、归并、排序算法对比
- 线性结构：栈、队列、链表、哈希表
- 搜索：二分查找
- 树与图：BST、堆/优先队列、BFS、DFS、Dijkstra
- 经典题目：有效的括号、反转链表、爬楼梯

## 新增模块流程

1. 在 `modules/` 下新增页面。
2. 在 `js/visualizations/` 下新增对应脚本。
3. 在 `js/modules_data.js` 中添加模块元数据。
4. 如有新的通用视觉元素，优先扩展 `css/style.css`。
