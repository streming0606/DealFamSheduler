// Thrift Zone - FULL Customized JavaScript with Enhanced Features

// Global variables
let allProducts = [];
let displayedProducts = 0;
const productsPerPage = 12;
let currentFilter = 'all';
let currentSort = 'latest';

// Global instances
let horizontalScroller = null;
let lootDealsScroller = null;

// Data for enhanced features
let productTimers = {};
let productLikes = JSON.parse(localStorage.getItem('productLikes') || '{}');
let productComments = JSON.parse(localStorage.getItem('productComments') || {});

// DOM Elements
const productsContainer = document.getElementById('products-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryCards = document.querySelectorAll('.category-card');
const totalDealsSpan = document.getElementById('total-deals');
const sortSelect = document.getElementById('sort-select');
const viewToggle = document.getElementById('view-toggle');

// Initialization on DOM load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Thrift Zone initialized');
    initializeApp();
});

// Main App Initialization
async function initializeApp() {
    try {
        console.log('Starting app initialization...');
        await loadProducts();
        setupEventListeners();
        initializeEnhancedFeatures();
        initializeBannerSlider();
        setTimeout(() => {
            initializeScrollers();
            initializeSearch();
        }, 500);
        console.log('App initialization complete');
    } catch (error) {
        console.error('App initialization failed:', error);
        showErrorMessage();
    }
}

// Load products.json and render
async function loadProducts() {
    try {
        console.log('Loading products...');
        showLoadingState();
        const response = await fetch('data/products.json');
        const data = await response.json();
        allProducts = data.products;
        console.log(`Loaded ${allProducts.length} products`);
        renderProducts();
        updateCategoryCounts();
        updateTotalDeals();
        return allProducts;
    } catch (error) {
        console.error('Error loading products:', error);
        showErrorMessage();
        throw error;
    }
}

// Render products grid with enhanced cards
function renderProducts() {
    console.log('Rendering products...');
    if (!productsContainer) {
        console.error('Products container not found');
        return;
    }
    productsContainer.innerHTML = '';
    const filtered = getFilteredProducts();
    const sorted = sortProducts(filtered);
    const toShow = sorted.slice(0, displayedProducts + productsPerPage);
    displayedProducts = toShow.length;

    if (toShow.length === 0) {
        showEmptyState();
        return;
    }
    toShow.forEach((product, index) => {
        const card = createEnhancedProductCard(product);
        productsContainer.insertAdjacentHTML('beforeend', card);
    });
    updateLoadMoreButton(filtered.length);
    initializeEnhancedFeatures();
}

// Filter products by currentFilter
function getFilteredProducts() {
    if (currentFilter === 'all') return allProducts;
    return allProducts.filter(p => p.category.toLowerCase() === currentFilter);
}

// Sort products by currentSort
function sortProducts(products) {
    const sorted = [...products];
    switch (currentSort) {
        case 'price-low':
            return sorted.sort((a,b) => extractPrice(a.price) - extractPrice(b.price));
        case 'price-high':
            return sorted.sort((a,b) => extractPrice(b.price) - extractPrice(a.price));
        case 'discount':
            return sorted.sort((a,b) => calculateDiscount(b.price) - calculateDiscount(a.price));
        case 'latest':
        default:
            return sorted.sort((a,b) => new Date(b.postedDate) - new Date(a.postedDate));
    }
}

// Extract price from string
function extractPrice(priceString) {
    const match = priceString.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
}

// Calculate discount percentage
function calculateDiscount(priceString) {
    // implement as per data format if available, else 0
    return 0;
}

// Setup event listeners for filters, load more, etc.
function setupEventListeners() {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            displayedProducts = 0;
            renderProducts();
        });
    });

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            setTimeout(() => {
                renderProducts();
                this.innerHTML = '<i class="fas fa-plus"></i> Load More Deals';
            }, 500);
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            displayedProducts = 0;
            renderProducts();
        });
    }

    if (viewToggle) {
        viewToggle.addEventListener('click', function() {
            productsContainer.classList.toggle('list-view');
            const icon = this.querySelector('i');
            if (productsContainer.classList.contains('list-view')) {
                icon.className = 'fas fa-th';
                this.title = 'Grid View';
            } else {
                icon.className = 'fas fa-th-large';
                this.title = 'List View';
            }
        });
    }
}

// Show loading state
function showLoadingState() {
    if (!productsContainer) return;
    productsContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"><div class="spinner"></div></div>
            <p>Loading amazing deals...</p>
        </div>
    `;
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
}

// Show empty state
function showEmptyState() {
    if (!productsContainer) return;
    productsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-search"></i>
            <h3>No deals found</h3>
            <p>No deals available in this category yet. Check back soon for amazing offers!</p>
            <button onclick="resetFilters()" class="btn-primary">
                <i class="fas fa-refresh"></i> Show All Deals...
            </button>
        </div>
    `;
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
}

