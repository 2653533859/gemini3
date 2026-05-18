# Python 算法与数据结构学习之旅

欢迎来到 **Python 算法与数据结构** 学习项目！本项目旨在通过动态的 HTML 可视化演示，帮助你直观地理解经典算法与数据结构的运行原理，并结合 Python 代码实现，助你系统掌握计算机科学的核心基础。

## 项目目标

1. **直观理解**：通过精美的动态演示（Animation），利用 HTML/CSS/JS 技术呈现算法执行过程。
2. **深入浅出**：从基础的线性结构到复杂的树图算法，循序渐进。
3. **代码对照**：理解原理后，提供 Python 代码实现，理论结合实践。

## 学习路线 (Roadmap)

我们按照以下模块进行系统学习：

- **模块一：基础排序算法** (Bubble, Selection, Insertion)
- **模块二：线性数据结构** (Stack, Queue, Linked List)
- **模块三：进阶排序与搜索** (Merge/Quick Sort, Binary Search)
- **模块四：树与图结构** (Trees, Graphs, BFS/DFS)
- **模块五：动态规划与高级算法**

## 🚀 如何运行 (How to Run)

由于本项目使用了 ES6 Modules (用于模块化管理 JavaScript)，出于浏览器安全策略 (CORS)，直接双击打开 HTML 文件导致可视化功能无法加载。

**推荐启动方式：**

1. **双击运行 `start_server.bat` 脚本** (Windows)
    - 这将自动启动一个本地 Python 服务器并打开浏览器。
2. 或者在终端中运行：

    ```bash
    python -m http.server 8000
    ```

    然后访问: `http://localhost:8000`
3. 使用 VS Code 的 **Live Server** 插件。

## 当前内容

- 排序算法：冒泡、选择、插入、快速、归并
- 线性结构：栈、队列、链表
- 搜索算法：二分查找
- 树与图：BST、BFS、DFS、Dijkstra
- 经典题目：有效的括号、反转链表、爬楼梯

## 维护说明

- 公共侧边栏导航由 `js/layout.js` 统一生成，新增模块时优先修改这里。
- 模块清单集中维护在 `js/modules_data.js`，首页卡片和侧边栏共用同一份数据。
- 排序类页面的播放、暂停、重置、速度控制由 `js/animation_controller.js` 统一管理。
- 全局视觉样式和响应式布局集中在 `css/style.css`。
- 每个可视化模块对应一个 `modules/*.html` 页面和一个 `js/visualizations/*.js` 脚本。

## 后续扩展方向

- 增加单步执行、上一步/下一步和复杂度统计。
- 增加算法对比页面，例如排序算法同屏比较。
- 扩展堆、哈希表、拓扑排序、A*、背包问题、最长公共子序列等模块。
- 配置 GitHub Pages，让项目可以直接在线访问。
