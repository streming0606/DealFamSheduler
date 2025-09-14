// Thrift Zone - Enhanced JavaScript with preserved functionality
// Your existing bot integration and update logic remain unchanged

// Global variables (preserved from your original code)
let allProducts = [];
let displayedProducts = 0;
const productsPerPage = 12;
let currentFilter = 'all';
let currentSort = 'latest';

// DOM Elements
const productsContainer = document.getElementById('products-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryCards = document.querySelectorAll('.category-card');
const totalDealsSpan = document.getElementById('total-deals');
const sortSelect = document.getElementById('sort-select');
const viewToggle = document.getElementById('view-toggle');





// // Initialize the website (preserving your original initialization)
// document.addEventListener('DOMContentLoaded', function() {
//     loadProducts(); // Your existing function
//     setupEventListeners();
//     updateLastRefresh();
//     initializeEnhancements(); // New enhancements
// });







// Update your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    loadProducts(); // Load products first
    setupEventListeners();
    updateLastRefresh();
    initializeEnhancements();
    initializeBannerSlider();
    
    // Initialize search after a short delay to ensure products are loaded
    setTimeout(() => {
        initializeSearch();
    }, 1000);
});













// Your original loadProducts function (UNCHANGED)
async function loadProducts() {
    try {
        showLoadingState();
        const response = await fetch('data/products.json');
        const data = await response.json();
        allProducts = data.products || [];
        
        renderProducts();
        updateCategoryCounts();
        updateTotalDeals();
        
    } catch (error) {
        console.error('Error loading products:', error);
        showErrorMessage();
    }
}

// Enhanced renderProducts function (preserving your original logic)
function renderProducts() {
    const filteredProducts = getFilteredProducts();
    const sortedProducts = sortProducts(filteredProducts);
    const productsToShow = sortedProducts.slice(0, displayedProducts + productsPerPage);
    
    if (productsToShow.length === 0) {
        showEmptyState();
        return;
    }
    
    productsContainer.innerHTML = '';
    
    productsToShow.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        productsContainer.appendChild(productCard);
        
        // Add entrance animation
        setTimeout(() => {
            productCard.style.opacity = '1';
            productCard.style.transform = 'translateY(0)';
        }, index * 50);
    });
    
    displayedProducts = productsToShow.length;
    
    // Update load more button (your original logic)
    if (displayedProducts >= filteredProducts.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
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
        
        // Add event listeners
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Auto slide
        this.startAutoSlide();
        
        // Pause auto slide on hover
        const heroSlider = document.querySelector('.hero-slider');
        if (heroSlider) {
            heroSlider.addEventListener('mouseenter', () => this.stopAutoSlide());
            heroSlider.addEventListener('mouseleave', () => this.startAutoSlide());
        }
        
        // Touch/Swipe support for mobile
        this.addTouchSupport();
    }
    
    goToSlide(slideIndex) {
        // Remove active class from current slide and dot
        this.slides[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');
        
        // Update current slide
        this.currentSlide = slideIndex;
        
        // Add active class to new slide and dot
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
        }, 5000); // Change slide every 5 seconds
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

// Add to your existing initialization
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    updateLastRefresh();
    initializeEnhancements();
    initializeBannerSlider(); // Add this line
});





















