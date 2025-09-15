// Thrift Zone - Complete JavaScript with Social Features
// Global variables
let allProducts = [];
let displayedProducts = 0;
const productsPerPage = 12;
let currentFilter = 'all';
let currentSort = 'latest';

// Global instances
let horizontalScroller = null;
let lootDealsScroller = null;

// DOM Elements
const productsContainer = document.getElementById('products-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryCards = document.querySelectorAll('.category-card');
const totalDealsSpan = document.getElementById('total-deals');
const sortSelect = document.getElementById('sort-select');
const viewToggle = document.getElementById('view-toggle');

// FIXED: Single DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Thrift Zone initialized');
    initializeApp();
});

// FIXED: Single initialization function
async function initializeApp() {
    try {
        console.log('📦 Starting app initialization...');
        
        // Load products first
        await loadProducts();
        
        // Initialize UI components
        setupEventListeners();
        updateLastRefresh();
        initializeEnhancements();
        initializeBannerSlider();
        
        // Initialize scrollers after products are loaded
        setTimeout(() => {
            initializeScrollers();
            initializeSearch();
        }, 500);
        
        console.log('✅ App initialization complete');
        
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        showErrorMessage();
    }
}

// FIXED: Single loadProducts function
async function loadProducts() {
    try {
        console.log('📦 Loading products...');
        showLoadingState();
        
        const response = await fetch('data/products.json');
        const data = await response.json();
        allProducts = data.products || [];
        
        console.log(`✅ Loaded ${allProducts.length} products`);
        
        // Update UI
        renderProducts();
        updateCategoryCounts();
        updateTotalDeals();
        
        return allProducts;
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showErrorMessage();
        throw error;
    }
}

// FIXED: Single renderProducts function
function renderProducts() {
    console.log('🎨 Rendering products...');
    
    // If horizontal scroller exists and is initialized, use it
    if (horizontalScroller && horizontalScroller.isInitialized) {
        horizontalScroller.refresh();
        return;
    }
    
    // If loot scroller exists and is initialized, use it
    if (lootDealsScroller && lootDealsScroller.initialized) {
        lootDealsScroller.refresh();
        return;
    }
    
    // Default grid rendering
    renderGridProducts();
}

function renderGridProducts() {
    const filteredProducts = getFilteredProducts();
    const sortedProducts = sortProducts(filteredProducts);
    const productsToShow = sortedProducts.slice(0, displayedProducts + productsPerPage);
    
    if (productsToShow.length === 0) {
        showEmptyState();
        return;
    }
    
    if (!productsContainer) {
        console.error('❌ Products container not found');
        return;
    }
    
    productsContainer.innerHTML = '';
    
    productsToShow.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        productsContainer.appendChild(productCard);
        
        setTimeout(() => {
            productCard.style.opacity = '1';
            productCard.style.transform = 'translateY(0)';
        }, index * 50);
    });
    
    displayedProducts = productsToShow.length;
    
    if (loadMoreBtn) {
        if (displayedProducts >= filteredProducts.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }
    
    initializeEnhancedCards();
}

// FIXED: Initialize scrollers separately
function initializeScrollers() {
    console.log('🔄 Initializing scrollers...');
    
    // Initialize horizontal scroller
    if (document.getElementById('horizontal-products-container')) {
        horizontalScroller = new HorizontalDealsScroller();
        horizontalScroller.init();
        console.log('✅ Horizontal scroller initialized');
    }
    
    // Initialize loot scroller
    if (document.getElementById('horizontal-loot-container')) {
        lootDealsScroller = new LootDealsScroller();
        console.log('✅ Loot scroller initialized');
    }
}

