// ============================================================================
// THRIFT MAAL BLOG - MAIN JAVASCRIPT
// 100% SEO-Optimized, Performance-Focused Blog System
// ============================================================================

// Global Variables
let allBlogPosts = [];
let displayedPosts = 0;
const postsPerPage = 9;
let currentCategory = 'all';
let currentSort = 'latest';
let searchQuery = '';

// DOM Elements
const blogPostsGrid = document.getElementById('blog-posts-grid');
const loadMoreBtn = document.getElementById('load-more-blog');
const categoryTabs = document.querySelectorAll('.category-tab');
const blogSort = document.getElementById('blog-sort');
const blogSearchInput = document.getElementById('blog-search-input');
const searchSuggestions = document.getElementById('search-suggestions');
const featuredPostContainer = document.getElementById('featured-post-container');
const popularPostsList = document.getElementById('popular-posts-list');
const categoriesList = document.getElementById('categories-list');
const tagsCloud = document.getElementById('tags-cloud');
const resultsCount = document.getElementById('blog-results-count');

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Blog initialized');
    initializeBlog();
});

// Main Initialization Function
async function initializeBlog() {
    try {
        await loadBlogPosts();
        renderFeaturedPost();
        renderBlogPosts();
        renderPopularPosts();
        renderCategories();
        renderTags();
        setupEventListeners();
        setupNewsletterForm();
    } catch (error) {
        console.error('Error initializing blog:', error);
        showError('Failed to load blog posts. Please refresh the page.');
    }
}

// Load Blog Posts from JSON
async function loadBlogPosts() {
    try {
        const response = await fetch('data/blog-data.json');
        if (!response.ok) throw new Error('Failed to fetch blog data');
        
        const data = await response.json();
        allBlogPosts = data.posts;
        
        console.log(`✓ Loaded ${allBlogPosts.length} blog posts`);
        return allBlogPosts;
    } catch (error) {
        console.error('Error loading blog posts:', error);
        // Fallback to empty array if fetch fails
        allBlogPosts = [];
        throw error;
    }
}

// Render Featured Post
function renderFeaturedPost() {
    if (allBlogPosts.length === 0) return;
    
    const featuredPost = allBlogPosts.find(post => post.featured) || allBlogPosts[0];
    
    const featuredHTML = `
        <div class="featured-post fade-in">
            <div class="featured-post-image">
                <img src="${featuredPost.image}" alt="${featuredPost.title}" loading="lazy">
                <span class="featured-badge"><i class="fas fa-star"></i> Featured</span>
            </div>
            <div class="featured-post-content">
                <div class="featured-post-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(featuredPost.publishDate)}</span>
                    <span><i class="far fa-clock"></i> ${featuredPost.readTime} min read</span>
                </div>
                <h2 class="featured-post-title">${featuredPost.title}</h2>
                <p class="featured-post-excerpt">${featuredPost.excerpt}</p>
                <a href="${featuredPost.url}" class="featured-post-link">
                    Read Full Article <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `;
    
    featuredPostContainer.innerHTML = featuredHTML;
}

// Render Blog Posts Grid
function renderBlogPosts(reset = false) {
    if (reset) {
        displayedPosts = 0;
        blogPostsGrid.innerHTML = '';
    }
    
    const filteredPosts = getFilteredPosts();
    const postsToShow = filteredPosts.slice(displayedPosts, displayedPosts + postsPerPage);
    
    if (postsToShow.length === 0 && displayedPosts === 0) {
        blogPostsGrid.innerHTML = '<p class="no-results">No articles found. Try a different search or category.</p>';
        loadMoreBtn.style.display = 'none';
        updateResultsCount(0);
        return;
    }
    
    postsToShow.forEach(post => {
        const postCard = createBlogCard(post);
        blogPostsGrid.appendChild(postCard);
    });
    
    displayedPosts += postsToShow.length;
    
    // Show/hide load more button
    if (displayedPosts >= filteredPosts.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
    
    updateResultsCount(filteredPosts.length);
}

// Create Blog Card Element
function createBlogCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card fade-in';
    card.innerHTML = `
        <div class="blog-card-image">
            <img src="${post.image}" alt="${post.title}" loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/400x300?text=Blog+Post'">
            <span class="blog-card-category">${getCategoryName(post.category)}</span>
        </div>
        <div class="blog-card-content">
            <div class="blog-card-meta">
                <span><i class="far fa-calendar"></i> ${formatDate(post.publishDate)}</span>
                <span><i class="far fa-clock"></i> ${post.readTime} min</span>
            </div>
            <h3 class="blog-card-title">${post.title}</h3>
            <p class="blog-card-excerpt">${post.excerpt}</p>
            <div class="blog-card-footer">
                <div class="blog-card-author">
                    <i class="fas fa-user-circle"></i>
                    <span>${post.author}</span>
                </div>
                <a href="${post.url}" class="blog-card-read-more">
                    Read More <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `;
    
    return card;
}

// Get Filtered Posts based on category, search, and sort
function getFilteredPosts() {
    let filtered = [...allBlogPosts];
    
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(post => post.category === currentCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(post => 
            post.title.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query) ||
            post.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }
    
    // Sort posts
    filtered = sortPosts(filtered, currentSort);
    
    return filtered;
}

// Sort Posts
function sortPosts(posts, sortBy) {
    const sorted = [...posts];
    
    switch(sortBy) {
        case 'latest':
            return sorted.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        case 'oldest':
            return sorted.sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate));
        case 'popular':
            return sorted.sort((a, b) => b.views - a.views);
        case 'trending':
            return sorted.sort((a, b) => b.trending - a.trending);
        default:
            return sorted;
    }
}