// Enhanced Product Card Functions
function createProductCard(product, index = 0) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', product.category);
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    // Format date (your original logic)
    const date = new Date(product.posted_date);
    const formattedDate = date.toLocaleDateString('en-IN');
    
    // Enhanced product data
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
            
            <div class="product-urgency">
                ${enhancedData.isLowStock ? `<div class="stock-indicator">Only ${enhancedData.stockCount} left!</div>` : ''}
                ${enhancedData.isLimitedTime ? '<div class="limited-time-indicator">Limited Time Offer</div>' : ''}
            </div>
            
            <div class="deal-countdown">
                <div class="countdown-label">Deal Expires In</div>
                <div class="countdown-timer" data-product-id="${product.id}">
                    <div class="countdown-unit">
                        <div class="countdown-number" data-hours>02</div>
                        <div class="countdown-text">Hours</div>
                    </div>
                    <div class="countdown-unit">
                        <div class="countdown-number" data-minutes>00</div>
                        <div class="countdown-text">Mins</div>
                    </div>
                    <div class="countdown-unit">
                        <div class="countdown-number" data-seconds>00</div>
                        <div class="countdown-text">Secs</div>
                    </div>
                </div>
            </div>
            
            <div class="product-social">
                <div class="social-actions">
                    <div class="social-action likes-action" onclick="toggleLike('${product.id}', this)">
                        <i class="far fa-thumbs-up"></i>
                        <span>${enhancedData.likes}</span>
                    </div>
                    <div class="social-action" onclick="shareProduct('${product.id}')">
                        <i class="fas fa-share"></i>
                        <span>${enhancedData.shares}</span>
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
    
    return card;
}





















// Enhanced product data generator
function enhanceProductData(product) {
    // Extract current price from product.price
    const currentPriceMatch = product.price.match(/₹(\d+,?\d*)/);
    const currentPrice = currentPriceMatch ? parseInt(currentPriceMatch[1].replace(',', '')) : 999;
    
    // Calculate enhanced pricing
    const markup = 1.3 + (Math.random() * 0.7); // 30-100% markup for original price
    const originalPrice = Math.round(currentPrice * markup);
    const savings = originalPrice - currentPrice;
    const discountPercent = Math.round((savings / originalPrice) * 100);
    
    // Generate random social proof
    const likes = Math.floor(Math.random() * 500) + 10; // 10-510 likes
    const shares = Math.floor(Math.random() * 100) + 5; // 5-105 shares
    
    // Random features
    const isLimitedTime = Math.random() > 0.6; // 40% chance
    const isLowStock = Math.random() > 0.7; // 30% chance
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

// Countdown timer functionality
function initializeCountdowns() {
    const countdowns = document.querySelectorAll('.countdown-timer');
    
    countdowns.forEach(countdown => {
        const productId = countdown.dataset.productId;
        startCountdown(countdown, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
    });
}

function startCountdown(element, duration) {
    const hoursEl = element.querySelector('[data-hours]');
    const minutesEl = element.querySelector('[data-minutes]');
    const secondsEl = element.querySelector('[data-seconds]');
    
    let timeLeft = duration;
    
    const timer = setInterval(() => {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
        
        timeLeft -= 1000;
        
        if (timeLeft < 0) {
            clearInterval(timer);
            // Handle expired deal
            element.closest('.product-card').classList.add('deal-expired');
            element.innerHTML = '<div style="color: #ef4444; font-weight: 700;">Deal Expired</div>';
        }
    }, 1000);
}

// Social interaction functions
function toggleLike(productId, element) {
    const isLiked = element.classList.contains('active');
    const countSpan = element.querySelector('span');
    const currentCount = parseInt(countSpan.textContent);
    
    if (isLiked) {
        element.classList.remove('active');
        element.querySelector('i').className = 'far fa-thumbs-up';
        countSpan.textContent = currentCount - 1;
    } else {
        element.classList.add('active');
        element.querySelector('i').className = 'fas fa-thumbs-up';
        countSpan.textContent = currentCount + 1;
        element.classList.add('action-success');
        setTimeout(() => element.classList.remove('action-success'), 600);
    }
    
    // Store like state
    const likes = JSON.parse(localStorage.getItem('thriftzone_likes') || '{}');
    likes[productId] = !isLiked;
    localStorage.setItem('thriftzone_likes', JSON.stringify(likes));
}

// Enhanced share function
function shareProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const shareData = {
        title: `Amazing Deal: ${product.title}`,
        text: `🔥 ${product.title}\n💰 ${product.price}\n⚡ Limited Time Offer!`,
        url: product.affiliate_link
    };
    
    if (navigator.share && navigator.canShare(shareData)) {
        navigator.share(shareData);
    } else {
        // Fallback - copy to clipboard
        const shareText = `${shareData.text}\n${shareData.url}`;
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('🎉 Deal link copied to clipboard!');
            
            // Increment share count
            const shareBtn = event.target.closest('.social-action');
            const countSpan = shareBtn.querySelector('span');
            countSpan.textContent = parseInt(countSpan.textContent) + 1;
            
            shareBtn.classList.add('action-success');
            setTimeout(() => shareBtn.classList.remove('action-success'), 600);
        });
    }
}

