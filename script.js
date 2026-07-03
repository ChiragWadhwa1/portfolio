// Init Lucide Icons
if(typeof lucide !== 'undefined') lucide.createIcons();

// Utilities
window.triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([15, 30, 15]);
    }
};

// Observers for Fade-In Effects
window.fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            window.fadeInObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Header Scrolling Logic
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if(header) {
            header.classList.toggle('header-scrolled', window.scrollY > 50);
        }
    });
    
    // Mobile Menu Logic
    const menuBtn = document.getElementById('menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    if(menuBtn && mobileNav) {
        menuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('-translate-x-full');
            document.body.classList.toggle('overflow-hidden');
        });
    }
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.add('-translate-x-full');
            document.body.classList.remove('overflow-hidden');
        });
    });

    // Magnetic Buttons Hover Effect
    document.querySelectorAll('.magnetic-button').forEach(button => {
        button.addEventListener('mousemove', e => {
            const { offsetX, offsetY, target } = e;
            const { clientWidth, clientHeight } = target;
            const x = (offsetX / clientWidth - 0.5) * 40;
            const y = (offsetY / clientHeight - 0.5) * 40;
            gsap.to(button, { x: x, y: y, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        });
        button.addEventListener('mouseleave', () => {
            gsap.to(button, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        });
    });

    // Attach Fade Observer to Sections
    document.querySelectorAll('.section-fade-in').forEach(section => {
        window.fadeInObserver.observe(section);
    });

    // 3D Globe Background Setup (Three.js)
    const initGlobe = (canvasId) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        const globeGroup = new THREE.Group();
        scene.add(globeGroup);

        const radius = 11;
        const material = new THREE.LineBasicMaterial({ 
            color: 0x22d3ee,
            transparent: true, 
            opacity: 0.12 
        });

        const lonCount = 16;
        for (let i = 0; i < lonCount; i++) {
            const theta = (i / lonCount) * Math.PI;
            const points = [];
            for (let j = 0; j <= 64; j++) {
                const phi = (j / 64) * Math.PI * 2;
                points.push(new THREE.Vector3(
                    radius * Math.cos(theta) * Math.sin(phi),
                    radius * Math.cos(phi),
                    radius * Math.sin(theta) * Math.sin(phi)
                ));
            }
            const geom = new THREE.BufferGeometry().setFromPoints(points);
            globeGroup.add(new THREE.Line(geom, material));
        }

        const latCount = 6;
        for (let i = 1; i < latCount; i++) {
            const phi = (i / latCount) * Math.PI;
            const points = [];
            const r = radius * Math.sin(phi);
            const y = radius * Math.cos(phi);
            for (let j = 0; j <= 64; j++) {
                const theta = (j / 64) * Math.PI * 2;
                points.push(new THREE.Vector3(
                    r * Math.cos(theta),
                    y,
                    r * Math.sin(theta)
                ));
            }
            const geom = new THREE.BufferGeometry().setFromPoints(points);
            globeGroup.add(new THREE.Line(geom, material));
        }

        const updateGlobe = () => {
            if (window.innerWidth < 768) {
                camera.position.z = 22;
                globeGroup.position.y = -3; 
            } else {
                camera.position.z = 18;
                globeGroup.position.y = 0;
            }
        };
        updateGlobe();

        const animate = () => {
            requestAnimationFrame(animate);
            globeGroup.rotation.y += 0.002;
            globeGroup.rotation.x += 0.001;
            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            updateGlobe();
        });
    };

    initGlobe('hero-globe-canvas');

    // Dynamic Year for Footer
    const year = new Date().getFullYear();
    if(document.getElementById('year')) document.getElementById('year').textContent = year;

    // Video Player Logic
    const videoContainers = document.querySelectorAll('.video-container');

    videoContainers.forEach(container => {
        const video = container.querySelector('video');
        const overlay = container.querySelector('.play-overlay');
        
        // Desktop Hover Handling
        container.addEventListener('mouseenter', () => {
            if (video.paused) {
                video.play().catch(() => {});
                overlay.style.opacity = '0';
            }
        });
        
        container.addEventListener('mouseleave', () => {
            if (!video.paused) {
                video.pause();
                overlay.style.opacity = '1';
            }
        });
        
        // Mobile Tap Handling
        container.addEventListener('click', () => {
            triggerHaptic();
            if (video.paused) {
                document.querySelectorAll('.video-container video').forEach(v => {
                    if(v !== video) {
                        v.pause();
                        v.closest('.video-container').querySelector('.play-overlay').style.opacity = '1';
                    }
                });
                video.play();
                overlay.style.opacity = '0';
            } else {
                video.pause();
                overlay.style.opacity = '1';
            }
        });
    });
});
