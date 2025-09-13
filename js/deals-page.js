// Dedicated Deals Page JavaScript
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
            const productCard = this.createProductCard(product, index);
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
    }
    
    createProductCard(product, index) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-category', product.category);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // Use your existing createProductCard function from script.js
        // This ensures consistency with the main site
        if (typeof createProductCard === 'function') {
            return createProductCard(product, index);
        }
        
        // Fallback basic card structure
        card.innerHTML = `
            <div class="product-image-container">
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">` 
                    : 
                    '<div class="product-placeholder"><i class="fas fa-image"></i></div>'
                }
                <div class="product-top-actions">
                    <button class="wishlist-btn" onclick="toggleWishlist('${product.id}', this)">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.title}</h3>
                <div class="product-pricing">
                    <div class="price-section">
                        <span class="price-current">${product.price}</span>
                    </div>
                </div>
                <div class="product-actions">
                    <a href="${product.affiliate_link}" target="_blank" class="deal-btn" onclick="trackClick('${product.id}')">
                        <i class="fas fa-bolt"></i>
                        Grab Deal Now
                    </a>
                </div>
            </div>
        `;
        
        return card;
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
        return match ? parseInt(match[21].replace(',', '')) : 0;
    }
    
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

// Initialize the deals page manager
let dealsPageManager;
document.addEventListener('DOMContentLoaded', () => {
    dealsPageManager = new DealsPageManager();
});

// Global functions for compatibility
function toggleWishlist(productId, button) {
    // Your existing wishlist functionality
    console.log('Toggle wishlist for:', productId);
}

function trackClick(productId) {
    // Your existing tracking functionality
    console.log('Track click for:', productId);
}