// RESTORED: Enhanced Product Card with ALL Social Features
function createProductCard(product, index = 0) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', product.category);
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    const date = new Date(product.posted_date);
    const formattedDate = date.toLocaleDateString('en-IN');
    const enhancedData = enhanceProductData(product);
    
    card.innerHTML = `
        <div class="product-image-container">
            ${product.image ? 
                `<img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\"product-placeholder\\"><i class=\\"fas fa-image\\"></i></div>'">` 
                : 
                '<div class="product-placeholder"><i class="fas fa-image"></i></div>'
            }
            
            <div class="product-badges">
                <span class="badge badge-discount">${enhancedData.discountPercent}% OFF</span>
                ${enhancedData.isLimitedTime ? '<span class="badge badge-limited">Limited Time</span>' : ''}
                ${enhancedData.isLowStock ? '<span class="badge badge-stock-low">Few Left!</span>' : ''}
            </div>
            
            <div class="product-top-actions">
                <button class="action-btn wishlist-btn" onclick="toggleWishlist('${product.id}', this)" title="Add to wishlist">
                    <i class="far fa-heart"></i>
                </button>
                <button class="action-btn quick-view-btn" onclick="openQuickView('${product.id}')" title="Quick view">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
        
        <div class="product-info">
            <div class="product-category">${product.category}</div>
            
            <h3 class="product-title">${product.title}</h3>
            
            <div class="product-pricing">
                <div class="price-section">
                    <span class="price-current">
                        <span class="currency">₹</span>${enhancedData.salePrice}
                    </span>
                    <span class="price-original">₹${enhancedData.originalPrice}</span>
                    <span class="price-discount-badge">${enhancedData.discountPercent}% OFF</span>
                </div>
                <div class="savings-amount">
                    You Save ₹${enhancedData.savings}
                </div>
            </div>
            
            <div class="product-meta">
                <div class="product-rating">
                    <div class="rating-stars">
                        ${generateStars(product.rating || '4.2')}
                    </div>
                    <span class="rating-text">${product.rating || '4.2'} (${Math.floor(Math.random() * 1000) + 100} reviews)</span>
                </div>
                <div class="product-posted-date">
                    <i class="fas fa-clock"></i>
                    ${formattedDate}
                </div>
            </div>
            
            <!-- RESTORED: Social Engagement Section -->
            <div class="product-social-stats">
                <div class="social-metrics">
                    <span class="social-metric">
                        <i class="fas fa-thumbs-up"></i>
                        <span class="metric-count likes-count-${product.id}">${enhancedData.likes}</span>
                    </span>
                    <span class="social-metric">
                        <i class="fas fa-share"></i>
                        <span class="metric-count shares-count-${product.id}">${enhancedData.shares}</span>
                    </span>
                    <span class="social-metric">
                        <i class="fas fa-comment"></i>
                        <span class="metric-count">${Math.floor(Math.random() * 50) + 5}</span>
                    </span>
                    <span class="social-metric">
                        <i class="fas fa-eye"></i>
                        <span class="metric-count">${Math.floor(Math.random() * 2000) + 100}</span>
                    </span>
                </div>
                
                <!-- RESTORED: Social Action Buttons -->
                <div class="product-social-actions">
                    <button class="social-action-btn likes-action" onclick="toggleLike('${product.id}', this)" title="Like this deal">
                        <i class="far fa-thumbs-up"></i>
                        <span class="action-text">Like</span>
                    </button>
                    
                    <div class="share-dropdown">
                        <button class="social-action-btn share-action" onclick="toggleShareMenu('${product.id}', this)" title="Share this deal">
                            <i class="fas fa-share"></i>
                            <span class="action-text">Share</span>
                        </button>
                        
                        <div class="share-menu" id="share-menu-${product.id}">
                            <div class="share-options">
                                <button class="share-option whatsapp-share" onclick="shareToWhatsApp('${product.id}')" title="Share on WhatsApp">
                                    <i class="fab fa-whatsapp"></i>
                                    WhatsApp
                                </button>
                                <button class="share-option facebook-share" onclick="shareToFacebook('${product.id}')" title="Share on Facebook">
                                    <i class="fab fa-facebook"></i>
                                    Facebook
                                </button>
                                <button class="share-option twitter-share" onclick="shareToTwitter('${product.id}')" title="Share on Twitter">
                                    <i class="fab fa-twitter"></i>
                                    Twitter
                                </button>
                                <button class="share-option telegram-share" onclick="shareToTelegram('${product.id}')" title="Share on Telegram">
                                    <i class="fab fa-telegram"></i>
                                    Telegram
                                </button>
                                <button class="share-option copy-link" onclick="copyProductLink('${product.id}')" title="Copy link">
                                    <i class="fas fa-copy"></i>
                                    Copy Link
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <button class="social-action-btn comment-action" onclick="openComments('${product.id}')" title="Comments">
                        <i class="far fa-comment"></i>
                        <span class="action-text">Comment</span>
                    </button>
                </div>
            </div>
            
            <!-- Additional Product Info -->
            <div class="product-additional-info">
                <div class="delivery-info">
                    <i class="fas fa-shipping-fast"></i>
                    <span>Free Delivery</span>
                    ${enhancedData.isLowStock ? `<span class="stock-warning">Only ${enhancedData.stockCount} left!</span>` : ''}
                </div>
                
                <div class="seller-info">
                    <i class="fas fa-store"></i>
                    <span>Sold by ${generateSellerName()}</span>
                    <span class="seller-rating">★ 4.${Math.floor(Math.random() * 8) + 1}</span>
                </div>
            </div>
            
            <div class="product-actions">
                <a href="${product.affiliate_link}" 
                   target="_blank" 
                   class="deal-btn" 
                   onclick="trackClick('${product.id}')"
                   rel="noopener noreferrer">
                    <div>
                        <div class="deal-btn-text">
                            <i class="fas fa-bolt"></i>
                            Grab Deal Now
                        </div>
                        <div class="deal-btn-subtext">Best Price Guaranteed</div>
                    </div>
                </a>
                
                <div class="secondary-actions">
                    <button class="quick-action-btn" onclick="addToWishlist('${product.id}')" title="Save for later">
                        <i class="fas fa-bookmark"></i>
                    </button>
                    <button class="quick-action-btn" onclick="addToCompare('${product.id}')" title="Add to compare">
                        <i class="fas fa-balance-scale"></i>
                    </button>
                    <button class="quick-action-btn" onclick="setPriceAlert('${product.id}')" title="Price alert">
                        <i class="fas fa-bell"></i>
                    </button>
                </div>
            </div>
            
            <!-- Price History -->
            <div class="price-history-section">
                <button class="price-history-toggle" onclick="togglePriceHistory('${product.id}')">
                    <i class="fas fa-chart-line"></i>
                    Price History
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="price-history-content" id="price-history-${product.id}" style="display: none;">
                    <div class="price-trend">
                        <span class="trend-indicator trend-down">
                            <i class="fas fa-arrow-down"></i>
                            Price dropped by ₹${Math.floor(Math.random() * 500) + 100} in last 30 days
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Enhanced product data generator with more social metrics
function enhanceProductData(product) {
    const currentPriceMatch = product.price.match(/₹(\d+,?\d*)/);
    const currentPrice = currentPriceMatch ? parseInt(currentPriceMatch[1].replace(',', '')) : 999;
    
    const markup = 1.3 + (Math.random() * 0.7);
    const originalPrice = Math.round(currentPrice * markup);
    const savings = originalPrice - currentPrice;
    const discountPercent = Math.round((savings / originalPrice) * 100);
    
    // Enhanced social metrics
    const likes = Math.floor(Math.random() * 500) + 10;
    const shares = Math.floor(Math.random() * 100) + 5;
    const comments = Math.floor(Math.random() * 50) + 3;
    const views = Math.floor(Math.random() * 2000) + 100;
    
    const isLimitedTime = Math.random() > 0.6;
    const isLowStock = Math.random() > 0.7;
    const stockCount = isLowStock ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 20) + 10;
    
    return {
        salePrice: currentPrice.toLocaleString('en-IN'),
        originalPrice: originalPrice.toLocaleString('en-IN'),
        savings: savings.toLocaleString('en-IN'),
        discountPercent,
        likes,
        shares,
        comments,
        views,
        isLimitedTime,
        isLowStock,
        stockCount
    };
}

