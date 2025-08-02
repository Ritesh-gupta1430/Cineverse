// Advanced Animations Controller
class AnimationController {
    constructor() {
        this.animationsEnabled = window.innerWidth >= 1200;
        this.animationQueue = [];
        this.isAnimating = false;
        this.observers = new Map();
        this.scrollAnimations = new Set();
        this.cursorEffects = new Map();
        
        this.init();
    }

    init() {
        if (!this.animationsEnabled) return;

        this.setupIntersectionObservers();
        this.setupScrollAnimations();
        this.setupCursorAnimations();
        this.setupPageTransitions();
        this.createParticleSystem();
        this.setupTextAnimations();
        this.initializeAdvancedEffects();
    }

    // Intersection Observer for scroll-triggered animations
    setupIntersectionObservers() {
        if (!this.animationsEnabled) return;

        const observerOptions = {
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
            rootMargin: '0px 0px -50px 0px'
        };

        // Main scroll reveal observer
        const scrollRevealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerScrollAnimation(entry.target, entry.intersectionRatio);
                }
            });
        }, observerOptions);

        // Grid animation observer
        const gridObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateGrid(entry.target);
                }
            });
        }, { threshold: 0.1 });

        // Store observers
        this.observers.set('scrollReveal', scrollRevealObserver);
        this.observers.set('grid', gridObserver);

        // Observe elements
        this.observeElements();
    }

    observeElements() {
        // Scroll reveal elements
        const scrollElements = document.querySelectorAll(
            '.movie-card, .reason-card, .team-member, .section-title, .hero-content'
        );
        scrollElements.forEach(el => {
            if (!el.hasAttribute('data-observed')) {
                el.classList.add('scroll-reveal');
                this.observers.get('scrollReveal').observe(el);
                el.setAttribute('data-observed', 'true');
            }
        });

        // Grid elements
        const gridElements = document.querySelectorAll('.movie-grid');
        gridElements.forEach(grid => {
            if (!grid.hasAttribute('data-grid-observed')) {
                this.observers.get('grid').observe(grid);
                grid.setAttribute('data-grid-observed', 'true');
            }
        });
    }

    triggerScrollAnimation(element, ratio) {
        const animationType = element.dataset.animation || 'fadeIn';
        const delay = parseInt(element.dataset.delay) || 0;
        
        setTimeout(() => {
            element.classList.add('revealed');
            this.applyAnimation(element, animationType);
        }, delay);
    }

    applyAnimation(element, type) {
        const animations = {
            fadeIn: () => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                });
            },
            slideLeft: () => {
                element.style.opacity = '0';
                element.style.transform = 'translateX(-50px)';
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateX(0)';
                });
            },
            slideRight: () => {
                element.style.opacity = '0';
                element.style.transform = 'translateX(50px)';
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateX(0)';
                });
            },
            scaleIn: () => {
                element.style.opacity = '0';
                element.style.transform = 'scale(0.8)';
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'scale(1)';
                });
            },
            bounceIn: () => {
                element.style.opacity = '0';
                element.style.transform = 'scale(0.3)';
                element.style.transition = 'opacity 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55), transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'scale(1)';
                });
            }
        };

        if (animations[type]) {
            animations[type]();
        } else {
            animations.fadeIn();
        }
    }

    animateGrid(grid) {
        const items = grid.querySelectorAll('.movie-card');
        
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px) scale(0.9)';
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0) scale(1)';
                item.classList.add('grid-animated');
            }, index * 100);
        });
    }

    // Advanced scroll animations
    setupScrollAnimations() {
        if (!this.animationsEnabled) return;

        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollAnimations();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    updateScrollAnimations() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercent = scrollTop / (documentHeight - windowHeight);

        // Update scroll-based text animations
        this.updateScrollText(scrollPercent);
        
        // Update parallax elements
        this.updateParallax(scrollTop);
        
        // Update navbar
        this.updateNavbar(scrollTop);
        
        // Update progress indicators
        this.updateProgress(scrollPercent);
    }

    updateScrollText(scrollPercent) {
        return;
    }

    updateParallax(scrollTop) {
        const parallaxElements = document.querySelectorAll('.floating-card, .parallax-element');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.05;
            const yPos = -(scrollTop * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    updateNavbar(scrollTop) {
        const navbar = document.getElementById('navbar');
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    updateProgress(scrollPercent) {
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            bar.style.width = `${scrollPercent * 100}%`;
        });
    }

    setupCursorAnimations() {
        if (!this.animationsEnabled) return;

        let cursor = null;
        let cursorFollower = null;

        if (window.innerWidth > 768) {
            this.createCustomCursor();
        }

        document.addEventListener('mousemove', (e) => {
            this.updateCursorPosition(e.clientX, e.clientY);
            this.handleCursorEffects(e);
        });

        this.setupHoverEffects();
    }

    createCustomCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.innerHTML = '<div class="cursor-dot"></div>';
        
        const follower = document.createElement('div');
        follower.className = 'cursor-follower';
        
        document.body.appendChild(cursor);
        document.body.appendChild(follower);
        this.addCursorStyles();
    }

    addCursorStyles() {
        const styles = `
            .custom-cursor {
                position: fixed;
                top: 0;
                left: 0;
                width: 10px;
                height: 10px;
                background: var(--primary-color);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transition: transform 0.1s ease;
            }
            
            .cursor-follower {
                position: fixed;
                top: 0;
                left: 0;
                width: 30px;
                height: 30px;
                border: 2px solid var(--primary-color);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
                transition: transform 0.2s ease;
                opacity: 0.5;
            }
            
            .cursor-hover {
                transform: scale(1.5);
            }
            
            .cursor-click {
                transform: scale(0.8);
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    updateCursorPosition(x, y) {
        const cursor = document.querySelector('.custom-cursor');
        const follower = document.querySelector('.cursor-follower');
        
        if (cursor) {
            cursor.style.transform = `translate(${x - 5}px, ${y - 5}px)`;
        }
        
        if (follower) {
            follower.style.transform = `translate(${x - 15}px, ${y - 15}px)`;
        }
    }

    handleCursorEffects(e) {
        const target = e.target;
        
        if (target.tagName === 'IMG' && target.closest && target.closest('.movie-card')) {
            this.triggerImageHoverEffect(target);
        }
        
        if (target.matches('.cursor-effect, .movie-card, .reason-card, .team-member')) {
            this.triggerCursorEffect(target, e);
        }
    }

    triggerImageHoverEffect(image) {
        if (!image.dataset.originalSrc) {
            image.dataset.originalSrc = image.src;
        }
        
        image.style.filter = 'brightness(1.1) contrast(1.1)';
        image.style.transform = 'scale(1.05)';
    }

    triggerCursorEffect(element, event) {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Create ripple effect
        this.createRippleEffect(element, x, y);
        
        // Update cursor appearance
        const cursor = document.querySelector('.custom-cursor');
        if (cursor) {
            cursor.classList.add('cursor-hover');
            setTimeout(() => cursor.classList.remove('cursor-hover'), 300);
        }
    }

    setupHoverEffects() {
        // Movie cards
        document.addEventListener('mouseenter', (e) => {
            if (e.target && e.target.closest && e.target.closest('.movie-card')) {
                this.animateMovieCardHover(e.target.closest('.movie-card'), true);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target && e.target.closest && e.target.closest('.movie-card')) {
                this.animateMovieCardHover(e.target.closest('.movie-card'), false);
            }
        }, true);
    }

    animateMovieCardHover(card, isEntering) {
        const poster = card.querySelector('.movie-poster');
        const overlay = card.querySelector('.movie-overlay');
        
        if (isEntering) {
            card.style.transform = 'translateY(-10px) scale(1.02)';
            card.style.boxShadow = '0 10px 30px rgba(255, 107, 53, 0.3)';
            
            if (poster) {
                poster.style.filter = 'brightness(1.1) contrast(1.1)';
            }
            
            if (overlay) {
                overlay.style.opacity = '1';
            }
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '0 4px 25px rgba(0, 0, 0, 0.3)';
            
            if (poster) {
                poster.style.filter = 'none';
            }
            
            if (overlay) {
                overlay.style.opacity = '0';
            }
        }
    }

    // Ripple effect creation
    createRippleEffect(element, x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-animation';
        
        const size = Math.max(element.offsetWidth, element.offsetHeight);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (x - size / 2) + 'px';
        ripple.style.top = (y - size / 2) + 'px';
        
        element.appendChild(ripple);
        
        // Animate ripple
        requestAnimationFrame(() => {
            ripple.style.transform = 'scale(4)';
            ripple.style.opacity = '0';
        });
        
        // Remove after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    // Page transition animations
    setupPageTransitions() {
        this.transitionDuration = 500;
        this.transitionEasing = 'cubic-bezier(0.4, 0, 0.2, 1)';
    }

    animatePageTransition(fromSection, toSection) {
        return new Promise((resolve) => {
            // Exit animation for current section
            if (fromSection) {
                fromSection.style.transform = 'translateX(-100px)';
                fromSection.style.opacity = '0';
                fromSection.style.transition = `all ${this.transitionDuration}ms ${this.transitionEasing}`;
            }
            
            // Entry animation for new section
            setTimeout(() => {
                if (toSection) {
                    toSection.style.transform = 'translateX(100px)';
                    toSection.style.opacity = '0';
                    toSection.style.transition = `all ${this.transitionDuration}ms ${this.transitionEasing}`;
                    
                    requestAnimationFrame(() => {
                        toSection.style.transform = 'translateX(0)';
                        toSection.style.opacity = '1';
                    });
                }
                
                setTimeout(resolve, this.transitionDuration);
            }, this.transitionDuration / 2);
        });
    }

    // Particle system
    createParticleSystem() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        
        document.body.appendChild(particleContainer);
        
        // Create particles periodically
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance
                this.createParticle(particleContainer);
            }
        }, 2000);
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        const size = Math.random() * 4 + 2;
        const startX = Math.random() * window.innerWidth;
        const duration = Math.random() * 10 + 15; // 15-25 seconds
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: var(--primary-color);
            border-radius: 50%;
            left: ${startX}px;
            top: 100vh;
            opacity: 0;
            animation: particleFloat ${duration}s linear infinite;
        `;
        
        container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration * 1000);
    }

    // Text animations
    setupTextAnimations() {
        if (!this.animationsEnabled) return;

        this.setupTypewriterEffect();
        this.setupTextReveal();
        this.setupCountingAnimation();
    }

    setupTypewriterEffect() {
        const typewriterElements = document.querySelectorAll('.typewriter');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid var(--primary-color)';
            
            this.typeText(element, text, 0);
        });
    }

    typeText(element, text, index) {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            setTimeout(() => this.typeText(element, text, index + 1), 100);
        } else {
            // Blinking cursor effect
            setInterval(() => {
                element.style.borderRight = element.style.borderRight === 'none' 
                    ? '2px solid var(--primary-color)' 
                    : 'none';
            }, 500);
        }
    }

    setupTextReveal() {
        const revealElements = document.querySelectorAll('.text-reveal');
        
        revealElements.forEach(element => {
            const words = element.textContent.split(' ');
            element.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
            
            const wordSpans = element.querySelectorAll('.word');
            wordSpans.forEach((span, index) => {
                span.style.opacity = '0';
                span.style.transform = 'translateY(20px)';
                span.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                span.style.transitionDelay = `${index * 0.1}s`;
                
                setTimeout(() => {
                    span.style.opacity = '1';
                    span.style.transform = 'translateY(0)';
                }, 100);
            });
        });
    }

    setupCountingAnimation() {
        const countElements = document.querySelectorAll('.count-up');
        
        countElements.forEach(element => {
            const target = parseInt(element.dataset.target) || 0;
            const duration = parseInt(element.dataset.duration) || 2000;
            
            this.animateCountUp(element, 0, target, duration);
        });
    }

    animateCountUp(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16); // 60fps
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    // Advanced effects
    initializeAdvancedEffects() {
        if (!this.animationsEnabled) return;

        this.setupMorphingShapes();
        this.setupGlowEffects();
        this.setupMotionPaths();
        this.setupResponsiveAnimations();
    }

    setupMorphingShapes() {
        const morphElements = document.querySelectorAll('.morph-shape');
        
        morphElements.forEach(element => {
            let morphState = 0;
            
            setInterval(() => {
                morphState = (morphState + 1) % 4;
                const borderRadius = this.getMorphRadius(morphState);
                element.style.borderRadius = borderRadius;
            }, 2000);
        });
    }

    getMorphRadius(state) {
        const radiuses = [
            '50%',
            '20% 80% 80% 20%',
            '80% 20% 20% 80%',
            '50% 10% 50% 10%'
        ];
        return radiuses[state];
    }

    setupGlowEffects() {
        const glowElements = document.querySelectorAll('.glow-effect');
        
        glowElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.boxShadow = '0 0 20px var(--primary-color)';
                element.style.transform = 'scale(1.05)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.boxShadow = 'none';
                element.style.transform = 'scale(1)';
            });
        });
    }

    setupMotionPaths() {
        const motionElements = document.querySelectorAll('.motion-path');
        
        motionElements.forEach(element => {
            const path = element.dataset.path || 'circle';
            this.animateAlongPath(element, path);
        });
    }

    animateAlongPath(element, pathType) {
        const animations = {
            circle: () => {
                element.style.animation = 'circularMotion 10s linear infinite';
            },
            wave: () => {
                element.style.animation = 'waveMotion 8s ease-in-out infinite';
            },
            spiral: () => {
                element.style.animation = 'spiralMotion 12s linear infinite';
            }
        };
        
        if (animations[pathType]) {
            animations[pathType]();
        }
    }

    setupResponsiveAnimations() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleResponsiveChange = (e) => {
            if (e.matches) {
                // Mobile: reduce animations
                this.reduceAnimations();
            } else {
                // Desktop: full animations
                this.enableFullAnimations();
            }
        };
        
        mediaQuery.addListener(handleResponsiveChange);
        handleResponsiveChange(mediaQuery);
    }

    reduceAnimations() {
        document.documentElement.style.setProperty('--animation-duration', '0.2s');
        
        // Disable heavy animations on mobile
        const heavyAnimations = document.querySelectorAll('.particle-container, .floating-particle');
        heavyAnimations.forEach(el => {
            el.style.display = 'none';
        });
    }

    enableFullAnimations() {
        document.documentElement.style.setProperty('--animation-duration', '0.5s');
        
        // Re-enable animations on desktop
        const heavyAnimations = document.querySelectorAll('.particle-container, .floating-particle');
        heavyAnimations.forEach(el => {
            el.style.display = '';
        });
    }

    // Utility methods
    addAnimationClass(element, className, duration = 1000) {
        element.classList.add(className);
        
        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }

    queueAnimation(animationFunc, delay = 0) {
        setTimeout(() => {
            this.animationQueue.push(animationFunc);
            this.processAnimationQueue();
        }, delay);
    }

    processAnimationQueue() {
        if (this.isAnimating || this.animationQueue.length === 0) {
            return;
        }
        
        this.isAnimating = true;
        const animation = this.animationQueue.shift();
        
        animation().then(() => {
            this.isAnimating = false;
            this.processAnimationQueue();
        });
    }

    // Cleanup method
    destroy() {
        // Remove observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Remove event listeners
        window.removeEventListener('scroll', this.updateScrollAnimations);
        
        // Clear animation queue
        this.animationQueue = [];
        
        // Remove custom cursor
        const cursor = document.querySelector('.custom-cursor');
        const follower = document.querySelector('.cursor-follower');
        if (cursor) cursor.remove();
        if (follower) follower.remove();
        
        // Remove particle container
        const particleContainer = document.querySelector('.particle-container');
        if (particleContainer) particleContainer.remove();
    }
}