// Initialize enhanced features
function initializeEnhancedCards() {
    // Initialize countdowns after products are rendered
    setTimeout(() => {
        initializeCountdowns();
        loadUserPreferences();
    }, 500);
}

// Load user preferences for likes/saves
function loadUserPreferences() {
    const likes = JSON.parse(localStorage.getItem('thriftzone_likes') || '{}');
    const wishlist = JSON.parse(localStorage.getItem('thriftzone_wishlist') || '[]');
    
    // Apply saved likes
    Object.keys(likes).forEach(productId => {
        if (likes[productId]) {
            const likeBtn = document.querySelector(`[onclick*="${productId}"].likes-action`);
            if (likeBtn) {
                likeBtn.classList.add('active');
                likeBtn.querySelector('i').className = 'fas fa-thumbs-up';
            }
        }
    });
    
    // Apply saved wishlist items
    wishlist.forEach(productId => {
        const wishlistBtn = document.querySelector(`[onclick*="${productId}"].wishlist-btn`);
        if (wishlistBtn) {
            wishlistBtn.classList.add('active');
            wishlistBtn.querySelector('i').className = 'fas fa-heart';
        }
    });
}

// Add to existing renderProducts function
const originalRenderProducts = window.renderProducts;
window.renderProducts = function() {
    originalRenderProducts.call(this);
    initializeEnhancedCards();
};



// SIMPLE TEST VERSION - Add this temporarily
function testTestimonials() {
    const testimonialsGrid = document.getElementById('testimonials-grid');
    if (testimonialsGrid) {
        testimonialsGrid.innerHTML = `
            <div class="testimonial-card">
                <div class="testimonial-avatar">
                    <img src="https://via.placeholder.com/80" alt="Test User">
                </div>
                <div class="testimonial-info">
                    <div class="testimonial-name">Test User</div>
                    <div class="testimonial-location">Test Location</div>
                </div>
                <div class="testimonial-rating">
                    <i class="fas fa-star testimonial-star"></i>
                    <i class="fas fa-star testimonial-star"></i>
                    <i class="fas fa-star testimonial-star"></i>
                    <i class="fas fa-star testimonial-star"></i>
                    <i class="fas fa-star testimonial-star"></i>
                </div>
                <div class="testimonial-text">
                    This is a test testimonial to check if the section is working properly.
                </div>
                <div class="testimonial-savings">
                    ₹10,000 saved
                </div>
            </div>
        `;
        console.log('Test testimonial loaded');
    } else {
        console.log('Testimonials grid element not found');
    }
}

// Test immediately
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(testTestimonials, 500);
});




















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
        
        // Don't auto-init in constructor
    }
    
    init() {
        if (!this.horizontalContainer || this.isInitialized) return;
        
        console.log('Initializing horizontal scroller...');
        this.setupEventListeners();
        this.isInitialized = true;
        
        // Render immediately if products are available
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
            console.log('Cannot render: missing container or products');
            return;
        }
        
        console.log('Rendering horizontal products:', allProducts.length);
        
        // Clear loading state
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
            
            // Entrance animation
            setTimeout(() => {
                productCard.style.opacity = '1';
                productCard.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        this.updateDealsCount(filteredProducts.length);
        
        // Update scroll buttons after rendering
        setTimeout(() => this.updateScrollButtons(), 200);
        
        console.log('Horizontal products rendered successfully');
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
        // Simple discount calculation - can be enhanced
        return Math.floor(Math.random() * 50) + 10; // 10-60% random discount
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
        console.log('View All Deals clicked - Opening dedicated page');
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

// FIXED: Initialize horizontal scroller properly
let horizontalScroller = null;

// FIXED: Update your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Initialize horizontal scroller first
    horizontalScroller = new HorizontalDealsScroller();
    
    // Load products and setup everything else
    loadProducts();
    setupEventListeners();
    updateLastRefresh();
    initializeEnhancements();
    initializeBannerSlider();
    
    // Initialize search after a delay
    setTimeout(() => {
        initializeSearch();
    }, 1000);
});

