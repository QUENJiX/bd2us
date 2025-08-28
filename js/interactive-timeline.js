/**
 * Interactive Timeline with Advanced Animations
 */

class InteractiveTimeline {
    constructor() {
        this.init();
    }
    
    init() {
        this.enhanceTimelineNodes();
        this.addProgressTracker();
        this.addMouseTrailEffect();
        this.addConstellationConnections();
    }
    
    enhanceTimelineNodes() {
        const timelineNodes = document.querySelectorAll('.timeline-node');
        
        timelineNodes.forEach((node, index) => {
            // Add stagger delay for entrance animation
            node.style.animationDelay = `${index * 0.2}s`;
            node.classList.add('elastic-in');
            
            // Add pulsing effect for active nodes
            if (node.classList.contains('active') || node.classList.contains('current')) {
                node.classList.add('pulse-on-hover');
            }
            
            // Add hover sound and haptic feedback
            node.addEventListener('mouseenter', () => {
                this.playHoverSound();
                this.addHapticFeedback();
                this.showTooltip(node);
            });
            
            node.addEventListener('mouseleave', () => {
                this.hideTooltip(node);
            });
            
            // Add click effects
            node.addEventListener('click', () => {
                this.createExplosionEffect(node);
                this.addRippleEffect(node);
            });
        });
    }
    
    addProgressTracker() {
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;
        
        // Create progress line
        const progressLine = document.createElement('div');
        progressLine.className = 'timeline-progress';
        progressLine.innerHTML = `
            <div class="progress-fill"></div>
            <div class="progress-particle"></div>
        `;
        
        timeline.appendChild(progressLine);
        
        // Animate progress based on scroll
        window.addEventListener('scroll', () => {
            const timelineRect = timeline.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const scrollProgress = Math.max(0, Math.min(1, 
                (windowHeight - timelineRect.top) / (windowHeight + timelineRect.height)
            ));
            
            const progressFill = progressLine.querySelector('.progress-fill');
            const progressParticle = progressLine.querySelector('.progress-particle');
            
            progressFill.style.height = `${scrollProgress * 100}%`;
            progressParticle.style.top = `${scrollProgress * 100}%`;
        });
    }
    
    addMouseTrailEffect() {
        const trail = [];
        const maxTrail = 20;
        
        document.addEventListener('mousemove', (e) => {
            // Add new trail point
            trail.push({
                x: e.clientX,
                y: e.clientY,
                life: maxTrail
            });
            
            // Remove old trail points
            if (trail.length > maxTrail) {
                trail.shift();
            }
            
            // Update existing trail elements
            trail.forEach((point, index) => {
                let trailElement = document.getElementById(`trail-${index}`);
                
                if (!trailElement) {
                    trailElement = document.createElement('div');
                    trailElement.id = `trail-${index}`;
                    trailElement.className = 'mouse-trail';
                    document.body.appendChild(trailElement);
                }
                
                const size = (point.life / maxTrail) * 10;
                const opacity = point.life / maxTrail;
                
                trailElement.style.left = `${point.x - size/2}px`;
                trailElement.style.top = `${point.y - size/2}px`;
                trailElement.style.width = `${size}px`;
                trailElement.style.height = `${size}px`;
                trailElement.style.opacity = opacity;
                
                point.life--;
                
                if (point.life <= 0) {
                    trailElement.remove();
                }
            });
        });
    }
    
    addConstellationConnections() {
        const nodes = document.querySelectorAll('.timeline-node');
        if (nodes.length < 2) return;
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.className = 'constellation-connections';
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '1';
        
        document.querySelector('.timeline')?.appendChild(svg);
        
        // Create animated connections between nodes
        for (let i = 0; i < nodes.length - 1; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'constellation-line');
            line.setAttribute('stroke', 'var(--color-primary)');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('stroke-dasharray', '5,5');
            line.setAttribute('opacity', '0.3');
            
            // Add animation
            const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animate.setAttribute('attributeName', 'stroke-dashoffset');
            animate.setAttribute('values', '0;-10');
            animate.setAttribute('dur', '1s');
            animate.setAttribute('repeatCount', 'indefinite');
            
            line.appendChild(animate);
            svg.appendChild(line);
            
            // Update line positions
            this.updateLinePositions(nodes[i], nodes[i + 1], line);
        }
    }
    
    updateLinePositions(node1, node2, line) {
        const rect1 = node1.getBoundingClientRect();
        const rect2 = node2.getBoundingClientRect();
        const svgRect = document.querySelector('.constellation-connections').getBoundingClientRect();
        
        const x1 = rect1.left + rect1.width / 2 - svgRect.left;
        const y1 = rect1.top + rect1.height / 2 - svgRect.top;
        const x2 = rect2.left + rect2.width / 2 - svgRect.left;
        const y2 = rect2.top + rect2.height / 2 - svgRect.top;
        
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
    }
    
    createExplosionEffect(node) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion-effect';
        
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            
            const angle = (i / 12) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.animationDelay = `${Math.random() * 0.2}s`;
            
            explosion.appendChild(particle);
        }
        
        node.appendChild(explosion);
        
        setTimeout(() => explosion.remove(), 1000);
    }
    
    addRippleEffect(node) {
        const ripple = document.createElement('div');
        ripple.className = 'node-ripple';
        node.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 800);
    }
    
    showTooltip(node) {
        const tooltip = document.createElement('div');
        tooltip.className = 'node-tooltip';
        tooltip.textContent = node.getAttribute('data-tooltip') || 'Interactive node';
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = node.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 40}px`;
        tooltip.style.transform = 'translateX(-50%)';
        
        setTimeout(() => tooltip.classList.add('show'), 10);
    }
    
    hideTooltip() {
        const tooltip = document.querySelector('.node-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    playHoverSound() {
        // Create audio context for hover sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Fallback for browsers without Web Audio API
        }
    }
    
    addHapticFeedback() {
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new InteractiveTimeline();
});
