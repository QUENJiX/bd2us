document.addEventListener('DOMContentLoaded', () => {

    // --- Sticky Header --- 
    const header = document.getElementById('main-header');
    const scrollThreshold = 50; // Pixels to scroll before header becomes opaque

    const handleHeaderScroll = () => {
        if (!header) return; // Guard clause
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    // --- Scroll-to-Top Button --- 
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const scrollBtnThreshold = 300; // Pixels to scroll before button appears

    const handleScrollBtnVisibility = () => {
        if (!scrollToTopBtn) return; // Guard clause
        if (window.scrollY > scrollBtnThreshold) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Attach scroll event listeners
    window.addEventListener('scroll', () => {
        handleHeaderScroll();
        handleScrollBtnVisibility();
    });

    // Attach click listener for scroll-to-top button
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', scrollToTop);
    }
    
    // Initial checks on load
    handleHeaderScroll();
    handleScrollBtnVisibility();

    // --- Mobile Navigation Menu ---
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navOverlay = document.getElementById('nav-overlay');
    const mainNav = document.getElementById('main-nav');
    
    // Toggle mobile navigation
    const toggleMobileNav = () => {
        const body = document.body;
        const isOpen = mobileMenuBtn.classList.toggle('open');
        body.classList.toggle('nav-open');
        mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };
    
    // Add event listeners for mobile menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileNav);
    }
    
    // Close menu when clicking on overlay
    if (navOverlay) {
        navOverlay.addEventListener('click', toggleMobileNav);
    }
    
    // Close menu when clicking on nav links (mobile only)
    const mobileNavLinks = document.querySelectorAll('.main-nav a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMobileNav();
            }
        });
    });
    
    // Close mobile menu on window resize if appropriate
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && document.body.classList.contains('nav-open')) {
            document.body.classList.remove('nav-open');
            mobileMenuBtn.classList.remove('open');
        }
    });

    // --- Active Nav Link Highlighting --- 
    const navLinks = document.querySelectorAll('#main-nav a');
    // Handle cases where path might be just '/' or include file name
    const currentPath = window.location.pathname.split("/").pop() || (window.location.pathname === '/' ? 'index.html' : window.location.pathname);

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split("/").pop() || 'index.html';
        link.classList.remove('active'); 
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });

    // --- Intersection Observer for Scroll Animations --- 
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null, 
            rootMargin: '0px', 
            threshold: 0.1 
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Add a subtle entrance effect based on mode
                    if (document.body.classList.contains('dark-mode')) {
                        entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                    } else {
                        entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        elementsToAnimate.forEach(el => {
            observer.observe(el);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        elementsToAnimate.forEach(el => {
            el.classList.add('visible');
        });
    }

    // --- Interactive Element Effects ---
    // Add interactive hover effects to cards and timeline items
    const addInteractiveEffects = () => {
        // Cards
        const cards = document.querySelectorAll('.highlight-card, .timeline-content, .resource-list li');
        cards.forEach(card => {
            // Mouse hover effect
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
            
            // Touch effect
            card.addEventListener('touchstart', () => {
                // Create tap highlight
                const highlight = document.createElement('div');
                highlight.classList.add('tap-highlight');
                card.appendChild(highlight);
                
                // Show the highlight
                setTimeout(() => {
                    highlight.style.opacity = '1';
                }, 10);
                
                // Remove the highlight
                setTimeout(() => {
                    highlight.style.opacity = '0';
                    setTimeout(() => {
                        highlight.remove();
                    }, 300);
                }, 300);
            }, { passive: true });
        });
        
        // Buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            // Mouse hover ripple
            btn.addEventListener('mouseenter', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                btn.style.setProperty('--mouse-x', `${x}px`);
                btn.style.setProperty('--mouse-y', `${y}px`);
                
                // Add ripple effect
                const ripple = document.createElement('span');
                ripple.classList.add('btn-ripple');
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                btn.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600); // Remove after animation completes
            });
            
            // Touch ripple
            btn.addEventListener('touchstart', (e) => {
                const rect = btn.getBoundingClientRect();
                const touch = e.touches[0];
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                // Add touch ripple effect
                const ripple = document.createElement('span');
                ripple.classList.add('btn-ripple');
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                btn.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }, { passive: true });
        });
        
        // Text links
        const links = document.querySelectorAll('a:not(.btn):not(.logo)');
        links.forEach(link => {
            // Mouse effect
            link.addEventListener('mouseenter', () => {
                link.style.animation = 'pulse 0.5s ease';
                
                setTimeout(() => {
                    link.style.animation = '';
                }, 500);
            });
            
            // Touch effect (subtle scale)
            link.addEventListener('touchstart', () => {
                link.style.transform = 'scale(1.03)';
                
                setTimeout(() => {
                    link.style.transform = 'scale(1)';
                }, 300);
            }, { passive: true });
        });
    };
    
    // Call the function to add interactive effects
    addInteractiveEffects();

    // --- Staggered Animation Logic --- 
    // Define a reusable function for staggered animations
    const applyStaggeredAnimation = (
      selector,
      baseDelay = 0,
      increment = 0.1
    ) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element, index) => {
        const delay = baseDelay + index * increment;
        // Check if element is an HTMLElement before accessing style
        if (element instanceof HTMLElement) {
          element.style.transitionDelay = `${delay}s`;
        }
      });
    };

    // Apply staggered animations to various elements
    const applyPageAnimations = () => {
        // Team members
    const teamGridElement = document.querySelector(".team-grid");
        if (teamGridElement) {
        applyStaggeredAnimation(".team-member.animate-on-scroll", 0, 0.1);
    }

        // Timeline nodes
        const timelineElement = document.querySelector(".timeline");
        if (timelineElement) {
            applyStaggeredAnimation(".timeline-node", 0, 0.15);
        }
        
        // Highlight cards
        const highlightsGrid = document.querySelector(".highlights-grid");
        if (highlightsGrid) {
            applyStaggeredAnimation(".highlight-card", 0, 0.1);
        }
        
        // Resource list items
        const resourceList = document.querySelector(".resource-list");
        if (resourceList) {
            applyStaggeredAnimation(".resource-list li", 0, 0.08);
        }
    };
    
    // Call the function to apply page animations
    applyPageAnimations();

    // --- Dark Mode Toggle Logic --- 
    const themeToggleBtn = document.getElementById('theme-toggle');
    const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');
    const body = document.body;
    const currentTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const toggleIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    const mobileToggleIcon = mobileThemeToggleBtn ? mobileThemeToggleBtn.querySelector('i') : null;

    // Modified setTheme function (without cursor updates)
    const setTheme = (isDark, animate = true) => {
        // If animation is enabled, add the transition class first
        if (animate) {
            body.classList.add('theme-transition');
            
            // Remove the transition class after the transition completes
            setTimeout(() => {
                body.classList.remove('theme-transition');
            }, 800); // Slightly longer than the CSS transition
        }
        
        if (isDark) {
            body.classList.add('dark-mode');
            if (toggleIcon) {
                toggleIcon.classList.remove('fa-sun');
                toggleIcon.classList.add('fa-moon');
                // Add slight rotation animation on icon change
                toggleIcon.style.animation = 'rotate-icon 0.5s ease';
                setTimeout(() => {
                    toggleIcon.style.animation = '';
                }, 500);
            }
            
            if (mobileToggleIcon) {
                mobileToggleIcon.classList.remove('fa-sun');
                mobileToggleIcon.classList.add('fa-moon');
            }
            
            // Store preference in localStorage
            localStorage.setItem('theme', 'dark');
            
            // Apply dark mode animations
            animateElementsOnThemeChange(true);
        } else {
            body.classList.remove('dark-mode');
            if (toggleIcon) {
                toggleIcon.classList.remove('fa-moon');
                toggleIcon.classList.add('fa-sun');
                // Add slight rotation animation on icon change
                toggleIcon.style.animation = 'rotate-icon 0.5s ease';
                setTimeout(() => {
                    toggleIcon.style.animation = '';
                }, 500);
            }
            
            if (mobileToggleIcon) {
                mobileToggleIcon.classList.remove('fa-moon');
                mobileToggleIcon.classList.add('fa-sun');
            }
            
            // Store preference in localStorage
            localStorage.setItem('theme', 'light');
            
            // Apply light mode animations
            animateElementsOnThemeChange(false);
        }
    };

    // Add CSS for smooth icon rotation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rotate-icon {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .theme-transition * {
            transition-duration: 0.6s !important;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .theme-animate {
            animation-duration: 0.6s;
            animation-fill-mode: both;
        }
        
        .fade-in-up {
            animation-name: fadeInUp;
        }
        
        .fade-in-down {
            animation-name: fadeInDown;
        }
        
        .pulse {
            animation-name: pulse;
        }
    `;
    document.head.appendChild(style);

    // Function to animate elements when theme changes
    const animateElementsOnThemeChange = (isDark) => {
        // Target specific elements to animate when theme changes
        const headings = document.querySelectorAll('h1, h2');
        const cards = document.querySelectorAll('.highlight-card, .timeline-content, .resource-list li');
        const buttons = document.querySelectorAll('.btn');
        
        // Apply staggered animations to elements
        headings.forEach((el, index) => {
            el.classList.add('theme-animate', 'fade-in-down');
            el.style.animationDelay = `${index * 0.1}s`;
            
            setTimeout(() => {
                el.classList.remove('theme-animate', 'fade-in-down');
                el.style.animationDelay = '';
            }, 1000 + (index * 100)); // Remove class after animation completes
        });
        
        cards.forEach((el, index) => {
            el.classList.add('theme-animate', 'fade-in-up');
            el.style.animationDelay = `${index * 0.05}s`;
            
            setTimeout(() => {
                el.classList.remove('theme-animate', 'fade-in-up');
                el.style.animationDelay = '';
            }, 1000 + (index * 50)); // Remove class after animation completes
        });
        
        buttons.forEach((el, index) => {
            el.classList.add('theme-animate', 'pulse');
            el.style.animationDelay = `${index * 0.1}s`;
            
            setTimeout(() => {
                el.classList.remove('theme-animate', 'pulse');
                el.style.animationDelay = '';
            }, 1000 + (index * 100)); // Remove class after animation completes
        });
    };

    // Initialize theme based on stored preference or system preference
    if (currentTheme === 'dark') {
        setTheme(true, false); // Apply dark theme without animation on initial load
    } else if (currentTheme === 'light') {
        setTheme(false, false); // Apply light theme without animation on initial load
    } else {
        // No stored theme, use system preference or default to light mode
        setTheme(prefersDark, false);
    }

    // Add event listener for the toggle button with enhanced animation
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDarkMode = body.classList.contains('dark-mode');
            setTheme(!isDarkMode);
        });
        
        // Add hover effect for the theme toggle button
        themeToggleBtn.addEventListener('mouseenter', () => {
            themeToggleBtn.style.transform = 'scale(1.1) rotate(15deg)';
        });
        
        themeToggleBtn.addEventListener('mouseleave', () => {
            themeToggleBtn.style.transform = 'scale(1) rotate(0deg)';
        });
    }
    
    // Add event listener for mobile toggle button
    if (mobileThemeToggleBtn) {
        mobileThemeToggleBtn.addEventListener('click', () => {
            const isDarkMode = body.classList.contains('dark-mode');
            setTheme(!isDarkMode);
        });
        
        // Add hover effect for the mobile theme toggle button
        mobileThemeToggleBtn.addEventListener('mouseenter', () => {
            mobileThemeToggleBtn.style.transform = 'scale(1.1) rotate(15deg)';
        });
        
        mobileThemeToggleBtn.addEventListener('mouseleave', () => {
            mobileThemeToggleBtn.style.transform = 'scale(1) rotate(0deg)';
        });
    }
    
    // Add system theme change detection
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem('theme') === null) {
                // Only follow system theme if user hasn't manually set a preference
                setTheme(e.matches);
            }
        });
    }

    // Add event listener for window resize
    window.addEventListener('resize', () => {
        // Empty resize handler - removed mouse trail code
    });

    // Add page transition effects
    const addPageTransitions = () => {
        // Add page transition overlay
        const transitionOverlay = document.createElement('div');
        transitionOverlay.className = 'page-transition-overlay';
        document.body.appendChild(transitionOverlay);
        
        // Add CSS for page transitions
        const transitionStyle = document.createElement('style');
        transitionStyle.textContent = `
            .page-transition-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: var(--color-primary);
                z-index: 9999;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.5s ease;
            }
            
            body.dark-mode .page-transition-overlay {
                background-color: var(--color-primary-dark);
            }
            
            .page-transition-active .page-transition-overlay {
                opacity: 0.2;
            }
        `;
        document.head.appendChild(transitionStyle);
        
        // Add click handlers to links for internal page transitions
        const internalLinks = document.querySelectorAll('a[href^="/"]:not([target]), a[href^="./"]:not([target]), a[href^="../"]:not([target]), a[href^="#"]:not([target])');
        
        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Skip hash links that target the same page
                const href = link.getAttribute('href');
                if (href.startsWith('#')) return;
                
                // Prevent default behavior
                e.preventDefault();
                
                // Show transition overlay
                document.body.classList.add('page-transition-active');
                
                // Navigate after transition
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            });
        });
    };
    
    // Add page transitions if not on a mobile device
    if (window.innerWidth > 768) {
        addPageTransitions();
    }

}); 