// Show error message
function showErrorMessage() {
    if (!productsContainer) return;
    productsContainer.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Unable to load deals</h3>
            <p>Something went wrong while loading the deals.</p>
            <button onclick="loadProducts()" class="retry-btn">
                <i class="fas fa-refresh"></i> Try Again
            </button>
        </div>
    `;
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
}

// Reset filters
function resetFilters() {
    currentFilter = 'all';
    currentSort = 'latest';
    displayedProducts = 0;
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === 'all') btn.classList.add('active');
    });
    if (sortSelect) sortSelect.value = 'latest';
    renderProducts();
}

// Update Load More Button visibility
function updateLoadMoreButton(totalCount) {
    if (!loadMoreBtn) return;
    loadMoreBtn.style.display = displayedProducts >= totalCount ? 'none' : 'block';
}

// Update category counts
function updateCategoryCounts() {
    categoryCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const countSpan = card.querySelector('.deal-count');
        const count = allProducts.filter(p => p.category.toLowerCase() === category).length;
        if (countSpan) countSpan.textContent = `${count} deals`;
    });
}

// Update total deals count
function updateTotalDeals() {
    if (totalDealsSpan) totalDealsSpan.textContent = allProducts.length;
}

// ----------------------------------------------------
// ENHANCED FEATURES IMPLEMENTATION BELOW
// ----------------------------------------------------

// Initialize enhanced features across all products
function initializeEnhancedFeatures() {
    if (allProducts.length === 0) return;
    allProducts.forEach(prod => {
        initializeProductTimer(prod.id);
        initializeProductLikes(prod.id);
        initializeProductComments(prod.id);
        updateLikeDisplay(prod.id);
        updateCommentsDisplay(prod.id);
    });
    setInterval(updateAllTimers, 1000); // update countdown timers every second
}

// FEATURE 1: Random daily resetting countdown timer for each product
function initializeProductTimer(productId) {
    const savedTimer = localStorage.getItem(`timer_${productId}`);
    const now = Date.now();

    if (savedTimer) {
        const timerData = JSON.parse(savedTimer);
        const timeLeft = timerData.endTime - now;
        if (timeLeft > 0) {
            productTimers[productId] = { endTime: timerData.endTime, expired: false, showingExpired: false };
        } else if (timeLeft > -3600000) { // Expired less than 1 hour ago
            productTimers[productId] = { endTime: timerData.endTime, expired: true, showingExpired: true, restoreTime: timerData.endTime + 3600000 };
        } else {
            createNewTimer(productId);
        }
    } else {
        createNewTimer(productId);
    }
}

function createNewTimer(productId) {
    const now = Date.now();
    const randomMinutes = Math.floor(Math.random() * (480 - 30) + 30); // 30 to 480 minutes
    const endTime = now + randomMinutes * 60 * 1000;
    productTimers[productId] = { endTime: endTime, expired: false, showingExpired: false };
    localStorage.setItem(`timer_${productId}`, JSON.stringify({ endTime: endTime, created: now }));
}

function updateAllTimers() {
    Object.keys(productTimers).forEach(productId => updateProductTimer(productId));
}

function updateProductTimer(productId) {
    const timer = productTimers[productId];
    if (!timer) return;
    const now = Date.now();
    const timeLeft = timer.endTime - now;

    if (timeLeft > 0 && !timer.expired) {
        updateTimerDisplay(productId, timeLeft);
    } else if (!timer.expired) {
        timer.expired = true;
        timer.showingExpired = true;
        timer.restoreTime = now + 3600000; // restore after 1 hour
        showExpiredState(productId);
    } else if (timer.showingExpired && now >= timer.restoreTime) {
        createNewTimer(productId);
        hideExpiredState(productId);
    }
}

function updateTimerDisplay(productId, timeLeft) {
    const timerElement = document.querySelector(`.product-card[data-product-id="${productId}"] .enhanced-countdown-timer .timer-text`);
    if (!timerElement) return;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    timerElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
}

function showExpiredState(productId) {
    const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
    if (!card) return;
    const timerElement = card.querySelector('.enhanced-countdown-timer');
    const dealBtn = card.querySelector('.deal-btn');
    if (timerElement) {
        timerElement.classList.add('expired');
        timerElement.querySelector('.timer-text').textContent = 'Deal Expired';
    }
    if (dealBtn) {
        dealBtn.style.opacity = '0.6';
        dealBtn.style.pointerEvents = 'none';
    }
}

function hideExpiredState(productId) {
    const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
    if (!card) return;
    const timerElement = card.querySelector('.enhanced-countdown-timer');
    const dealBtn = card.querySelector('.deal-btn');
    if (timerElement) {
        timerElement.classList.remove('expired');
    }
    if (dealBtn) {
        dealBtn.style.opacity = '1';
        dealBtn.style.pointerEvents = 'auto';
    }
}

// FEATURE 2: Like feature with localStorage and animations
function initializeProductLikes(productId) {
    if (!productLikes[productId]) {
        productLikes[productId] = { count: Math.floor(Math.random() * 50) + 10, liked: false };
    }
}

function toggleLike(productId, event) {
    event.preventDefault();
    event.stopPropagation();
    const likeData = productLikes[productId];
    if (!likeData) return;
    likeData.liked = !likeData.liked;
    likeData.count += likeData.liked ? 1 : -1;
    updateLikeDisplay(productId);
    localStorage.setItem('productLikes', JSON.stringify(productLikes));
    const likeBtn = document.querySelector(`.product-card[data-product-id="${productId}"] .like-btn`);
    if (likeBtn && likeData.liked) {
        likeBtn.classList.add('liked-animation');
        setTimeout(() => likeBtn.classList.remove('liked-animation'), 600);
    }
}

function updateLikeDisplay(productId) {
    const likeElement = document.querySelector(`.product-card[data-product-id="${productId}"] .like-section`);
    if (!likeElement) return;
    const likeData = productLikes[productId];
    const heartIcon = likeData.liked ? '❤️' : '🤍';
    likeElement.innerHTML = `
        <button class="like-btn ${likeData.liked ? 'active' : ''}" onclick="toggleLike('${productId}', event)">
            <span class="heart-icon">${heartIcon}</span>
        </button>
        <span class="like-count">${likeData.count}</span>
    `;
}

// FEATURE 3: Share modal with multiple platform options
function openShareModal(productId, productData, event) {
    event.preventDefault();
    event.stopPropagation();
    const shareText = `Check out this amazing deal!\n\n${productData.title}\n💰 Price: ${productData.price}\n🔥 Discount: ${productData.discount || 'Special Offer'}\n\nGrab it now at Thrift Zone!`;
    const shareUrl = `${window.location.origin}${window.location.pathname}#product-${productId}`;

    const modal = document.createElement('div');
    modal.className = 'share-modal-overlay';
    modal.innerHTML = `
        <div class="share-modal">
            <div class="share-header">
                <h3>Share this deal</h3>
                <button class="close-share-modal">&times;</button>
            </div>
            <div class="share-content">
                <div class="share-product-preview">
                    <img src="${productData.image}" alt="${productData.title}" class="share-product-image">
                    <div class="share-product-info">
                        <h4>${productData.title}</h4>
                        <p class="share-price">${productData.price}</p>
                    </div>
                </div>
                <div class="share-buttons">
                    <button class="share-btn whatsapp" onclick="shareToWhatsApp('${encodeURIComponent(shareText)}', '${encodeURIComponent(shareUrl)}')">
                        <span class="share-icon">📱</span> WhatsApp
                    </button>
                    <button class="share-btn twitter" onclick="shareToTwitter('${encodeURIComponent(shareText)}', '${encodeURIComponent(shareUrl)}')">
                        <span class="share-icon">🐦</span> Twitter
                    </button>
                    <button class="share-btn facebook" onclick="shareToFacebook('${encodeURIComponent(shareUrl)}')">
                        <span class="share-icon">📘</span> Facebook
                    </button>
                    <button class="share-btn copy" onclick="copyToClipboard('${shareText}\\n${shareUrl}')">
                        <span class="share-icon">📋</span> Copy Link
                    </button>
                    <button class="share-btn native" onclick="nativeShare('${productId}', ${JSON.stringify(productData).replace(/\"/g, \"'\")})">
                        <span class="share-icon">📤</span> More Options
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.close-share-modal').onclick = () => closeShareModal(modal);
    modal.onclick = e => { if (e.target === modal) closeShareModal(modal); };
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeShareModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
}

function shareToWhatsApp(text, url) {
    window.open(`https://wa.me/?text=${text} ${url}`, '_blank');
}