// RESTORED: All Social Functions
function toggleLike(productId, button) {
    const icon = button.querySelector('i');
    const textSpan = button.querySelector('.action-text');
    const countElement = document.querySelector(`.likes-count-${productId}`);
    const isActive = button.classList.contains('active');
    
    if (isActive) {
        button.classList.remove('active');
        icon.className = 'far fa-thumbs-up';
        textSpan.textContent = 'Like';
        
        // Decrease count
        if (countElement) {
            const currentCount = parseInt(countElement.textContent);
            countElement.textContent = currentCount - 1;
        }
        
        removeLike(productId);
    } else {
        button.classList.add('active');
        icon.className = 'fas fa-thumbs-up';
        textSpan.textContent = 'Liked';
        
        // Increase count
        if (countElement) {
            const currentCount = parseInt(countElement.textContent);
            countElement.textContent = currentCount + 1;
        }
        
        saveLike(productId);
    }
    
    // Animation
    button.style.transform = 'scale(1.1)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
    
    console.log(`Product ${productId} ${isActive ? 'unliked' : 'liked'}`);
}

function toggleShareMenu(productId, button) {
    const shareMenu = document.getElementById(`share-menu-${productId}`);
    const allShareMenus = document.querySelectorAll('.share-menu');
    
    // Close all other share menus
    allShareMenus.forEach(menu => {
        if (menu !== shareMenu) {
            menu.classList.remove('active');
        }
    });
    
    // Toggle current menu
    shareMenu.classList.toggle('active');
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeShareMenu(e) {
        if (!button.contains(e.target) && !shareMenu.contains(e.target)) {
            shareMenu.classList.remove('active');
            document.removeEventListener('click', closeShareMenu);
        }
    });
}

function shareToWhatsApp(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const message = `🔥 Amazing Deal Alert! 🔥\n\n${product.title}\n💰 Price: ${product.price}\n🎯 Category: ${product.category}\n\n🛒 Grab it now: ${product.affiliate_link}\n\n#ThriftZone #Deals #Shopping`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    trackShare(productId, 'whatsapp');
    updateShareCount(productId);
}

function shareToFacebook(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(product.affiliate_link)}&quote=${encodeURIComponent(product.title)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    trackShare(productId, 'facebook');
    updateShareCount(productId);
}

function shareToTwitter(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const tweetText = `🔥 ${product.title} at ${product.price}! Don't miss this deal! ${product.affiliate_link} #Deals #Shopping #ThriftZone`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    trackShare(productId, 'twitter');
    updateShareCount(productId);
}

function shareToTelegram(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const message = `🔥 Amazing Deal Alert!\n\n${product.title}\n💰 ${product.price}\n🎯 ${product.category}\n\n🛒 ${product.affiliate_link}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(product.affiliate_link)}&text=${encodeURIComponent(message)}`;
    
    window.open(telegramUrl, '_blank');
    trackShare(productId, 'telegram');
    updateShareCount(productId);
}

function copyProductLink(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    navigator.clipboard.writeText(product.affiliate_link).then(() => {
        showToast('Link copied to clipboard!', 'success');
        trackShare(productId, 'copy');
        updateShareCount(productId);
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = product.affiliate_link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Link copied to clipboard!', 'success');
        trackShare(productId, 'copy');
        updateShareCount(productId);
    });
}

