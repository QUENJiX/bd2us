/**
 * Enhanced UX Features for College Roadmap
 * Essential interactions only - performance focused
 */

document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Initialize only essential features
    if (!reducedMotion) {
        initScrollEffects();
        initBasicInteractions();
    }
    
    initAccessibilityFeatures();
    
    /**
     * Essential scroll effects only
     */
    function initScrollEffects() {
        // Simple scroll-to-view animations
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        
        elements.forEach(el => observer.observe(el));
    }
    
    /**
     * Basic interactive feedback
     */
    function initBasicInteractions() {
        // Simple button hover effects
        document.querySelectorAll('.btn, button').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });
    }
    
    /**
     * Essential accessibility features
     */
    function initAccessibilityFeatures() {
        // Focus management and keyboard navigation improvements
        document.addEventListener('keydown', (e) => {
            // Enhanced keyboard navigation
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
});
