document.addEventListener('DOMContentLoaded', async () => {
    // 从 URL 获取项目 ID
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (projectId) {
        await loadProjectDetails(projectId);
    }
});

async function loadProjectDetails(projectId) {
    try {
        const response = await fetch(`http://localhost:3000/api/projects/${projectId}`);
        const project = await response.json();

        // 更新页面标题和元数据
        document.title = `${project.name} - Alpha Studio`;
        document.getElementById('projectTitle').textContent = project.name;
        document.getElementById('projectYear').textContent = project.year;
        document.getElementById('projectCategory').textContent = project.category;
        document.getElementById('projectDesc').textContent = project.description;

        // 加载图片画廊
        const gallery = document.getElementById('projectGallery');
        project.images.forEach(imagePath => {
            const img = document.createElement('img');
            img.src = imagePath;
            img.alt = project.name;
            
            // 图片加载完成后添加动画
            img.onload = () => {
                img.classList.add('loaded');
            };
            
            gallery.appendChild(img);
        });

        // 设置导航链接
        await setupProjectNavigation(projectId);
    } catch (error) {
        console.error('加载项目详情失败：', error);
    }
}

async function setupProjectNavigation(currentId) {
    try {
        const response = await fetch('http://localhost:3000/api/projects');
        const projects = await response.json();
        
        const currentIndex = projects.findIndex(p => p.id === parseInt(currentId));
        const prevProject = projects[currentIndex - 1];
        const nextProject = projects[currentIndex + 1];

        const prevLink = document.querySelector('.prev-project');
        const nextLink = document.querySelector('.next-project');

        if (prevProject) {
            prevLink.href = `project-detail.html?id=${prevProject.id}`;
            prevLink.textContent = `← ${prevProject.name}`;
        } else {
            prevLink.style.visibility = 'hidden';
        }

        if (nextProject) {
            nextLink.href = `project-detail.html?id=${nextProject.id}`;
            nextLink.textContent = `${nextProject.name} →`;
        } else {
            nextLink.style.visibility = 'hidden';
        }
    } catch (error) {
        console.error('设置项目导航失败：', error);
    }
} 