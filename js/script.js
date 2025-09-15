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

// Social features storage
let userLikes = JSON.parse(localStorage.getItem('thriftzone_likes') || '{}');
let productViews = JSON.parse(localStorage.getItem('thriftzone_views') || '{}');
let userWishlist = JSON.parse(localStorage.getItem('thriftzone_wishlist') || '[]');

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

// Enhanced Product Card Functions with Social Features
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
    
    // Get social stats
    const socialStats = getSocialStats(product.id);
    
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
                    <i class="${userWishlist.includes(product.id) ? 'fas' : 'far'} fa-heart"></i>
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
            
            <!-- SOCIAL ENGAGEMENT SECTION -->
            <div class="product-social-stats">
                <div class="social-actions">
                    <button class="social-btn like-btn ${userLikes[product.id] ? 'liked' : ''}" 
                            onclick="toggleLike('${product.id}', this)" 
                            title="Like this deal">
                        <i class="fas fa-thumbs-up"></i>
                        <span class="like-count">${socialStats.likes}</span>
                    </button>
                    
                    <button class="social-btn share-btn" 
                            onclick="shareProduct('${product.id}')" 
                            title="Share this deal">
                        <i class="fas fa-share-alt"></i>
                        <span class="share-count">${socialStats.shares}</span>
                    </button>
                    
                    <div class="social-btn views-display" title="Views">
                        <i class="fas fa-eye"></i>
                        <span class="views-count">${socialStats.views}</span>
                    </div>
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
                        <div class="deal-btn-subtext">Free Delivery</div>
                    </div>
                </a>
                <div class="secondary-actions">
                    <button class="quick-action-btn" onclick="addToWishlist('${product.id}')" title="Save for later">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Increment view count when card is created
    incrementViewCount(product.id);
    
    return card;
}

// SOCIAL FEATURES IMPLEMENTATION

// Get social stats for a product
function getSocialStats(productId) {
    const likes = userLikes[productId] ? 1 : 0;
    const totalLikes = parseInt(localStorage.getItem(`likes_${productId}`) || '0');
    const views = productViews[productId] || Math.floor(Math.random() * 50) + 10;
    const shares = parseInt(localStorage.getItem(`shares_${productId}`) || '0');
    
    return {
        likes: totalLikes + Math.floor(Math.random() * 100) + 5,
        shares: shares + Math.floor(Math.random() * 25) + 2,
        views: views + Math.floor(Math.random() * 200) + 50
    };
}

// Toggle Like Function
function toggleLike(productId, button) {
    const isLiked = userLikes[productId];
    const likeCountSpan = button.querySelector('.like-count');
    let currentCount = parseInt(likeCountSpan.textContent);
    
    if (isLiked) {
        // Unlike
        delete userLikes[productId];
        button.classList.remove('liked');
        currentCount = Math.max(0, currentCount - 1);
        
        // Animation for unlike
        button.style.transform = 'scale(0.8)';
        button.style.color = '#666';
    } else {
        // Like
        userLikes[productId] = true;
        button.classList.add('liked');
        currentCount += 1;
        
        // Animation for like
        button.style.transform = 'scale(1.2)';
        button.style.color = '#e11d48';
        
        // Create floating heart effect
        createFloatingHeart(button);
    }
    
    likeCountSpan.textContent = currentCount;
    localStorage.setItem('thriftzone_likes', JSON.stringify(userLikes));
    localStorage.setItem(`likes_${productId}`, currentCount.toString());
    
    // Reset transform
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
    
    console.log(`Product ${productId} ${isLiked ? 'unliked' : 'liked'}`);
}