// Add additional CSS animations
const additionalAnimationStyles = `
<style>
.ripple-animation {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 107, 53, 0.6);
    transform: scale(0);
    transition: transform 0.6s ease, opacity 0.6s ease;
    pointer-events: none;
}

@keyframes particleFloat {
    0% {
        transform: translateY(0) translateX(0) rotate(0deg);
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    90% {
        opacity: 1;
    }
    100% {
        transform: translateY(-100vh) translateX(100px) rotate(360deg);
        opacity: 0;
    }
}

@keyframes circularMotion {
    0% {
        transform: rotate(0deg) translateX(50px) rotate(0deg);
    }
    100% {
        transform: rotate(360deg) translateX(50px) rotate(-360deg);
    }
}

@keyframes waveMotion {
    0%, 100% {
        transform: translateY(0);
    }
    25% {
        transform: translateY(-20px);
    }
    75% {
        transform: translateY(20px);
    }
}

@keyframes spiralMotion {
    0% {
        transform: rotate(0deg) translateX(0px) scale(1);
    }
    50% {
        transform: rotate(180deg) translateX(100px) scale(1.2);
    }
    100% {
        transform: rotate(360deg) translateX(0px) scale(1);
    }
}

.word {
    display: inline-block;
}

@media (prefers-reduced-motion: reduce) {
    .ripple-animation,
    .floating-particle,
    .particle-container {
        display: none !important;
    }
    
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalAnimationStyles);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationController;
}