function openComments(productId) {
    // Create and show comments modal
    const modal = document.createElement('div');
    modal.className = 'comments-modal';
    modal.innerHTML = `
        <div class="comments-modal-content">
            <div class="comments-header">
                <h3>Comments</h3>
                <button class="close-comments" onclick="this.closest('.comments-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="comments-list">
                ${generateDummyComments()}
            </div>
            <div class="add-comment">
                <textarea placeholder="Add a comment..." class="comment-input"></textarea>
                <button class="post-comment-btn" onclick="postComment('${productId}', this)">Post Comment</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 100);
}

function generateDummyComments() {
    const comments = [
        { name: 'Priya S.', comment: 'Great deal! Just ordered it.', time: '2 hours ago' },
        { name: 'Rahul K.', comment: 'Thanks for sharing! Very helpful.', time: '5 hours ago' },
        { name: 'Sneha M.', comment: 'Is this still available?', time: '1 day ago' },
        { name: 'Amit R.', comment: 'Awesome price! Recommended.', time: '2 days ago' }
    ];
    
    return comments.map(comment => `
        <div class="comment-item">
            <div class="comment-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="commenter-name">${comment.name}</span>
                    <span class="comment-time">${comment.time}</span>
                </div>
                <div class="comment-text">${comment.comment}</div>
            </div>
        </div>
    `).join('');
}

function postComment(productId, button) {
    const textarea = button.previousElementSibling;
    const commentText = textarea.value.trim();
    
    if (!commentText) {
        showToast('Please enter a comment', 'warning');
        return;
    }
    
    // Add comment to the list
    const commentsList = button.closest('.comments-modal-content').querySelector('.comments-list');
    const newComment = document.createElement('div');
    newComment.className = 'comment-item new-comment';
    newComment.innerHTML = `
        <div class="comment-avatar">
            <i class="fas fa-user-circle"></i>
        </div>
        <div class="comment-content">
            <div class="comment-header">
                <span class="commenter-name">You</span>
                <span class="comment-time">Now</span>
            </div>
            <div class="comment-text">${commentText}</div>
        </div>
    `;
    
    commentsList.insertBefore(newComment, commentsList.firstChild);
    textarea.value = '';
    
    showToast('Comment posted successfully!', 'success');
    console.log(`Comment posted for product ${productId}: ${commentText}`);
}

function updateShareCount(productId) {
    const shareCountElement = document.querySelector(`.shares-count-${productId}`);
    if (shareCountElement) {
        const currentCount = parseInt(shareCountElement.textContent);
        shareCountElement.textContent = currentCount + 1;
    }
}

function trackShare(productId, platform) {
    console.log(`Product ${productId} shared via ${platform}`);
    // You can add analytics tracking here
    if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
            event_category: 'engagement',
            event_label: platform,
            custom_parameter: productId
        });
    }
}

function saveLike(productId) {
    let likes = JSON.parse(localStorage.getItem('thriftzone_likes') || '{}');
    likes[productId] = true;
    localStorage.setItem('thriftzone_likes', JSON.stringify(likes));
}

function removeLike(productId) {
    let likes = JSON.parse(localStorage.getItem('thriftzone_likes') || '{}');
    delete likes[productId];
    localStorage.setItem('thriftzone_likes', JSON.stringify(likes));
}

// Utility functions for product cards
function generateStars(rating) {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHtml = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
}

function generateSellerName() {
    const sellers = [
        'Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Nykaa', 
        'BigBasket', 'Grofers', 'Snapdeal', 'Paytm Mall',
        'FirstCry', 'Limeroad', 'Koovs', 'Jabong'
    ];
    return sellers[Math.floor(Math.random() * sellers.length)];
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Additional product interaction functions
function openQuickView(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    console.log(`Quick view opened for product: ${productId}`);
    // Implement quick view modal
}

function addToCompare(productId) {
    console.log(`Added to compare: ${productId}`);
    showToast('Added to comparison list!', 'success');
}

function setPriceAlert(productId) {
    console.log(`Price alert set for: ${productId}`);
    showToast('Price alert set! We\'ll notify you of price drops.', 'success');
}

function togglePriceHistory(productId) {
    const historyElement = document.getElementById(`price-history-${productId}`);
    const isVisible = historyElement.style.display !== 'none';
    
    if (isVisible) {
        historyElement.style.display = 'none';
    } else {
        historyElement.style.display = 'block';
    }
}

// FIXED Horizontal Scrolling Functionality
class HorizontalDealsScroller {
    constructor() {
        this.horizontalContainer = document.getElementById('horizontal-products-container');
        this.scrollLeftBtn = document.getElementById('scroll-left');
        this.scrollRightBtn = document.getElementById('scroll-right');
        this.viewAllBtn = document.getElementById('view-all-deals');
        this.dealsCountSpan = document.querySelector('.deals-count');
        this.totalDealsPreview = document.getElementById('total-deals-preview');
        
        this.scrollAmount = 300;
        this.maxHorizontalItems = 6;
        this.isInitialized = false;
    }
    
    init() {
        if (!this.horizontalContainer || this.isInitialized) return;
        
        console.log('🎮 Initializing horizontal scroller...');
        this.setupEventListeners();
        this.isInitialized = true;
        
        if (allProducts && allProducts.length > 0) {
            this.renderHorizontalProducts();
        }
    }
    
    setupEventListeners() {
        this.scrollLeftBtn?.addEventListener('click', () => this.scrollLeft());
        this.scrollRightBtn?.addEventListener('click', () => this.scrollRight());
        this.horizontalContainer?.addEventListener('scroll', () => this.updateScrollButtons());
        
        if (this.viewAllBtn) {
            this.viewAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.trackViewAllClick();
                window.open('deals/today.html', '_blank');
            });
        }
    }
    
    renderHorizontalProducts() {
        if (!this.horizontalContainer || !allProducts || allProducts.length === 0) {
            console.log('❌ Cannot render: missing container or products');
            return;
        }
        
        console.log(`🎨 Rendering ${allProducts.length} horizontal products`);
        
        this.horizontalContainer.innerHTML = '';
        
        const filteredProducts = this.getFilteredProducts();
        const sortedProducts = this.sortProducts(filteredProducts);
        const productsToShow = sortedProducts.slice(0, this.maxHorizontalItems);
        
        if (productsToShow.length === 0) {
            this.horizontalContainer.innerHTML = `
                <div class="empty-horizontal-state" style="
                    padding: 2rem; 
                    text-align: center; 
                    color: var(--text-secondary);
                    grid-column: 1 / -1;
                ">
                    <p>No deals available in this category</p>
                </div>
            `;
            return;
        }
        
        productsToShow.forEach((product, index) => {
            const productCard = createProductCard(product, index);
            this.horizontalContainer.appendChild(productCard);
            
            setTimeout(() => {
                productCard.style.opacity = '1';
                productCard.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        this.updateDealsCount(filteredProducts.length);
        setTimeout(() => this.updateScrollButtons(), 200);
        
        console.log('✅ Horizontal products rendered successfully');
    }
    
    getFilteredProducts() {
        if (currentFilter === 'all') {
            return allProducts;
        }
        return allProducts.filter(product => 
            product.category.toLowerCase() === currentFilter
        );
    }
    
    sortProducts(products) {
        const sorted = [...products];
        
        switch (currentSort) {
            case 'price-low':
                return sorted.sort((a, b) => this.extractPrice(a.price) - this.extractPrice(b.price));
            case 'price-high':
                return sorted.sort((a, b) => this.extractPrice(b.price) - this.extractPrice(a.price));
            case 'discount':
                return sorted.sort((a, b) => this.calculateDiscount(b.price) - this.calculateDiscount(a.price));
            case 'latest':
            default:
                return sorted.sort((a, b) => new Date(b.posted_date) - new Date(a.posted_date));
        }
    }
    
    extractPrice(priceString) {
        const match = priceString.match(/₹(\d+,?\d*)/);
        return match ? parseInt(match[1].replace(',', '')) : 0;
    }
    
    calculateDiscount(priceString) {
        return Math.floor(Math.random() * 50) + 10;
    }
    
    scrollLeft() {
        this.horizontalContainer.scrollBy({
            left: -this.scrollAmount,
            behavior: 'smooth'
        });
    }
    
    scrollRight() {
        this.horizontalContainer.scrollBy({
            left: this.scrollAmount,
            behavior: 'smooth'
        });
    }
    
    updateScrollButtons() {
        const container = this.horizontalContainer;
        if (!container) return;
        
        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (this.scrollLeftBtn) {
            this.scrollLeftBtn.disabled = scrollLeft <= 0;
            this.scrollLeftBtn.style.opacity = scrollLeft <= 0 ? '0.5' : '1';
        }
        
        if (this.scrollRightBtn) {
            this.scrollRightBtn.disabled = scrollLeft >= maxScroll;
            this.scrollRightBtn.style.opacity = scrollLeft >= maxScroll ? '0.5' : '1';
        }
    }
    
    updateDealsCount(count) {
        if (this.dealsCountSpan) {
            this.dealsCountSpan.textContent = `${count} deals`;
        }
        if (this.totalDealsPreview) {
            this.totalDealsPreview.textContent = count;
        }
    }
    
    trackViewAllClick() {
        console.log('📊 View All Deals clicked');
        if (typeof gtag !== 'undefined') {
            gtag('event', 'view_all_deals_click', {
                event_category: 'engagement',
                event_label: 'horizontal_scroll_section'
            });
        }
    }
    
    refresh() {
        if (this.isInitialized) {
            this.renderHorizontalProducts();
        }
    }
}

// FIXED Loot Deals Scroller
class LootDealsScroller {
    constructor() {
        this.horizontalContainer = document.getElementById('horizontal-loot-container');
        this.fullContainer = document.getElementById('loot-products-container');
        this.horizontalSection = document.querySelector('.horizontal-loot-container');
        this.fullSection = document.getElementById('full-loot-section');
        this.scrollLeftBtn = document.getElementById('loot-scroll-left');
        this.scrollRightBtn = document.getElementById('loot-scroll-right');
        this.viewAllBtn = document.getElementById('view-all-loot');
        this.backToPreviewBtn = document.getElementById('back-to-loot-preview');
        this.lootCountSpan = document.querySelector('.loot-deals-count');
        this.loadMoreBtn = document.getElementById('load-more-loot-btn');
        
        this.isHorizontalMode = true;
        this.scrollAmount = 300;
        this.maxHorizontalItems = 8;
        this.currentPriceLimit = 500;
        this.displayedLootProducts = 0;
        this.lootProductsPerPage = 12;
        this.initialized = false;
        
        console.log("💸 LootDealsScroller constructed");
        this.init();
    }
    
    init() {
        if (!this.horizontalContainer) {
            console.log("❌ Loot horizontal container not found!");
            return;
        }
        
        this.scrollLeftBtn?.addEventListener('click', () => this.scrollLeft());
        this.scrollRightBtn?.addEventListener('click', () => this.scrollRight());
        this.viewAllBtn?.addEventListener('click', () => this.showFullView());
        this.backToPreviewBtn?.addEventListener('click', () => this.showHorizontalView());
        this.loadMoreBtn?.addEventListener('click', () => this.loadMoreLootProducts());
        
        this.setupPriceFilterButtons();
        this.horizontalContainer.addEventListener('scroll', () => this.updateScrollButtons());
        
        this.waitForProducts();
    }
    
    waitForProducts() {
        console.log("⏳ Loot scroller waiting for products...");
        
        const checkProducts = () => {
            if (allProducts && allProducts.length > 0) {
                console.log(`✅ Loot scroller found ${allProducts.length} products`);
                this.initialized = true;
                this.showHorizontalView();
                return;
            }
            
            console.log("🔍 Loot scroller: products not ready yet...");
            setTimeout(checkProducts, 500);
        };
        
        checkProducts();
    }
    
    setupPriceFilterButtons() {
        const horizontalFilters = document.querySelectorAll('.loot-price-filter .price-filter-btn');
        horizontalFilters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                horizontalFilters.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPriceLimit = parseInt(e.target.dataset.priceLimit);
                console.log(`💰 Price limit changed to: ₹${this.currentPriceLimit}`);
                this.renderHorizontalLootProducts();
            });
        });
        
        const fullViewFilters = document.querySelectorAll('.loot-price-filter-full .price-filter-btn');
        fullViewFilters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                fullViewFilters.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPriceLimit = parseInt(e.target.dataset.priceLimit);
                this.displayedLootProducts = 0;
                this.renderFullLootProducts();
            });
        });
    }
    
    extractPrice(priceString) {
        if (!priceString) return 0;
        
        const cleanPrice = priceString.toString().replace(/[^\d,.-]/g, '');
        const patterns = [
            /(\d+,\d+)/,
            /(\d+\.\d+)/,
            /(\d+)/,
        ];
        
        for (let pattern of patterns) {
            const match = cleanPrice.match(pattern);
            if (match) {
                const price = parseInt(match[1].replace(/[,.-]/g, ''));
                return isNaN(price) ? 0 : price;
            }
        }
        
        return 0;
    }
    
    getFilteredLootProducts() {
        console.log(`🔍 Filtering products for price limit: ₹${this.currentPriceLimit}`);
        
        if (!allProducts || allProducts.length === 0) {
            console.log("❌ No products available for loot filtering");
            return [];
        }
        
        const filteredProducts = allProducts.filter(product => {
            if (!product) return false;
            
            const price = this.extractPrice(product.price);
            const isValidPrice = price > 0 && price <= this.currentPriceLimit;
            
            if (isValidPrice) {
                console.log(`✅ Loot Product: ${product.title || 'Unknown'} - Price: ₹${price}`);
            }
            
            return isValidPrice;
        });
        
        console.log(`✅ Loot filtered products: ${filteredProducts.length}`);
        return filteredProducts;
    }
    
    sortLootProducts(products) {
        return products.sort((a, b) => {
            const priceA = this.extractPrice(a.price);
            const priceB = this.extractPrice(b.price);
            return priceA - priceB;
        });
    }
    
    renderHorizontalLootProducts() {
        console.log("🎨 Rendering horizontal loot products...");
        
        if (!this.horizontalContainer) {
            console.log("❌ No loot horizontal container");
            return;
        }
        
        const filteredProducts = this.getFilteredLootProducts();
        
        if (filteredProducts.length === 0) {
            if (allProducts && allProducts.length > 0) {
                console.log("🔄 No products match filter, showing all products");
                const productsToShow = allProducts.slice(0, this.maxHorizontalItems);
                this.renderProductCards(productsToShow);
                this.updateLootCount(allProducts.length);
                return;
            }
            
            this.horizontalContainer.innerHTML = `
                <div class="loot-empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Products are still loading, please wait...</p>
                    <button onclick="location.reload()" style="background: #e11d48; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 10px; cursor: pointer;">
                        Refresh Page
                    </button>
                </div>
            `;
            this.updateLootCount(0);
            return;
        }
        
        const sortedProducts = this.sortLootProducts(filteredProducts);
        const productsToShow = sortedProducts.slice(0, this.maxHorizontalItems);
        
        this.renderProductCards(productsToShow);
        this.updateLootCount(filteredProducts.length);
    }
    
    renderProductCards(products) {
        this.horizontalContainer.innerHTML = '';
        
        products.forEach((product, index) => {
            console.log(`🏗️ Creating loot card ${index + 1}: ${product.title || 'Unknown Product'}`);
            
            const productCard = createProductCard(product, index);
            productCard.classList.add('loot-deal-card');
            productCard.style.opacity = '0';
            productCard.style.transform = 'translateY(20px)';
            this.horizontalContainer.appendChild(productCard);
            
            setTimeout(() => {
                productCard.style.opacity = '1';
                productCard.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        setTimeout(() => this.updateScrollButtons(), 500);
        console.log("✅ Loot horizontal products rendered successfully!");
    }
    
    renderFullLootProducts() {
        if (!this.fullContainer) return;
        
        const filteredProducts = this.getFilteredLootProducts();
        const sortedProducts = this.sortLootProducts(filteredProducts);
        const productsToShow = sortedProducts.slice(0, this.displayedLootProducts + this.lootProductsPerPage);
        
        this.fullContainer.innerHTML = '';
        
        if (productsToShow.length === 0) {
            this.fullContainer.innerHTML = `
                <div class="loot-empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No deals found under ₹${this.currentPriceLimit}</h3>
                    <p>Try a different price filter!</p>
                </div>
            `;
            return;
        }
        
        productsToShow.forEach((product, index) => {
            const productCard = createProductCard(product, index);
            productCard.classList.add('loot-deal-card');
            this.fullContainer.appendChild(productCard);
            
            setTimeout(() => {
                productCard.style.opacity = '1';
                productCard.style.transform = 'translateY(0)';
            }, index * 50);
        });
        
        this.displayedLootProducts = productsToShow.length;
        
        if (this.displayedLootProducts >= filteredProducts.length) {
            this.loadMoreBtn.style.display = 'none';
        } else {
            this.loadMoreBtn.style.display = 'block';
        }
    }
    
    loadMoreLootProducts() {
        this.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        setTimeout(() => {
            this.renderFullLootProducts();
            this.loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Loot Deals';
        }, 500);
    }
    
    scrollLeft() {
        this.horizontalContainer.scrollBy({
            left: -this.scrollAmount,
            behavior: 'smooth'
        });
    }
    
    scrollRight() {
        this.horizontalContainer.scrollBy({
            left: this.scrollAmount,
            behavior: 'smooth'
        });
    }
    
    updateScrollButtons() {
        const container = this.horizontalContainer;
        if (!container) return;
        
        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (this.scrollLeftBtn) {
            this.scrollLeftBtn.disabled = scrollLeft <= 0;
        }
        
        if (this.scrollRightBtn) {
            this.scrollRightBtn.disabled = scrollLeft >= maxScroll;
        }
    }
    
    showFullView() {
        this.isHorizontalMode = false;
        this.horizontalSection.style.display = 'none';
        this.fullSection.style.display = 'block';
        
        this.displayedLootProducts = 0;
        this.renderFullLootProducts();
        
        this.fullSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    showHorizontalView() {
        this.isHorizontalMode = true;
        this.horizontalSection.style.display = 'block';
        this.fullSection.style.display = 'none';
        
        this.renderHorizontalLootProducts();
        
        const lootSection = document.getElementById('loot-deals');
        if (lootSection) {
            lootSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    updateLootCount(count) {
        if (this.lootCountSpan) {
            this.lootCountSpan.textContent = `${count} deals`;
        }
    }
    
    refresh() {
        console.log("🔄 Refreshing loot deals...");
        if (!this.initialized) {
            this.waitForProducts();
            return;
        }
        
        if (this.isHorizontalMode) {
            this.renderHorizontalLootProducts();
        } else {
            this.renderFullLootProducts();
        }
    }
}

// Banner Slider Functionality
class BannerSlider {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = document.querySelectorAll('.banner-slide').length;
        this.slides = document.querySelectorAll('.banner-slide');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.getElementById('prev-banner');
        this.nextBtn = document.getElementById('next-banner');
        this.autoSlideInterval = null;
        this.init();
    }
    
    init() {
        if (this.totalSlides === 0) return;
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        this.startAutoSlide();
        
        const heroSlider = document.querySelector('.hero-slider');
        if (heroSlider) {
            heroSlider.addEventListener('mouseenter', () => this.stopAutoSlide());
            heroSlider.addEventListener('mouseleave', () => this.startAutoSlide());
        }
        
        this.addTouchSupport();
    }
    
    goToSlide(slideIndex) {
        this.slides[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');
        
        this.currentSlide = slideIndex;
        
        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(nextIndex);
    }
    
    previousSlide() {
        const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prevIndex);
    }
    
    startAutoSlide() {
        this.stopAutoSlide();
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }
    
    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
    
    addTouchSupport() {
        const heroSlider = document.querySelector('.hero-slider');
        if (!heroSlider) return;
        
        let startX = 0;
        let endX = 0;
        
        heroSlider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        heroSlider.addEventListener('touchmove', (e) => {
            endX = e.touches[0].clientX;
        });
        
        heroSlider.addEventListener('touchend', () => {
            const diff = startX - endX;
            const minSwipeDistance = 50;
            
            if (Math.abs(diff) > minSwipeDistance) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
        });
    }
}

// Initialize banner slider
function initializeBannerSlider() {
    if (document.querySelector('.hero-slider')) {
        window.bannerSlider = new BannerSlider();
    }
}

// Utility functions
function getFilteredProducts() {
    if (currentFilter === 'all') {
        return allProducts;
    }
    return allProducts.filter(product => 
        product.category.toLowerCase() === currentFilter
    );
}

function sortProducts(products) {
    const sorted = [...products];
    
    switch (currentSort) {
        case 'price-low':
            return sorted.sort((a, b) => extractPrice(a.price) - extractPrice(b.price));
        case 'price-high':
            return sorted.sort((a, b) => extractPrice(b.price) - extractPrice(a.price));
        case 'discount':
            return sorted.sort((a, b) => calculateDiscount(b.price).discount - calculateDiscount(a.price).discount);
        case 'latest':
        default:
            return sorted.sort((a, b) => new Date(b.posted_date) - new Date(a.posted_date));
    }
}

function setupEventListeners() {
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            displayedProducts = 0;
            renderProducts();
        });
    });
    
    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            setTimeout(() => {
                renderProducts();
                this.innerHTML = '<i class="fas fa-plus"></i> Load More Deals';
            }, 500);
        });
    }
    
    // Category cards
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterByCategory(category);
        });
    });
    
    // Sort functionality
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            displayedProducts = 0;
            renderProducts();
        });
    }
    
    // View toggle
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
    
    setupMobileNavigation();
    
    // Close share menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.share-dropdown')) {
            document.querySelectorAll('.share-menu').forEach(menu => {
                menu.classList.remove('active');
            });
        }
    });
}

function filterByCategory(category) {
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === category) {
            btn.classList.add('active');
        }
    });
    
    currentFilter = category;
    displayedProducts = 0;
    renderProducts();
    
    document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' });
}

function updateCategoryCounts() {
    categoryCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const count = allProducts.filter(p => 
            p.category.toLowerCase() === category
        ).length;
        
        const countSpan = card.querySelector('.deal-count');
        if (countSpan) {
            countSpan.textContent = `${count} deals`;
        }
    });
}

function updateTotalDeals() {
    if (totalDealsSpan) {
        totalDealsSpan.textContent = allProducts.length;
    }
}

function trackClick(productId) {
    console.log(`Product clicked: ${productId}`);
    event.target.style.transform = 'scale(0.95)';
    setTimeout(() => {
        event.target.style.transform = 'scale(1)';
    }, 150);
}

// Loading, empty, and error states
function showLoadingState() {
    if (productsContainer) {
        productsContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
                <p>Loading amazing deals...</p>
            </div>
        `;
    }
    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
    }
}