// FIXED: Override renderProducts to work properly with horizontal scroller
function renderProducts() {
    console.log('renderProducts called');
    
    // Handle horizontal mode
    if (horizontalScroller && horizontalScroller.horizontalContainer) {
        horizontalScroller.refresh();
        return;
    }
    
    // Handle regular grid mode (fallback)
    const filteredProducts = getFilteredProducts();
    const sortedProducts = sortProducts(filteredProducts);
    const productsToShow = sortedProducts.slice(0, displayedProducts + productsPerPage);
    
    const container = document.getElementById('products-container');
    if (!container) return;
    
    if (productsToShow.length === 0) {
        showEmptyState();
        return;
    }
    
    container.innerHTML = '';
    
    productsToShow.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        container.appendChild(productCard);
        
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
    
    // Initialize enhanced features
    initializeEnhancedCards();
}

// FIXED: Update loadProducts function to properly initialize horizontal scroller
async function loadProducts() {
    try {
        console.log('Loading products...');
        
        // Show loading state for horizontal container
        if (horizontalScroller && horizontalScroller.horizontalContainer) {
            horizontalScroller.horizontalContainer.innerHTML = `
                <div class="loading-state" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    grid-column: 1 / -1;
                ">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                    </div>
                    <p style="margin-top: 1rem; color: var(--text-secondary);">Loading amazing deals...</p>
                </div>
            `;
        }
        
        const response = await fetch('data/products.json');
        const data = await response.json();
        allProducts = data.products || [];
        
        console.log('Products loaded:', allProducts.length);
        
        // Initialize horizontal scroller if not already initialized
        if (horizontalScroller && !horizontalScroller.isInitialized) {
            horizontalScroller.init();
        }
        
        // Render products
        renderProducts();
        updateCategoryCounts();
        updateTotalDeals();
        
        console.log('Products rendering complete');
        
    } catch (error) {
        console.error('Error loading products:', error);
        
        // Show error state
        if (horizontalScroller && horizontalScroller.horizontalContainer) {
            horizontalScroller.horizontalContainer.innerHTML = `
                <div class="error-state" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    grid-column: 1 / -1;
                    color: var(--error);
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <h3>Unable to load deals</h3>
                    <p>Please try refreshing the page</p>
                    <button onclick="loadProducts()" style="
                        margin-top: 1rem;
                        padding: 0.5rem 1rem;
                        background: var(--primary-color);
                        color: white;
                        border: none;
                        border-radius: var(--radius);
                        cursor: pointer;
                    ">
                        <i class="fas fa-refresh"></i>
                        Try Again
                    </button>
                </div>
            `;
        }
    }
}




















// 💸 LOOT DEALS FINDS - HORIZONTAL SCROLLING WITH PRICE FILTER
class LootDealsScroller {
    constructor() {
        // DOM ELEMENTS - CHANGE IDs HERE IF NEEDED
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
        
        // CONFIGURATION - MODIFY THESE VALUES AS NEEDED
        this.isHorizontalMode = true;
        this.scrollAmount = 300; // CHANGE SCROLL DISTANCE HERE
        this.maxHorizontalItems = 8; // CHANGE MAX ITEMS IN HORIZONTAL VIEW HERE
        this.currentPriceLimit = 500; // DEFAULT PRICE LIMIT - CHANGE HERE
        this.displayedLootProducts = 0; // TRACK DISPLAYED PRODUCTS IN FULL VIEW
        this.lootProductsPerPage = 12; // PRODUCTS PER PAGE IN FULL VIEW - CHANGE HERE
        
        this.init();
    }
    
