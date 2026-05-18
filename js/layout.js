import { moduleGroups } from './modules_data.js';

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

function createNavItem({ href, navLabel }) {
    const li = document.createElement('li');
    li.className = 'nav-item';

    const link = document.createElement('a');
    link.href = resolveHref(href);
    link.className = `nav-link${isActive(href) ? ' active' : ''}`;
    link.textContent = navLabel;

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

    moduleGroups.forEach(group => {
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
