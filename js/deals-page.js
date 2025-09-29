// Dedicated Deals Page JavaScript - FIXED VERSION
class DealsPageManager {
    constructor() {
        this.currentFilter = 'all';
        this.currentSort = 'latest';
        this.displayedProducts = 0;
        this.productsPerPage = 12;
        this.allProducts = [];
        
        this.init();
    }
    
    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.setupBackToTop();
        this.updateLastRefreshed();
        
        // Initialize compact features for deals page
        setTimeout(() => {
            this.initializeCompactFeatures();
        }, 1000);
        
        // Auto refresh every 5 minutes
        setInterval(() => {
            this.loadProducts();
            this.updateLastRefreshed();
        }, 5 * 60 * 1000);
    }
    
    async loadProducts() {
        try {
            this.showLoadingState();
            const response = await fetch('../data/products.json');
            const data = await response.json();
            this.allProducts = data.products || [];
            
            this.renderProducts();
            this.updateStats();
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.showErrorState();
        }
    }
    
    renderProducts() {
        const container = document.getElementById('products-container');
        if (!container) return;
        
        const filteredProducts = this.getFilteredProducts();
        const sortedProducts = this.sortProducts(filteredProducts);
        const productsToShow = sortedProducts.slice(0, this.displayedProducts + this.productsPerPage);
        
        if (productsToShow.length === 0) {
            this.showEmptyState();
            return;
        }
        
        container.innerHTML = '';
        
        productsToShow.forEach((product, index) => {
            const productCard = this.createFullFeaturedProductCard(product, index);
            container.appendChild(productCard);
            
            // Entrance animation
            setTimeout(() => {
                productCard.style.opacity = '1';
                productCard.style.transform = 'translateY(0)';
            }, index * 50);
        });
        
        this.displayedProducts = productsToShow.length;
        this.updateLoadMoreButton(productsToShow.length, filteredProducts.length);
        this.updateResultsInfo(productsToShow.length, filteredProducts.length);
        
        // Initialize features after cards are rendered
        setTimeout(() => {
            this.initializeCompactFeatures();
        }, 500);
    }
    
    // FIXED: Full-featured product card with all enhancements
    createFullFeaturedProductCard(product, index = 0) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-category', product.category);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        const date = new Date(product.posteddate);
        const formattedDate = date.toLocaleDateString('en-IN');
        const enhancedData = this.enhanceProductData(product);
        
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
                    <div class="savings-amount">You Save: ₹${enhancedData.savings}</div>
                </div>
                <div class="product-actions">
                    <a href="#" class="deal-btn" onclick="openProductPage('${product.id}', '${product.title}'); return false;" rel="noopener noreferrer">
                        <div class="deal-btn-content">
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
    
    // Enhanced product data generator (from main script)
    enhanceProductData(product) {
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
    
    // Initialize compact features for all product cards
    initializeCompactFeatures() {
        if (!window.dealsPageCompactFeatures) {
            window.dealsPageCompactFeatures = new CompactProductFeatures();
        } else {
            // Re-initialize for new cards
            window.dealsPageCompactFeatures.addFeaturesToExistingProducts();
        }
    }
    
    getFilteredProducts() {
        if (this.currentFilter === 'all') {
            return this.allProducts;
        }
        return this.allProducts.filter(product => 
            product.category.toLowerCase() === this.currentFilter
        );
    }
    
    sortProducts(products) {
        const sorted = [...products];
        
        switch (this.currentSort) {
            case 'price-low':
                return sorted.sort((a, b) => this.extractPrice(a.price) - this.extractPrice(b.price));
            case 'price-high':
                return sorted.sort((a, b) => this.extractPrice(b.price) - this.extractPrice(a.price));
            case 'latest':
            default:
                return sorted.sort((a, b) => new Date(b.posted_date) - new Date(a.posted_date));
        }
    }
    
    extractPrice(priceString) {
        const match = priceString.match(/₹(\d+,?\d*)/);
        return match ? parseInt(match[1].replace(',', '')) : 0; // FIXED: was match[21]
    }
    
    // ... [keep all your existing methods - setupEventListeners, updateStats, etc.]
    
    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.displayedProducts = 0;
                this.renderProducts();
                this.updateActiveFilters();
            });
        });
        
        // Sort select
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.displayedProducts = 0;
                this.renderProducts();
            });
        }
        
        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                setTimeout(() => {
                    this.renderProducts();
                    loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Deals';
                }, 500);
            });
        }
        
        // Clear filters
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
        
        // View toggle
        const viewToggle = document.getElementById('view-toggle');
        if (viewToggle) {
            viewToggle.addEventListener('click', () => {
                const container = document.getElementById('products-container');
                container.classList.toggle('list-view');
                const icon = viewToggle.querySelector('i');
                if (container.classList.contains('list-view')) {
                    icon.className = 'fas fa-th';
                } else {
                    icon.className = 'fas fa-th-large';
                }
            });
        }
    }
    
    updateStats() {
        const totalDealsElement = document.getElementById('total-deals-count');
        if (totalDealsElement) {
            totalDealsElement.textContent = this.allProducts.length;
        }
    }
    
    updateResultsInfo(showing, total) {
        const showingElement = document.getElementById('showing-count');
        const totalElement = document.getElementById('total-count');
        
        if (showingElement) showingElement.textContent = showing;
        if (totalElement) totalElement.textContent = total;
    }
    
    updateLoadMoreButton(showing, total) {
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            if (showing >= total) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }
        }
    }
    
    updateLastRefreshed() {
        const updateTimeElement = document.getElementById('update-time');
        if (updateTimeElement) {
            updateTimeElement.textContent = new Date().toLocaleTimeString('en-IN');
        }
    }
    
    setupBackToTop() {
        const backToTopBtn = document.getElementById('back-to-top');
        if (!backToTopBtn) return;
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    updateActiveFilters() {
        const activeFiltersContainer = document.getElementById('active-filters');
        const activeFiltersList = document.getElementById('active-filters-list');
        
        if (!activeFiltersContainer || !activeFiltersList) return;
        
        if (this.currentFilter === 'all' && this.currentSort === 'latest') {
            activeFiltersContainer.style.display = 'none';
            return;
        }
        
        activeFiltersContainer.style.display = 'flex';
        activeFiltersList.innerHTML = '';
        
        if (this.currentFilter !== 'all') {
            const filterTag = document.createElement('span');
            filterTag.className = 'active-filter-tag';
            filterTag.innerHTML = `
                Category: ${this.currentFilter}
                <span class="remove-filter" onclick="dealsPageManager.removeFilter('category')">&times;</span>
            `;
            activeFiltersList.appendChild(filterTag);
        }
        
        if (this.currentSort !== 'latest') {
            const sortTag = document.createElement('span');
            sortTag.className = 'active-filter-tag';
            sortTag.innerHTML = `
                Sort: ${this.currentSort}
                <span class="remove-filter" onclick="dealsPageManager.removeFilter('sort')">&times;</span>
            `;
            activeFiltersList.appendChild(sortTag);
        }
    }
    
    removeFilter(type) {
        if (type === 'category') {
            this.currentFilter = 'all';
            document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
            document.querySelectorAll('.filter-btn:not([data-filter="all"])').forEach(btn => 
                btn.classList.remove('active')
            );
        } else if (type === 'sort') {
            this.currentSort = 'latest';
            document.getElementById('sort-select').value = 'latest';
        }
        
        this.displayedProducts = 0;
        this.renderProducts();
        this.updateActiveFilters();
    }
    
    clearAllFilters() {
        this.currentFilter = 'all';
        this.currentSort = 'latest';
        
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
        document.getElementById('sort-select').value = 'latest';
        
        this.displayedProducts = 0;
        this.renderProducts();
        this.updateActiveFilters();
    }
    
    showLoadingState() {
        const container = document.getElementById('products-container');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"><div class="spinner"></div></div>
                    <p>Loading today's hottest deals...</p>
                </div>
            `;
        }
    }
    
    showEmptyState() {
        const container = document.getElementById('products-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No deals found</h3>
                    <p>No deals available in this category yet.</p>
                    <button onclick="dealsPageManager.clearAllFilters()" class="btn-primary">
                        <i class="fas fa-refresh"></i>
                        Show All Deals
                    </button>
                </div>
            `;
        }
    }
    
    showErrorState() {
        const container = document.getElementById('products-container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Unable to load deals</h3>
                    <p>Something went wrong while loading the deals.</p>
                    <button onclick="dealsPageManager.loadProducts()" class="retry-btn">
                        <i class="fas fa-refresh"></i>
                        Try Again
                    </button>
                </div>
            `;
        }
    }
}

// COPY CompactProductFeatures class from main script.js (the entire class)
// [Include the full CompactProductFeatures class from your main script here]

// FIXED: Product page navigation function
function openProductPage(productId, productTitle) {
    const titleSlug = productTitle.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
    const productUrl = `product.html?id=${productId}&title=${titleSlug}`;
    window.location.href = productUrl;
}

// FIXED: Wishlist functionality with proper integration
function toggleWishlist(productId, button) {
    // Get wishlist from localStorage
    let wishlist = JSON.parse(localStorage.getItem('thriftzone-wishlist') || '[]');
    const icon = button.querySelector('i');
    const isActive = button.classList.contains('active');
    
    if (isActive) {
        // Remove from wishlist
        button.classList.remove('active');
        icon.className = 'far fa-heart';
        wishlist = wishlist.filter(id => id !== productId);
    } else {
        // Add to wishlist
        button.classList.add('active');
        icon.className = 'fas fa-heart';
        if (!wishlist.includes(productId)) {
            wishlist.push(productId);
        }
    }
    
    localStorage.setItem('thriftzone-wishlist', JSON.stringify(wishlist));
    
    // Animation
    button.style.transform = 'scale(1.3)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
}

function addToWishlist(productId) {
    const wishlistBtn = document.querySelector(`[onclick*="${productId}"].wishlist-btn`);
    if (wishlistBtn) {
        toggleWishlist(productId, wishlistBtn);
    }
}

function trackClick(productId) {
    console.log('Track click for:', productId);
    // Add your tracking logic here
}

// Initialize the deals page manager
let dealsPageManager;
document.addEventListener('DOMContentLoaded', () => {
    dealsPageManager = new DealsPageManager();
});
