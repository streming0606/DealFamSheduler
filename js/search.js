// Enhanced Search functionality with Voice Search for Thrift Zone
class ThriftZoneSearch {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.voiceSearchBtn = document.getElementById('voice-search-btn');
        this.searchSuggestions = document.getElementById('search-suggestions');
        this.voiceSearchModal = document.getElementById('voice-search-modal');
        this.voiceCloseBtn = document.getElementById('voice-close-btn');
        this.voiceStatus = document.getElementById('voice-status');
        
        this.searchTerm = '';
        this.searchResults = [];
        this.isListening = false;
        this.recognition = null;
        
        this.init();
        this.initVoiceSearch();
    }
    
    init() {
        if (!this.searchInput) return;
        
        // Input event listener
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase().trim();
            if (this.searchTerm.length >= 1) {
                this.handleSearch();
            } else {
                this.hideSuggestions();
                this.clearSearch();
            }
        });
        
        // Enter key search
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch();
                this.hideSuggestions();
            }
        });
        
        // Search button click
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.performSearch();
                this.hideSuggestions();
            });
        }
        
        // Voice search button
        if (this.voiceSearchBtn) {
            this.voiceSearchBtn.addEventListener('click', () => {
                this.startVoiceSearch();
            });
        }
        
        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSuggestions();
            }
        });
        
        // Voice modal close
        if (this.voiceCloseBtn) {
            this.voiceCloseBtn.addEventListener('click', () => {
                this.stopVoiceSearch();
            });
        }
        
        // Close modal on outside click
        if (this.voiceSearchModal) {
            this.voiceSearchModal.addEventListener('click', (e) => {
                if (e.target === this.voiceSearchModal) {
                    this.stopVoiceSearch();
                }
            });
        }
    }
    
    handleSearch() {
        if (this.searchTerm.length < 1) {
            this.hideSuggestions();
            return;
        }
        
        this.searchResults = this.searchProducts(this.searchTerm);
        if (this.searchResults.length > 0) {
            this.showSuggestions();
        } else {
            this.hideSuggestions();
        }
    }
    
    searchProducts(term) {
        if (!window.allProducts || window.allProducts.length === 0) {
            return [];
        }
        
        return window.allProducts.filter(product => {
            const titleMatch = product.title.toLowerCase().includes(term);
            const categoryMatch = product.category.toLowerCase().includes(term);
            const priceMatch = product.price && product.price.toLowerCase().includes(term);
            
            return titleMatch || categoryMatch || priceMatch;
        }).slice(0, 6); // Limit to 6 suggestions
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
                    <div class="suggestion-image">
                        ${product.image ? 
                            `<img src="${product.image}" alt="${product.title}">` 
                            : '<i class="fas fa-image" style="color: var(--text-muted); font-size: 0.8rem;"></i>'
                        }
                    </div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">
                            ${this.highlightSearchTerm(product.title, this.searchTerm)}
                        </div>
                        <div class="suggestion-meta">
                            <span>${discountInfo.currentPrice}</span>
                            <span>•</span>
                            <span>${product.category}</span>
                            ${discountInfo.discount > 0 ? `<span>• ${discountInfo.discount}% OFF</span>` : ''}
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
            this.searchTerm = product.title.toLowerCase();
            this.hideSuggestions();
            this.performSearch();
            
            // Scroll to deals section
            setTimeout(() => {
                document.getElementById('deals').scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }
    
    performSearch() {
        const searchValue = this.searchInput.value.toLowerCase().trim();
        
        if (!searchValue) {
            this.clearSearch();
            return;
        }
        
        // Filter products based on search
        const filteredProducts = window.allProducts.filter(product => {
            const titleMatch = product.title.toLowerCase().includes(searchValue);
            const categoryMatch = product.category.toLowerCase().includes(searchValue);
            const priceMatch = product.price && product.price.toLowerCase().includes(searchValue);
            
            return titleMatch || categoryMatch || priceMatch;
        });
        
        // Update the products display
        this.displaySearchResults(filteredProducts, searchValue);
        
        // Show search results info
        this.showSearchInfo(filteredProducts.length, searchValue);
    }
    
    displaySearchResults(products, searchTerm) {
        const productsContainer = document.getElementById('products-container');
        if (!productsContainer) return;
        
        // Clear existing products
        productsContainer.innerHTML = '';
        
        if (products.length === 0) {
            this.showNoResults(searchTerm);
            return;
        }
        
        // Display filtered products
        products.forEach((product, index) => {
            const productCard = this.createProductCard(product, index);
            productsContainer.appendChild(productCard);
            
            // Add entrance animation
            setTimeout(() => {
                productCard.style.opacity = '1';
                productCard.style.transform = 'translateY(0)';
            }, index * 50);
        });
        
        // Hide load more button during search
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
    }
    
    createProductCard(product, index) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-category', product.category);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // Format date
        const date = new Date(product.posted_date);
        const formattedDate = date.toLocaleDateString('en-IN');
        
        // Calculate discount
        const discountInfo = this.calculateDiscount(product.price);
        
        // Generate rating stars
        const ratingStars = this.generateRatingStars(product.rating);
        
        card.innerHTML = `
            <div class="product-image-container">
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\"product-placeholder\\"><i class=\\"fas fa-image\\"></i></div>'">` 
                    : 
                    '<div class="product-placeholder"><i class="fas fa-image"></i></div>'
                }
                
                <div class="product-badges">
                    ${discountInfo.discount > 0 ? `<span class="badge badge-deal">${discountInfo.discount}% OFF</span>` : ''}
                    ${this.isNewProduct(product.posted_date) ? '<span class="badge badge-new">New</span>' : ''}
                </div>
                
                <button class="wishlist-btn" onclick="toggleWishlist('${product.id}', this)" title="Add to wishlist">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                
                <h3 class="product-title">${product.title}</h3>
                
                <div class="product-rating">
                    <div class="rating-stars">${ratingStars}</div>
                    <span class="rating-text">${this.extractRatingText(product.rating)}</span>
                </div>
                
                <div class="product-price">
                    <span class="price-current">${discountInfo.currentPrice}</span>
                    ${discountInfo.originalPrice && discountInfo.originalPrice !== discountInfo.currentPrice ? 
                        `<span class="price-original">${discountInfo.originalPrice}</span>
                         <span class="price-discount">${discountInfo.discount}% OFF</span>` 
                        : ''
                    }
                </div>
                
                <div class="product-meta">
                    <div class="product-date">Posted: ${formattedDate}</div>
                    <div class="product-source">Amazon</div>
                </div>
                
                <div class="product-actions">
                    <a href="${product.affiliate_link}" 
                       target="_blank" 
                       class="deal-btn" 
                       onclick="trackClick('${product.id}')"
                       rel="noopener noreferrer">
                        <i class="fas fa-bolt"></i>
                        Grab Deal Now
                    </a>
                    <button class="share-btn" onclick="shareProduct('${product.id}')" title="Share deal">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    showNoResults(searchTerm) {
        const productsContainer = document.getElementById('products-container');
        productsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>No deals found for "<strong>${searchTerm}</strong>"</p>
                <p>Try searching with different keywords or browse categories.</p>
                <button onclick="window.thriftSearch.clearSearch()" class="btn-primary">
                    <i class="fas fa-refresh"></i>
                    Show All Deals
                </button>
            </div>
        `;
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
        
        searchInfo.innerHTML = `
            <div class="search-info-text">
                ${count} results found for "${term}"
            </div>
            <button onclick="window.thriftSearch.clearSearch()" class="clear-search-btn" title="Clear search">
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
        if (window.renderProducts) {
            window.currentFilter = 'all';
            window.displayedProducts = 0;
            window.renderProducts();
        }
        
        // Show load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'block';
        }
    }
    
    // Voice Search Methods
    initVoiceSearch() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.log('Speech recognition not supported');
            if (this.voiceSearchBtn) {
                this.voiceSearchBtn.style.display = 'none';
            }
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.voiceSearchBtn.classList.add('listening');
            this.voiceStatus.textContent = 'Listening...';
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.searchInput.value = transcript;
            this.searchTerm = transcript.toLowerCase();
            this.voiceStatus.textContent = `You said: "${transcript}"`;
            
            setTimeout(() => {
                this.stopVoiceSearch();
                this.performSearch();
            }, 1000);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.voiceStatus.textContent = 'Error occurred. Please try again.';
            setTimeout(() => {
                this.stopVoiceSearch();
            }, 2000);
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.voiceSearchBtn.classList.remove('listening');
        };
    }
    
    startVoiceSearch() {
        if (!this.recognition) {
            alert('Voice search is not supported in your browser.');
            return;
        }
        
        if (this.isListening) {
            this.stopVoiceSearch();
            return;
        }
        
        this.voiceSearchModal.classList.add('active');
        this.voiceStatus.textContent = 'Listening...';
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.voiceStatus.textContent = 'Error starting voice search.';
            setTimeout(() => {
                this.stopVoiceSearch();
            }, 2000);
        }
    }
    
    stopVoiceSearch() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        this.voiceSearchModal.classList.remove('active');
        this.isListening = false;
        this.voiceSearchBtn.classList.remove('listening');
    }
    
    // Helper Methods
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
    
    generateRatingStars(ratingString) {
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
    
    extractRatingText(ratingString) {
        const match = ratingString.match(/\((\d+\.?\d*)\)/);
        return match ? `(${match[1]})` : '';
    }
    
    isNewProduct(dateString) {
        const productDate = new Date(dateString);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return productDate > oneDayAgo;
    }
}

// Initialize search functionality
function initializeSearch() {
    // Wait for products to load
    const initSearch = () => {
        if (window.allProducts && window.allProducts.length > 0) {
            window.thriftSearch = new ThriftZoneSearch();
        } else {
            setTimeout(initSearch, 500);
        }
    };
    initSearch();
}

// Export for use in main script
window.initializeSearch = initializeSearch;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSearch);
} else {
    initializeSearch();
}
