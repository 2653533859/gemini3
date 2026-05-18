# 二叉搜索树 (Binary Search Tree) 详解

二叉搜索树（BST）是一种特殊的二叉树，它对于树中的每个节点，都满足以下性质：

1. **左子树**上所有节点的值均**小于**它的根节点的值。
2. **右子树**上所有节点的值均**大于**它的根节点的值。
3. 左、右子树也分别为二叉搜索树。

## 1. 核心操作与时间复杂度

| 操作 | 平均时间复杂度 | 最坏时间复杂度 | 说明 |
| :--- | :--- | :--- | :--- |
| **Search (查找)** | O(log n) | O(n) | 类似于二分查找 |
| **Insert (插入)** | O(log n) | O(n) | 需要查找到合适的位置 |
| **Delete (删除)** | O(log n) | O(n) | 较为复杂，需要维持 BST 性质 |

> [!WARNING]
> **最坏情况**: 当插入的数据是有序的时（例如 1, 2, 3, 4, 5），BST 会退化成一条**链表**，此时所有操作的时间复杂度降为 O(n)。为了解决这个问题，实际生产中通常使用 **平衡二叉树** (AVL Tree, Red-Black Tree)。

## 2. Python 代码实现

### 定义节点 (TreeNode)

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

### 插入操作 (Insert)

```python
def insert(root, val):
    # Base Case: 如果树为空，新建节点返回
    if not root:
        return TreeNode(val)
    
    # 如果值比当前节点小，去左边插入
    if val < root.val:
        root.left = insert(root.left, val)
    # 如果值比当前节点大，去右边插入
    else:
        root.right = insert(root.right, val)
        
    return root
```

### 查找操作 (Search)

```python
def search(root, val):
    # Base Case: 树为空或找到目标
    if not root or root.val == val:
        return root
    
    # 递归查找
    if val < root.val:
        return search(root.left, val)
    else:
        return search(root.right, val)
```

## 3. 面试常见考点 (Interview Tips)

1. **验证 BST**: 给定一棵树，判断它是否有效？
    * *技巧*: 递归时维护 `min_val` 和 `max_val` 区间。
2. **中序遍历 (In-order Traversal)**:
    * BST 的中序遍历结果是一个**有序数组**。这是 BST 最重要的性质之一。
3. **最近公共祖先 (LCA)**:
    * 如果两个节点值都小于根，LCA 在左边；都大于根，LCA 在右边；否则根就是 LCA。

## 4. 练习题目

- [LeetCode 98. Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/)
* [LeetCode 701. Insert into a Binary Search Tree](https://leetcode.com/problems/insert-into-a-binary-search-tree/)