function showEmptyState() {
    if (productsContainer) {
        productsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No deals found</h3>
                <p>No deals available in this category yet.</p>
                <p>Check back soon for amazing offers!</p>
                <button onclick="resetFilters()" class="btn-primary">
                    <i class="fas fa-refresh"></i>
                    Show All Deals
                </button>
            </div>
        `;
    }
    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
    }
}

function showErrorMessage() {
    if (productsContainer) {
        productsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load deals</h3>
                <p>Something went wrong while loading the deals.</p>
                <button onclick="loadProducts()" class="retry-btn">
                    <i class="fas fa-refresh"></i>
                    Try Again
                </button>
            </div>
        `;
    }
    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
    }
}

function updateLastRefresh() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN');
    console.log(`Last updated: ${timeString}`);
}

// Helper functions
function calculateDiscount(priceString) {
    const priceMatch = priceString.match(/₹(\d+,?\d*)/g);
    if (priceMatch && priceMatch.length >= 2) {
        const current = parseInt(priceMatch[0].replace(/₹|,/g, ''));
        const original = parseInt(priceMatch[1].replace(/₹|,/g, ''));
        const discount = Math.round(((original - current) / original) * 100);
        return {
            currentPrice: priceMatch[0],
            originalPrice: priceMatch[1],
            discount: discount > 0 ? discount : 0
        };
    }
    return {
        currentPrice: priceString,
        originalPrice: null,
        discount: 0
    };
}

