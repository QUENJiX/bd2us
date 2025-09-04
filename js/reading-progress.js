/* ===== READING PROGRESS BAR FUNCTIONALITY ===== */

document.addEventListener('DOMContentLoaded', function() {
    // Create progress bar element
    const progressContainer = document.createElement('div');
    progressContainer.className = 'reading-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress-bar';
    
    progressContainer.appendChild(progressBar);
    document.body.insertBefore(progressContainer, document.body.firstChild);
    
    // Update progress on scroll
    function updateReadingProgress() {
        const contentBlock = document.querySelector('.content-block');
        if (!contentBlock) return;
        
        const contentTop = contentBlock.offsetTop;
        const contentHeight = contentBlock.offsetHeight;
        const viewportHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        
        // Calculate progress based on content area
        const contentStart = contentTop - viewportHeight * 0.3;
        const contentEnd = contentTop + contentHeight - viewportHeight * 0.7;
        const totalContentLength = contentEnd - contentStart;
        
        if (totalContentLength <= 0) return;
        
        const progress = Math.max(0, Math.min(100, 
            ((scrollTop - contentStart) / totalContentLength) * 100
        ));
        
        progressBar.style.width = progress + '%';
        
        // Always show the progress bar (remove hide/show logic for debugging)
        progressContainer.style.opacity = '1';
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    
    // Initial update
    setTimeout(updateReadingProgress, 100); // Small delay to ensure content is loaded
});
