/**
 * Advanced Button Effects and Morphing Animations
 */

class MorphingEffects {
    constructor() {
        this.init();
    }
    
    init() {
        this.initMorphingButtons();
        this.initLiquidLoader();
        this.initTextEffects();
        this.initProgressiveDisclosure();
        this.initGestureEffects();
    }
    
    initMorphingButtons() {
        const morphButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
        
        morphButtons.forEach(btn => {
            // Create ripple container
            const rippleContainer = document.createElement('div');
            rippleContainer.className = 'ripple-container';
            btn.appendChild(rippleContainer);
            
            // Add morphing effect on click
            btn.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                ripple.className = 'ripple-effect';
                
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                rippleContainer.appendChild(ripple);
                
                // Remove ripple after animation
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
            
            // Add hover morph effect
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.05) rotateZ(2deg)';
                btn.style.boxShadow = '0 10px 25px rgba(0, 77, 64, 0.3)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1) rotateZ(0deg)';
                btn.style.boxShadow = '';
            });
        });
    }
    
    initLiquidLoader() {
        // Create liquid loading animation for page transitions
        const loader = document.createElement('div');
        loader.className = 'liquid-loader';
        loader.innerHTML = `
            <div class="liquid-shape">
                <svg viewBox="0 0 200 200">
                    <path d="M 0,100 C 0,100 50,80 100,100 S 200,120 200,100 L 200,200 L 0,200 Z">
                        <animate attributeName="d" 
                                dur="3s" 
                                repeatCount="indefinite"
                                values="M 0,100 C 0,100 50,80 100,100 S 200,120 200,100 L 200,200 L 0,200 Z;
                                        M 0,100 C 0,100 50,120 100,100 S 200,80 200,100 L 200,200 L 0,200 Z;
                                        M 0,100 C 0,100 50,80 100,100 S 200,120 200,100 L 200,200 L 0,200 Z"/>
                    </path>
                </svg>
            </div>
        `;
        document.body.appendChild(loader);
    }
    
    initTextEffects() {
        // Add typewriter effect to main headings
        const typewriterElements = document.querySelectorAll('h1, .hero-section h1');
        
        typewriterElements.forEach(element => {
            if (element.dataset.typewriter) return; // Already processed
            element.dataset.typewriter = 'true';
            
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid var(--color-primary)';
            element.style.animation = 'blink 1s infinite';
            
            let i = 0;
            const typeInterval = setInterval(() => {
                element.textContent += text[i];
                i++;
                
                if (i === text.length) {
                    clearInterval(typeInterval);
                    setTimeout(() => {
                        element.style.borderRight = 'none';
                        element.style.animation = 'none';
                    }, 1000);
                }
            }, 100);
        });
    }
    
    initProgressiveDisclosure() {
        // Add expandable content sections
        const expandableCards = document.querySelectorAll('.highlight-card');
        
        expandableCards.forEach(card => {
            const content = card.querySelector('p');
            const originalHeight = content.offsetHeight;
            
            // Create expand button
            const expandBtn = document.createElement('button');
            expandBtn.className = 'expand-btn';
            expandBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
            expandBtn.title = 'Expand content';
            
            card.appendChild(expandBtn);
            
            // Initially collapse
            content.style.maxHeight = '60px';
            content.style.overflow = 'hidden';
            content.style.transition = 'max-height 0.5s ease';
            
            expandBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (content.style.maxHeight === '60px') {
                    content.style.maxHeight = originalHeight + 'px';
                    expandBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
                    expandBtn.title = 'Collapse content';
                } else {
                    content.style.maxHeight = '60px';
                    expandBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                    expandBtn.title = 'Expand content';
                }
            });
        });
    }
    
    initGestureEffects() {
        // Add swipe gestures for mobile
        let startX, startY, currentX, currentY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
            
            const diffX = startX - currentX;
            const diffY = startY - currentY;
            
            // Add visual feedback for swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                document.body.style.transform = `translateX(${-diffX * 0.1}px)`;
                document.body.style.transition = 'none';
            }
        });
        
        document.addEventListener('touchend', () => {
            document.body.style.transform = '';
            document.body.style.transition = 'transform 0.3s ease';
            startX = startY = null;
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MorphingEffects();
});
