// ============================================================================
// THRIFT MAAL BLOG ENGINE
// Features: Search, Filter, Lazy Load, Analytics, Newsletter
// Performance: Optimized for < 2 second load time
// ============================================================================

class ThriftBlogEngine {
    constructor() {
        // Configuration
        this.blogData = null;
        this.allPosts = [];
        this.filteredPosts = [];
        this.displayedPosts = 0;
        this.postsPerPage = 6;
        this.currentCategory = 'all';
        this.searchQuery = '';
        
        // DOM Elements
        this.blogGrid = document.getElementById('blog-grid');
        this.featuredPost = document.getElementById('featured-post');
        this.popularPosts = document.getElementById('popular-posts');
        this.searchInput = document.getElementById('blog-search');
        this.categoryTabs = document.querySelectorAll('.cat-tab');
        this.loadMoreBtn = document.getElementById('btn-load-more');
        this.noResults = document.getElementById('no-results');
        this.newsletterForm = document.getElementById('newsletter-form');
        
        // Initialize
        this.init();
    }
    
    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    
    async init() {
        console.log('🚀 Thrift Maal Blog Engine Starting...');
        
        try {
            await this.loadBlogData();
            this.setupEventListeners();
            this.renderFeaturedPost();
            this.renderPopularPosts();
            this.updateCategoryCounts();
            this.renderPosts();
            this.initLazyLoading();
            
            console.log('✅ Blog Engine Initialized Successfully');
        } catch (error) {
            console.error('❌ Blog Engine Error:', error);
            this.showError();
        }
    }
    
    // ========================================================================
    // DATA LOADING
    // ========================================================================
    
    async loadBlogData() {
        try {
            // Load from external JSON file
            const response = await fetch('js/blog-posts.json');
            if (!response.ok) throw new Error('Failed to load blog data');
            
            this.blogData = await response.json();
            this.allPosts = this.blogData.posts;
            this.filteredPosts = [...this.allPosts];
            
            console.log(`📚 Loaded ${this.allPosts.length} blog posts`);
        } catch (error) {
            console.error('Error loading blog data:', error);
            // Fallback: Show error message
            throw error;
        }
    }
    
    // ========================================================================
    // EVENT LISTENERS
    // ========================================================================
    
    setupEventListeners() {
        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }
        
