// 项目搜索和筛选功能
const projectSearch = document.getElementById('projectSearch');
const filterTags = document.querySelectorAll('.filter-tags .tag');
const projectGrid = document.querySelector('.project-grid');

// 获取所有项目数据
async function fetchProjects() {
    try {
        const response = await fetch('http://localhost:3000/api/projects');
        return await response.json();
    } catch (error) {
        console.error('获取项目失败：', error);
        return [];
    }
}

// 渲染项目列表
function renderProjects(projects) {
    projectGrid.innerHTML = projects.map(project => `
        <div class="project-item" data-category="${project.category}">
            <img src="${project.images[0]}" alt="${project.name}">
            <div class="project-info">
                <h3>${project.name}</h3>
                <p>${project.year}</p>
            </div>
        </div>
    `).join('');
}

// 搜索和筛选功能
function filterProjects() {
    const searchTerm = projectSearch.value.toLowerCase();
    const activeTag = document.querySelector('.tag.active').textContent;
    
    const projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach(item => {
        const title = item.querySelector('h3').textContent.toLowerCase();
        const category = item.dataset.category;
        
        const matchesSearch = title.includes(searchTerm);
        const matchesTag = activeTag === '全部' || category === activeTag.toLowerCase();
        
        item.style.display = matchesSearch && matchesTag ? 'block' : 'none';
    });
}

// 标签点击事件
filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
        filterTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        filterProjects();
    });
});

// 搜索输入事件
projectSearch.addEventListener('input', filterProjects);

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 页面加载时获取并显示项目
document.addEventListener('DOMContentLoaded', async () => {
    const projects = await fetchProjects();
    renderProjects(projects);
});

// 导航栏滚动效果
const header = document.querySelector('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
}); 