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





















function createProductCard(product, index = 0) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', product.category);
    card.setAttribute('data-product-id', product.id); // Add this line
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    // Format date (your original logic)
    const date = new Date(product.posted_date);
    const formattedDate = date.toLocaleDateString('en-IN');
    
    // Enhanced product data
    const enhancedData = enhanceProductData(product);
    
    // Check if in wishlist
    const isInWishlist = window.wishlistManager ? window.wishlistManager.isInWishlist(product.id) : false;
    
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
                <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" 
                        data-product-id="${product.id}"
                        onclick="toggleWishlist('${product.id}', this)" 
                        title="Add to wishlist"
                        style="${isInWishlist ? 'color: #ef4444;' : ''}">
                    <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
        </div>
        
        <div class="product-info">
            <div class="product-category">${product.category}</div>
            
            <h3 class="product-title">${product.title}</h3>
            
            <div class="product-pricing">
                <div class="price-section">
                    <span class="price-current">₹${enhancedData.salePrice}</span>
                    <span class="price-original">₹${enhancedData.originalPrice}</span>
                    <span class="price-discount-badge">${enhancedData.discountPercent}% OFF</span>
                </div>
                <div class="savings-amount">You Save ₹${enhancedData.savings}</div>
            </div>
            
            <div class="product-urgency">
                ${enhancedData.isLowStock ? `<span class="stock-indicator">Only ${enhancedData.stockCount} left!</span>` : ''}
                ${enhancedData.isLimitedTime ? '<span class="limited-time-indicator">Limited Time Offer</span>' : ''}
            </div>
            
            <div class="deal-countdown">
                <span class="countdown-label">Expires:</span>
                <div class="countdown-timer" data-product-id="${product.id}">
                    <div class="countdown-unit">
                        <span class="countdown-number" data-hours>02</span>
                        <span class="countdown-text">h</span>
                    </div>
                    <div class="countdown-unit">
                        <span class="countdown-number" data-minutes>00</span>
                        <span class="countdown-text">m</span>
                    </div>
                    <div class="countdown-unit">
                        <span class="countdown-number" data-seconds>00</span>
                        <span class="countdown-text">s</span>
                    </div>
                </div>
            </div>
            
            <div class="product-social">
                <div class="social-actions">
                    <button class="social-action likes-action" onclick="toggleLike('${product.id}', this)">
                        <i class="far fa-thumbs-up"></i>
                        <span>${enhancedData.likes}</span>
                    </button>
                    <button class="social-action" onclick="shareProduct('${product.id}')">
                        <i class="fas fa-share"></i>
                        <span>${enhancedData.shares}</span>
                    </button>
                </div>
            </div>
            
            <div class="product-actions">
                <a href="${product.affiliate_link}" 
                   target="_blank" 
                   class="deal-btn" 
                   onclick="trackClick('${product.id}')"
                   rel="noopener noreferrer">
                    <i class="fas fa-bolt"></i>
                    <span>Grab Deal Now</span>
                </a>
                <div class="secondary-actions">
                    <button class="quick-action-btn" onclick="addToWishlist('${product.id}')" title="Save">
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

















// Add this to your existing js/script.js file

// Enhanced Wishlist Management System
class WishlistManager {
    constructor() {
        this.wishlistKey = 'thriftzone_wishlist';
        this.wishlist = this.loadWishlist();
        this.init();
    }

    init() {
        // Update wishlist UI on page load
        this.updateWishlistUI();
        
        // Listen for auth state changes
        if (window.thriftAuth) {
            // Check periodically if auth is ready
            const checkAuth = setInterval(() => {
                if (window.thriftAuth.isLoggedIn()) {
                    clearInterval(checkAuth);
                    this.updateWishlistUI();
                }
            }, 500);
        }
    }

    loadWishlist() {
        try {
            const saved = localStorage.getItem(this.wishlistKey);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading wishlist:', error);
            return [];
        }
    }

    saveWishlist() {
        try {
            localStorage.setItem(this.wishlistKey, JSON.stringify(this.wishlist));
            this.updateWishlistUI();
            this.showNotification('Wishlist updated!', 'success');
        } catch (error) {
            console.error('Error saving wishlist:', error);
            this.showNotification('Failed to save wishlist', 'error');
        }
    }

