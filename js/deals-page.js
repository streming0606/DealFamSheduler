// ========================================
// DEALS PAGE - COMPLETE STANDALONE VERSION
// No dependencies on script.js, auth.js, or search.js
// ========================================

(function() {
    'use strict';

    class DealsPageManager {
        constructor() {
            this.currentFilter = 'all';
            this.currentSort = 'latest';
            this.displayedProducts = 0;
            this.productsPerPage = 12;
            this.allProducts = [];
            this.isLoading = false;
            
            console.log('🚀 DealsPageManager: Starting initialization...');
            this.init();
        }
        
        init() {
            // Wait for DOM
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.setup();
                });
            } else {
                this.setup();
            }
        }
        
        setup() {
            console.log('✓ DOM ready, setting up...');
            this.setupEventListeners();
            this.setupBackToTop();
            this.setupMobileMenu();
            this.updateLastRefreshed();
            this.loadProducts();
            
            // Auto refresh every 5 minutes
            setInterval(() => {
                if (!this.isLoading) {
                    console.log('🔄 Auto-refreshing products...');
                    this.loadProducts();
                    this.updateLastRefreshed();
                }
            }, 5 * 60 * 1000);
        }
        
        async loadProducts() {
            if (this.isLoading) {
                console.log('⚠️ Already loading, skipping...');
                return;
            }
            
            try {
                this.isLoading = true;
                this.showLoadingState();
                
                const productPath = '../data/products.json';
                console.log('📡 Fetching from:', productPath);
                
                const response = await fetch(productPath);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    console.warn('⚠️ Response is not JSON, trying to parse anyway...');
                }
                
                const data = await response.json();
                
                if (!data || !data.products || !Array.isArray(data.products)) {
                    throw new Error('Invalid JSON structure. Expected { products: [...] }');
                }
                
                this.allProducts = data.products;
                console.log(`✅ Successfully loaded ${this.allProducts.length} products`);
                
                this.displayedProducts = 0;
                this.renderProducts();
                this.updateStats();
                
            } catch (error) {
                console.error('❌ Error loading products:', error);
                this.showErrorState(error.message);
            } finally {
                this.isLoading = false;
            }
        }
        
        renderProducts() {
            const container = document.getElementById('products-container');
            if (!container) {
                console.error('❌ Products container not found');
                return;
            }
            
            const filteredProducts = this.getFilteredProducts();
            const sortedProducts = this.sortProducts(filteredProducts);
            const endIndex = this.displayedProducts + this.productsPerPage;
            const productsToShow = sortedProducts.slice(0, endIndex);
            
            console.log(`📦 Rendering ${productsToShow.length} of ${filteredProducts.length} products`);
            
            if (filteredProducts.length === 0) {
                this.showEmptyState();
                return;
            }
            
            container.innerHTML = '';
            
            productsToShow.forEach((product, index) => {
                const card = this.createProductCard(product);
                container.appendChild(card);
                
                // Animate only first batch
                if (index < 12) {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 30);
                } else {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }
            });
            
            this.displayedProducts = productsToShow.length;
            this.updateLoadMoreButton(productsToShow.length, filteredProducts.length);
            this.updateResultsInfo(productsToShow.length, filteredProducts.length);
            this.restoreWishlistState();
        }
        
        createProductCard(product) {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-category', product.category || 'other');
            card.setAttribute('data-product-id', product.id);
            card.style.cssText = 'opacity: 0; transform: translateY(20px); transition: opacity 0.5s, transform 0.5s;';
            
            const enhanced = this.enhanceProductData(product);
            const imageUrl = product.image || '';
            const title = this.escapeHtml(product.title || 'Product');
            const category = this.escapeHtml(product.category || 'General');
            
            card.innerHTML = `
                <div class="product-image-container">
                    ${imageUrl ? 
                        `<img src="${imageUrl}" alt="${title}" class="product-image" loading="lazy" 
                         onerror="this.parentElement.innerHTML='<div class=\\"product-placeholder\\"><i class=\\"fas fa-image\\"></i></div>` 
                        : 
                        '<div class="product-placeholder"><i class="fas fa-image"></i></div>'
                    }
                    <div class="product-badges">
                        <span class="badge badge-discount">${enhanced.discountPercent}% OFF</span>
                        ${enhanced.isLimitedTime ? '<span class="badge badge-limited">⚡ Limited</span>' : ''}
                    </div>
                    <div class="product-top-actions">
                        <button class="action-btn wishlist-btn" data-product-id="${product.id}" title="Add to wishlist">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${category}</div>
                    <h3 class="product-title">${title}</h3>
                    <div class="product-pricing">
                        <div class="price-section">
                            <span class="price-current">₹${enhanced.salePrice}</span>
                            <span class="price-original">₹${enhanced.originalPrice}</span>
                            <span class="price-discount-badge">${enhanced.discountPercent}% OFF</span>
                        </div>
                        <div class="savings-amount">You Save: ₹${enhanced.savings}</div>
                    </div>
                    <div class="product-actions">
                        <a href="../product.html?id=${encodeURIComponent(product.id)}&title=${encodeURIComponent(this.createSlug(title))}" 
                           class="deal-btn" rel="noopener">
                            <div class="deal-btn-content">
                                <div class="deal-btn-text">
                                    <i class="fas fa-bolt"></i> View Deal Details
                                </div>
                                <div class="deal-btn-subtext">Save Big Today</div>
                            </div>
                        </a>
                    </div>
                </div>
            `;
            
            // Add wishlist click handler
            const wishlistBtn = card.querySelector('.wishlist-btn');
            if (wishlistBtn) {
                wishlistBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleWishlist(product.id, wishlistBtn);
                });
            }
            
            return card;
        }
        
        enhanceProductData(product) {
            let currentPrice = 999;
            
            if (product.price) {
                const match = product.price.toString().match(/[\d,]+/);
                if (match) {
                    currentPrice = parseInt(match[0].replace(/,/g, ''));
                }
            }
            
            const markup = 1.4 + (Math.random() * 0.6);
            const originalPrice = Math.round(currentPrice * markup);
            const savings = originalPrice - currentPrice;
            const discountPercent = Math.round((savings / originalPrice) * 100);
            
            return {
                salePrice: currentPrice.toLocaleString('en-IN'),
                originalPrice: originalPrice.toLocaleString('en-IN'),
                savings: savings.toLocaleString('en-IN'),
                discountPercent: Math.max(10, Math.min(85, discountPercent)),
                isLimitedTime: Math.random() > 0.6
            };
        }
        
        escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        createSlug(text) {
            if (!text) return 'product';
            return text.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .substring(0, 50);
        }
        
        restoreWishlistState() {
            try {
                const wishlist = JSON.parse(localStorage.getItem('thriftzone-wishlist') || '[]');
                wishlist.forEach(productId => {
                    const btns = document.querySelectorAll(`[data-product-id="${productId}"].wishlist-btn`);
                    btns.forEach(btn => {
                        btn.classList.add('active');
                        const icon = btn.querySelector('i');
                        if (icon) icon.className = 'fas fa-heart';
                    });
                });
            } catch (e) {
                console.warn('Could not restore wishlist:', e);
            }
        }
        
        toggleWishlist(productId, button) {
            try {
                let wishlist = JSON.parse(localStorage.getItem('thriftzone-wishlist') || '[]');
                const icon = button.querySelector('i');
                const isActive = button.classList.contains('active');
                
                if (isActive) {
                    button.classList.remove('active');
                    if (icon) icon.className = 'far fa-heart';
                    wishlist = wishlist.filter(id => id !== productId);
                } else {
                    button.classList.add('active');
                    if (icon) icon.className = 'fas fa-heart';
                    if (!wishlist.includes(productId)) {
                        wishlist.push(productId);
                    }
                }
                
                localStorage.setItem('thriftzone-wishlist', JSON.stringify(wishlist));
                
                button.style.transform = 'scale(1.3)';
                setTimeout(() => button.style.transform = 'scale(1)', 200);
            } catch (e) {
                console.error('Wishlist error:', e);
            }
        }
        
        getFilteredProducts() {
            if (this.currentFilter === 'all') {
                return this.allProducts;
            }
            return this.allProducts.filter(p => 
                p.category && p.category.toLowerCase() === this.currentFilter.toLowerCase()
            );
        }
        
        sortProducts(products) {
            const sorted = [...products];
            
            switch (this.currentSort) {
                case 'price-low':
                    return sorted.sort((a, b) => this.extractPrice(a.price) - this.extractPrice(b.price));
                case 'price-high':
                    return sorted.sort((a, b) => this.extractPrice(b.price) - this.extractPrice(a.price));
                default:
                    return sorted.sort((a, b) => {
                        const dateA = new Date(a.posteddate || a.posted_date || 0);
                        const dateB = new Date(b.posteddate || b.posted_date || 0);
                        return dateB - dateA;
                    });
            }
        }
        
        extractPrice(priceString) {
            if (!priceString) return 0;
            const match = priceString.toString().match(/[\d,]+/);
            return match ? parseInt(match[0].replace(/,/g, '')) : 0;
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
            
            // Load more
            const loadMoreBtn = document.getElementById('load-more-btn');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => {
                    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                    setTimeout(() => {
                        this.renderProducts();
                        loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Deals';
                    }, 300);
                });
            }
            
            // Clear filters
            const clearBtn = document.getElementById('clear-filters');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => this.clearAllFilters());
            }
        }
        
        setupMobileMenu() {
            const toggle = document.getElementById('mobile-menu-toggle');
            const menu = document.getElementById('mobile-nav');
            const close = document.querySelector('.mobile-nav-close');
            
            if (toggle && menu) {
                toggle.addEventListener('click', () => {
                    menu.classList.add('active');
                    document.body.style.overflow = 'hidden';
                });
            }
            
            if (close && menu) {
                close.addEventListener('click', () => {
                    menu.classList.remove('active');
                    document.body.style.overflow = '';
                });
            }
        }
        
        setupBackToTop() {
            const btn = document.getElementById('back-to-top');
            if (!btn) return;
            
            window.addEventListener('scroll', () => {
                btn.style.display = window.pageYOffset > 300 ? 'flex' : 'none';
            });
            
            btn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        updateStats() {
            const elem = document.getElementById('total-deals-count');
            if (elem) elem.textContent = this.allProducts.length;
        }
        
        updateResultsInfo(showing, total) {
            const showingElem = document.getElementById('showing-count');
            const totalElem = document.getElementById('total-count');
            if (showingElem) showingElem.textContent = showing;
            if (totalElem) totalElem.textContent = total;
        }
        
        updateLoadMoreButton(showing, total) {
            const btn = document.getElementById('load-more-btn');
            if (btn) {
                btn.style.display = showing >= total ? 'none' : 'block';
            }
        }
        
        updateLastRefreshed() {
            const elem = document.getElementById('update-time');
            if (elem) {
                elem.textContent = new Date().toLocaleTimeString('en-IN');
            }
        }
        
        updateActiveFilters() {
            const container = document.getElementById('active-filters');
            const list = document.getElementById('active-filters-list');
            
            if (!container || !list) return;
            
            if (this.currentFilter === 'all') {
                container.style.display = 'none';
                return;
            }
            
            container.style.display = 'flex';
            list.innerHTML = '';
            
            const tag = document.createElement('span');
            tag.className = 'active-filter-tag';
            tag.innerHTML = `Category: ${this.currentFilter} <span class="remove-filter">&times;</span>`;
            tag.querySelector('.remove-filter').addEventListener('click', () => {
                this.currentFilter = 'all';
                document.querySelector('.filter-btn[data-filter="all"]')?.classList.add('active');
                document.querySelectorAll('.filter-btn:not([data-filter="all"])').forEach(b => 
                    b.classList.remove('active')
                );
                this.displayedProducts = 0;
                this.renderProducts();
                this.updateActiveFilters();
            });
            list.appendChild(tag);
        }
        
        clearAllFilters() {
            this.currentFilter = 'all';
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.filter-btn[data-filter="all"]')?.classList.add('active');
            this.displayedProducts = 0;
            this.renderProducts();
            this.updateActiveFilters();
        }
        
        showLoadingState() {
            const container = document.getElementById('products-container');
            if (container) {
                container.innerHTML = `
                    <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                        <div class="loading-spinner" style="margin: 0 auto 20px;">
                            <div class="spinner" style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        </div>
                        <p style="color: #666; font-size: 16px;">Loading today's hottest deals...</p>
                    </div>
                `;
            }
        }
        
        showEmptyState() {
            const container = document.getElementById('products-container');
            if (container) {
                const msg = this.currentFilter === 'all' 
                    ? 'No deals available yet. Check back soon!' 
                    : `No deals found in "${this.currentFilter}" category.`;
                
                container.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                        <i class="fas fa-search" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
                        <h3 style="margin: 0 0 10px 0; color: #333;">No deals found</h3>
                        <p style="color: #666; margin-bottom: 20px;">${msg}</p>
                        ${this.currentFilter !== 'all' ? 
                            '<button onclick="window.dealsPageManager.clearAllFilters()" class="btn-primary" style="padding: 12px 24px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer;"><i class="fas fa-refresh"></i> Show All Deals</button>' 
                            : ''
                        }
                    </div>
                `;
            }
        }
        
        showErrorState(errorMsg) {
            const container = document.getElementById('products-container');
            if (container) {
                container.innerHTML = `
                    <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #e74c3c; margin-bottom: 20px;"></i>
                        <h3 style="margin: 0 0 10px 0; color: #333;">Unable to load deals</h3>
                        <p style="color: #666; margin-bottom: 10px;">Error: ${this.escapeHtml(errorMsg)}</p>
                        <p style="color: #999; font-size: 14px; margin-bottom: 20px;">Press F12 to see console for details</p>
                        <button onclick="window.dealsPageManager.loadProducts()" class="btn-primary" style="padding: 12px 24px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-refresh"></i> Try Again
                        </button>
                    </div>
                `;
            }
        }
    }

    // Create global instance
    window.dealsPageManager = new DealsPageManager();
    console.log('✓ DealsPageManager initialized globally');

})();

// Add spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
