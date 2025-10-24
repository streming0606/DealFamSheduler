// Thrift Maal Blog - Main JavaScript
// Mobile-First, SEO-Optimized Blog Functionality

// Global Variables
let allPosts = [];
let displayedPosts = [];
let currentCategory = 'all';
let currentSort = 'latest';
let postsPerPage = 12;
let currentPage = 1;

// DOM Elements
const blogPostsGrid = document.getElementById('blog-posts-grid');
const featuredPostSection = document.getElementById('featured-post');
const loadMoreBtn = document.getElementById('load-more-posts');
const categoryTabs = document.querySelectorAll('.category-tab');
const sortSelect = document.getElementById('sort-posts');
const postsCountSpan = document.getElementById('posts-count');
const blogSearchInput = document.getElementById('blog-search-input');
const sidebarSearch = document.getElementById('sidebar-search');
const popularPostsList = document.getElementById('popular-posts');
const categoriesList = document.getElementById('categories-list');
const tagsCloud = document.getElementById('tags-cloud');
const newsletterForm = document.getElementById('newsletter-form');

// Initialize Blog on DOM Load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Thrift Maal Blog initialized');
    initializeBlog();
});

// Main Initialization Function
async function initializeBlog() {
    try {
        // Load blog posts data
        await loadBlogPosts();
        
        // Render featured post
        renderFeaturedPost();
        
        // Render initial posts
        renderBlogPosts();
        
        // Setup sidebar
        setupSidebar();
        
        // Setup event listeners
        setupEventListeners();
        
        // Update post count
        updatePostCount();
        
        console.log('✅ Blog loaded successfully');
    } catch (error) {
        console.error('❌ Error initializing blog:', error);
        showError('Failed to load blog posts. Please refresh the page.');
    }
}

// Load Blog Posts from JSON
async function loadBlogPosts() {
    try {
        const response = await fetch('data/blog-posts.json');
        if (!response.ok) throw new Error('Failed to fetch blog posts');
        
        const data = await response.json();
        allPosts = data.posts || [];
        
        // Sort posts by date (latest first) by default
        allPosts.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        
        console.log(`📚 Loaded ${allPosts.length} blog posts`);
    } catch (error) {
        console.error('Error loading blog posts:', error);
        // Fallback to empty array
        allPosts = [];
    }
}

// Render Featured Post
function renderFeaturedPost() {
    if (allPosts.length === 0) return;
    
    // Get the most recent or featured post
    const featuredPost = allPosts.find(post => post.featured) || allPosts[0];
    
    const html = `
        <article class="featured-post">
            <div class="featured-badge">
                <i class="fas fa-star"></i> Featured
            </div>
            <div class="featured-post-image">
                <img src="${featuredPost.image}" 
                     alt="${featuredPost.title}" 
                     loading="eager"
                     onerror="this.src='../images/placeholder-blog.jpg'">
            </div>
            <div class="featured-post-content">
                <span class="featured-category">
                    <i class="${getCategoryIcon(featuredPost.category)}"></i>
                    ${formatCategory(featuredPost.category)}
                </span>
                <h2 class="featured-post-title">${featuredPost.title}</h2>
                <p class="featured-post-excerpt">${featuredPost.excerpt}</p>
                <div class="featured-post-meta">
                    <div>
                        <i class="fas fa-user-circle"></i> ${featuredPost.author}
                    </div>
                    <div>
                        <i class="fas fa-calendar"></i> ${formatDate(featuredPost.publishDate)}
                    </div>
                    <div>
                        <i class="fas fa-clock"></i> ${featuredPost.readTime} min read
                    </div>
                </div>
                <a href="post.html?slug=${featuredPost.slug}" class="featured-post-cta">
                    Read Full Article <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </article>
    `;
    
    featuredPostSection.innerHTML = html;
}

