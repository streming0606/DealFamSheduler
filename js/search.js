// Search functionality for Thrift Zone
class ThriftZoneSearch {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.searchSuggestions = document.getElementById('search-suggestions');
        this.searchTerm = '';
        this.searchResults = [];
        this.init();
    }
    
    init() {
        if (!this.searchInput) return;
        
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase().trim();
            this.handleSearch();
        });
        
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }
        
        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSuggestions();
            }
        });
    }
    
    handleSearch() {
        if (this.searchTerm.length < 2) {
            this.hideSuggestions();
            return;
        }
        
        this.searchResults = this.searchProducts(this.searchTerm);
        this.showSuggestions();
    }
    
    searchProducts(term) {
        if (!window.allProducts) return [];
        
        return window.allProducts.filter(product => {
            return product.title.toLowerCase().includes(term) ||
                   product.category.toLowerCase().includes(term) ||
                   (product.price && product.price.toLowerCase().includes(term));
        }).slice(0, 5); // Limit to 5 suggestions
    }
    
    showSuggestions() {
        if (this.searchResults.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        const suggestionsHTML = this.searchResults.map(product => {
            const discountInfo = this.calculateDiscount(product.price);
            return `
                <div class="suggestion-item" onclick="window.thriftSearch.selectSuggestion('${product.id}')">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 40px; height: 40px; background: var(--surface); border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                            ${product.image ? 
                                `<img src="${product.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="">` 
                                : '<i class="fas fa-image" style="color: var(--text-muted); font-size: 0.8rem;"></i>'
                            }
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 500; font-size: 0.875rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${this.highlightSearchTerm(product.title, this.searchTerm)}
                            </div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary);">
                                ${discountInfo.currentPrice} • ${product.category}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        this.searchSuggestions.innerHTML = suggestionsHTML;
        this.searchSuggestions.style.display = 'block';
    }
    
    hideSuggestions() {
        if (this.searchSuggestions) {
            this.searchSuggestions.style.display = 'none';
        }
    }
    
    selectSuggestion(productId) {
        const product = window.allProducts.find(p => p.id === productId);
        if (product) {
            this.searchInput.value = product.title;
            this.hideSuggestions();
            
            // Filter to show this product
            this.performSearch();
            
            // Scroll to deals section
            document.getElementById('deals').scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    performSearch() {
        if (!this.searchTerm && !this.searchInput.value) {
            // Reset to show all products
            window.currentFilter = 'all';
            window.displayedProducts = 0;
            window.renderProducts();
            return;
        }
        
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        if (!searchTerm) return;
        
        // Store original products
        const originalProducts = window.allProducts;
        
        // Filter products based on search
        const filteredProducts = originalProducts.filter(product => {
            return product.title.toLowerCase().includes(searchTerm) ||
                   product.category.toLowerCase().includes(searchTerm) ||
                   (product.price && product.price.toLowerCase().includes(searchTerm));
        });
        
        // Temporarily replace allProducts for rendering
        window.allProducts = filteredProducts;
        window.currentFilter = 'all';
        window.displayedProducts = 0;
        window.renderProducts();
        
        // Restore original products after a delay
        setTimeout(() => {
            window.allProducts = originalProducts;
        }, 100);
        
        this.hideSuggestions();
        
        // Show search results info
        this.showSearchInfo(filteredProducts.length, searchTerm);
    }
    
    showSearchInfo(count, term) {
        // Remove existing search info
        const existingInfo = document.querySelector('.search-info');
        if (existingInfo) {
            existingInfo.remove();
        }
        
        // Create search info
        const searchInfo = document.createElement('div');
        searchInfo.className = 'search-info';
        searchInfo.style.cssText = `
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: var(--spacing-md);
            margin-bottom: var(--spacing-lg);
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        searchInfo.innerHTML = `
            <div>
                <span style="color: var(--text-primary); font-weight: 500;">
                    ${count} results found for "${term}"
                </span>
            </div>
            <button onclick="window.thriftSearch.clearSearch()" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px;">
                <i class="fas fa-times"></i> Clear
            </button>
        `;
        
        const productsContainer = document.getElementById('products-container');
        productsContainer.parentNode.insertBefore(searchInfo, productsContainer);
    }
    
    clearSearch() {
        this.searchInput.value = '';
        this.searchTerm = '';
        this.hideSuggestions();
        
        // Remove search info
        const searchInfo = document.querySelector('.search-info');
        if (searchInfo) {
            searchInfo.remove();
        }
        
        // Reset to show all products
        window.currentFilter = 'all';
        window.displayedProducts = 0;
        window.renderProducts();
    }
    
    highlightSearchTerm(text, term) {
        if (!term) return text;
        
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark style="background: var(--warning); color: white; padding: 1px 2px; border-radius: 2px;">$1</mark>');
    }
    
    calculateDiscount(priceString) {
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
}

// Initialize search functionality
function initializeSearch() {
    window.thriftSearch = new ThriftZoneSearch();
}

// Export for use in main script
window.initializeSearch = initializeSearch;