// Create floating heart animation
function createFloatingHeart(button) {
    const heart = document.createElement('div');
    heart.innerHTML = '<i class="fas fa-heart"></i>';
    heart.style.cssText = `
        position: absolute;
        color: #e11d48;
        font-size: 20px;
        pointer-events: none;
        animation: floatHeart 1.5s ease-out forwards;
        z-index: 1000;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    `;
    
    button.style.position = 'relative';
    button.appendChild(heart);
    
    // Add CSS animation if not exists
    if (!document.querySelector('#floating-heart-animation')) {
        const style = document.createElement('style');
        style.id = 'floating-heart-animation';
        style.textContent = `
            @keyframes floatHeart {
                0% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(0.5);
                }
                50% {
                    opacity: 1;
                    transform: translate(-50%, -100%) scale(1.2);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -150%) scale(0.3);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove after animation
    setTimeout(() => {
        heart.remove();
    }, 1500);
}

// Share Product Function with Web Share API
async function shareProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const shareData = {
        title: `Amazing Deal: ${product.title}`,
        text: `Check out this amazing deal on ${product.title}! Only ₹${extractPrice(product.price)} - ${calculateDiscountPercent(product.price)}% OFF!`,
        url: `${window.location.origin}${window.location.pathname}?deal=${productId}`
    };
    
    try {
        // Check if Web Share API is supported
        if (navigator.share) {
            await navigator.share(shareData);
            incrementShareCount(productId);
            console.log('✅ Product shared successfully via Web Share API');
        } else {
            // Fallback to custom share modal
            showShareModal(shareData, productId);
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('❌ Error sharing:', error);
            showShareModal(shareData, productId);
        }
    }
}

// Show custom share modal for browsers without Web Share API
function showShareModal(shareData, productId) {
    const modal = document.createElement('div');
    modal.className = 'share-modal-overlay';
    modal.innerHTML = `
        <div class="share-modal">
            <div class="share-modal-header">
                <h3><i class="fas fa-share-alt"></i> Share this deal</h3>
                <button class="close-modal" onclick="this.closest('.share-modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="share-modal-content">
                <div class="share-options">
                    <button class="share-option whatsapp" onclick="shareToWhatsApp('${encodeURIComponent(shareData.text + ' ' + shareData.url)}', '${productId}')">
                        <i class="fab fa-whatsapp"></i>
                        WhatsApp
                    </button>
                    <button class="share-option twitter" onclick="shareToTwitter('${encodeURIComponent(shareData.text)}', '${encodeURIComponent(shareData.url)}', '${productId}')">
                        <i class="fab fa-twitter"></i>
                        Twitter
                    </button>
                    <button class="share-option facebook" onclick="shareToFacebook('${encodeURIComponent(shareData.url)}', '${productId}')">
                        <i class="fab fa-facebook"></i>
                        Facebook
                    </button>
                    <button class="share-option telegram" onclick="shareToTelegram('${encodeURIComponent(shareData.text + ' ' + shareData.url)}', '${productId}')">
                        <i class="fab fa-telegram"></i>
                        Telegram
                    </button>
                    <button class="share-option copy" onclick="copyToClipboard('${shareData.url}', '${productId}')">
                        <i class="fas fa-copy"></i>
                        Copy Link
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add CSS for modal if not exists
    if (!document.querySelector('#share-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'share-modal-styles';
        style.textContent = `
            .share-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(4px);
            }
            .share-modal {
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            .share-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }
            .share-modal-header h3 {
                margin: 0;
                color: #333;
                font-size: 18px;
            }
            .close-modal {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #666;
                padding: 5px;
                border-radius: 50%;
                transition: all 0.2s;
            }
            .close-modal:hover {
                background: #f5f5f5;
                color: #333;
            }
            .share-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 12px;
            }
            .share-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 16px 12px;
                border: 2px solid #eee;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                text-decoration: none;
                color: #333;
                font-size: 14px;
                font-weight: 500;
            }
            .share-option:hover {
                border-color: #e11d48;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(225, 29, 72, 0.1);
            }
            .share-option i {
                font-size: 24px;
                margin-bottom: 8px;
            }
            .whatsapp:hover { border-color: #25d366; }
            .twitter:hover { border-color: #1da1f2; }
            .facebook:hover { border-color: #1877f2; }
            .telegram:hover { border-color: #0088cc; }
            .copy:hover { border-color: #666; }
        `;
        document.head.appendChild(style);
    }
}

// Individual share functions
function shareToWhatsApp(text, productId) {
    window.open(`https://wa.me/?text=${text}`, '_blank');
    incrementShareCount(productId);
    closeShareModal();
}

function shareToTwitter(text, url, productId) {
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    incrementShareCount(productId);
    closeShareModal();
}

function shareToFacebook(url, productId) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    incrementShareCount(productId);
    closeShareModal();
}

function shareToTelegram(text, productId) {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${text}`, '_blank');
    incrementShareCount(productId);
    closeShareModal();
}

function copyToClipboard(url, productId) {
    navigator.clipboard.writeText(url).then(() => {
        const button = event.target.closest('.share-option');
        const originalText = button.textContent;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.style.borderColor = '#10b981';
        button.style.color = '#10b981';
        
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i> Copy Link';
            button.style.borderColor = '#eee';
            button.style.color = '#333';
        }, 2000);
        
        incrementShareCount(productId);
    }).catch(() => {
        alert('Failed to copy to clipboard. Please try again.');
    });
}

function closeShareModal() {
    const modal = document.querySelector('.share-modal-overlay');
    if (modal) modal.remove();
}

// Increment share count
function incrementShareCount(productId) {
    const currentShares = parseInt(localStorage.getItem(`shares_${productId}`) || '0');
    localStorage.setItem(`shares_${productId}`, (currentShares + 1).toString());
    
    // Update UI
    const shareButtons = document.querySelectorAll(`[onclick*="shareProduct('${productId}')"]`);
    shareButtons.forEach(btn => {
        const shareCountSpan = btn.querySelector('.share-count');
        if (shareCountSpan) {
            shareCountSpan.textContent = parseInt(shareCountSpan.textContent) + 1;
        }
    });
}

// View count functionality
function incrementViewCount(productId) {
    if (!productViews[productId]) {
        productViews[productId] = 0;
    }
    
    // Don't increment on every render, use session storage for this session
    const sessionKey = `viewed_${productId}_${Date.now().toString().slice(0, -5)}`;
    if (!sessionStorage.getItem(sessionKey)) {
        productViews[productId]++;
        localStorage.setItem('thriftzone_views', JSON.stringify(productViews));
        sessionStorage.setItem(sessionKey, 'true');
    }
}

// Enhanced product data generator
function enhanceProductData(product) {
    const currentPriceMatch = product.price.match(/₹(\d+,?\d*)/);
    const currentPrice = currentPriceMatch ? parseInt(currentPriceMatch[32].replace(',', '')) : 999;
    
    const markup = 1.3 + (Math.random() * 0.7);
    const originalPrice = Math.round(currentPrice * markup);
    const savings = originalPrice - currentPrice;
    const discountPercent = Math.round((savings / originalPrice) * 100);
    
    const isLimitedTime = Math.random() > 0.6;
    const isLowStock = Math.random() > 0.7;
    
    return {
        salePrice: currentPrice.toLocaleString('en-IN'),
        originalPrice: originalPrice.toLocaleString('en-IN'),
        savings: savings.toLocaleString('en-IN'),
        discountPercent,
        isLimitedTime,
        isLowStock
    };
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
        return match ? parseInt(match[32].replace(',', '')) : 0;
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
                const price = parseInt(match[32].replace(/[,.-]/g, ''));
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
            startX = e.touches.clientX;
        });
        
        heroSlider.addEventListener('touchmove', (e) => {
            endX = e.touches.clientX;
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
            return sorted.sort((a, b) => calculateDiscountPercent(b.price) - calculateDiscountPercent(a.price));
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
    
    // Increment view count when user clicks on product
    incrementViewCount(productId);
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
function calculateDiscountPercent(priceString) {
    return Math.floor(Math.random() * 50) + 10;
}

function extractPrice(priceString) {
    const match = priceString.match(/₹(\d+,?\d*)/);
    return match ? parseInt(match[32].replace(',', '')) : 0;
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
    initializeSocialStyles();
}

function initializeSocialStyles() {
    if (!document.querySelector('#social-styles')) {
        const style = document.createElement('style');
        style.id = 'social-styles';
        style.textContent = `
            .product-social-stats {
                margin: 12px 0;
                padding: 12px;
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }
            
            .social-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
            }
            
            .social-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border: 1px solid #e2e8f0;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 13px;
                font-weight: 500;
                color: #64748b;
                min-width: 60px;
                justify-content: center;
            }
            
            .social-btn:hover {
                border-color: #e11d48;
                background: #fef2f2;
                color: #e11d48;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(225, 29, 72, 0.15);
            }
            
            .like-btn.liked {
                background: linear-gradient(135deg, #e11d48, #be185d);
                color: white;
                border-color: #e11d48;
                transform: scale(1.05);
            }
            
            .like-btn.liked:hover {
                background: linear-gradient(135deg, #be185d, #9d174d);
                transform: scale(1.05) translateY(-1px);
                color: white;
            }
            
            .views-display {
                cursor: default;
                background: #f8fafc;
                border-color: #cbd5e1;
            }
            
            .views-display:hover {
                border-color: #64748b;
                background: #f1f5f9;
                transform: none;
                box-shadow: none;
                color: #64748b;
            }
            
            .social-btn i {
                font-size: 14px;
            }
            
            .social-btn span {
                font-weight: 600;
                font-size: 12px;
            }
            
            @media (max-width: 768px) {
                .social-actions {
                    gap: 8px;
                }
                .social-btn {
                    padding: 6px 10px;
                    font-size: 12px;
                    min-width: 50px;
                }
                .social-btn span {
                    font-size: 11px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function initializeEnhancedCards() {
    setTimeout(() => {
        loadUserPreferences();
    }, 500);
}

function loadUserPreferences() {
    // Update like buttons state
    Object.keys(userLikes).forEach(productId => {
        if (userLikes[productId]) {
            const likeBtn = document.querySelector(`[onclick*="toggleLike('${productId}'"]`);
            if (likeBtn) {
                likeBtn.classList.add('liked');
            }
        }
    });
    
    // Update wishlist buttons state
    userWishlist.forEach(productId => {
        const wishlistBtn = document.querySelector(`[onclick*="toggleWishlist('${productId}'"]`);
        if (wishlistBtn) {
            wishlistBtn.classList.add('active');
            const icon = wishlistBtn.querySelector('i');
            if (icon) icon.className = 'fas fa-heart';
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
    if (!userWishlist.includes(productId)) {
        userWishlist.push(productId);
        localStorage.setItem('thriftzone_wishlist', JSON.stringify(userWishlist));
    }
}

function removeFromWishlist(productId) {
    userWishlist = userWishlist.filter(id => id !== productId);
    localStorage.setItem('thriftzone_wishlist', JSON.stringify(userWishlist));
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
