/**
 * Enhanced Form Interactions and Micro-Animations
 */

class EnhancedForms {
    constructor() {
        this.init();
    }
    
    init() {
        this.enhanceInputFields();
        this.addFloatingLabels();
        this.addProgressIndicators();
        this.addValidationAnimations();
        this.addSubmitAnimations();
    }
    
    enhanceInputFields() {
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Add focus ring animation
            input.addEventListener('focus', () => {
                this.createFocusRing(input);
            });
            
            input.addEventListener('blur', () => {
                this.removeFocusRing(input);
            });
            
            // Add typing animation
            input.addEventListener('input', () => {
                this.addTypingEffect(input);
            });
        });
    }
    
    createFocusRing(input) {
        const ring = document.createElement('div');
        ring.className = 'focus-ring';
        
        const rect = input.getBoundingClientRect();
        ring.style.position = 'fixed';
        ring.style.left = rect.left - 4 + 'px';
        ring.style.top = rect.top - 4 + 'px';
        ring.style.width = rect.width + 8 + 'px';
        ring.style.height = rect.height + 8 + 'px';
        ring.style.border = '2px solid var(--color-primary)';
        ring.style.borderRadius = '8px';
        ring.style.pointerEvents = 'none';
        ring.style.zIndex = '10000';
        ring.style.opacity = '0';
        ring.style.transform = 'scale(0.8)';
        ring.style.transition = 'all 0.3s ease';
        
        document.body.appendChild(ring);
        
        requestAnimationFrame(() => {
            ring.style.opacity = '1';
            ring.style.transform = 'scale(1)';
        });
        
        input._focusRing = ring;
    }
    
    removeFocusRing(input) {
        if (input._focusRing) {
            input._focusRing.style.opacity = '0';
            input._focusRing.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                if (input._focusRing) {
                    input._focusRing.remove();
                    input._focusRing = null;
                }
            }, 300);
        }
    }
    
    addFloatingLabels() {
        const labeledInputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
        
        labeledInputs.forEach(input => {
            const wrapper = document.createElement('div');
            wrapper.className = 'floating-label-wrapper';
            
            const label = document.createElement('label');
            label.className = 'floating-label';
            label.textContent = input.placeholder;
            label.setAttribute('for', input.id || '');
            
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            wrapper.appendChild(label);
            
            // Remove original placeholder
            input.removeAttribute('placeholder');
            
            // Handle label animation
            const updateLabel = () => {
                if (input.value || input === document.activeElement) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            };
            
            input.addEventListener('focus', updateLabel);
            input.addEventListener('blur', updateLabel);
            input.addEventListener('input', updateLabel);
            
            updateLabel(); // Initial state
        });
    }
    
    addProgressIndicators() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const steps = form.querySelectorAll('[data-step]');
            if (steps.length <= 1) return;
            
            const progressBar = document.createElement('div');
            progressBar.className = 'form-progress';
            progressBar.innerHTML = `
                <div class="progress-track">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-steps"></div>
            `;
            
            form.insertBefore(progressBar, form.firstChild);
            
            // Create step indicators
            const stepsContainer = progressBar.querySelector('.progress-steps');
            steps.forEach((step, index) => {
                const stepIndicator = document.createElement('div');
                stepIndicator.className = 'step-indicator';
                stepIndicator.textContent = index + 1;
                stepsContainer.appendChild(stepIndicator);
            });
            
            this.updateFormProgress(form);
        });
    }
    
    updateFormProgress(form) {
        const steps = form.querySelectorAll('[data-step]');
        const progressFill = form.querySelector('.progress-fill');
        const stepIndicators = form.querySelectorAll('.step-indicator');
        
        let completedSteps = 0;
        
        steps.forEach((step, index) => {
            const inputs = step.querySelectorAll('input, textarea, select');
            let stepCompleted = true;
            
            inputs.forEach(input => {
                if (input.required && !input.value) {
                    stepCompleted = false;
                }
            });
            
            if (stepCompleted) {
                completedSteps++;
                stepIndicators[index]?.classList.add('completed');
            } else {
                stepIndicators[index]?.classList.remove('completed');
            }
        });
        
        const progress = (completedSteps / steps.length) * 100;
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
    }
    
    addValidationAnimations() {
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateInput(input);
                }
            });
        });
    }
    
    validateInput(input) {
        const isValid = input.checkValidity();
        
        if (isValid) {
            input.classList.remove('error');
            input.classList.add('success');
            this.showSuccessIcon(input);
        } else {
            input.classList.remove('success');
            input.classList.add('error');
            this.showErrorIcon(input);
            this.shakeInput(input);
        }
    }
    
    showSuccessIcon(input) {
        this.removeValidationIcon(input);
        
        const icon = document.createElement('div');
        icon.className = 'validation-icon success-icon';
        icon.innerHTML = '<i class="fas fa-check"></i>';
        
        input.parentNode.appendChild(icon);
        input._validationIcon = icon;
    }
    
    showErrorIcon(input) {
        this.removeValidationIcon(input);
        
        const icon = document.createElement('div');
        icon.className = 'validation-icon error-icon';
        icon.innerHTML = '<i class="fas fa-times"></i>';
        
        input.parentNode.appendChild(icon);
        input._validationIcon = icon;
    }
    
    removeValidationIcon(input) {
        if (input._validationIcon) {
            input._validationIcon.remove();
            input._validationIcon = null;
        }
    }
    
    shakeInput(input) {
        input.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }
    
    addSubmitAnimations() {
        const submitButtons = document.querySelectorAll('button[type="submit"], input[type="submit"]');
        
        submitButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const form = button.closest('form');
                
                if (form && form.checkValidity()) {
                    this.animateSubmitSuccess(button);
                } else {
                    this.animateSubmitError(button);
                }
            });
        });
    }
    
    animateSubmitSuccess(button) {
        button.classList.add('loading');
        button.disabled = true;
        
        const originalText = button.textContent;
        button.textContent = 'Submitting...';
        
        // Simulate loading
        setTimeout(() => {
            button.classList.remove('loading');
            button.classList.add('success');
            button.textContent = 'Success!';
            
            setTimeout(() => {
                button.classList.remove('success');
                button.textContent = originalText;
                button.disabled = false;
            }, 2000);
        }, 1500);
    }
    
    animateSubmitError(button) {
        button.classList.add('error');
        
        setTimeout(() => {
            button.classList.remove('error');
        }, 500);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedForms();
});
