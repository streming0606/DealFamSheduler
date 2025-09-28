// Thrift Zone - FIXED Complete JavaScript
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







// Enhanced Product Card Functions
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
                `<img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\"product-placeholder\\"><i class=\\"fas fa-image\\"></i></div>` 
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
            
            <div class="product-actions">

            










            


<a href="#" 
   class="deal-btn" 
   onclick="openProductPage('${product.id}', '${product.title}'); return false;"
   rel="noopener noreferrer">
    <div>



                    
                        <div class="deal-btn-text">
                            <i class="fas fa-bolt"></i>
                            View Deal Details
                        </div>
                        <div class="deal-btn-subtext">Save Big Today</div>
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
    
    return card;
}








// Product page navigation function
function openProductPage(productId, productTitle) {
    const titleSlug = productTitle.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    
    const productUrl = `product.html?id=${productId}&title=${titleSlug}`;
    window.location.href = productUrl;
}













// ========== ULTRA COMPACT ENHANCED FEATURES ==========

class CompactProductFeatures {
    constructor() {
        this.initializeFeatures();
        this.loadStoredData();
    }

    initializeFeatures() {
        setTimeout(() => {
            this.addFeaturesToExistingProducts();
        }, 1000);
    }

    addFeaturesToExistingProducts() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach((card, index) => {
            if (!card.querySelector('.product-enhanced-features')) {
                this.addCompactFeaturesToCard(card, index);
            }
        });
    }

    addCompactFeaturesToCard(productCard, productIndex) {
        const productInfo = productCard.querySelector('.product-info');
        const productActions = productCard.querySelector('.product-actions');
        
        if (!productInfo || !productActions) return;

        // Create ultra-compact features section
        const featuresSection = document.createElement('div');
        featuresSection.className = 'product-enhanced-features';
        featuresSection.innerHTML = this.createCompactFeaturesHTML(productIndex);

        // Insert before product actions with minimal spacing
        productInfo.insertBefore(featuresSection, productActions);

        // Add event listeners
        this.addCompactFeatureEventListeners(productCard, productIndex);
        
        // Initialize timer
        this.initializeCompactTimer(productCard, productIndex);
    }

    createCompactFeaturesHTML(productIndex) {
        const likes = this.getLikes(productIndex);
        const comments = this.getComments(productIndex);
        
        return `
            <div class="features-compact-row">
                <button class="feature-compact-btn like-compact-btn" data-product="${productIndex}">
                    <span class="feature-compact-icon">❤️</span>
                    <span class="feature-compact-count">${likes}</span>
                </button>
                
                <button class="feature-compact-btn share-compact-btn" data-product="${productIndex}">
                    <span class="feature-compact-icon">🔗</span>
                </button>
                
                <button class="feature-compact-btn comment-compact-btn ${comments.length > 0 ? 'has-comments' : ''}" data-product="${productIndex}">
                    <span class="feature-compact-icon">💬</span>
                    <span class="feature-compact-count">${comments.length}</span>
                </button>
                
                <div class="feature-compact-btn timer-compact-btn" data-product="${productIndex}">
                    <span class="feature-compact-icon">⏰</span>
                    <span class="feature-compact-count timer-compact-display">--:--</span>
                </div>
            </div>
        `;
    }

    addCompactFeatureEventListeners(productCard, productIndex) {
        // Like button
        const likeBtn = productCard.querySelector('.like-compact-btn');
        likeBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLike(productIndex, likeBtn);
        });

        // Share button
        const shareBtn = productCard.querySelector('.share-compact-btn');
        shareBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleShare(productIndex);
        });

        // Comment button
        const commentBtn = productCard.querySelector('.comment-compact-btn');
        commentBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleComment(productIndex, productCard);
        });
    }

    handleLike(productIndex, button) {
        let likes = this.getLikes(productIndex);
        const isLiked = this.isLiked(productIndex);
        
        if (isLiked) {
            likes = Math.max(0, likes - 1);
            this.setLiked(productIndex, false);
            button.classList.remove('active');
        } else {
            likes += 1;
            this.setLiked(productIndex, true);
            button.classList.add('active');
        }
        
        this.setLikes(productIndex, likes);
        const countElement = button.querySelector('.feature-compact-count');
        if (countElement) {
            countElement.textContent = likes;
        }
    }

    handleShare(productIndex) {
        if (navigator.share) {
            const productCard = document.querySelector(`[data-product="${productIndex}"]`)?.closest('.product-card');
            const productTitle = productCard?.querySelector('.product-title')?.textContent || 'Great Deal';
            const currentUrl = window.location.href;
            
            navigator.share({
                title: `${productTitle} - Thrift Zone`,
                text: `Check out this amazing deal!`,
                url: currentUrl
            }).catch(err => {
                this.fallbackShare(currentUrl);
            });
        } else {
            this.fallbackShare(window.location.href);
        }
    }

    fallbackShare(url) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                this.showCompactToast('Link copied!');
            });
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showCompactToast('Link copied!');
        }
    }

    handleComment(productIndex, productCard) {
        this.showCompactCommentModal(productIndex, productCard);
    }

    showCompactCommentModal(productIndex, productCard) {
        const productTitle = productCard.querySelector('.product-title')?.textContent || 'Product';
        const comments = this.getComments(productIndex);
        
        const modal = document.createElement('div');
        modal.className = 'comment-modal';
        modal.innerHTML = `
            <div class="comment-modal-content">
                <div class="comment-modal-header">
                    <h3 class="comment-modal-title">${productTitle.substring(0, 25)}...</h3>
                    <button class="comment-modal-close">&times;</button>
                </div>
                
                <div class="comments-list">
                    ${comments.map(comment => `
                        <div class="comment-item">
                            <div class="comment-author">${comment.author}</div>
                            <div class="comment-text">${comment.text}</div>
                            <div class="comment-date">${comment.date}</div>
                        </div>
                    `).join('')}
                    ${comments.length === 0 ? '<p style="text-align: center; color: #6b7280; padding: 15px; font-size: 0.8rem;">No comments yet!</p>' : ''}
                </div>
                
                <div class="comment-input-section">
                    <textarea class="comment-input" placeholder="Share your thoughts..."></textarea>
                    <button class="comment-submit-btn">Post</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.comment-modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        modal.querySelector('.comment-submit-btn').addEventListener('click', () => {
            const input = modal.querySelector('.comment-input');
            const text = input.value.trim();
            
            if (text) {
                this.addComment(productIndex, text);
                input.value = '';
                document.body.removeChild(modal);
                
                // Update comment count
                const commentBtn = productCard.querySelector('.comment-compact-btn');
                const newCount = this.getComments(productIndex).length;
                const countElement = commentBtn.querySelector('.feature-compact-count');
                if (countElement) {
                    countElement.textContent = newCount;
                }
                commentBtn.classList.add('has-comments');
                
                this.showCompactToast('Comment added!');
            }
        });
    }

    initializeCompactTimer(productCard, productIndex) {
        const minMinutes = 5;
        const maxMinutes = 360;
        const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
        
        let endTime = this.getTimerEndTime(productIndex);
        
        if (!endTime || endTime <= Date.now()) {
            endTime = Date.now() + (randomMinutes * 60 * 1000);
            this.setTimerEndTime(productIndex, endTime);
        }
        
        this.updateCompactTimer(productCard, productIndex, endTime);
        
        setInterval(() => {
            this.updateCompactTimer(productCard, productIndex, endTime);
        }, 1000);
    }

    updateCompactTimer(productCard, productIndex, endTime) {
        const now = Date.now();
        const timeLeft = endTime - now;
        const timerDisplay = productCard.querySelector('.timer-compact-display');
        const timerBtn = productCard.querySelector('.timer-compact-btn');
        
        if (!timerDisplay) return;
        
        if (timeLeft <= 0) {
            const minMinutes = 5;
            const maxMinutes = 360;
            const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
            const newEndTime = Date.now() + (randomMinutes * 60 * 1000);
            this.setTimerEndTime(productIndex, newEndTime);
            endTime = newEndTime;
            timerBtn?.classList.remove('urgent');
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        if (hours > 0) {
            timerDisplay.textContent = `${hours}h`;
        } else if (minutes >= 10) {
            timerDisplay.textContent = `${minutes}m`;
        } else {
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (timeLeft < 30 * 60 * 1000) {
            timerBtn?.classList.add('urgent');
        }
    }

    // Storage methods (same as before but more compact)
    getLikes(productIndex) {
        const likes = JSON.parse(localStorage.getItem('productLikes') || '{}');
        return likes[productIndex] || Math.floor(Math.random() * 50) + 10;
    }

    setLikes(productIndex, count) {
        const likes = JSON.parse(localStorage.getItem('productLikes') || '{}');
        likes[productIndex] = count;
        localStorage.setItem('productLikes', JSON.stringify(likes));
    }

    isLiked(productIndex) {
        const liked = JSON.parse(localStorage.getItem('likedProducts') || '{}');
        return liked[productIndex] || false;
    }

    setLiked(productIndex, isLiked) {
        const liked = JSON.parse(localStorage.getItem('likedProducts') || '{}');
        liked[productIndex] = isLiked;
        localStorage.setItem('likedProducts', JSON.stringify(liked));
    }

    getComments(productIndex) {
        const comments = JSON.parse(localStorage.getItem('productComments') || '{}');
        if (!comments[productIndex]) {
            comments[productIndex] = this.getDefaultComments();
            localStorage.setItem('productComments', JSON.stringify(comments));
        }
        return comments[productIndex] || [];
    }

    getDefaultComments() {
        const defaultComments = [
            { author: 'Sarah', text: 'Great deal! 👍', date: '2d ago' },
            { author: 'Mike', text: 'Amazing quality!', date: '1d ago' },
            { author: 'Priya', text: 'Love it! ❤️', date: '5h ago' }
        ];
        
        const numComments = Math.floor(Math.random() * 3);
        return defaultComments.slice(0, numComments);
    }

    addComment(productIndex, text) {
        const comments = this.getComments(productIndex);
        const newComment = {
            author: 'You',
            text: text,
            date: 'now'
        };
        comments.unshift(newComment);
        
        const allComments = JSON.parse(localStorage.getItem('productComments') || '{}');
        allComments[productIndex] = comments;
        localStorage.setItem('productComments', JSON.stringify(allComments));
    }

    getTimerEndTime(productIndex) {
        const timers = JSON.parse(localStorage.getItem('productTimers') || '{}');
        return timers[productIndex];
    }

    setTimerEndTime(productIndex, endTime) {
        const timers = JSON.parse(localStorage.getItem('productTimers') || '{}');
        timers[productIndex] = endTime;
        localStorage.setItem('productTimers', JSON.stringify(timers));
    }

    loadStoredData() {
        setTimeout(() => {
            const liked = JSON.parse(localStorage.getItem('likedProducts') || '{}');
            Object.keys(liked).forEach(productIndex => {
                if (liked[productIndex]) {
                    const likeBtn = document.querySelector(`[data-product="${productIndex}"].like-compact-btn`);
                    likeBtn?.classList.add('active');
                }
            });
        }, 1500);
    }

    showCompactToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2874F0;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 2000);
    }
}

// Initialize compact features
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.compactProductFeatures = new CompactProductFeatures();
    }, 2000);
});














// Enhanced product data generator
function enhanceProductData(product) {
    const currentPriceMatch = product.price.match(/₹(\d+,?\d*)/);
    const currentPrice = currentPriceMatch ? parseInt(currentPriceMatch[1].replace(',', '')) : 999;
    
    const markup = 1.3 + (Math.random() * 0.7);
    const originalPrice = Math.round(currentPrice * markup);
    const savings = originalPrice - currentPrice;
    const discountPercent = Math.round((savings / originalPrice) * 100);
    
    const likes = Math.floor(Math.random() * 500) + 10;
    const shares = Math.floor(Math.random() * 100) + 5;
    
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
        isLimitedTime,
        isLowStock,
        stockCount
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

















// // Handle View All Hot Deals button
// function showAllHotDeals(event) {
//     event.preventDefault();
    
//     // Hide horizontal section
//     const horizontalSection = document.querySelector('.horizontal-deals-container');
//     const fullSection = document.getElementById('full-products-section');
    
//     if (horizontalSection && fullSection) {
//         horizontalSection.style.display = 'none';
//         fullSection.style.display = 'block';
        
//         // Scroll to full section
//         fullSection.scrollIntoView({ behavior: 'smooth' });
        
//         // Trigger full product rendering if needed
//         if (typeof renderProducts === 'function') {
//             renderProducts();
//         }
//     }
// }

// // Handle View All Loot Deals button  
// function showAllLootDeals(event) {
//     event.preventDefault();
    
//     // Hide horizontal section
//     const horizontalSection = document.querySelector('.horizontal-loot-container');
//     const fullSection = document.getElementById('full-loot-section');
    
//     if (horizontalSection && fullSection) {
//         horizontalSection.style.display = 'none';
//         fullSection.style.display = 'block';
        
//         // Scroll to full section
//         fullSection.scrollIntoView({ behavior: 'smooth' });
        
//         // Trigger loot deals rendering if the scroller exists
//         if (window.lootDealsScroller && typeof window.lootDealsScroller.showFullView === 'function') {
//             window.lootDealsScroller.showFullView();
//         }
//     }
// }

// // Handle back to preview buttons
// document.addEventListener('DOMContentLoaded', function() {
//     // Back to preview for hot deals
//     const backToPreviewBtn = document.getElementById('back-to-preview');
//     if (backToPreviewBtn) {
//         backToPreviewBtn.addEventListener('click', function() {
//             const horizontalSection = document.querySelector('.horizontal-deals-container');
//             const fullSection = document.getElementById('full-products-section');
            
//             if (horizontalSection && fullSection) {
//                 fullSection.style.display = 'none';
//                 horizontalSection.style.display = 'block';
                
//                 // Scroll back to deals section
//                 document.getElementById('deals').scrollIntoView({ behavior: 'smooth' });
//             }
//         });
//     }
    
//     // Back to preview for loot deals
//     const backToLootPreviewBtn = document.getElementById('back-to-loot-preview');
//     if (backToLootPreviewBtn) {
//         backToLootPreviewBtn.addEventListener('click', function() {
//             const horizontalSection = document.querySelector('.horizontal-loot-container');
//             const fullSection = document.getElementById('full-loot-section');
            
//             if (horizontalSection && fullSection) {
//                 fullSection.style.display = 'none';
//                 horizontalSection.style.display = 'block';
                
//                 // Scroll back to loot deals section
//                 document.getElementById('loot-deals').scrollIntoView({ behavior: 'smooth' });
//             }
//         });
//     }
// });














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
        const current = parseInt(priceMatch.replace(/₹|,/g, ''));
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
    
    Object.keys(likes).forEach(productId => {
        if (likes[productId]) {
            const likeBtn = document.querySelector(`[onclick*="${productId}"].likes-action`);
            if (likeBtn) {
                likeBtn.classList.add('active');
                likeBtn.querySelector('i').className = 'fas fa-thumbs-up';
            }
        }
    });
    
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
    }
}

function removeFromWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('thriftzone_wishlist') || '[]');
    wishlist = wishlist.filter(id => id !== productId);
    localStorage.setItem('thriftzone_wishlist', JSON.stringify(wishlist));
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

console.log('🎉 Thrift Zone JavaScript loaded successfully');