// Render Blog Posts Grid
function renderBlogPosts() {
    // Filter posts by category
    let filteredPosts = currentCategory === 'all' 
        ? allPosts 
        : allPosts.filter(post => post.category === currentCategory);
    
    // Sort posts
    filteredPosts = sortPosts(filteredPosts, currentSort);
    
    // Paginate posts
    const startIndex = 0;
    const endIndex = currentPage * postsPerPage;
    displayedPosts = filteredPosts.slice(startIndex, endIndex);
    
    // Render posts
    if (displayedPosts.length === 0) {
        blogPostsGrid.innerHTML = `
            <div class="no-posts-message">
                <i class="fas fa-inbox" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <p>No blog posts found in this category.</p>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
        return;
    }
    
    const postsHTML = displayedPosts.map((post, index) => `
        <article class="blog-card" style="animation-delay: ${index * 50}ms">
            <a href="post.html?slug=${post.slug}" class="blog-card-link">
                <div class="blog-card-image">
                    <img src="${post.image}" 
                         alt="${post.title}" 
                         loading="lazy"
                         onerror="this.src='../images/placeholder-blog.jpg'">
                    <span class="card-category-badge">
                        <i class="${getCategoryIcon(post.category)}"></i>
                        ${formatCategory(post.category)}
                    </span>
                </div>
                <div class="blog-card-content">
                    <h3 class="blog-card-title">${post.title}</h3>
                    <p class="blog-card-excerpt">${post.excerpt}</p>
                    <div class="blog-card-meta">
                        <div class="meta-left">
                            <span class="meta-item">
                                <i class="fas fa-calendar"></i>
                                ${formatDate(post.publishDate)}
                            </span>
                            <span class="meta-item">
                                <i class="fas fa-clock"></i>
                                ${post.readTime} min
                            </span>
                        </div>
                        <span class="blog-card-cta">
                            Read More <i class="fas fa-arrow-right"></i>
                        </span>
                    </div>
                </div>
            </a>
        </article>
    `).join('');
    
    blogPostsGrid.innerHTML = postsHTML;
    
    // Show/hide load more button
    if (displayedPosts.length >= filteredPosts.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-flex';
    }
    
    updatePostCount();
}

// Sort Posts
function sortPosts(posts, sortBy) {
    const sortedPosts = [...posts];
    
    switch(sortBy) {
        case 'latest':
            return sortedPosts.sort((a, b) => 
                new Date(b.publishDate) - new Date(a.publishDate)
            );
        case 'oldest':
            return sortedPosts.sort((a, b) => 
                new Date(a.publishDate) - new Date(b.publishDate)
            );
        case 'popular':
            return sortedPosts.sort((a, b) => b.views - a.views);
        case 'trending':
            return sortedPosts.sort((a, b) => b.shares - a.shares);
        default:
            return sortedPosts;
    }
}

// Setup Sidebar
function setupSidebar() {
    renderPopularPosts();
    renderCategoriesList();
    renderTagsCloud();
}

// Render Popular Posts in Sidebar
function renderPopularPosts() {
    const popularPosts = [...allPosts]
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
    
    const html = popularPosts.map(post => `
        <a href="post.html?slug=${post.slug}" class="popular-post-item">
            <div class="popular-post-thumb">
                <img src="${post.image}" 
                     alt="${post.title}"
                     loading="lazy"
                     onerror="this.src='../images/placeholder-blog.jpg'">
            </div>
            <div class="popular-post-info">
                <h4 class="popular-post-title">${post.title}</h4>
                <p class="popular-post-date">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(post.publishDate)}
                </p>
            </div>
        </a>
    `).join('');
    
    popularPostsList.innerHTML = html;
}

// Render Categories List
function renderCategoriesList() {
    const categories = {};
    
    allPosts.forEach(post => {
        categories[post.category] = (categories[post.category] || 0) + 1;
    });
    
    const html = Object.entries(categories).map(([category, count]) => `
        <li class="category-item">
            <a href="#" class="category-link" data-category="${category}">
                <span>
                    <i class="${getCategoryIcon(category)}"></i>
                    ${formatCategory(category)}
                </span>
                <span class="category-count">${count}</span>
            </a>
        </li>
    `).join('');
    
    categoriesList.innerHTML = html;
    
    // Add event listeners
    categoriesList.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.currentTarget.dataset.category;
            filterByCategory(category);
        });
    });
}

// Render Tags Cloud
function renderTagsCloud() {
    const allTags = new Set();
    
    allPosts.forEach(post => {
        if (post.tags) {
            post.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    const html = Array.from(allTags).slice(0, 15).map(tag => `
        <a href="#" class="tag-item" data-tag="${tag}">
            ${tag}
        </a>
    `).join('');
    
    tagsCloud.innerHTML = html;
    
    // Add event listeners
    tagsCloud.querySelectorAll('.tag-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tag = e.currentTarget.dataset.tag;
            searchPosts(tag);
        });
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Category filter tabs
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            filterByCategory(category);
            
            // Update active tab
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
    
    // Sort select
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            currentPage = 1;
            renderBlogPosts();
        });
    }
    
    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            renderBlogPosts();
            
            // Smooth scroll to new content
            setTimeout(() => {
                const lastCard = blogPostsGrid.lastElementChild;
                if (lastCard) {
                    lastCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
        });
    }
    
    // Search functionality
    if (blogSearchInput) {
        let searchTimeout;
        blogSearchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchPosts(e.target.value);
            }, 300);
        });
    }
    
    if (sidebarSearch) {
        let searchTimeout;
        sidebarSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchPosts(e.target.value);
            }, 300);
        });
    }
    
    // Newsletter form
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
}

// Filter by Category
function filterByCategory(category) {
    currentCategory = category;
    currentPage = 1;
    renderBlogPosts();
    
    // Scroll to blog grid
    blogPostsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Search Posts
function searchPosts(query) {
    if (!query.trim()) {
        currentCategory = 'all';
        renderBlogPosts();
        return;
    }
    
    const searchLower = query.toLowerCase();
    const searchResults = allPosts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
    
    displayedPosts = searchResults;
    
    const html = searchResults.length > 0 
        ? searchResults.map((post, index) => `
            <article class="blog-card" style="animation-delay: ${index * 50}ms">
                <a href="post.html?slug=${post.slug}" class="blog-card-link">
                    <div class="blog-card-image">
                        <img src="${post.image}" alt="${post.title}" loading="lazy">
                        <span class="card-category-badge">
                            ${formatCategory(post.category)}
                        </span>
                    </div>
                    <div class="blog-card-content">
                        <h3 class="blog-card-title">${post.title}</h3>
                        <p class="blog-card-excerpt">${post.excerpt}</p>
                        <div class="blog-card-meta">
                            <div class="meta-left">
                                <span class="meta-item">
                                    <i class="fas fa-calendar"></i>
                                    ${formatDate(post.publishDate)}
                                </span>
                                <span class="meta-item">
                                    <i class="fas fa-clock"></i>
                                    ${post.readTime} min
                                </span>
                            </div>
                            <span class="blog-card-cta">
                                Read More <i class="fas fa-arrow-right"></i>
                            </span>
                        </div>
                    </div>
                </a>
            </article>
        `).join('')
        : `<div class="no-posts-message">
               <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
               <p>No posts found for "${query}"</p>
           </div>`;
    
    blogPostsGrid.innerHTML = html;
    loadMoreBtn.style.display = 'none';
    updatePostCount();
}

// Handle Newsletter Submission
function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    
    if (!email || !isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate newsletter subscription
    // In production, send to backend API
    showToast('Successfully subscribed! Check your inbox.', 'success');
    emailInput.value = '';
    
    // Track with Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'newsletter_signup', {
            'event_category': 'engagement',
            'event_label': email
        });
    }
}

// Utility Functions
function formatCategory(category) {
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getCategoryIcon(category) {
    const icons = {
        'shopping-tips': 'fas fa-lightbulb',
        'deal-guides': 'fas fa-tags',
        'product-reviews': 'fas fa-star',
        'festival-sales': 'fas fa-gift',
        'student-discounts': 'fas fa-graduation-cap',
        'brand-reviews': 'fas fa-building'
    };
    return icons[category] || 'fas fa-folder';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

function updatePostCount() {
    if (postsCountSpan) {
        postsCountSpan.textContent = displayedPosts.length;
    }
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? 'var(--success)' : 'var(--error)'};
        color: white;
        border-radius: 6px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showError(message) {
    const errorHTML = `
        <div style="text-align: center; padding: 3rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--error); margin-bottom: 1rem;"></i>
            <p style="color: var(--text-secondary);">${message}</p>
        </div>
    `;
    if (blogPostsGrid) blogPostsGrid.innerHTML = errorHTML;
}

// CSS for toast animations
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
    
    .no-posts-message {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
    }
`;
document.head.appendChild(style);

// Export for use in other modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadBlogPosts, renderBlogPosts, searchPosts };
}
