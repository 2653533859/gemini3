const navGroups = [
    {
        title: '排序算法 (Sorting)',
        items: [
            { href: 'modules/bubble_sort.html', label: '冒泡排序 (Bubble)' },
            { href: 'modules/selection_sort.html', label: '选择排序 (Selection)' },
            { href: 'modules/insertion_sort.html', label: '插入排序 (Insertion)' },
            { href: 'modules/quick_sort.html', label: '快速排序 (Quick)' },
            { href: 'modules/merge_sort.html', label: '归并排序 (Merge)' },
        ],
    },
    {
        title: '线性结构 (Linear)',
        items: [
            { href: 'modules/linked_list.html', label: '链表 (Linked List)' },
            { href: 'modules/stack.html', label: '栈 (Stack)' },
            { href: 'modules/queue.html', label: '队列 (Queue)' },
        ],
    },
    {
        title: '搜索算法 (Search)',
        items: [
            { href: 'modules/binary_search.html', label: '二分查找 (Binary)' },
        ],
    },
    {
        title: '树与图 (Trees & Graphs)',
        items: [
            { href: 'modules/bst.html', label: '二叉搜索树 (BST)' },
            { href: 'modules/graph_bfs.html', label: '网格 BFS (Grid BFS)' },
            { href: 'modules/graph_dfs.html', label: '网格 DFS (Grid DFS)' },
            { href: 'modules/graph_dijkstra.html', label: 'Dijkstra 最短路径' },
        ],
    },
    {
        title: '经典题目 (Problems)',
        items: [
            { href: 'modules/problem_valid_parentheses.html', label: '有效的括号 (Stack)' },
            { href: 'modules/problem_reverse_linked_list.html', label: '反转链表 (Linked List)' },
            { href: 'modules/problem_climbing_stairs.html', label: '爬楼梯 (DP)' },
        ],
    },
];

function isModulePage() {
    return window.location.pathname.includes('/modules/');
}

function resolveHref(href) {
    return isModulePage() ? href.replace('modules/', '') : href;
}

function isActive(href) {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    const target = href.split('/').pop();
    return current === target;
}

function createNavItem({ href, label }) {
    const li = document.createElement('li');
    li.className = 'nav-item';

    const link = document.createElement('a');
    link.href = resolveHref(href);
    link.className = `nav-link${isActive(href) ? ' active' : ''}`;
    link.textContent = label;

    li.appendChild(link);
    return li;
}

function renderNavigation() {
    const sidebar = document.getElementById('sidebar-nav');
    if (!sidebar) return;

    const dashboardHref = isModulePage() ? '../index.html' : 'index.html';
    const dashboardActive = isActive('index.html') ? ' active' : '';

    sidebar.innerHTML = `
        <div class="sidebar-header">
            <h1>AlgoViz Py</h1>
        </div>
        <ul class="nav-links">
            <li class="nav-item">
                <a href="${dashboardHref}" class="nav-link${dashboardActive}">仪表盘 (Dashboard)</a>
            </li>
        </ul>
    `;

    const navLinks = sidebar.querySelector('.nav-links');

    navGroups.forEach(group => {
        const category = document.createElement('li');
        category.className = 'nav-category';
        category.textContent = group.title;
        navLinks.appendChild(category);

        group.items.forEach(item => {
            navLinks.appendChild(createNavItem(item));
        });
    });
}

renderNavigation();
