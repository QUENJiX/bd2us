/**
 * Easter Eggs and Fun Interactive Features
 */

class EasterEggs {
    constructor() {
        this.konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A
        this.inputSequence = [];
        this.init();
    }
    
    init() {
        this.addKonamiCode();
        this.addClickCounter();
        this.addSecretMenu();
        this.addConfettiEffect();
        this.addWavingAnimation();
    }
    
    addKonamiCode() {
        document.addEventListener('keydown', (e) => {
            this.inputSequence.push(e.keyCode);
            
            if (this.inputSequence.length > this.konamiCode.length) {
                this.inputSequence.shift();
            }
            
            if (this.arraysEqual(this.inputSequence, this.konamiCode)) {
                this.activateKonamiEgg();
                this.inputSequence = [];
            }
        });
    }
    
    activateKonamiEgg() {
        // Create celebration effect
        this.createConfettiExplosion();
        
        // Add special styling
        document.body.classList.add('konami-mode');
        
        // Show secret message
        this.showSecretMessage('🎉 Konami Code Activated! You found the secret! 🎉');
        
        // Play celebration sound
        this.playSuccessSound();
        
        // Add rainbow effect to all buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.classList.add('rainbow-effect');
        });
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            document.body.classList.remove('konami-mode');
            document.querySelectorAll('.btn').forEach(btn => {
                btn.classList.remove('rainbow-effect');
            });
        }, 10000);
    }
    
    addClickCounter() {
        let logoClicks = 0;
        const logo = document.querySelector('.logo');
        
        if (logo) {
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                logoClicks++;
                
                if (logoClicks === 5) {
                    this.showSecretMessage('🎯 You clicked the logo 5 times! Here\'s a fun fact: The average student applies to 8-12 colleges!');
                    logoClicks = 0;
                }
                
                // Add bounce effect
                logo.style.animation = 'bounce 0.5s ease';
                setTimeout(() => {
                    logo.style.animation = '';
                }, 500);
            });
        }
    }
    
    addSecretMenu() {
        // Triple-click anywhere to show debug menu
        let clickCount = 0;
        let clickTimer;
        
        document.addEventListener('click', () => {
            clickCount++;
            
            if (clickCount === 3) {
                this.showDebugMenu();
                clickCount = 0;
            }
            
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 500);
        });
    }
    
    showDebugMenu() {
        const menu = document.createElement('div');
        menu.className = 'debug-menu';
        menu.innerHTML = `
            <h3>🛠️ Debug Menu</h3>
            <button onclick="document.body.classList.toggle('dark-mode')">Toggle Dark Mode</button>
            <button onclick="this.parentElement.classList.toggle('party-mode')">Party Mode</button>
            <button onclick="window.location.reload()">Refresh Page</button>
            <button onclick="this.parentElement.remove()">Close Menu</button>
        `;
        
        document.body.appendChild(menu);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (menu.parentElement) {
                menu.remove();
            }
        }, 10000);
    }
    
    addConfettiEffect() {
        // Double-click on any heading to create confetti
        document.querySelectorAll('h1, h2, h3').forEach(heading => {
            heading.addEventListener('dblclick', () => {
                this.createConfettiExplosion(heading);
            });
        });
    }
    
    createConfettiExplosion(target = document.body) {
        const colors = ['#004D40', '#A23E48', '#D8C3A5', '#F8F8F2', '#FFD700', '#FF6B6B'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                pointer-events: none;
                z-index: 10000;
                border-radius: 50%;
            `;
            
            const rect = target.getBoundingClientRect ? target.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
            confetti.style.left = rect.left + Math.random() * (rect.width || 100) + 'px';
            confetti.style.top = rect.top + Math.random() * (rect.height || 100) + 'px';
            
            document.body.appendChild(confetti);
            
            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${300 + Math.random() * 200}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: 2000 + Math.random() * 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });
            
            animation.onfinish = () => confetti.remove();
        }
    }
    
    addWavingAnimation() {
        // Add wave effect to any emoji
        document.querySelectorAll('body').forEach(element => {
            const text = element.innerHTML;
            const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
            
            element.innerHTML = text.replace(emojiRegex, (emoji) => {
                return `<span class="wave-emoji">${emoji}</span>`;
            });
        });
    }
    
    showSecretMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'secret-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    playSuccessSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Play a happy tune
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            let noteIndex = 0;
            
            const playNote = () => {
                if (noteIndex < notes.length) {
                    oscillator.frequency.setValueAtTime(notes[noteIndex], audioContext.currentTime + noteIndex * 0.2);
                    noteIndex++;
                }
            };
            
            oscillator.frequency.setValueAtTime(notes[0], audioContext.currentTime);
            notes.forEach((note, index) => {
                oscillator.frequency.setValueAtTime(note, audioContext.currentTime + index * 0.2);
            });
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (e) {
            // Fallback for browsers without Web Audio API
        }
    }
    
    arraysEqual(a, b) {
        return a.length === b.length && a.every((val, index) => val === b[index]);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EasterEggs();
});
