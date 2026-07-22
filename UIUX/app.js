// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// Canvas Cinematic Background Animation (Particles/Stars simulation)
// ==========================================================================
const canvas = document.getElementById('cinematic-bg');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function init() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        
        // Create particles
        const particleCount = Math.floor((width * height) / 15000); // Responsive particle count
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 0.5,
                color: `rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 200 + 55)}, 255, ${Math.random() * 0.5 + 0.1})`,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                depth: Math.random() // For parallax effect
            });
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, width, height);
        
        // Add a subtle gradient background
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(1, '#020205');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Update scroll position for parallax
        const scrollY = window.scrollY;

        particles.forEach(p => {
            // Move particles
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Wrap around edges
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Draw particle
            ctx.beginPath();
            
            // Parallax offset based on scroll and depth
            const parallaxY = p.y - (scrollY * p.depth * 0.5);
            // Wrap parallax Y
            let finalY = parallaxY % height;
            if (finalY < 0) finalY += height;

            ctx.arc(p.x, finalY, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
    }

    window.addEventListener('resize', init);
    init();
    animate();
}

// ==========================================================================
// GSAP Scroll Animations
// ==========================================================================

// Hero elements animation on load
if (document.querySelector('.gsap-hero-elem')) {
    gsap.fromTo('.gsap-hero-elem', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 }
    );
}

// Fade in up elements on scroll
const fadeElements = document.querySelectorAll('.fade-in-up');
fadeElements.forEach(elem => {
    gsap.fromTo(elem,
        { opacity: 0, y: 40 },
        {
            scrollTrigger: {
                trigger: elem,
                start: "top 85%", // Triggers when top of elem hits 85% of viewport
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
        }
    );
});

// ==========================================================================
// Utilities for Interactivity (Tabs, Modals, etc.)
// ==========================================================================

// Simple Tab System for prototype
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabBtns.length === 0) return;

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Show corresponding content
            const targetId = btn.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if(targetContent) {
                targetContent.style.display = 'block';
                // Trigger GSAP animation for tab content
                gsap.fromTo(targetContent, {opacity: 0, y: 10}, {opacity: 1, y: 0, duration: 0.4});
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
});