        // Category Tabs
        this.categoryTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleCategoryFilter(e.currentTarget.dataset.category);
            });
        });
        
        // Load More
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.loadMorePosts();
            });
        }
        
        // Newsletter
        if (this.newsletterForm) {
            this.newsletterForm.addEventListener('submit', (e) => {
                this.handleNewsletterSubmit(e);
            });
        }
        
        // Analytics - Track page view
        this.trackPageView();
    }
    
    // ========================================================================
    // SEARCH FUNCTIONALITY
    // ========================================================================
    
    handleSearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.displayedPosts = 0;
        
        if (this.searchQuery === '') {
            // Reset to current category
            this.filteredPosts = this.currentCategory === 'all' 
                ? [...this.allPosts]
                : this.allPosts.filter(post => post.category === this.currentCategory);
        } else {
            // Search in title, excerpt, tags, keywords
            this.filteredPosts = this.allPosts.filter(post => {
                const matchesSearch = 
                    post.title.toLowerCase().includes(this.searchQuery) ||
                    post.excerpt.toLowerCase().includes(this.searchQuery) ||
                    post.tags.some(tag => tag.toLowerCase().includes(this.searchQuery)) ||
                    post.metaKeywords.toLowerCase().includes(this.searchQuery);
                
                const matchesCategory = 
                    this.currentCategory === 'all' || post.category === this.currentCategory;
                
                return matchesSearch && matchesCategory;
            });
        }
        
        this.renderPosts();
        this.trackSearch(this.searchQuery);
    }
    
    // ========================================================================
    // CATEGORY FILTER
    // ========================================================================
    
    handleCategoryFilter(category) {
        this.currentCategory = category;
        this.displayedPosts = 0;
        this.searchQuery = '';
        if (this.searchInput) this.searchInput.value = '';
        
        // Update active tab
        this.categoryTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });
        
        // Filter posts
        if (category === 'all') {
            this.filteredPosts = [...this.allPosts];
        } else {
            this.filteredPosts = this.allPosts.filter(post => post.category === category);
        }
        
        this.renderPosts();
        this.trackCategoryFilter(category);
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // ========================================================================
    // RENDER POSTS
    // ========================================================================
    
    renderPosts() {
        const postsToShow = this.filteredPosts.slice(0, this.displayedPosts + this.postsPerPage);
        this.displayedPosts = postsToShow.length;
        
        // Clear grid
        if (this.blogGrid) {
            this.blogGrid.innerHTML = '';
        }
        
        // Check if no results
        if (postsToShow.length === 0) {
            if (this.noResults) this.noResults.style.display = 'block';
            if (this.blogGrid) this.blogGrid.style.display = 'none';
            if (this.loadMoreBtn) this.loadMoreBtn.style.display = 'none';
            return;
        }
        
        if (this.noResults) this.noResults.style.display = 'none';
        if (this.blogGrid) this.blogGrid.style.display = 'grid';
        
        // Render each post
        postsToShow.forEach(post => {
            const card = this.createPostCard(post);
            this.blogGrid.appendChild(card);
        });
        
        // Show/hide load more button
        if (this.loadMoreBtn) {
            this.loadMoreBtn.style.display = 
                this.displayedPosts < this.filteredPosts.length ? 'block' : 'none';
        }
    }
    
    createPostCard(post) {
        const card = document.createElement('article');
        card.className = 'blog-card';
        card.setAttribute('data-aos', 'fade-up');
        
        card.innerHTML = `
            <div class="blog-card-image">
                <img 
                    src="${post.featuredImage}" 
                    alt="${post.featuredImageAlt}"
                    loading="lazy"
                    onerror="this.src='https://via.placeholder.com/800x500/2874F0/FFFFFF?text=Thrift+Maal'"
                >
                <span class="category-badge">${this.getCategoryName(post.category)}</span>
            </div>
            <div class="blog-card-content">
                <h3>${post.title}</h3>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <div class="blog-card-footer">
                    <span class="post-author">
                        <i class="fas fa-user"></i> ${post.author}
                    </span>
                    <span class="post-meta">
                        <i class="fas fa-clock"></i> ${post.readingTime}
                    </span>
                </div>
            </div>
        `;
        
        // Add click event to open post
        card.addEventListener('click', () => {
            this.openPost(post);
        });
        
        return card;
    }
    
    // ========================================================================
    // FEATURED POST
    // ========================================================================
    
    renderFeaturedPost() {
        const featured = this.allPosts.find(post => post.featured) || this.allPosts[0];
        if (!featured || !this.featuredPost) return;
        
        this.featuredPost.innerHTML = `
            <img 
                src="${featured.featuredImage}" 
                alt="${featured.featuredImageAlt}"
                class="featured-post-image"
                loading="eager"
                onerror="this.src='https://via.placeholder.com/800x500/2874F0/FFFFFF?text=Featured+Post'"
            >
            <div class="featured-post-content">
                <span class="featured-badge">
                    <i class="fas fa-star"></i> Featured
                </span>
                <h2>${featured.title}</h2>
                <p class="featured-excerpt">${featured.excerpt}</p>
                <div class="featured-meta">
                    <span><i class="fas fa-calendar"></i> ${this.formatDate(featured.publishDate)}</span>
                    <span><i class="fas fa-user"></i> ${featured.author}</span>
                    <span><i class="fas fa-clock"></i> ${featured.readingTime}</span>
                </div>
                <a href="#" class="btn-read" onclick="event.preventDefault(); blogEngine.openPost(${JSON.stringify(featured).replace(/"/g, '&quot;')});">
                    Read Full Article <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
    }
    
    // ========================================================================
    // POPULAR POSTS
    // ========================================================================
    
    renderPopularPosts() {
        if (!this.popularPosts) return;
        
        // Sort by views and get top 5
        const popular = [...this.allPosts]
            .sort((a, b) => b.views - a.views)
            .slice(0, 5);
        
        this.popularPosts.innerHTML = popular.map(post => `
            <div class="popular-post-item" onclick="blogEngine.openPost(${JSON.stringify(post).replace(/"/g, '&quot;')})">
                <img 
                    src="${post.featuredImage}" 
                    alt="${post.featuredImageAlt}"
                    class="popular-post-thumb"
                    loading="lazy"
                    onerror="this.src='https://via.placeholder.com/160x120/2874F0/FFFFFF?text=Post'"
                >
                <div class="popular-post-info">
                    <h4>${post.title}</h4>
                    <span class="popular-post-date">
                        <i class="fas fa-calendar"></i> ${this.formatDate(post.publishDate)}
                    </span>
                </div>
            </div>
        `).join('');
    }
    
    // ========================================================================
    // CATEGORY COUNTS
    // ========================================================================
    
    updateCategoryCounts() {
        const counts = {
            'all': this.allPosts.length,
            'shopping-tips': this.countByCategory('shopping-tips'),
            'product-guides': this.countByCategory('product-guides'),
            'deals-offers': this.countByCategory('deals-offers'),
            'student-discounts': this.countByCategory('student-discounts'),
            'festival-sales': this.countByCategory('festival-sales'),
            'brand-reviews': this.countByCategory('brand-reviews')
        };
        
        // Update count spans
        document.getElementById('count-all')?.textContent = `(${counts.all})`;
        document.getElementById('count-shop')?.textContent = `(${counts['shopping-tips']})`;
        document.getElementById('count-prod')?.textContent = `(${counts['product-guides']})`;
        document.getElementById('count-deals')?.textContent = `(${counts['deals-offers']})`;
        document.getElementById('count-student')?.textContent = `(${counts['student-discounts']})`;
        document.getElementById('count-festival')?.textContent = `(${counts['festival-sales']})`;
        document.getElementById('count-brand')?.textContent = `(${counts['brand-reviews']})`;
    }
    
    countByCategory(category) {
        return this.allPosts.filter(post => post.category === category).length;
    }
    
    // ========================================================================
    // LOAD MORE
    // ========================================================================
    
    loadMorePosts() {
        this.displayedPosts += this.postsPerPage;
        this.renderPosts();
        
        // Track load more click
        this.trackEvent('load_more', { posts_loaded: this.displayedPosts });
    }
    
    // ========================================================================
    // OPEN POST
    // ========================================================================
    
    openPost(post) {
        // Store post in sessionStorage
        sessionStorage.setItem('currentPost', JSON.stringify(post));
        
        // Navigate to post page
        const postUrl = `/blog/${post.category}/${post.slug}/`;
        
        // Track post click
        this.trackEvent('post_click', {
            post_id: post.id,
            post_title: post.title,
            category: post.category
        });
        
        // Navigate
        window.location.href = postUrl;
    }
    
    // ========================================================================
    // NEWSLETTER
    // ========================================================================
    
    handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const emailInput = e.target.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Save to localStorage
        let subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
        
        if (subscribers.includes(email)) {
            this.showNotification('You are already subscribed!', 'info');
            return;
        }
        
        subscribers.push(email);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
        
        // Track subscription
        this.trackEvent('newsletter_subscribe', { email: email });
        
        // Show success message
        this.showNotification('✅ Thank you for subscribing! Check your email for confirmation.', 'success');
        
        // Reset form
        e.target.reset();
    }
    
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // ========================================================================
    // LAZY LOADING
    // ========================================================================
    
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });
            
            // Observe all lazy images
            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    // ========================================================================
    // ANALYTICS & TRACKING
    // ========================================================================
    
    trackPageView() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
    }
    
    trackSearch(query) {
        if (typeof gtag !== 'undefined' && query) {
            gtag('event', 'search', {
                search_term: query
            });
        }
    }
    
    trackCategoryFilter(category) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'filter_category', {
                category: category
            });
        }
    }
    
    trackEvent(eventName, params = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, params);
        }
        console.log('📊 Event:', eventName, params);
    }
    
    // ========================================================================
    // UTILITY FUNCTIONS
    // ========================================================================
    
    getCategoryName(categoryId) {
        const categoryMap = {
            'shopping-tips': 'Shopping Tips',
            'product-guides': 'Product Guides',
            'deals-offers': 'Deals & Offers',
            'student-discounts': 'Student Discounts',
            'festival-sales': 'Festival Sales',
            'brand-reviews': 'Brand Reviews'
        };
        return categoryMap[categoryId] || categoryId;
    }
    
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#2874F0'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    showError() {
        if (this.blogGrid) {
            this.blogGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #EF4444; margin-bottom: 1rem;"></i>
                    <h3 style="color: #1f2937; margin-bottom: 0.5rem;">Unable to load blog posts</h3>
                    <p style="color: #6b7280;">Please check your connection and try again.</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #2874F0; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                        Reload Page
                    </button>
                </div>
            `;
        }
    }
}

// ============================================================================
// INITIALIZE ON DOM READY
// ============================================================================

let blogEngine;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM Content Loaded');
    blogEngine = new ThriftBlogEngine();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    img.loaded {
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);