function extractPrice(priceString) {
    const match = priceString.match(/₹(\d+,?\d*)/);
    return match ? parseInt(match[1].replace(',', '')) : 0;
}

function resetFilters() {
    currentFilter = 'all';
    currentSort = 'latest';
    displayedProducts = 0;
    
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === 'all') {
            btn.classList.add('active');
        }
    });
    
    if (sortSelect) {
        sortSelect.value = 'latest';
    }
    
    renderProducts();
}

// Enhanced features
function initializeEnhancements() {
    initializeTheme();
    initializeScrollEffects();
    initializeAnimations();
}

function initializeEnhancedCards() {
    setTimeout(() => {
        loadUserPreferences();
    }, 500);
}

function loadUserPreferences() {
    const likes = JSON.parse(localStorage.getItem('thriftzone_likes') || '{}');
    const wishlist = JSON.parse(localStorage.getItem('thriftzone_wishlist') || '[]');
    
    // Restore likes
    Object.keys(likes).forEach(productId => {
        if (likes[productId]) {
            const likeBtn = document.querySelector(`[onclick*="${productId}"].likes-action`);
            if (likeBtn) {
                likeBtn.classList.add('active');
                const icon = likeBtn.querySelector('i');
                const text = likeBtn.querySelector('.action-text');
                if (icon) icon.className = 'fas fa-thumbs-up';
                if (text) text.textContent = 'Liked';
            }
        }
    });
    
    // Restore wishlist
    wishlist.forEach(productId => {
        const wishlistBtn = document.querySelector(`[onclick*="${productId}"].wishlist-btn`);
        if (wishlistBtn) {
            wishlistBtn.classList.add('active');
            wishlistBtn.querySelector('i').className = 'fas fa-heart';
        }
    });
}