function shareToTwitter(text, url) {
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

function shareToFacebook(url) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(decodeURIComponent(text)).then(() => { showToast('Link copied to clipboard!'); });
}

function nativeShare(productId, productData) {
    if (navigator.share) {
        navigator.share({
            title: productData.title,
            text: `Check out this amazing deal: ${productData.price}`,
            url: `${window.location.origin}${window.location.pathname}#product-${productId}`
        });
    } else {
        showToast('Native sharing not supported');
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2000);
}

// FEATURE 4: Inline comment system with localStorage
function initializeProductComments(productId) {
    if (!productComments[productId]) {
        productComments[productId] = [];
    }
}

function addComment(productId, event) {
    event.preventDefault();
    const input = document.querySelector(`.product-card[data-product-id="${productId}"] .comment-input`);
    const text = input.value.trim();
    if (!text) return;
    const comment = { id: Date.now().toString(), text: text, timestamp: new Date().toISOString(), date: new Date().toLocaleDateString() };
    productComments[productId].unshift(comment);
    localStorage.setItem('productComments', JSON.stringify(productComments));
    input.value = '';
    updateCommentsDisplay(productId);
}

function updateCommentsDisplay(productId) {
    const container = document.querySelector(`.product-card[data-product-id="${productId}"] .comments-display`);
    if (!container) return;
    const comments = productComments[productId] || [];
    const displayComments = comments.slice(0, 2); // Show only latest 2 comments
    container.innerHTML = displayComments.map(c => `
        <div class="comment-item">
            <div class="comment-text">${c.text}</div>
            <div class="comment-date">${c.date}</div>
        </div>
    `).join('');
    const countEl = document.querySelector(`.product-card[data-product-id="${productId}"] .comments-count`);
    if (countEl) countEl.textContent = comments.length;
}

