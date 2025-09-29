// Blog Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    let currentPosts = [...blogPosts];
    let displayedPosts = [];
    let postsPerLoad = 6;
    let currentLoadIndex = 0;
    
    // Get DOM elements
    const blogPostsGrid = document.getElementById('blog-posts-grid');
    const searchInput = document.getElementById('blog-search');
    const sortSelect = document.getElementById('sort-select');
    const categorySelect = document.getElementById('category-select');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const noResults = document.getElementById('no-results');
    
    // Initialize the blog
    init();
    
    function init() {
        // Force default selection to 'newest' regardless of any browser autofill/state
        if (sortSelect) {
            sortSelect.value = 'newest';
        }
        // Ensure the initial view reflects the default sort selection (newest) instead of raw array order
        applySortAndFilter();
        bindEvents();
        renderPosts();
        loadStoredLikes();
    }
    
    function bindEvents() {
        searchInput.addEventListener('input', handleSearch);
        sortSelect.addEventListener('change', handleSort);
        categorySelect.addEventListener('change', handleCategoryFilter);
        loadMoreBtn.addEventListener('click', loadMorePosts);
        
        // Debounce search to improve performance
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(handleSearch, 300);
        });
    }
    
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (!searchTerm) {
            currentPosts = [...blogPosts];
        } else {
            currentPosts = blogPosts.filter(post => 
                post.title.toLowerCase().includes(searchTerm) ||
                post.excerpt.toLowerCase().includes(searchTerm) ||
                post.author.toLowerCase().includes(searchTerm) ||
                categoryLabels[post.category].toLowerCase().includes(searchTerm)
            );
        }
        
        applySortAndFilter();
        resetPagination();
        renderPosts();
    }
    
    function handleSort() {
        applySortAndFilter();
        resetPagination();
        renderPosts();
    }
    
    function handleCategoryFilter() {
        const selectedCategory = categorySelect.value;
        
        if (selectedCategory === 'all') {
            // Apply search filter if there's a search term
            const searchTerm = searchInput.value.toLowerCase().trim();
            if (!searchTerm) {
                currentPosts = [...blogPosts];
            } else {
                currentPosts = blogPosts.filter(post => 
                    post.title.toLowerCase().includes(searchTerm) ||
                    post.excerpt.toLowerCase().includes(searchTerm) ||
                    post.author.toLowerCase().includes(searchTerm)
                );
            }
        } else {
            currentPosts = currentPosts.filter(post => post.category === selectedCategory);
        }
        
        applySortAndFilter();
        resetPagination();
        renderPosts();
    }
    
    function applySortAndFilter() {
        const sortValue = sortSelect.value;
        
        switch (sortValue) {
            case 'newest':
                currentPosts.sort((a, b) => safeDate(b.date) - safeDate(a.date));
                break;
            case 'oldest':
                currentPosts.sort((a, b) => safeDate(a.date) - safeDate(b.date));
                break;
            case 'most-liked':
                currentPosts.sort((a, b) => (getStoredLikes(b.id) || b.likes) - (getStoredLikes(a.id) || a.likes));
                break;
            case 'title-az':
                currentPosts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-za':
                currentPosts.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }
    }

    // Robust date parser with fallback to epoch ordering by ID (so newest IDs appear first if date invalid)
    function safeDate(dateStr) {
        if (!dateStr) return 0;
        // Fast numeric parse for YYYY-MM-DD
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
        if (m) {
            const y = parseInt(m[1], 10);
            const mo = parseInt(m[2], 10) - 1;
            const d = parseInt(m[3], 10);
            const t = Date.UTC(y, mo, d);
            if (!isNaN(t)) return t;
        }
        const t2 = Date.parse(dateStr);
        if (!isNaN(t2)) return t2;
        // Fallback: derive pseudo time from id (higher id = newer) if available
        const p = blogPosts.find(p => p.date === dateStr);
        return p ? p.id : 0;
    }
    
    function resetPagination() {
        currentLoadIndex = 0;
        displayedPosts = [];
        blogPostsGrid.innerHTML = '';
    }
    
    function renderPosts() {
        if (currentPosts.length === 0) {
            showNoResults();
            return;
        }
        
        hideNoResults();
        
        const postsToShow = currentPosts.slice(currentLoadIndex, currentLoadIndex + postsPerLoad);
        displayedPosts.push(...postsToShow);
        
        postsToShow.forEach(post => {
            const postElement = createPostElement(post);
            blogPostsGrid.appendChild(postElement);
            
            // Add animation
            setTimeout(() => {
                postElement.style.opacity = '1';
                postElement.style.transform = 'translateY(0)';
            }, 100);
        });
        
        currentLoadIndex += postsPerLoad;
        
        // Show/hide load more button
        if (currentLoadIndex >= currentPosts.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
        }
    }
    
    function createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'blog-post-card';
        postDiv.style.opacity = '0';
        postDiv.style.transform = 'translateY(20px)';
        postDiv.style.transition = 'all 0.5s ease';
        
        const categoryColor = categoryColors[post.category] || '#00693E';
        const currentLikes = getStoredLikes(post.id) || post.likes;
        const isLiked = isPostLiked(post.id);
        
        postDiv.innerHTML = `
            <div class="blog-post-header">
                <span class="blog-post-category" style="background-color: ${categoryColor}">
                    ${categoryLabels[post.category]}
                </span>
                <h3 class="blog-post-title">${post.title}</h3>
            </div>
            
            <div class="blog-post-meta">
                <div class="blog-post-date">
                    <i class="fas fa-calendar-alt"></i>
                    <span title="${formatDate(post.date)}">${getRelativeTime(post.date)}</span>
                </div>
                <div class="blog-post-author">
                    <i class="fas fa-user"></i>
                    <span>${post.author}</span>
                </div>
                <div class="blog-post-read-time">
                    <i class="fas fa-clock"></i>
                    <span>${post.readTime}</span>
                </div>
            </div>
            
            <p class="blog-post-excerpt">${post.excerpt}</p>
            
            <div class="blog-post-footer">
                <div class="blog-post-likes">
                    <button class="like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                    <span class="like-count">${currentLikes}</span>
                </div>
                <a href="blog/${post.slug}.html" class="read-more-btn">Read More</a>
            </div>
        `;
        
        // Add click handler for like button
        const likeBtn = postDiv.querySelector('.like-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(post.id);
        });
        
        // Add click handler for the whole card (except buttons)
        postDiv.addEventListener('click', (e) => {
            if (!e.target.closest('.like-btn') && !e.target.closest('.read-more-btn')) {
                window.location.href = `blog/${post.slug}.html`;
            }
        });
        
        return postDiv;
    }
    
    function loadMorePosts() {
        renderPosts();
    }
    
    function showNoResults() {
        noResults.style.display = 'block';
        loadMoreBtn.style.display = 'none';
    }
    
    function hideNoResults() {
        noResults.style.display = 'none';
    }
    
    // Like functionality
    function toggleLike(postId) {
        const likedPosts = getStoredLikedPosts();
        const isCurrentlyLiked = likedPosts.includes(postId);
        
        if (isCurrentlyLiked) {
            // Remove like
            const index = likedPosts.indexOf(postId);
            likedPosts.splice(index, 1);
            updateStoredLikes(postId, -1);
        } else {
            // Add like
            likedPosts.push(postId);
            updateStoredLikes(postId, 1);
        }
        
        localStorage.setItem('bd2us-liked-posts', JSON.stringify(likedPosts));
        
        // Update UI
        updateLikeUI(postId);
        
        // Re-sort if sorting by likes
        if (sortSelect.value === 'most-liked') {
            applySortAndFilter();
            resetPagination();
            renderPosts();
        }
    }
    
    function updateLikeUI(postId) {
        const likeBtn = document.querySelector(`[data-post-id="${postId}"]`);
        const likeCount = likeBtn.nextElementSibling;
        const isLiked = isPostLiked(postId);
        const currentLikes = getStoredLikes(postId);
        
        likeBtn.classList.toggle('liked', isLiked);
        likeCount.textContent = currentLikes;
    }
    
    function getStoredLikedPosts() {
        const stored = localStorage.getItem('bd2us-liked-posts');
        return stored ? JSON.parse(stored) : [];
    }
    
    function isPostLiked(postId) {
        return getStoredLikedPosts().includes(postId);
    }
    
    function getStoredLikes(postId) {
        const stored = localStorage.getItem('bd2us-post-likes');
        const likes = stored ? JSON.parse(stored) : {};
        const originalPost = blogPosts.find(p => p.id === postId);
        return likes[postId] !== undefined ? likes[postId] : originalPost.likes;
    }
    
    function updateStoredLikes(postId, change) {
        const stored = localStorage.getItem('bd2us-post-likes');
        const likes = stored ? JSON.parse(stored) : {};
        const currentLikes = getStoredLikes(postId);
        likes[postId] = Math.max(0, currentLikes + change);
        localStorage.setItem('bd2us-post-likes', JSON.stringify(likes));
    }
    
    function loadStoredLikes() {
        // This function ensures stored likes are loaded on page refresh
        const storedLikes = localStorage.getItem('bd2us-post-likes');
        if (storedLikes) {
            const likes = JSON.parse(storedLikes);
            // Update the blogPosts array with stored likes for proper sorting
            blogPosts.forEach(post => {
                if (likes[post.id] !== undefined) {
                    post.currentLikes = likes[post.id];
                }
            });
        }
        // If user switches to Most Liked later it's handled, but in case the current selection is already 'most-liked', reapply.
        if (sortSelect.value === 'most-liked') {
            applySortAndFilter();
            resetPagination();
            renderPosts();
        }
    }
    
    // Initial load handled in init()
});