// Wishlist functionality
function toggleWishlist(productId, button) {
    const icon = button.querySelector('i');
    const isActive = button.classList.contains('active');
    
    if (isActive) {
        button.classList.remove('active');
        icon.className = 'far fa-heart';
        removeFromWishlist(productId);
    } else {
        button.classList.add('active');
        icon.className = 'fas fa-heart';
        addToWishlist(productId);
    }
    
    button.style.transform = 'scale(1.3)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
}

function addToWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('thriftzone_wishlist') || '[]');
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem('thriftzone_wishlist', JSON.stringify(wishlist));
        console.log(`Added to wishlist: ${productId}`);
    }
}

function removeFromWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('thriftzone_wishlist') || '[]');
    wishlist = wishlist.filter(id => id !== productId);
    localStorage.setItem('thriftzone_wishlist', JSON.stringify(wishlist));
    console.log(`Removed from wishlist: ${productId}`);
}

// Mobile Navigation Functions
function setupMobileNavigation() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavClose = document.querySelector('.mobile-nav-close');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', openMobileNav);
    }
    
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileNav);
    }
    
    document.addEventListener('click', (e) => {
        if (mobileNav && mobileNav.classList.contains('active') && 
            !mobileNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            closeMobileNav();
        }
    });
}

function openMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) {
        mobileNav.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) {
        mobileNav.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function initializeTheme() {
    // Theme initialization code
}

function initializeScrollEffects() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            lastScrollTop = scrollTop;
            
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

function initializeAnimations() {
    if (!document.querySelector('#thriftzone-animations')) {
        const style = document.createElement('style');
        style.id = 'thriftzone-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                color: #333;
                padding: 12px 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateX(100%);
                transition: transform 0.3s ease;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 8px;
                border-left: 4px solid #28a745;
            }
            
            .toast.show {
                transform: translateX(0);
            }
            
            .toast-success { border-left-color: #28a745; }
            .toast-warning { border-left-color: #ffc107; }
            .toast-info { border-left-color: #17a2b8; }
            
            .comments-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .comments-modal.active {
                opacity: 1;
            }
            
            .comments-modal-content {
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
            }
            
            .comments-header {
                padding: 16px 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: between;
                align-items: center;
            }
            
            .close-comments {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #666;
            }
            
            .comments-list {
                padding: 16px 20px;
                flex: 1;
                overflow-y: auto;
            }
            
            .comment-item {
                display: flex;
                gap: 12px;
                margin-bottom: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .comment-avatar i {
                font-size: 32px;
                color: #ccc;
            }
            
            .comment-content {
                flex: 1;
            }
            
            .comment-header {
                display: flex;
                gap: 12px;
                align-items: center;
                margin-bottom: 4px;
            }
            
            .commenter-name {
                font-weight: 600;
                color: #333;
            }
            
            .comment-time {
                color: #666;
                font-size: 12px;
            }
            
            .comment-text {
                color: #555;
                line-height: 1.4;
            }
            
            .add-comment {
                padding: 16px 20px;
                border-top: 1px solid #eee;
            }
            
            .comment-input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                resize: none;
                margin-bottom: 8px;
                min-height: 60px;
            }
            
            .post-comment-btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }
}

function initializeSearch() {
    // Search functionality - implement as needed
    console.log('🔍 Search initialized');
}

// Utility functions for hero section
function scrollToDeals() {
    document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' });
}

function scrollToCategories() {
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
}

// Auto-refresh functionality
setInterval(loadProducts, 5 * 60 * 1000);

console.log('🎉 Thrift Zone JavaScript with Social Features loaded successfully');
