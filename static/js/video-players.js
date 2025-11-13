document.addEventListener('DOMContentLoaded', function() {
    // Configure video data here...
    const videoData = [
        { 
            src: 'static/videos/1.mp4',
            title: 'Video Demo 1: Visual Search with Reasoning: The model first performs intelligent cropping and zooming on the input image to precisely focus on the key visual cue—the Chinese characters on the signboard. It then invokes image search for initial geolocation, followed by text-based search to conduct cross-modal semantic verification.' 
        },
        { 
            src: 'static/videos/水杯条形码.mp4',
            title: 'Video Demo 2: Image Cropping and Zoom In' 
        },
        { 
            src: 'static/videos/旋转.mp4',
            title: 'Video Demo 3: R1V4-Lite performs rotation and structural reconstruction analysis on the input image, demonstrating active visual reasoning capabilities in understanding spatial relationships and geometric transformations—truly "comprehending the physical logic behind the image.' 
        },
        { 
            src: 'static/videos/录屏2025-11-10 21.11.44.mov',
            title: 'Video Demo 4: Deep Research' 
        },
        { 
            src: 'static/videos/病理放大.mp4',
            title: 'Video Demo 5: The model demonstrates breakthrough capabilities in medical image understanding and cross-domain knowledge-integrated reasoning, offering a verifiable and practical pathway toward intelligent pathological diagnosis.' 
        },
        { 
            src: 'static/videos/茶叶2.mp4',
            title: 'Video Demo 6: R1V4-Lite excels in e-commerce intelligence and content understanding. Faced with complex image inputs, it successfully identifies the product source and provides a detailed product description.' 
        },
        { 
            src: 'static/videos/电商.mp4',
            title: 'Video Demo 7: R1V4-Lite excels in e-commerce intelligence and content understanding. Faced with complex image inputs, it successfully identifies the product source and provides a detailed product description.' 
        },
    ];

    const videoPlayer = document.getElementById('main-video-player');
    const videoTitle = document.getElementById('video-title');
    const videoCounter = document.getElementById('video-counter');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    let currentIndex = 0;

    function updateCarousel() {
        if (!videoData || videoData.length === 0 || !videoPlayer) {
            const carousel = document.querySelector('.video-carousel');
            if(carousel) carousel.style.display = 'none';
            return;
        }

        const currentVideo = videoData[currentIndex];

        videoPlayer.src = currentVideo.src;
        videoTitle.textContent = currentVideo.title;
        videoCounter.textContent = `${currentIndex + 1} / ${videoData.length}`;

        prevBtn.disabled = (currentIndex === 0);
        nextBtn.disabled = (currentIndex === videoData.length - 1);
        
        videoPlayer.load();
    }

    nextBtn.addEventListener('click', function() {
        if (currentIndex < videoData.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    updateCarousel();
});