import { moduleGroups } from './modules_data.js';

function createCard(item) {
    const card = document.createElement('a');
    card.href = item.href;
    card.className = 'module-card';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = item.title;

    const description = document.createElement('div');
    description.className = 'card-desc';
    description.textContent = item.description;

    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.textContent = item.meta;

    card.append(title, description, meta);
    return card;
}

function createGroup(group) {
    const section = document.createElement('section');

    const heading = document.createElement('h3');
    heading.className = 'section-title';
    heading.textContent = group.dashboardTitle;

    const grid = document.createElement('div');
    grid.className = 'modules-grid';

    group.items.forEach(item => {
        grid.appendChild(createCard(item));
    });

    section.append(heading, grid);
    return section;
}

function renderDashboard() {
    const dashboard = document.getElementById('modules-dashboard');
    if (!dashboard) return;

    dashboard.innerHTML = '';
    moduleGroups.forEach(group => {
        dashboard.appendChild(createGroup(group));
    });
}

renderDashboard();