    init() {
        if (!this.horizontalContainer) return;
        
        // SETUP EVENT LISTENERS
        this.scrollLeftBtn?.addEventListener('click', () => this.scrollLeft());
        this.scrollRightBtn?.addEventListener('click', () => this.scrollRight());
        this.viewAllBtn?.addEventListener('click', () => this.showFullView());
        this.backToPreviewBtn?.addEventListener('click', () => this.showHorizontalView());
        this.loadMoreBtn?.addEventListener('click', () => this.loadMoreLootProducts());
        
        // PRICE FILTER BUTTONS EVENT LISTENERS
        this.setupPriceFilterButtons();
        
        // UPDATE SCROLL BUTTON STATES ON SCROLL
        this.horizontalContainer.addEventListener('scroll', () => this.updateScrollButtons());
        
        // INITIALIZE WITH HORIZONTAL VIEW
        this.showHorizontalView();
    }
    
    // SETUP PRICE FILTER BUTTONS - ADD NEW PRICE RANGES HERE
    setupPriceFilterButtons() {
        // HORIZONTAL VIEW PRICE FILTERS
        const horizontalFilters = document.querySelectorAll('.loot-price-filter .price-filter-btn');
        horizontalFilters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // REMOVE ACTIVE CLASS FROM ALL BUTTONS
                horizontalFilters.forEach(b => b.classList.remove('active'));
                // ADD ACTIVE CLASS TO CLICKED BUTTON
                e.target.classList.add('active');
                // UPDATE PRICE LIMIT
                this.currentPriceLimit = parseInt(e.target.dataset.priceLimit);
                // REFRESH HORIZONTAL VIEW
                this.renderHorizontalLootProducts();
            });
        });
        
        // FULL VIEW PRICE FILTERS
        const fullViewFilters = document.querySelectorAll('.loot-price-filter-full .price-filter-btn');
        fullViewFilters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                fullViewFilters.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPriceLimit = parseInt(e.target.dataset.priceLimit);
                this.displayedLootProducts = 0; // RESET PAGINATION
                this.renderFullLootProducts();
            });
        });
    }
    
    // GET FILTERED LOOT PRODUCTS - MODIFY FILTERING LOGIC HERE
    getFilteredLootProducts() {
        return allProducts.filter(product => {
            // EXTRACT PRICE FROM PRODUCT - MODIFY PRICE EXTRACTION IF NEEDED
            const price = this.extractPrice(product.price);
            
            // FILTER BY PRICE LIMIT - CHANGE CONDITION HERE IF NEEDED
            return price > 0 && price <= this.currentPriceLimit;
        });
    }





    
    // // EXTRACT PRICE FROM PRODUCT STRING - MODIFY IF PRICE FORMAT CHANGES
    // extractPrice(priceString) {
    //     // HANDLE DIFFERENT PRICE FORMATS
    //     const match = priceString.match(/₹(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
    //     return match ? parseInt(match[1].replace(/,/g, '')) : 0;
    // }