    addToWishlist(product) {
        // Check if user is logged in
        if (!window.thriftAuth || !window.thriftAuth.isLoggedIn()) {
            this.showNotification('Please login to add items to wishlist', 'warning');
            if (window.thriftAuth) {
                window.thriftAuth.showLoginModal();
            }
            return false;
        }

        // Check if product already in wishlist
        const existingIndex = this.wishlist.findIndex(item => item.id === product.id);
        
        if (existingIndex !== -1) {
            // Remove from wishlist
            this.wishlist.splice(existingIndex, 1);
            this.saveWishlist();
            this.showNotification('Removed from wishlist', 'info');
            return false;
        } else {
            // Add to wishlist
            const wishlistItem = {
                id: product.id,
                title: product.title,
                image: product.image,
                category: product.category,
                salePrice: this.extractPrice(product.price),
                originalPrice: this.extractOriginalPrice(product.price),
                affiliate_link: product.affiliate_link,
                added_at: new Date().toISOString()
            };

            this.wishlist.push(wishlistItem);
            this.saveWishlist();
            this.showNotification('Added to wishlist!', 'success');
            return true;
        }
    }

    removeFromWishlist(productId) {
        const index = this.wishlist.findIndex(item => item.id === productId);
        if (index !== -1) {
            this.wishlist.splice(index, 1);
            this.saveWishlist();
            this.showNotification('Removed from wishlist', 'info');
            return true;
        }
        return false;
    }

    isInWishlist(productId) {
        return this.wishlist.some(item => item.id === productId);
    }

    getWishlist() {
        return this.wishlist;
    }

    getWishlistCount() {
        return this.wishlist.length;
    }

    clearWishlist() {
        this.wishlist = [];
        localStorage.removeItem(this.wishlistKey);
        this.updateWishlistUI();
        this.showNotification('Wishlist cleared', 'info');
    }

    extractPrice(priceText) {
        // Extract numeric value from price text like "₹1,299" or "₹1299"
        const match = priceText.replace(/[₹,]/g, '').match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    }

    extractOriginalPrice(priceText) {
        // For demo purposes, assume original price is 20-40% higher
        const salePrice = this.extractPrice(priceText);
        return Math.round(salePrice * (1 + Math.random() * 0.4 + 0.2));
    }

    updateWishlistUI() {
        // Update wishlist count in header/profile
        const wishlistCount = this.getWishlistCount();
        
        // Update product card wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const productId = btn.dataset.productId || btn.closest('.product-card')?.dataset.productId;
            if (productId) {
                const isWishlisted = this.isInWishlist(productId);
                const icon = btn.querySelector('i');
                
                if (isWishlisted) {
                    icon.className = 'fas fa-heart';
                    btn.classList.add('active');
                    btn.style.color = '#ef4444';
                } else {
                    icon.className = 'far fa-heart';
                    btn.classList.remove('active');
                    btn.style.color = '';
                }
            }
        });

        // Update wishlist count displays
        document.querySelectorAll('.wishlist-count').forEach(element => {
            element.textContent = wishlistCount;
        });

        // Dispatch custom event for wishlist page to listen
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
            detail: { wishlist: this.wishlist, count: wishlistCount } 
        }));
    }

    showNotification(message, type = 'info') {
        if (window.thriftAuth && window.thriftAuth.showNotification) {
            window.thriftAuth.showNotification(message, type);
        } else {
            // Fallback notification
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Global wishlist instance
window.wishlistManager = new WishlistManager();

// Global function for product cards
function toggleWishlist(productId, buttonElement) {
    // Get product data from the card
    const card = buttonElement.closest('.product-card');
    if (!card) return;

    const product = {
        id: productId,
        title: card.querySelector('.product-title')?.textContent || 'Unknown Product',
        image: card.querySelector('.product-image')?.src || card.querySelector('.product-placeholder')?.innerHTML || '',
        category: card.dataset.category || 'general',
        price: card.querySelector('.product-current')?.textContent || '₹0',
        affiliate_link: card.querySelector('.deal-btn')?.href || '#'
    };

    const added = window.wishlistManager.addToWishlist(product);
    
    // Update button appearance immediately
    const icon = buttonElement.querySelector('i');
    if (added) {
        icon.className = 'fas fa-heart';
        buttonElement.classList.add('active');
        buttonElement.style.color = '#ef4444';
    } else {
        icon.className = 'far fa-heart';
        buttonElement.classList.remove('active');
        buttonElement.style.color = '';
    }
}

















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
