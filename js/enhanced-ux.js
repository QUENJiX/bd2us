/**
 * Enhanced UX Features for College Roadmap
 * Implements advanced interactions, animations, and visual effects
 */

document.addEventListener('DOMContentLoaded', () => {
    // Restore system cursor and remove any custom cursors
    restoreSystemCursor();
    
    // Other features can be conditional
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasTouchScreen = ('ontouchstart' in window) || 
                           (navigator.maxTouchPoints > 0) || 
                           window.matchMedia('(pointer: coarse)').matches;
    const highPerformanceDevice = checkHighPerformanceDevice();
    
    // Initialize features based on device capabilities
    if (!reducedMotion && !hasTouchScreen) {
        initScrollDrivenAnimations();
        initContentAnimations();
        
        if (highPerformanceDevice) {
            initParticleEffects();
        }
    }
    
    // Always initialize these features (with reduced motion if needed)
    initMicroInteractions(reducedMotion);
    initAdvancedNavigation();
    initVisualFeedback(reducedMotion);
    initInteractiveElements(reducedMotion);
    initAccessibilityFeatures();
    
    /**
     * 1. SCROLL-DRIVEN ANIMATIONS
     */
    function initScrollDrivenAnimations() {
        // Parallax effect for background elements
        const parallaxElements = document.querySelectorAll('.parallax-element');
        
        // Perspective effect for cards
        const perspectiveCards = document.querySelectorAll('.highlight-card, .timeline-content');
        
        // Scroll-linked color transitions for section backgrounds
        const colorTransitionSections = document.querySelectorAll('.color-transition-section');
        
        // Skip if no elements found
        if (parallaxElements.length === 0 && perspectiveCards.length === 0 && 
            colorTransitionSections.length === 0) {
            return;
        }
        
        // Add perspective container for 3D effects
        perspectiveCards.forEach(card => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            card.style.transition = 'transform 0.1s ease';
        });
        
        // Handle scroll events for parallax and color transitions
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            
            // Parallax effect
            parallaxElements.forEach(el => {
                const speed = el.getAttribute('data-parallax-speed') || 0.2;
                const offset = scrollPosition * speed;
                el.style.transform = `translateY(${offset}px)`;
            });
            
            // Color transitions for sections
            colorTransitionSections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top;
                const sectionHeight = rect.height;
                
                // Calculate position in section (0 to 1)
                const positionInSection = Math.max(0, Math.min(1, 
                    (windowHeight - sectionTop) / (windowHeight + sectionHeight)));
                
                // Get colors from data attributes
                const startColor = section.getAttribute('data-start-color') || '#ffffff';
                const endColor = section.getAttribute('data-end-color') || '#f5f5f5';
                
                // Apply gradient background based on scroll position
                section.style.backgroundColor = positionInSection < 0.5 ? 
                    startColor : endColor;
            });
        });
        
        // Apply perspective effect to cards on mouse move
        perspectiveCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const cardCenterX = rect.width / 2;
                const cardCenterY = rect.height / 2;
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                // Calculate rotation angle (max ±15 degrees)
                const rotateY = ((mouseX - cardCenterX) / cardCenterX) * 5;
                const rotateX = ((cardCenterY - mouseY) / cardCenterY) * 5;
                
                // Apply rotation and slight elevation
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) 
                                      translateZ(10px)`;
            });
            
            // Reset card on mouse leave
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
            });
        });
    }

    /**
     * 2. MICRO-INTERACTIONS
     */
    function initMicroInteractions(reducedMotion) {
        // Add audio feedback for interactions
        const audioFeedback = {
            click: new Audio('./audio/click.mp3'),
            hover: new Audio('./audio/hover.mp3'),
            toggle: new Audio('./audio/toggle.mp3'),
            success: new Audio('./audio/success.mp3')
        };
        
        // Preload audio files
        Object.values(audioFeedback).forEach(audio => {
            audio.load();
            audio.volume = 0.2; // Reduce volume
        });
        
        // Add sound effects to interactive elements
        if (!reducedMotion) {
            // Click sounds for buttons
            document.querySelectorAll('.btn, button, .timeline-node').forEach(btn => {
                btn.addEventListener('click', () => {
                    try {
                        audioFeedback.click.currentTime = 0;
                        audioFeedback.click.play().catch(() => {/* Ignore errors */});
                    } catch (e) {/* Ignore errors */}
                });
            });
            
            // Hover sounds for main nav
            document.querySelectorAll('.main-nav a').forEach(link => {
                link.addEventListener('mouseenter', () => {
                    try {
                        audioFeedback.hover.currentTime = 0;
                        audioFeedback.hover.play().catch(() => {/* Ignore errors */});
                    } catch (e) {/* Ignore errors */}
                });
            });
            
            // Toggle sound for theme switch
            document.getElementById('theme-toggle')?.addEventListener('click', () => {
                try {
                    audioFeedback.toggle.currentTime = 0;
                    audioFeedback.toggle.play().catch(() => {/* Ignore errors */});
                } catch (e) {/* Ignore errors */}
            });
        }
        
        // Add magnetic button effect
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
            const btnRect = btn.getBoundingClientRect();
            const btnCenterX = btnRect.left + btnRect.width / 2;
            const btnCenterY = btnRect.top + btnRect.height / 2;
            const magneticRadius = 150; // px
            
            document.addEventListener('mousemove', (e) => {
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                
                // Calculate distance between mouse and button center
                const deltaX = mouseX - btnCenterX;
                const deltaY = mouseY - btnCenterY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                // Apply magnetic effect if mouse is within magnetic radius
                if (distance < magneticRadius) {
                    // Calculate pull factor based on distance (closer = stronger)
                    const pull = 1 - (distance / magneticRadius);
                    
                    // Calculate new position with magnetic pull
                    const moveX = deltaX * pull * 0.3;
                    const moveY = deltaY * pull * 0.3;
                    
                    // Apply transformation
                    btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
                } else {
                    // Reset position
                    btn.style.transform = 'translate(0, 0)';
                }
            });
        });
        
        // Haptic feedback for touch devices (using navigator.vibrate if available)
        if (navigator.vibrate && hasTouchScreen) {
            document.querySelectorAll('.btn, button, .timeline-node').forEach(el => {
                el.addEventListener('touchstart', () => {
                    navigator.vibrate(10); // Short 10ms vibration
                }, { passive: true });
            });
        }
    }

    /**
     * 3. CONTENT PRESENTATION
     */
    function initContentAnimations() {
        // Text scramble effect for main headings
        const headings = document.querySelectorAll('h1');
        
        headings.forEach(heading => {
            // Skip if already animated
            if (heading.classList.contains('scramble-animated')) return;
            
            // Create observer to trigger effect when heading comes into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Get the original text
                        const originalText = heading.textContent;
                        heading.classList.add('scramble-animated');
                        
                        // Start scramble effect
                        textScrambleEffect(heading, originalText);
                        
                        // Stop observing after animation
                        observer.unobserve(heading);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(heading);
        });
        
        // Image reveal animations
        document.querySelectorAll('.image-reveal').forEach(imgContainer => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        imgContainer.classList.add('revealed');
                        observer.unobserve(imgContainer);
                    }
                });
            }, { threshold: 0.3 });
            
            observer.observe(imgContainer);
        });
        
        // Split-screen transitions
        document.querySelectorAll('.split-section').forEach(section => {
            const leftSide = section.querySelector('.split-left');
            const rightSide = section.querySelector('.split-right');
            
            if (leftSide && rightSide) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            leftSide.classList.add('animated');
                            rightSide.classList.add('animated');
                            observer.unobserve(section);
                        }
                    });
                }, { threshold: 0.2 });
                
                observer.observe(section);
            }
        });
    }

    /**
     * 4. ADVANCED NAVIGATION
     */
    function initAdvancedNavigation() {
        // Reading progress indicator
        createReadingProgressIndicator();
        
        // Mini-map navigation for roadmap
        createRoadmapMinimap();
        
        // Gesture-based navigation for mobile
        if (hasTouchScreen) {
            enableGestureNavigation();
        }
    }

    /**
     * 5. VISUAL FEEDBACK
     */
    function initVisualFeedback(reducedMotion) {
        // Confetti animations for milestone completion
        document.querySelectorAll('.milestone-complete').forEach(milestone => {
            milestone.addEventListener('click', (e) => {
                if (!reducedMotion) {
                    showConfetti(e.clientX, e.clientY);
                    
                    // Play success sound
                    try {
                        audioFeedback.success.currentTime = 0;
                        audioFeedback.success.play().catch(() => {/* Ignore errors */});
                    } catch (e) {/* Ignore errors */}
                }
            });
        });
        
        // Background animations (if high-performance device)
        if (highPerformanceDevice && !reducedMotion) {
            initBackgroundAnimations();
        }
    }

    /**
     * 6. PERFORMANCE & ACCESSIBILITY
     */
    function initAccessibilityFeatures() {
        // Content prefetching for instant page transitions
        initContentPrefetching();
        
        // High-contrast mode toggle
        addHighContrastMode();
        
        // Voice navigation command
        if ('webkitSpeechRecognition' in window) {
            initVoiceNavigation();
        }
    }

    /**
     * 7. INTERACTIVE ELEMENTS
     */
    function initInteractiveElements(reducedMotion) {
        // Draggable timeline elements
        if (!reducedMotion) {
            makeDraggable('.draggable-timeline .timeline-node');
        }
        
        // Flip card animations for resources
        document.querySelectorAll('.flip-card').forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('flipped');
            });
        });
        
        // Interactive infographics
        document.querySelectorAll('.interactive-infographic').forEach(initInteractiveInfoGraphic);
    }

    /**
     * HELPER FUNCTIONS 
     * Implementation of individual features
     */
    
    // Text scramble effect
    function textScrambleEffect(element, finalText) {
        const chars = '!<>-_\\/[]{}—=+*^?#_abcdefghijklmnopqrstuvwxyz';
        const duration = 1500; // ms
        const frameRate = 30;
        let frame = 0;
        const maxFrames = 20;
        
        const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
        
        // Start animation
        const update = () => {
            let currentText = '';
            const progressRate = frame / maxFrames;
            
            for (let i = 0; i < finalText.length; i++) {
                // If character should be revealed
                if (i < Math.floor(progressRate * finalText.length)) {
                    currentText += finalText[i];
                } else if (i === Math.floor(progressRate * finalText.length)) {
                    currentText += randomChar();
                } else {
                    currentText += randomChar();
                }
            }
            
            element.textContent = currentText;
            frame++;
            
            if (frame <= maxFrames) {
                setTimeout(update, duration / maxFrames);
            } else {
                element.textContent = finalText; // Ensure final text is correct
            }
        };
        
        update();
    }
    
    // Reading progress indicator
    function createReadingProgressIndicator() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'reading-progress-container';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress-bar';
        
        progressContainer.appendChild(progressBar);
        document.body.appendChild(progressContainer);
        
        // Update progress on scroll
        window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollTop = window.scrollY;
            const progress = (scrollTop / scrollHeight) * 100;
            
            progressBar.style.width = `${progress}%`;
        });
    }
    
    // Create mini-map navigation for roadmap
    function createRoadmapMinimap() {
        const roadmap = document.querySelector('.roadmap-section');
        if (!roadmap) return;
        
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;
        
        // Create minimap container
        const minimapContainer = document.createElement('div');
        minimapContainer.className = 'roadmap-minimap';
        
        const minimapInner = document.createElement('div');
        minimapInner.className = 'roadmap-minimap-inner';
        
        // Create dots for each timeline node
        const timelineNodes = document.querySelectorAll('.timeline-node');
        
        timelineNodes.forEach((node, index) => {
            const dot = document.createElement('div');
            dot.className = 'minimap-dot';
            dot.setAttribute('data-index', index);
            
            // Get label from h3 if available
            const label = node.querySelector('h3') ? 
                node.querySelector('h3').textContent : `Step ${index + 1}`;
            
            dot.setAttribute('title', label);
            
            // Add event listener to scroll to node when clicked
            dot.addEventListener('click', () => {
                node.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            
            minimapInner.appendChild(dot);
        });
        
        minimapContainer.appendChild(minimapInner);
        roadmap.appendChild(minimapContainer);
        
        // Update active dot on scroll
        window.addEventListener('scroll', () => {
            const windowMiddle = window.scrollY + window.innerHeight / 2;
            
            timelineNodes.forEach((node, index) => {
                const rect = node.getBoundingClientRect();
                const nodeTop = rect.top + window.scrollY;
                const nodeBottom = nodeTop + rect.height;
                
                const dot = minimapContainer.querySelector(`[data-index="${index}"]`);
                
                if (windowMiddle >= nodeTop && windowMiddle <= nodeBottom) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        });
    }
    
    // Enable gesture-based navigation for mobile
    function enableGestureNavigation() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleGesture();
        }, { passive: true });
        
        function handleGesture() {
            const threshold = 100; // Minimum swipe distance
            const sections = document.querySelectorAll('section');
            
            if (sections.length === 0) return;
            
            // Get current section based on scroll position
            const currentPosition = window.scrollY + window.innerHeight / 2;
            let currentSectionIndex = 0;
            
            sections.forEach((section, index) => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (currentPosition >= sectionTop && currentPosition <= sectionBottom) {
                    currentSectionIndex = index;
                }
            });
            
            // Handle left swipe (next section)
            if (touchEndX + threshold < touchStartX) {
                const nextSection = sections[currentSectionIndex + 1];
                if (nextSection) {
                    nextSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
            
            // Handle right swipe (previous section)
            if (touchEndX - threshold > touchStartX) {
                const prevSection = sections[currentSectionIndex - 1];
                if (prevSection) {
                    prevSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    }
    
    // Background animations
    function initBackgroundAnimations() {
        // Create flowing gradient background
        const gradientContainer = document.createElement('div');
        gradientContainer.className = 'flowing-gradient';
        document.body.appendChild(gradientContainer);
        
        // Create particles for special sections
        document.querySelectorAll('.particle-section').forEach(section => {
            createParticles(section);
        });
    }
    
    // Create particle effect
    function initParticleEffects() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        document.body.appendChild(particleContainer);
        
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Randomize particle properties
            const size = Math.random() * 5 + 3;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 20 + 10;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}vw`;
            particle.style.top = `${posY}vh`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            
            particleContainer.appendChild(particle);
        }
    }
    
    // Create confetti animation
    function showConfetti(x, y) {
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        confettiContainer.style.left = `${x}px`;
        confettiContainer.style.top = `${y}px`;
        document.body.appendChild(confettiContainer);
        
        const colors = ['#00f2ff', '#ff00c3', '#7d14ff', '#00ffaa', '#ffaa00'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 8 + 4;
            const angle = Math.random() * 360;
            const distance = Math.random() * 100 + 50;
            const duration = Math.random() * 1 + 1;
            const delay = Math.random() * 0.2;
            
            confetti.style.backgroundColor = color;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.transform = `rotate(${angle}deg)`;
            confetti.style.animationDuration = `${duration}s`;
            confetti.style.animationDelay = `${delay}s`;
            
            // Calculate final position with random angle
            const angleRad = (Math.random() * 360) * Math.PI / 180;
            const destX = Math.cos(angleRad) * distance;
            const destY = Math.sin(angleRad) * distance;
            
            confetti.style.setProperty('--destX', `${destX}px`);
            confetti.style.setProperty('--destY', `${destY}px`);
            
            confettiContainer.appendChild(confetti);
        }
        
        // Remove confetti container after animation
        setTimeout(() => {
            confettiContainer.remove();
        }, 3000);
    }
    
    // Content prefetching
    function initContentPrefetching() {
        // Prefetch linked pages on hover
        document.querySelectorAll('a[href^="/"]:not([target]), a[href^="./"]:not([target]), a[href^="../"]:not([target])').forEach(link => {
            link.addEventListener('mouseenter', () => {
                const href = link.getAttribute('href');
                
                // Check if prefetch already exists
                if (!document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
                    const prefetch = document.createElement('link');
                    prefetch.rel = 'prefetch';
                    prefetch.href = href;
                    document.head.appendChild(prefetch);
                }
            });
        });
    }
    
    // Add high contrast mode
    function addHighContrastMode() {
        // Create high contrast toggle button
        const contrastToggle = document.createElement('button');
        contrastToggle.className = 'high-contrast-toggle';
        contrastToggle.setAttribute('aria-label', 'Toggle high contrast mode');
        contrastToggle.innerHTML = '<span class="accessibility-icon">Aa</span>';
        
        document.body.appendChild(contrastToggle);
        
        // Toggle high contrast mode
        contrastToggle.addEventListener('click', () => {
            document.body.classList.toggle('high-contrast');
            
            // Remember setting in localStorage
            if (document.body.classList.contains('high-contrast')) {
                localStorage.setItem('highContrast', 'true');
            } else {
                localStorage.setItem('highContrast', 'false');
            }
        });
        
        // Check localStorage for saved preference
        if (localStorage.getItem('highContrast') === 'true') {
            document.body.classList.add('high-contrast');
        }
    }
    
    // Voice navigation
    function initVoiceNavigation() {
        // Create voice control button
        const voiceButton = document.createElement('button');
        voiceButton.className = 'voice-control-toggle';
        voiceButton.setAttribute('aria-label', 'Toggle voice control');
        voiceButton.innerHTML = '<span class="microphone-icon">🎤</span>';
        
        document.body.appendChild(voiceButton);
        
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        // Handle voice commands
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            
            // Navigation commands
            if (command.includes('go to home') || command.includes('go home')) {
                window.location.href = '/';
            } else if (command.includes('go to roadmap')) {
                window.location.href = '/roadmap.html';
            } else if (command.includes('go to resources')) {
                window.location.href = '/resources.html';
            } else if (command.includes('go to about')) {
                window.location.href = '/about.html';
            } else if (command.includes('go to financial')) {
                window.location.href = '/financial-aid.html';
            }
            
            // Scroll commands
            else if (command.includes('scroll down')) {
                window.scrollBy({ top: window.innerHeight / 2, behavior: 'smooth' });
            } else if (command.includes('scroll up')) {
                window.scrollBy({ top: -window.innerHeight / 2, behavior: 'smooth' });
            } else if (command.includes('top') || command.includes('go to top')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (command.includes('bottom') || command.includes('go to bottom')) {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
            
            // Theme toggle
            else if (command.includes('dark mode') || command.includes('light mode') || command.includes('toggle theme')) {
                document.getElementById('theme-toggle')?.click();
            }
            
            // Display command feedback
            showVoiceCommandFeedback(command);
        };
        
        // Active state handling
        let isListening = false;
        
        voiceButton.addEventListener('click', () => {
            if (!isListening) {
                recognition.start();
                voiceButton.classList.add('listening');
                isListening = true;
                
                showVoiceCommandFeedback('Listening...');
            } else {
                recognition.stop();
                voiceButton.classList.remove('listening');
                isListening = false;
                
                showVoiceCommandFeedback('Voice control off');
            }
        });
        
        recognition.onend = () => {
            voiceButton.classList.remove('listening');
            isListening = false;
        };
    }
    
    // Display voice command feedback
    function showVoiceCommandFeedback(text) {
        const feedback = document.createElement('div');
        feedback.className = 'voice-command-feedback';
        feedback.textContent = text;
        
        document.body.appendChild(feedback);
        
        // Animate in
        setTimeout(() => {
            feedback.classList.add('active');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            feedback.classList.remove('active');
            
            setTimeout(() => {
                feedback.remove();
            }, 500);
        }, 3000);
    }
    
    // Make elements draggable
    function makeDraggable(selector) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(el => {
            el.setAttribute('draggable', 'true');
            
            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', el.id);
                el.classList.add('dragging');
            });
            
            el.addEventListener('dragend', () => {
                el.classList.remove('dragging');
            });
        });
        
        // Setup drop zones
        document.querySelectorAll('.drag-container').forEach(container => {
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                container.classList.add('drag-over');
            });
            
            container.addEventListener('dragleave', () => {
                container.classList.remove('drag-over');
            });
            
            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.classList.remove('drag-over');
                
                const id = e.dataTransfer.getData('text/plain');
                const element = document.getElementById(id);
                
                if (element) {
                    container.appendChild(element);
                }
            });
        });
    }
    
    // Initialize interactive infographics
    function initInteractiveInfoGraphic(infographic) {
        const hotspots = infographic.querySelectorAll('.hotspot');
        
        hotspots.forEach(hotspot => {
            hotspot.addEventListener('click', () => {
                // Remove active class from all hotspots
                hotspots.forEach(h => h.classList.remove('active'));
                
                // Add active class to clicked hotspot
                hotspot.classList.add('active');
                
                // Show associated content
                const contentId = hotspot.getAttribute('data-content');
                const content = infographic.querySelector(`#${contentId}`);
                
                if (content) {
                    // Hide all content panels
                    infographic.querySelectorAll('.content-panel').forEach(panel => {
                        panel.classList.remove('active');
                    });
                    
                    // Show selected content
                    content.classList.add('active');
                }
            });
        });
    }

    /**
     * UTILITY FUNCTIONS
     */
    
    // Check if device supports WebP
    function checkWebPSupport() {
        const canvas = document.createElement('canvas');
        if (canvas.getContext && canvas.getContext('2d')) {
            return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        return false;
    }
    
    // Detect high performance device
    function checkHighPerformanceDevice() {
        // Check for hardware concurrency (CPU cores)
        const cpuPower = navigator.hardwareConcurrency || 0;
        
        // Check for device memory
        const deviceMemory = navigator.deviceMemory || 0;
        
        // Consider device high performance if it has at least 4 cores or 4GB RAM
        return cpuPower >= 4 || deviceMemory >= 4;
    }

    // Function to restore system cursor and remove any custom cursors
    function restoreSystemCursor() {
        // Reset cursor style on HTML and body
        document.documentElement.style.cursor = '';
        document.body.style.cursor = '';
        
        // Remove all custom cursors
        const cursorElements = document.querySelectorAll('#simple-cursor, .custom-cursor, .cursor-dot, .cursor-ring, .dynamic-cursor, .cursor-trail-point, .advanced-cursor');
        cursorElements.forEach(el => {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        
        // Reset cursor on all interactive elements to ensure they show the default system cursor
        const interactiveElements = document.querySelectorAll('a, button, .btn, input, textarea, select, .timeline-node, [role="button"]');
        interactiveElements.forEach(el => {
            el.style.cursor = '';
        });
    }
}); 
