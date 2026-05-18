# 课程内容结构规划

为了系统性地学习 Python 算法与数据结构，我们设计了以下文件和目录结构。

## 目录结构

```
/
├── index.html              # 演示系统主入口 (Dashboard)
├── css/
│   ├── style.css           # 全局样式 (Premium Design)
│   └── components.css      # 组件样式
├── js/
│   ├── main.js             # 全局逻辑
│   ├── visualizations/     # 各类算法的可视化脚本
│   │   ├── bubble_sort.js
│   │   └── ...
│   └── utils.js            # 工具函数 (动画控制, 暂停/播放)
├── modules/                # 学习模块内容
│   ├── module1_sorting/
│   │   ├── bubble_sort.html
│   │   └── README.md       # 算法讲解与 Python 代码
│   └── ...
└── README.md               # 项目说明
```

## 学习模块详情

### 模块一：基础排序 (Basic Sorting)

- **目标**: 理解基本的元素交换与比较操作。
- **内容**:
    1. 冒泡排序 (Bubble Sort)
    2. 选择排序 (Selection Sort)
    3. 插入排序 (Insertion Sort)

### 模块二：线性结构 (Linear Structures)

- **目标**: 掌握数据的存储与访问方式 (LIFO, FIFO, 引用)。
- **内容**:
    1. 栈 (Stack) - 演示入栈/出栈
    2. 队列 (Queue) - 演示入队/出队
    3. 链表 (Linked List) - 演示节点插入/删除

... (后续模块待扩展)