// Render Popular Posts
function renderPopularPosts() {
    const popularPosts = [...allBlogPosts]
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
    
    const popularHTML = popularPosts.map(post => `
        <div class="popular-post-item" onclick="window.location.href='${post.url}'">
            <div class="popular-post-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
            </div>
            <div class="popular-post-info">
                <h4 class="popular-post-title">${post.title}</h4>
                <p class="popular-post-date">${formatDate(post.publishDate)}</p>
            </div>
        </div>
    `).join('');
    
    popularPostsList.innerHTML = popularHTML;
}

// Render Categories
function renderCategories() {
    const categories = getCategoryCounts();
    
    const categoriesHTML = Object.entries(categories).map(([category, count]) => `
        <li>
            <a href="#" data-category="${category}">
                <span>${getCategoryName(category)}</span>
                <span class="category-count">${count}</span>
            </a>
        </li>
    `).join('');
    
    categoriesList.innerHTML = categoriesHTML;
    
    // Add click event to category links
    categoriesList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            filterByCategory(category);
        });
    });
}

// Render Tags Cloud
function renderTags() {
    const allTags = getAllTags();
    
    const tagsHTML = allTags.map(tag => `
        <span class="tag-item" data-tag="${tag}">${tag}</span>
    `).join('');
    
    tagsCloud.innerHTML = tagsHTML;
    
    // Add click event to tags
    tagsCloud.querySelectorAll('.tag-item').forEach(tag => {
        tag.addEventListener('click', function() {
            searchQuery = this.dataset.tag;
            blogSearchInput.value = searchQuery;
            renderBlogPosts(true);
        });
    });
}

// Get Category Counts
function getCategoryCounts() {
    const counts = {};
    allBlogPosts.forEach(post => {
        counts[post.category] = (counts[post.category] || 0) + 1;
    });
    return counts;
}

// Get All Unique Tags
function getAllTags() {
    const tagsSet = new Set();
    allBlogPosts.forEach(post => {
        post.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).slice(0, 15); // Limit to 15 tags
}

// Setup Event Listeners
function setupEventListeners() {
    // Category tabs
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.dataset.category;
            filterByCategory(category);
        });
    });
    
    // Sort select
    if (blogSort) {
        blogSort.addEventListener('change', function() {
            currentSort = this.value;
            renderBlogPosts(true);
        });
    }
    
    // Search input
    if (blogSearchInput) {
        blogSearchInput.addEventListener('input', debounce(function() {
            searchQuery = this.value;
            renderBlogPosts(true);
            showSearchSuggestions(this.value);
        }, 300));
        
        // Close suggestions on blur
        blogSearchInput.addEventListener('blur', () => {
            setTimeout(() => {
                searchSuggestions.classList.remove('active');
            }, 200);
        });
    }
    
    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            renderBlogPosts(false);
        });
    }
}

// Filter by Category
function filterByCategory(category) {
    currentCategory = category;
    
    // Update active tab
    categoryTabs.forEach(tab => {
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    renderBlogPosts(true);
}

// Show Search Suggestions
function showSearchSuggestions(query) {
    if (query.length < 2) {
        searchSuggestions.classList.remove('active');
        return;
    }
    
    const suggestions = allBlogPosts
        .filter(post => 
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 5);
    
    if (suggestions.length === 0) {
        searchSuggestions.classList.remove('active');
        return;
    }
    
    const suggestionsHTML = suggestions.map(post => `
        <div class="search-suggestion-item" onclick="window.location.href='${post.url}'">
            <strong>${highlightQuery(post.title, query)}</strong>
            <small>${formatDate(post.publishDate)}</small>
        </div>
    `).join('');
    
    searchSuggestions.innerHTML = suggestionsHTML;
    searchSuggestions.classList.add('active');
}

// Newsletter Form Setup
function setupNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Here you would typically send to your backend
            alert(`Thank you for subscribing! We'll send updates to ${email}`);
            this.reset();
            
            // Track with Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'newsletter_signup', {
                    'event_category': 'engagement',
                    'event_label': 'blog_page'
                });
            }
        });
    }
}

// Update Results Count
function updateResultsCount(count) {
    if (resultsCount) {
        resultsCount.textContent = `Showing ${count} ${count === 1 ? 'article' : 'articles'}`;
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

// Get Category Name
function getCategoryName(category) {
    const categoryNames = {
        'shopping-tips': 'Shopping Tips',
        'product-guides': 'Product Guides',
        'deals-offers': 'Deals & Offers',
        'student-discounts': 'Student Discounts',
        'festival-sales': 'Festival Sales',
        'brand-reviews': 'Brand Reviews'
    };
    return categoryNames[category] || category;
}

// Highlight Search Query
function highlightQuery(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show Error Message
function showError(message) {
    blogPostsGrid.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

// ============================================================================
// SEO & PERFORMANCE OPTIMIZATIONS
// ============================================================================

// Lazy Load Images (if IntersectionObserver is available)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    // Observe all lazy images
    setTimeout(() => {
        document.querySelectorAll('img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
    }, 1000);
}

// Track Page Views with Google Analytics
if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
        'page_title': document.title,
        'page_location': window.location.href,
        'page_path': window.location.pathname
    });
}

console.log('✓ Blog JavaScript loaded successfully');