// FIXED PRICE EXTRACTION - HANDLES MULTIPLE FORMATS
extractPrice(priceString) {
    console.log("🔍 Extracting price from:", priceString); // DEBUG LOG
    
    // HANDLE DIFFERENT PRICE FORMATS - MODIFY THESE PATTERNS IF NEEDED
    const patterns = [
        /₹(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,  // Standard ₹123 or ₹1,234
        /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,   // Just numbers 123 or 1,234
        /Rs\.?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // Rs. 123 format
    ];
    
    let prices = [];
    
    // TRY EACH PATTERN TO EXTRACT ALL PRICES
    for (let pattern of patterns) {
        const matches = priceString.match(pattern);
        if (matches) {
            prices = matches.map(match => {
                const numStr = match.replace(/₹|Rs\.?|,|\s/gi, '');
                return parseInt(numStr);
            }).filter(price => price > 0);
            break;
        }
    }
    
    console.log("💰 Extracted prices:", prices); // DEBUG LOG
    
    // RETURN THE FIRST (CURRENT) PRICE - MODIFY LOGIC HERE IF NEEDED
    const currentPrice = prices.length > 0 ? prices : 0;
    console.log("✅ Using price:", currentPrice); // DEBUG LOG
    
    return currentPrice;
}


    






    
    
    // SORT LOOT PRODUCTS - MODIFY SORTING LOGIC HERE
    sortLootProducts(products) {
        return products.sort((a, b) => {
            // PRIMARY SORT: HIGHEST DISCOUNT FIRST - CHANGE SORTING HERE
            const discountA = this.calculateDiscountPercentage(a.price);
            const discountB = this.calculateDiscountPercentage(b.price);
            
            if (discountB !== discountA) {
                return discountB - discountA; // HIGHEST DISCOUNT FIRST
            }
            
            // SECONDARY SORT: LOWEST PRICE FIRST
            const priceA = this.extractPrice(a.price);
            const priceB = this.extractPrice(b.price);
            return priceA - priceB; // LOWEST PRICE FIRST
        });
    }
    
    // CALCULATE DISCOUNT PERCENTAGE - MODIFY DISCOUNT CALCULATION HERE
    calculateDiscountPercentage(priceString) {
        const prices = priceString.match(/₹(\d{1,3}(?:,\d{3})*)/g);
        if (prices && prices.length >= 2) {
            const current = parseInt(prices[0].replace(/₹|,/g, ''));
            const original = parseInt(prices[1].replace(/₹|,/g, ''));
            if (original > current) {
                return Math.round(((original - current) / original) * 100);
            }
        }
        // DEFAULT DISCOUNT FOR BUDGET ITEMS - CHANGE DEFAULT HERE
        return Math.floor(Math.random() * 30) + 10; // 10-40% random discount
    }
    
    // RENDER HORIZONTAL LOOT PRODUCTS
    renderHorizontalLootProducts() {
        if (!this.horizontalContainer) return;
        
        const filteredProducts = this.getFilteredLootProducts();
        const sortedProducts = this.sortLootProducts(filteredProducts);
        const productsToShow = sortedProducts.slice(0, this.maxHorizontalItems);
        
        console.log(`🔍 Found ${filteredProducts.length} products under ₹${this.currentPriceLimit}`); // DEBUG LOG
        
        this.horizontalContainer.innerHTML = '';
        
        if (productsToShow.length === 0) {
            this.horizontalContainer.innerHTML = `
                <div class="loot-empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No deals found under ₹${this.currentPriceLimit}</h3>
                    <p>Try increasing the price limit or check back later!</p>
                </div>
            `;
            this.updateLootCount(0);
            return;
        }
        
        // CREATE PRODUCT CARDS
        productsToShow.forEach((product, index) => {
            const productCard = createProductCard(product, index);
            // ADD SPECIAL LOOT DEALS STYLING - MODIFY STYLING HERE
            productCard.classList.add('loot-deal-card');
            this.horizontalContainer.appendChild(productCard);
            
            // ENTRANCE ANIMATION - CHANGE ANIMATION TIMING HERE
            setTimeout(() => {
                productCard.style.opacity = '1';
                productCard.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        // UPDATE DEALS COUNT
        this.updateLootCount(filteredProducts.length);
        
        // UPDATE SCROLL BUTTONS
        setTimeout(() => this.updateScrollButtons(), 100);
    }
    
    // RENDER FULL LOOT PRODUCTS VIEW
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
        
        // UPDATE LOAD MORE BUTTON
        if (this.displayedLootProducts >= filteredProducts.length) {
            this.loadMoreBtn.style.display = 'none';
        } else {
            this.loadMoreBtn.style.display = 'block';
        }
    }
    
    // LOAD MORE LOOT PRODUCTS
    loadMoreLootProducts() {
        this.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        setTimeout(() => {
            this.renderFullLootProducts();
            this.loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Loot Deals';
        }, 500);
    }
    
    // SCROLL FUNCTIONS - MODIFY SCROLL BEHAVIOR HERE
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
    
    // UPDATE SCROLL BUTTONS STATE
    updateScrollButtons() {
        const container = this.horizontalContainer;
        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (this.scrollLeftBtn) {
            this.scrollLeftBtn.disabled = scrollLeft <= 0;
        }
        
        if (this.scrollRightBtn) {
            this.scrollRightBtn.disabled = scrollLeft >= maxScroll;
        }
    }
    
    // SHOW FULL VIEW
    showFullView() {
        this.isHorizontalMode = false;
        this.horizontalSection.style.display = 'none';
        this.fullSection.style.display = 'block';
        
        this.displayedLootProducts = 0;
        this.renderFullLootProducts();
        
        this.fullSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // SHOW HORIZONTAL VIEW
    showHorizontalView() {
        this.isHorizontalMode = true;
        this.horizontalSection.style.display = 'block';
        this.fullSection.style.display = 'none';
        
        this.renderHorizontalLootProducts();
        
        document.getElementById('loot-deals').scrollIntoView({ behavior: 'smooth' });
    }
    
    // UPDATE LOOT DEALS COUNT
    updateLootCount(count) {
        if (this.lootCountSpan) {
            this.lootCountSpan.textContent = `${count} deals`;
        }
    }
    
    // PUBLIC METHOD TO REFRESH LOOT PRODUCTS
    refresh() {
        if (this.isHorizontalMode) {
            this.renderHorizontalLootProducts();
        } else {
            this.renderFullLootProducts();
        }
    }
}

// INITIALIZE LOOT DEALS SCROLLER
let lootDealsScroller = null;

// UPDATE YOUR EXISTING DOMContentLoaded EVENT LISTENER
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    updateLastRefresh();
    initializeEnhancements();
    initializeBannerSlider();
    
    // INITIALIZE BOTH SCROLLERS
    setTimeout(() => {
        horizontalScroller = new HorizontalDealsScroller();
        lootDealsScroller = new LootDealsScroller(); // ADD THIS LINE
        initializeSearch();
    }, 1000);
});

// UPDATE RENDER PRODUCTS TO REFRESH BOTH SECTIONS
const originalRenderProducts2 = renderProducts;
renderProducts = function() {
    if (horizontalScroller) {
        horizontalScroller.refresh();
    }
    if (lootDealsScroller) {
        lootDealsScroller.refresh(); // ADD THIS LINE
    }
    if (!horizontalScroller && !lootDealsScroller) {
        originalRenderProducts2.call(this);
    }
    initializeEnhancedCards();
};


























// Your original getFilteredProducts function (UNCHANGED)
function getFilteredProducts() {
    if (currentFilter === 'all') {
        return allProducts;
    }
    return allProducts.filter(product => 
        product.category.toLowerCase() === currentFilter
    );
}

// New sorting function
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

// Enhanced setupEventListeners (preserving your original logic)
function setupEventListeners() {
    // Filter buttons (your original logic preserved)
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            displayedProducts = 0;
            renderProducts();
        });
    });
    
    // Load more button (your original logic preserved)
    loadMoreBtn.addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        setTimeout(() => {
            renderProducts();
            this.innerHTML = '<i class="fas fa-plus"></i> Load More Deals';
        }, 500);
    });
    
    // Category cards (your original logic preserved)
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterByCategory(category);
        });
    });
    
    // Enhanced navigation with smooth scrolling
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                // Close mobile nav if open
                closeMobileNav();
                // Update active nav link
                updateActiveNavLink(this);
            }
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
    
    // Mobile navigation
    setupMobileNavigation();
}