// Enhanced product card HTML creator
function createEnhancedProductCard(product) {
    return `
    <div class="product-card" data-product-id="${product.id}">
        <div class="product-image-container">
            ${product.image ? `<img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">` : ""}
            <div class="product-placeholder" style="display:none">🛒</div>
            <div class="product-badges">
                ${product.discount ? `<span class="badge badge-discount">${product.discount}% OFF</span>` : ""}
                ${product.limited ? `<span class="badge badge-limited">LIMITED</span>` : ""}
            </div>
            <div class="product-top-actions">
                <button class="wishlist-btn" onclick="toggleWishlist('${product.id}', event)">
                    ${isInWishlist(product.id) ? '❤️' : '🤍'}
                </button>
            </div>
        </div>
        <div class="product-info">
            <span class="product-category">${product.category}</span>
            <h3 class="product-title">${product.title}</h3>
            <div class="product-pricing">
                <div class="price-section">
                    <span class="price-current">${product.price}</span>
                    ${product.originalPrice ? `<span class="price-original">${product.originalPrice}</span>` : ''}
                    ${product.discount ? `<span class="price-discount-badge">${product.discount}% OFF</span>` : ''}
                </div>
            </div>

            <!-- Enhanced Features -->
            <div class="enhanced-features-section">
                <div class="enhanced-countdown-timer">
                    <span class="timer-icon">⏰</span> <span class="timer-text">Loading...</span>
                </div>
                <div class="enhanced-social-actions">
                    <div class="like-section"></div>
                    <button class="share-btn" onclick='openShareModal("${product.id}", ${JSON.stringify(product).replace(/"/g, "'")}, event)'>
                        <span class="share-icon">📤</span><span class="share-text">Share</span>
                    </button>
                    <div class="comments-indicator">
                        <span class="comment-icon">💬</span> <span class="comments-count">0</span>
                    </div>
                </div>
                <div class="comment-section">
                    <div class="comments-display"></div>
                    <div class="comment-input-section">
                        <input type="text" class="comment-input" placeholder="Add a comment..." onkeypress='if(event.key === "Enter") addComment("${product.id}", event)'>
                        <button class="comment-submit-btn" onclick='addComment("${product.id}", event)'>💬</button>
                    </div>
                </div>
            </div>

            <div class="product-actions">
                <a href="${product.dealUrl || '#'}" class="deal-btn" target="_blank" rel="noopener noreferrer">
                    <div class="deal-btn-text">
                        <span>Grab Deal</span>
                        <span class="deal-btn-subtext">Best Price</span>
                    </div>
                </a>
            </div>
        </div>
    </div>
    `;
}

// Helper functions for wishlist management, assumed to exist
function isInWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return wishlist.includes(productId);
}
function toggleWishlist(productId, event) {
    event.preventDefault();
    event.stopPropagation();
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
    } else {
        wishlist.push(productId);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderProducts(); // Refresh product cards to update wishlist button state
}

// Dummy functions for slider and search (You can implement or keep your existing ones)
function initializeBannerSlider() { /* Your banner slider initialization */ }
function initializeScrollers() { /* Your scrollers init */ }
function initializeSearch() { /* Your search init */ }

// You can call initializeApp() again if loading products manually or on demand

