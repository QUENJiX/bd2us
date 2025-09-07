/* ===== READING PROGRESS BAR FUNCTIONALITY ===== */

document.addEventListener('DOMContentLoaded', function() {
    // Get the existing progress bar
    const progressBar = document.getElementById('reading-progress-bar');
    const progressContainer = document.querySelector('.reading-progress');
    
    if (!progressBar) return;
    
    // Update progress on scroll
    function updateReadingProgress() {
        // Look for content in different page types
        const contentBlock = document.querySelector('.content-block') || 
                           document.querySelector('.blog-post-content') ||
                           document.querySelector('main');
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
        
        // Show the progress bar
        if (progressContainer) {
            progressContainer.style.opacity = '1';
        }
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    
    // Initial update
    setTimeout(updateReadingProgress, 100);
});