// Your original filterByCategory function (UNCHANGED)
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
    
    // Scroll to deals section
    document.getElementById('deals').scrollIntoView({ behavior: 'smooth' });
}

// Your original updateCategoryCounts function (UNCHANGED)
function updateCategoryCounts() {
    categoryCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const count = allProducts.filter(p => 
            p.category.toLowerCase() === category
        ).length;
        
        const countSpan = card.querySelector('.deal-count');
        countSpan.textContent = `${count} deals`;
    });
}

// Your original updateTotalDeals function (UNCHANGED)
function updateTotalDeals() {
    if (totalDealsSpan) {
        totalDealsSpan.textContent = allProducts.length;
    }
}

// Your original trackClick function (UNCHANGED - preserves analytics)
function trackClick(productId) {
    console.log(`Product clicked: ${productId}`);
    // Your analytics tracking remains here
    
    // Add click animation
    event.target.style.transform = 'scale(0.95)';
    setTimeout(() => {
        event.target.style.transform = 'scale(1)';
    }, 150);
}

// Enhanced loading, empty, and error states
function showLoadingState() {
    productsContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner">
                <div class="spinner"></div>
            </div>
            <p>Loading amazing deals...</p>
        </div>
    `;
    loadMoreBtn.style.display = 'none';
}

function showEmptyState() {
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
    loadMoreBtn.style.display = 'none';
}

function showErrorMessage() {
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
    loadMoreBtn.style.display = 'none';
}

// Your original updateLastRefresh function (UNCHANGED)
function updateLastRefresh() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN');
    console.log(`Last updated: ${timeString}`);
}

// Your original auto-refresh (UNCHANGED - preserves GitHub Actions integration)
setInterval(loadProducts, 5 * 60 * 1000);

// New helper functions for enhanced features
function initializeEnhancements() {
    // Initialize theme
    initializeTheme();
    
    // Initialize search
    initializeSearch();
    
    // Add scroll effects
    initializeScrollEffects();
    
    // Initialize animations
    initializeAnimations();
}

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

function generateRatingStars(ratingString) {
    const match = ratingString.match(/\((\d+\.?\d*)\)/);
    const rating = match ? parseFloat(match[1]) : 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star rating-star"></i>';
    }
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt rating-star"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star rating-star empty"></i>';
    }
    
    return starsHTML;
}

function extractRatingText(ratingString) {
    const match = ratingString.match(/\((\d+\.?\d*)\)/);
    return match ? `(${match[1]})` : '';
}

function isNewProduct(dateString) {
    const productDate = new Date(dateString);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return productDate > oneDayAgo;
}

function shouldShowCountdown(dateString) {
    const productDate = new Date(dateString);
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
    return productDate > sixHoursAgo;
}

function createCountdownTimer(dateString) {
    const productDate = new Date(dateString);
    const expiryDate = new Date(productDate.getTime() + (24 * 60 * 60 * 1000)); // 24 hours later
    const timerId = 'timer_' + Date.now() + Math.random();
    
    setTimeout(() => {
        updateCountdown(timerId, expiryDate);
    }, 100);
    
    return `
        <div class="countdown-timer">
            <span class="timer-label">Deal expires in:</span>
            <span class="timer-value" id="${timerId}">Loading...</span>
        </div>
    `;
}

function updateCountdown(timerId, expiryDate) {
    const timer = document.getElementById(timerId);
    if (!timer) return;
    
    function tick() {
        const now = new Date().getTime();
        const distance = expiryDate.getTime() - now;
        
        if (distance < 0) {
            timer.parentElement.innerHTML = '<div class="countdown-timer" style="background: #666;"><span class="timer-label">Deal Expired</span></div>';
            return;
        }
        
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        timer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        setTimeout(tick, 1000);
    }
    
    tick();
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
    
    // Close mobile nav when clicking outside
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

function updateActiveNavLink(clickedLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const href = clickedLink.getAttribute('href');
    document.querySelectorAll(`[href="${href}"]`).forEach(link => {
        if (link.classList.contains('nav-link')) {
            link.classList.add('active');
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
    
    // Add animation
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

// Share functionality
function shareProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const shareData = {
        title: `Thrift Zone - ${product.title}`,
        text: `Check out this amazing deal: ${product.title} at ${product.price}`,
        url: product.affiliate_link
    };
    
    if (navigator.share) {
        navigator.share(shareData);
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`).then(() => {
            showNotification('Link copied to clipboard!');
        });
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 1002;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Utility functions for scroll effects
function initializeScrollEffects() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header hide/show on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop;
        
        // Add scrolled class for styling
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function initializeAnimations() {
    // Add CSS for new animations
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

// Smooth utility functions for hero section
function scrollToDeals() {
    document.getElementById('deals').scrollIntoView({ behavior: 'smooth' });
}

function scrollToCategories() {
    document.getElementById('categories').scrollIntoView({ behavior: 'smooth' });
}
