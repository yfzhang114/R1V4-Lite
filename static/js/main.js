document.addEventListener('DOMContentLoaded', function() {
    const tabsContainer = document.querySelector('.tabs-container');
    const contentArea = document.querySelector('.content-area');
    
    // Check if FlexibleCaseRenderer is available
    if (typeof FlexibleCaseRenderer === 'undefined') {
        contentArea.innerHTML = '<p class="error">Case renderer not loaded. Please check if flexible-case-renderer.js is included.</p>';
        return;
    }
    
    const renderer = new FlexibleCaseRenderer();
    
    // Load cases data
    fetch('static/data/cases.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.cases) {
                throw new Error('Invalid data format');
            }
            renderTabs(data.cases);
            if (data.cases.length > 0) {
                showCase(data.cases[0]);
            }
        })
        .catch(error => {
            console.error('Error loading cases:', error);
            contentArea.innerHTML = `<p class="error">Failed to load cases data: ${error.message}</p>`;
        });
    
    function renderTabs(cases) {
        if (!cases || cases.length === 0) {
            tabsContainer.innerHTML = '<p class="error">No cases available</p>';
            return;
        }
        
        tabsContainer.innerHTML = cases.map((caseItem, index) => `
            <div class="tab ${index === 0 ? 'active' : ''}" data-case-id="${caseItem.id}">
                <div class="tab-title">${caseItem.title}</div>
                ${caseItem.description ? `<div class="tab-description">${caseItem.description}</div>` : ''}
            </div>
        `).join('');
        
        // Add click handlers
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const caseId = parseInt(this.dataset.caseId);
                const caseData = cases.find(c => c.id === caseId);
                if (caseData) {
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    showCase(caseData);
                }
            });
        });
    }
    
    function showCase(caseData) {
        try {
            contentArea.innerHTML = renderer.renderCase(caseData);
            
            // 滚动到内容区域顶部
            contentArea.scrollTop = 0;

            // Re-initialize Prism for syntax highlighting
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
        } catch (error) {
            console.error('Error rendering case:', error);
            contentArea.innerHTML = `<p class="error">Error rendering case: ${error.message}</p>`;
        }
    }

    function createImageViewer() {
        const viewerHTML = `
            <div id="imageViewer" class="image-viewer" style="display: none;">
                <div class="image-viewer-overlay" onclick="closeImageViewer()"></div>
                <div class="image-viewer-container">
                    <button class="image-viewer-close" onclick="closeImageViewer()">&times;</button>
                    <div class="image-viewer-content">
                        <img id="viewerImage" src="" alt="">
                    </div>
                    <div class="image-viewer-controls">
                        <button onclick="zoomIn()">+</button>
                        <button onclick="zoomOut()">-</button>
                        <button onclick="resetZoom()">Reset</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', viewerHTML);
    }

    let currentZoom = 1;
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;

    
    window.openImageViewer = function(src, caption) {
        const viewer = document.getElementById('imageViewer');
        const image = document.getElementById('viewerImage');
        
        if (!viewer) {
            createImageViewer();
            return openImageViewer(src, caption);
        }
        
        image.src = src;
        viewer.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        image.onload = function() {
            fitImageToContainer();
            addImageViewerEvents();
        };
        
        translateX = 0;
        translateY = 0;
    };

    function fitImageToContainer() {
        const image = document.getElementById('viewerImage');
        const container = document.querySelector('.image-viewer-content');
        
        if (!image || !container) return;
        
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const imageWidth = image.naturalWidth;
        const imageHeight = image.naturalHeight;
        
        const scaleX = containerWidth / imageWidth;
        const scaleY = containerHeight / imageHeight;
        currentZoom = Math.min(scaleX, scaleY, 1); 
        
        translateX = 0;
        translateY = 0;
        
        updateImageTransform();
    }

    window.closeImageViewer = function() {
        const viewer = document.getElementById('imageViewer');
        if (viewer) {
            viewer.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    window.zoomIn = function() {
        currentZoom = Math.min(currentZoom * 1.2, 5);
        updateImageTransform();
    };

    window.zoomOut = function() {
        currentZoom = Math.max(currentZoom / 1.2, 0.1);
        updateImageTransform();
    };

    window.resetZoom = function() {
        fitImageToContainer();
    };

    function updateImageTransform() {
        const image = document.getElementById('viewerImage');
        if (image) {
            image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
        }
    }

    function addImageViewerEvents() {
        const image = document.getElementById('viewerImage');
        const container = document.querySelector('.image-viewer-content');
        
        if (!image || !container) return;
        
        window.addEventListener('resize', function() {
            if (document.getElementById('imageViewer').style.display === 'flex') {
                setTimeout(fitImageToContainer, 100);
            }
        });
        
        container.onwheel = function(e) {
            e.preventDefault();
            if (e.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        };
        
        image.onmousedown = function(e) {
            e.preventDefault();
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            image.style.cursor = 'grabbing';
        };
        
        document.onmousemove = function(e) {
            if (!isDragging) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateImageTransform();
        };
        
        document.onmouseup = function() {
            isDragging = false;
            const image = document.getElementById('viewerImage');
            if (image) {
                image.style.cursor = 'grab';
            }
        };
        
        document.onkeydown = function(e) {
            if (e.key === 'Escape') {
                closeImageViewer();
            }
        };
}

    createImageViewer();
});