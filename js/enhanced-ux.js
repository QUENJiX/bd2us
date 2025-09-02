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
        // High contrast mode toggle
        const contrastToggle = document.createElement('button');
        contrastToggle.className = 'high-contrast-toggle';
        contrastToggle.setAttribute('aria-label', 'Toggle high contrast mode');
        contrastToggle.innerHTML = '<span style="font-weight: bold;">Aa</span>';
        contrastToggle.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 1000;
            background: var(--color-primary);
            color: var(--color-text-light);
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;
        
        document.body.appendChild(contrastToggle);
        
        contrastToggle.addEventListener('click', () => {
            document.body.classList.toggle('high-contrast');
            localStorage.setItem('highContrast', 
                document.body.classList.contains('high-contrast') ? 'true' : 'false');
        });
        
        // Restore saved preference
        if (localStorage.getItem('highContrast') === 'true') {
            document.body.classList.add('high-contrast');
        }
    }
});
