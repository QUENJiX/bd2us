/**
 * Modern UI Enhancements for BD2US Guide
 * Enhanced interactions, animations, and user experience
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ===== 1. ENHANCED SCROLL ANIMATIONS =====
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Add stagger animation for grid items
                if (entry.target.classList.contains('stagger-item')) {
                    const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
                    entry.target.style.animationDelay = `${delay}ms`;
                }
            }
        });
    }, observerOptions);
    
    // Observe all elements with animation classes
    document.querySelectorAll('.animate-on-scroll, .stagger-item').forEach(el => {
        observer.observe(el);
    });
    
    // ===== 2. ENHANCED BUTTON INTERACTIONS =====
    
    // Button ripple effect
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('btn-ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // ===== 3. ENHANCED NAVIGATION =====
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Active navigation highlighting
    const updateActiveNav = () => {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.main-nav a');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    };
    
    window.addEventListener('scroll', updateActiveNav);
    
    // ===== 4. ENHANCED CARDS =====
    
    // Card hover effects with mouse tracking
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
    
    // ===== 5. ENHANCED TIMELINE =====
    
    // Timeline progress indicator
    const timeline = document.querySelector('.timeline');
    if (timeline) {
        const timelineProgress = () => {
            const timelineRect = timeline.getBoundingClientRect();
            const timelineHeight = timelineRect.height;
            const scrollTop = window.pageYOffset;
            const timelineTop = timeline.offsetTop;
            const windowHeight = window.innerHeight;
            
            const progress = Math.min(1, Math.max(0, 
                (scrollTop + windowHeight - timelineTop) / (timelineHeight + windowHeight)
            ));
            
            timeline.style.setProperty('--timeline-progress', progress);
        };
        
        window.addEventListener('scroll', timelineProgress);
        timelineProgress(); // Initial call
    }
    
    // ===== 6. ENHANCED FORMS =====
    
    // Floating labels for form inputs
    document.querySelectorAll('.form-input').forEach(input => {
        const label = input.previousElementSibling;
        if (label && label.classList.contains('form-label')) {
            input.addEventListener('focus', () => {
                label.classList.add('floating');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    label.classList.remove('floating');
                }
            });
            
            // Check if input has value on load
            if (input.value) {
                label.classList.add('floating');
            }
        }
    });
    
    // ===== 7. ENHANCED SCROLL TO TOP =====
    
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
        const showScrollToTop = () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        };
        
        window.addEventListener('scroll', showScrollToTop);
        
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ===== 8. ENHANCED THEME TOGGLE =====
    
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    
    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        
        // Update icon
        const icon = isDark ? 'fa-moon' : 'fa-sun';
        const iconElement = themeToggle?.querySelector('i') || mobileThemeToggle?.querySelector('i');
        if (iconElement) {
            iconElement.className = `fas ${icon}`;
        }
        
        // Save preference
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Add transition class
        document.body.classList.add('theme-transitioning');
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);
    };
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleTheme);
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const iconElement = themeToggle?.querySelector('i') || mobileThemeToggle?.querySelector('i');
        if (iconElement) {
            iconElement.className = 'fas fa-moon';
        }
    }
    
    // ===== 9. ENHANCED MOBILE NAVIGATION =====
    
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navOverlay = document.getElementById('nav-overlay');
    const mainNav = document.getElementById('main-nav');
    
    const toggleMobileNav = () => {
        document.body.classList.toggle('nav-open');
        mobileMenuBtn?.classList.toggle('open');
        
        // Prevent body scroll when nav is open
        if (document.body.classList.contains('nav-open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileNav);
    }
    
    if (navOverlay) {
        navOverlay.addEventListener('click', toggleMobileNav);
    }
    
    // Close mobile nav when clicking on links
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMobileNav();
            }
        });
    });
    
    // ===== 10. ENHANCED PERFORMANCE =====
    
    // Debounce scroll events
    let scrollTimeout;
    const debouncedScroll = (callback) => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(callback, 16); // ~60fps
    };
    
    // Optimize scroll handlers
    window.addEventListener('scroll', () => {
        debouncedScroll(() => {
            updateActiveNav();
            if (timeline) timelineProgress();
            showScrollToTop();
        });
    });
    
    // ===== 11. ENHANCED ACCESSIBILITY =====
    
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(skipLink.getAttribute('href'));
            if (target) {
                target.focus();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Keyboard navigation for cards
    document.querySelectorAll('.card').forEach(card => {
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const link = card.querySelector('a');
                if (link) {
                    link.click();
                }
            }
        });
    });
    
    // ===== 12. ENHANCED LOADING STATES =====
    
    // Add loading state to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.getAttribute('href') && !this.getAttribute('href').startsWith('#')) {
                this.classList.add('loading');
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            }
        });
    });
    
    // ===== 13. ENHANCED ERROR HANDLING =====
    
    // Global error handler
    window.addEventListener('error', (e) => {
        console.error('UI Error:', e.error);
        // Could add error reporting here
    });
    
    // ===== 14. ENHANCED ANALYTICS =====
    
    // Track user interactions
    const trackInteraction = (action, label) => {
        // Could integrate with Google Analytics or other tracking
        console.log('User Interaction:', { action, label, timestamp: new Date().toISOString() });
    };
    
    // Track button clicks
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.textContent.trim();
            const href = btn.getAttribute('href');
            trackInteraction('button_click', `${action} (${href})`);
        });
    });
    
    // Track navigation
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            const href = link.getAttribute('href');
            trackInteraction('navigation', href);
        });
    });
    
    // ===== 15. ENHANCED RESPONSIVE BEHAVIOR =====
    
    // Handle resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Close mobile nav if screen becomes large
            if (window.innerWidth > 768 && document.body.classList.contains('nav-open')) {
                toggleMobileNav();
            }
            
            // Recalculate any layout-dependent elements
            if (timeline) timelineProgress();
        }, 250);
    });
    
    // ===== 16. ENHANCED ANIMATIONS =====
    
    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        });
    }
    
    // Typing effect for hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && !heroTitle.dataset.animated) {
        heroTitle.dataset.animated = 'true';
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // Start typing effect when element is visible
        const titleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeWriter();
                    titleObserver.unobserve(entry.target);
                }
            });
        });
        
        titleObserver.observe(heroTitle);
    }
    
    // ===== 17. ENHANCED FEEDBACK =====
    
    // Success/error message system
    const showMessage = (message, type = 'info') => {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => {
                messageEl.remove();
            }, 300);
        }, 3000);
    };
    
    // Global message function
    window.showMessage = showMessage;
    
    // ===== 18. ENHANCED SEO =====
    
    // Update page title based on scroll position
    const updatePageTitle = () => {
        const sections = document.querySelectorAll('section[id]');
        let currentSection = '';
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                currentSection = section.querySelector('h1, h2')?.textContent || '';
            }
        });
        
        if (currentSection) {
            document.title = `${currentSection} - BD2US Guide`;
        }
    };
    
    window.addEventListener('scroll', debouncedScroll(updatePageTitle));
    
    // ===== 19. ENHANCED PROGRESS INDICATOR =====
    
    // Reading progress bar
    const createProgressBar = () => {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
        document.body.appendChild(progressBar);
        
        const updateProgress = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            const progressBarEl = progressBar.querySelector('.reading-progress-bar');
            progressBarEl.style.width = scrollPercent + '%';
        };
        
        window.addEventListener('scroll', debouncedScroll(updateProgress));
        updateProgress(); // Initial call
    };
    
    createProgressBar();
    
    // ===== 20. ENHANCED INITIALIZATION =====
    
    // Initialize all components
    const init = () => {
        // Add loading class to body
        document.body.classList.add('loaded');
        
        // Trigger initial animations
        setTimeout(() => {
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                if (el.getBoundingClientRect().top < window.innerHeight) {
                    el.classList.add('visible');
                }
            });
        }, 100);
        
        // Show welcome message
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            setTimeout(() => {
                showMessage('Welcome to BD2US Guide! 🎓', 'success');
            }, 1000);
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
});

// ===== 21. ENHANCED UTILITY FUNCTIONS =====

// Utility function to check if element is in viewport
window.isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

// Utility function to debounce
window.debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Utility function to throttle
window.throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};
