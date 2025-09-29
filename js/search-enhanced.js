// Enhanced Amazon-Style Search System for Thrift Zone
class ThriftZoneSearchSystem {
    constructor() {
        console.log('🔍 Initializing Enhanced Search System...');
        
        // DOM Elements
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.searchForm = document.getElementById('search-form');
        this.voiceSearchBtn = document.getElementById('voice-search-btn');
        this.searchSuggestions = document.getElementById('search-suggestions');
        this.voiceSearchModal = document.getElementById('voice-search-modal');
        this.voiceCloseBtn = document.getElementById('voice-close-btn');
        this.voiceStartBtn = document.getElementById('voice-start-btn');
        this.voiceStatus = document.getElementById('voice-status');
        
        // Search Results Elements
        this.searchResultsGrid = document.getElementById('search-results-grid');
        this.resultsCount = document.getElementById('results-count');
        this.resultsShowing = document.getElementById('results-showing');
        this.searchQuery = document.getElementById('search-query');
        this.breadcrumbSearch = document.getElementById('breadcrumb-search');
        this.searchResultsTitle = document.getElementById('search-results-title');
        this.noResults = document.getElementById('no-results');
        this.searchLoading = document.getElementById('search-loading');
        this.loadMoreResults = document.getElementById('load-more-results');
        
        // Filter Elements
        this.categoryFilters = document.getElementById('category-filters');
        this.discountFilters = document.getElementById('discount-filters');
        this.ratingFilters = document.getElementById('rating-filters');
        this.minPriceInput = document.getElementById('min-price');
        this.maxPriceInput = document.getElementById('max-price');
        this.applyPriceFilter = document.getElementById('apply-price-filter');
        this.clearAllFiltersBtn = document.getElementById('clear-all-filters');
        this.priceQuickBtns = document.querySelectorAll('.price-quick-btn');
        
        // Sort and View Elements
        this.resultsSort = document.getElementById('results-sort');
        this.viewToggleBtns = document.querySelectorAll('.view-btn');
        
        // Search State
        this.currentQuery = '';
        this.currentResults = [];
        this.allProducts = [];
        this.displayedCount = 0;
        this.resultsPerPage = 12;
        this.currentFilters = {
            categories: [],
            minPrice: null,
            maxPrice: null,
            minDiscount: null,
            minRating: null
        };
        this.currentSort = 'relevance';
        this.currentView = 'grid';
        
        // Voice Search
        this.recognition = null;
        this.isListening = false;
        this.searchTimeout = null;
        this.debounceDelay = 300;
        this.currentSuggestionIndex = -1;
        
        // Search Cache
        this.searchCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        this.init();
    }
    
    async init() {
        try {
            // Load products data
            await this.loadProducts();
            
            // Initialize search functionality
            this.initSearchEvents();
            this.initVoiceSearch();
            this.initFilters();
            this.initSortAndView();
            
            // Parse URL parameters and perform search if needed
            this.parseURLAndSearch();
            
            console.log('✅ Search System Ready');
        } catch (error) {
            console.error('Error initializing search system:', error);
        }
    }
    
    async loadProducts() {
        try {
            // Try to get products from global variable first
            if (window.allProducts && window.allProducts.length > 0) {
                this.allProducts = window.allProducts;
                console.log(`📦 Loaded ${this.allProducts.length} products from global variable`);
                return;
            }
            
            // Fallback: load from JSON file
            const response = await fetch('data/products.json');
            if (response.ok) {
                this.allProducts = await response.json();
                window.allProducts = this.allProducts; // Set global variable
                console.log(`📦 Loaded ${this.allProducts.length} products from JSON`);
            } else {
                throw new Error('Could not load products from JSON file');
            }
        } catch (error) {
            console.warn('Error loading products:', error);
            // Use sample data as fallback
            this.allProducts = this.getSampleProducts();
            console.log('📦 Using sample products as fallback');
        }
    }
    
    initSearchEvents() {
        if (!this.searchInput) return;
        
        // Form submission
        if (this.searchForm) {
            this.searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }
        
        // Search input with debouncing
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    this.showSuggestions(query);
                } else {
                    this.hideSuggestions();
                }
            }, this.debounceDelay);
        });
        
        // Keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateSuggestions('down');
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateSuggestions('up');
            } else if (e.key === 'Escape') {
                this.hideSuggestions();
            } else if (e.key === 'Enter' && this.currentSuggestionIndex >= 0) {
                e.preventDefault();
                this.selectCurrentSuggestion();
            }
        });
        
        // Click outside to hide suggestions
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSuggestions();
            }
        });
        
        // Voice search button
        if (this.voiceSearchBtn) {
            this.voiceSearchBtn.addEventListener('click', () => {
                this.openVoiceSearch();
            });
        }
    }
    
    initVoiceSearch() {
        // Check for speech recognition support
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
            this.voiceStatus.textContent = 'Listening... Speak now';
            const voiceCircle = document.querySelector('.voice-circle');
            if (voiceCircle) {
                voiceCircle.classList.add('listening');
            }
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.searchInput.value = transcript;
            this.currentQuery = transcript;
            this.voiceStatus.textContent = `You said: "${transcript}"`;
            this.voiceStatus.style.color = 'var(--success, #28a745)';
            
            setTimeout(() => {
                this.closeVoiceSearch();
                this.performSearch();
            }, 1500);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.voiceStatus.textContent = 'Error occurred. Please try again.';
            this.voiceStatus.style.color = 'var(--danger, #dc3545)';
            setTimeout(() => {
                this.closeVoiceSearch();
            }, 2000);
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.voiceSearchBtn.classList.remove('listening');
            const voiceCircle = document.querySelector('.voice-circle');
            if (voiceCircle) {
                voiceCircle.classList.remove('listening');
            }
        };
        
        // Voice modal events
        if (this.voiceCloseBtn) {
            this.voiceCloseBtn.addEventListener('click', () => {
                this.closeVoiceSearch();
            });
        }
        
        if (this.voiceStartBtn) {
            this.voiceStartBtn.addEventListener('click', () => {
                this.startVoiceRecognition();
            });
        }
        
        // Close modal on outside click
        if (this.voiceSearchModal) {
            this.voiceSearchModal.addEventListener('click', (e) => {
                if (e.target === this.voiceSearchModal) {
                    this.closeVoiceSearch();
                }
            });
        }
    }
    
    initFilters() {
        // Category filters
        if (this.categoryFilters) {
            this.categoryFilters.addEventListener('change', () => {
                this.updateFilters();
            });
        }
        
        // Discount filters
        if (this.discountFilters) {
            this.discountFilters.addEventListener('change', () => {
                this.updateFilters();
            });
        }
        
        // Rating filters
        if (this.ratingFilters) {
            this.ratingFilters.addEventListener('change', () => {
                this.updateFilters();
            });
        }
        
        // Price filters
        if (this.applyPriceFilter) {
            this.applyPriceFilter.addEventListener('click', () => {
                this.updateFilters();
            });
        }
        
        // Enter key for price inputs
        [this.minPriceInput, this.maxPriceInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.updateFilters();
                    }
                });
            }
        });
        
        // Quick price filters
        this.priceQuickBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                this.priceQuickBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                
                const range = e.target.dataset.range.split('-');
                if (this.minPriceInput) this.minPriceInput.value = range[0];
                if (this.maxPriceInput) this.maxPriceInput.value = range[1] === '999999' ? '' : range[1];
                this.updateFilters();
            });
        });
        
        // Clear all filters
        if (this.clearAllFiltersBtn) {
            this.clearAllFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }
    
    initSortAndView() {
        // Sort dropdown
        if (this.resultsSort) {
            this.resultsSort.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applyFiltersAndSort();
            });
        }
        
        // View toggle
        this.viewToggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.viewToggleBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentView = e.target.dataset.view;
                this.updateView();
            });
        });
        
        // Load more button
        if (this.loadMoreResults) {
            this.loadMoreResults.addEventListener('click', () => {
                this.loadMoreProducts();
            });
        }
    }
    
    parseURLAndSearch() {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        
        if (query) {
            this.searchInput.value = query;
            this.currentQuery = query;
            this.performSearch();
            
            // Update UI elements
            this.updateUIForQuery(query);
        }
    }
    
    updateUIForQuery(query) {
        const elements = [
            { el: this.searchQuery, text: `"${query}"` },
            { el: this.breadcrumbSearch, text: `Search results for "${query}"` },
            { el: this.searchResultsTitle, text: `Search Results for "${query}"` }
        ];
        
        elements.forEach(({ el, text }) => {
            if (el) el.textContent = text;
        });
    }
    
    async performSearch() {
        const query = this.searchInput.value.trim();
        
        if (!query) {
            this.showNoResults();
            return;
        }
        
        // Update URL without refreshing page
        const newURL = `${window.location.pathname}?q=${encodeURIComponent(query)}`;
        window.history.pushState({}, '', newURL);
        
        this.currentQuery = query;
        this.showLoading();
        this.updateUIForQuery(query);
        
        try {
            // Check cache first
            const cacheKey = `${query}_${JSON.stringify(this.currentFilters)}_${this.currentSort}`;
            if (this.searchCache.has(cacheKey)) {
                const cached = this.searchCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    this.displayResults(cached.results, query);
                    return;
                }
                this.searchCache.delete(cacheKey);
            }
            
            // Perform search
            let results = this.searchProducts(query);
            results = this.applyFilters(results);
            results = this.sortResults(results);
            
            // Cache results
            this.searchCache.set(cacheKey, {
                results: results,
                timestamp: Date.now()
            });
            
            this.displayResults(results, query);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError();
        }
    }
    
    searchProducts(query) {
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        
        return this.allProducts.filter(product => {
            const searchFields = [
                product.title || '',
                product.category || '',
                product.description || '',
                product.brand || ''
            ];
            
            const searchText = searchFields.join(' ').toLowerCase();
            
            // Calculate relevance score
            let score = 0;
            searchTerms.forEach(term => {
                if (searchText.includes(term)) {
                    // Higher score for exact matches in title
                    if ((product.title || '').toLowerCase().includes(term)) {
                        score += 3;
                    }
                    // Medium score for category matches
                    if ((product.category || '').toLowerCase().includes(term)) {
                        score += 2;
                    }
                    // Base score for any match
                    score += 1;
                }
            });
            
            product.relevanceScore = score;
            return score > 0;
        });
    }
    
    applyFilters(products) {
        return products.filter(product => {
            // Category filter
            if (this.currentFilters.categories.length > 0 && !this.currentFilters.categories.includes('all')) {
                const categoryMatch = this.currentFilters.categories.some(cat => 
                    (product.category || '').toLowerCase().includes(cat.toLowerCase())
                );
                if (!categoryMatch) return false;
            }
            
            // Price filter
            const price = this.extractPrice(product.price);
            if (this.currentFilters.minPrice && price < this.currentFilters.minPrice) return false;
            if (this.currentFilters.maxPrice && price > this.currentFilters.maxPrice) return false;
            
            // Discount filter
            if (this.currentFilters.minDiscount) {
                const discount = this.calculateDiscount(product.price);
                if (discount.discount < this.currentFilters.minDiscount) return false;
            }
            
            // Rating filter
            if (this.currentFilters.minRating) {
                const rating = this.extractRating(product.rating);
                if (rating < this.currentFilters.minRating) return false;
            }
            
            return true;
        });
    }
    
    sortResults(products) {
        return products.sort((a, b) => {
            switch (this.currentSort) {
                case 'relevance':
                    return (b.relevanceScore || 0) - (a.relevanceScore || 0);
                case 'price-low':
                    return this.extractPrice(a.price) - this.extractPrice(b.price);
                case 'price-high':
                    return this.extractPrice(b.price) - this.extractPrice(a.price);
                case 'discount':
                    return this.calculateDiscount(b.price).discount - this.calculateDiscount(a.price).discount;
                case 'rating':
                    return this.extractRating(b.rating) - this.extractRating(a.rating);
                case 'newest':
                    return new Date(b.posted_date) - new Date(a.posted_date);
                default:
                    return 0;
            }
        });
    }
    
    displayResults(results, query) {
        this.hideLoading();
        this.currentResults = results;
        this.displayedCount = 0;
        
        if (results.length === 0) {
            this.showNoResults(query);
            return;
        }
        
        // Update UI elements
        this.updateResultsInfo(results.length, query);
        this.clearGrid();
        this.updateFilterCounts(results);
        
        // Display first batch of results
        this.loadMoreProducts();
    }
    
    loadMoreProducts() {
        const endIndex = Math.min(this.displayedCount + this.resultsPerPage, this.currentResults.length);
        const productsToShow = this.currentResults.slice(this.displayedCount, endIndex);
        
        productsToShow.forEach((product, index) => {
            const productCard = this.createProductCard(product);
            if (this.searchResultsGrid) {
                this.searchResultsGrid.appendChild(productCard);
            }
            
            // Add entrance animation
            setTimeout(() => {
                productCard.style.opacity = '1';
                productCard.style.transform = 'translateY(0)';
            }, index * 50);
        });
        
        this.displayedCount = endIndex;
        
        // Update load more button
        if (this.loadMoreResults) {
            if (this.displayedCount >= this.currentResults.length) {
                this.loadMoreResults.style.display = 'none';
            } else {
                this.loadMoreResults.style.display = 'block';
            }
        }
        
        // Update showing info
        this.updateShowingInfo();
    }
    
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        const discountInfo = this.calculateDiscount(product.price);
        const formattedDate = new Date(product.posted_date).toLocaleDateString('en-IN');
        const ratingStars = this.generateRatingStars(product.rating);
        
        card.innerHTML = `
            <div class="product-image-container">
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\"product-placeholder\\"><i class=\\"fas fa-image\\"></i></div>'">` 
                    : '<div class="product-placeholder"><i class="fas fa-image"></i></div>'
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
                
                <h3 class="product-title">${this.highlightSearchTerm(product.title, this.currentQuery)}</h3>
                
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
    
    // Search Suggestions
    showSuggestions(query) {
        if (!this.searchSuggestions) return;
        
        const suggestions = this.searchProducts(query).slice(0, 6);
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        const suggestionsHTML = suggestions.map((product, index) => {
            const discountInfo = this.calculateDiscount(product.price);
            return `
                <div class="suggestion-item" data-index="${index}" onclick="window.thriftSearchSystem.selectSuggestion('${product.id}')">
                    <div class="suggestion-image">
                        ${product.image ? 
                            `<img src="${product.image}" alt="${product.title}">` 
                            : '<i class="fas fa-image"></i>'
                        }
                    </div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">
                            ${this.highlightSearchTerm(product.title, query)}
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
        this.currentSuggestionIndex = -1;
    }
    
    hideSuggestions() {
        if (this.searchSuggestions) {
            this.searchSuggestions.style.display = 'none';
        }
        this.currentSuggestionIndex = -1;
    }
    
    navigateSuggestions(direction) {
        const suggestions = this.searchSuggestions.querySelectorAll('.suggestion-item');
        if (suggestions.length === 0) return;
        
        // Remove current highlight
        if (this.currentSuggestionIndex >= 0) {
            suggestions[this.currentSuggestionIndex].classList.remove('highlighted');
        }
        
        // Calculate new index
        if (direction === 'down') {
            this.currentSuggestionIndex = (this.currentSuggestionIndex + 1) % suggestions.length;
        } else {
            this.currentSuggestionIndex = this.currentSuggestionIndex <= 0 
                ? suggestions.length - 1 
                : this.currentSuggestionIndex - 1;
        }
        
        // Highlight new suggestion
        suggestions[this.currentSuggestionIndex].classList.add('highlighted');
        suggestions[this.currentSuggestionIndex].scrollIntoView({ block: 'nearest' });
    }
    
    selectCurrentSuggestion() {
        const suggestions = this.searchSuggestions.querySelectorAll('.suggestion-item');
        if (this.currentSuggestionIndex >= 0 && suggestions[this.currentSuggestionIndex]) {
            suggestions[this.currentSuggestionIndex].click();
        }
    }
    
    selectSuggestion(productId) {
        const product = this.allProducts.find(p => p.id === productId);
        if (product) {
            this.searchInput.value = product.title;
            this.hideSuggestions();
            this.performSearch();
        }
    }
    
    // Voice Search Methods
    openVoiceSearch() {
        if (this.voiceSearchModal) {
            this.voiceSearchModal.classList.add('active');
            this.voiceStatus.textContent = 'Click "Start Speaking" and say your search term';
            this.voiceStatus.style.color = 'var(--text-primary)';
        }
    }
    
    closeVoiceSearch() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        if (this.voiceSearchModal) {
            this.voiceSearchModal.classList.remove('active');
        }
        
        this.isListening = false;
        this.voiceSearchBtn.classList.remove('listening');
    }
    
    startVoiceRecognition() {
        if (!this.recognition) {
            this.voiceStatus.textContent = 'Voice search not supported in this browser';
            this.voiceStatus.style.color = 'var(--danger, #dc3545)';
            return;
        }
        
        if (this.isListening) {
            this.recognition.stop();
            return;
        }
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.voiceStatus.textContent = 'Error starting voice search';
            this.voiceStatus.style.color = 'var(--danger, #dc3545)';
        }
    }
    
    // Filter Management
    updateFilters() {
        this.currentFilters = {
            categories: this.getSelectedCategories(),
            minPrice: this.minPriceInput ? parseInt(this.minPriceInput.value) || null : null,
            maxPrice: this.maxPriceInput ? parseInt(this.maxPriceInput.value) || null : null,
            minDiscount: this.getSelectedDiscount(),
            minRating: this.getSelectedRating()
        };
        
        this.applyFiltersAndSort();
    }
    
    getSelectedCategories() {
        if (!this.categoryFilters) return [];
        const checkboxes = this.categoryFilters.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value).filter(value => value !== 'all');
    }
    
    getSelectedDiscount() {
        if (!this.discountFilters) return null;
        const checkboxes = this.discountFilters.querySelectorAll('input[type="checkbox"]:checked');
        const values = Array.from(checkboxes).map(cb => parseInt(cb.value));
        return values.length > 0 ? Math.max(...values) : null;
    }
    
    getSelectedRating() {
        if (!this.ratingFilters) return null;
        const radio = this.ratingFilters.querySelector('input[type="radio"]:checked');
        return radio ? parseInt(radio.value) : null;
    }
    
    applyFiltersAndSort() {
        if (this.currentQuery && this.currentResults.length > 0) {
            let results = this.searchProducts(this.currentQuery);
            results = this.applyFilters(results);
            results = this.sortResults(results);
            
            this.displayResults(results, this.currentQuery);
        }
    }
    
    clearFilters() {
        // Clear category filters
        if (this.categoryFilters) {
            const checkboxes = this.categoryFilters.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = cb.value === 'all';
            });
        }
        
        // Clear price filters
        if (this.minPriceInput) this.minPriceInput.value = '';
        if (this.maxPriceInput) this.maxPriceInput.value = '';
        
        // Clear quick price buttons
        this.priceQuickBtns.forEach(btn => btn.classList.remove('active'));
        
        // Clear discount filters
        if (this.discountFilters) {
            const checkboxes = this.discountFilters.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = false);
        }
        
        // Clear rating filters
        if (this.ratingFilters) {
            const radios = this.ratingFilters.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => radio.checked = false);
        }
        
        // Reset filters and refresh results
        this.currentFilters = {
            categories: [],
            minPrice: null,
            maxPrice: null,
            minDiscount: null,
            minRating: null
        };
        
        this.applyFiltersAndSort();
    }
    
    updateFilterCounts(results) {
        // Update category counts
        if (this.categoryFilters) {
            const categoryCounts = {};
            results.forEach(product => {
                const category = (product.category || '').toLowerCase();
                if (category) {
                    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                }
            });
            
            const categoryOptions = this.categoryFilters.querySelectorAll('.filter-option');
            categoryOptions.forEach(option => {
                const checkbox = option.querySelector('input[type="checkbox"]');
                const countSpan = option.querySelector('.count');
                if (checkbox && countSpan) {
                    const value = checkbox.value;
                    if (value === 'all') {
                        countSpan.textContent = `(${results.length})`;
                    } else {
                        const count = categoryCounts[value] || 0;
                        countSpan.textContent = `(${count})`;
                    }
                }
            });
        }
    }
    
    updateView() {
        if (this.searchResultsGrid) {
            this.searchResultsGrid.className = `search-results-grid${this.currentView === 'list' ? ' list-view' : ''}`;
        }
    }
    
    // Helper Methods
    calculateDiscount(priceString) {
        const priceMatch = priceString.match(/₹(\d+,?\d*)/g);
        if (priceMatch && priceMatch.length >= 2) {
            const current = parseInt(priceMatch[0].replace(/₹|,/g, ''));
            const original = parseInt(priceMatch[1].replace(/₹|,/g, ''));
            if (original > current) {
                const discount = Math.round(((original - current) / original) * 100);
                return {
                    currentPrice: priceMatch[0],
                    originalPrice: priceMatch[1],
                    discount: discount
                };
            }
        }
        return {
            currentPrice: priceString.split(' ')[0] || priceString,
            originalPrice: null,
            discount: 0
        };
    }
    
    extractPrice(priceString) {
        const match = priceString.match(/₹(\d+,?\d*)/);
        return match ? parseInt(match[1].replace(/,/g, '')) : 0;
    }
    
    extractRating(ratingString) {
        if (!ratingString) return 0;
        const match = ratingString.match(/\((\d+\.?\d*)\)/);
        return match ? parseFloat(match[1]) : 0;
    }
    
    highlightSearchTerm(text, term) {
        if (!term || !text) return text;
        
        const regex = new RegExp(`(${this.escapeRegExp(term)})`, 'gi');
        return text.replace(regex, '<mark style="background: var(--warning, #ffc107); color: white; padding: 1px 2px; border-radius: 2px;">$1</mark>');
    }
    
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    generateRatingStars(ratingString) {
        const rating = this.extractRating(ratingString);
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
        if (!ratingString) return '';
        const match = ratingString.match(/\((\d+\.?\d*)\)/);
        return match ? `(${match[1]})` : '';
    }
    
    isNewProduct(dateString) {
        const productDate = new Date(dateString);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return productDate > oneDayAgo;
    }
    
    // UI Update Methods
    updateResultsInfo(count, query) {
        if (this.resultsCount) {
            this.resultsCount.textContent = `${count} results found`;
        }
    }
    
    updateShowingInfo() {
        if (this.resultsShowing) {
            const start = 1;
            const end = this.displayedCount;
            const total = this.currentResults.length;
            this.resultsShowing.textContent = `Showing ${start}-${end} of ${total} results`;
        }
    }
    
    clearGrid() {
        if (this.searchResultsGrid) {
            this.searchResultsGrid.innerHTML = '';
        }
    }
    
    showLoading() {
        if (this.searchLoading) {
            this.searchLoading.style.display = 'block';
        }
        if (this.noResults) {
            this.noResults.style.display = 'none';
        }
        if (this.searchResultsGrid) {
            this.searchResultsGrid.style.display = 'none';
        }
    }
    
    hideLoading() {
        if (this.searchLoading) {
            this.searchLoading.style.display = 'none';
        }
        if (this.searchResultsGrid) {
            this.searchResultsGrid.style.display = 'grid';
        }
    }
    
    showNoResults(query = '') {
        this.hideLoading();
        if (this.noResults) {
            this.noResults.style.display = 'block';
            const message = document.getElementById('no-results-message');
            if (message && query) {
                message.textContent = `We couldn't find any products matching "${query}".`;
            }
        }
        if (this.searchResultsGrid) {
            this.searchResultsGrid.style.display = 'none';
        }
        if (this.loadMoreResults) {
            this.loadMoreResults.style.display = 'none';
        }
    }
    
    showError() {
        this.hideLoading();
        if (this.noResults) {
            this.noResults.style.display = 'block';
            const message = document.getElementById('no-results-message');
            if (message) {
                message.textContent = 'Sorry, there was an error processing your search. Please try again.';
            }
        }
    }
    
    getSampleProducts() {
        return [
            {
                id: 'sample-1',
                title: 'Sample Smartphone - Latest Model with Amazing Features',
                category: 'Electronics',
                price: '₹15,999 ₹25,999',
                rating: '(4.2)',
                posted_date: new Date().toISOString(),
                affiliate_link: '#',
                image: null,
                description: 'High-quality smartphone with excellent camera'
            },
            {
                id: 'sample-2',
                title: 'Trendy Fashion T-Shirt - Premium Cotton Fabric',
                category: 'Fashion',
                price: '₹999 ₹1,999',
                rating: '(4.5)',
                posted_date: new Date().toISOString(),
                affiliate_link: '#',
                image: null,
                description: 'Comfortable and stylish t-shirt for daily wear'
            },
            {
                id: 'sample-3',
                title: 'Home Decor Item - Modern Design for Living Room',
                category: 'Home',
                price: '₹2,499 ₹4,999',
                rating: '(4.0)',
                posted_date: new Date().toISOString(),
                affiliate_link: '#',
                image: null,
                description: 'Beautiful home decor to enhance your living space'
            },
            {
                id: 'sample-4',
                title: 'Gaming Headset - High Quality Audio Experience',
                category: 'Gaming',
                price: '₹3,499 ₹5,999',
                rating: '(4.6)',
                posted_date: new Date().toISOString(),
                affiliate_link: '#',
                image: null,
                description: 'Professional gaming headset with surround sound'
            },
            {
                id: 'sample-5',
                title: 'Fitness Tracker - Smart Watch with Health Monitor',
                category: 'Sports',
                price: '₹8,999 ₹12,999',
                rating: '(4.3)',
                posted_date: new Date().toISOString(),
                affiliate_link: '#',
                image: null,
                description: 'Advanced fitness tracker with heart rate monitoring'
            }
        ];
    }
}

// Global functions for compatibility
window.clearAllFilters = function() {
    if (window.thriftSearchSystem) {
        window.thriftSearchSystem.clearFilters();
    }
};

window.trackClick = function(productId) {
    console.log('Product click tracked:', productId);
    // Add your tracking logic here
    if (gtag) {
        gtag('event', 'click', {
            'event_category': 'Product',
            'event_label': productId
        });
    }
};

window.toggleWishlist = function(productId, element) {
    console.log('Wishlist toggled for:', productId);
    element.classList.toggle('active');
    const icon = element.querySelector('i');
    if (icon) {
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
    }
    
    // Update wishlist count
    const wishlistCount = document.querySelector('.wishlist-count');
    if (wishlistCount) {
        const currentCount = parseInt(wishlistCount.textContent) || 0;
        const newCount = element.classList.contains('active') ? currentCount + 1 : Math.max(0, currentCount - 1);
        wishlistCount.textContent = newCount;
    }
};

window.shareProduct = function(productId) {
    console.log('Share product:', productId);
    const currentURL = window.location.href;
    const shareData = {
        title: 'Great Deal Found!',
        text: 'Check out this amazing deal on Thrift Zone',
        url: currentURL
    };
    
    if (navigator.share) {
        navigator.share(shareData).catch(console.error);
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(currentURL).then(() => {
            alert('Link copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = currentURL;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Link copied to clipboard!');
        });
    }
};

// Initialize search system when DOM is ready
function initializeSearchSystem() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.thriftSearchSystem = new ThriftZoneSearchSystem();
        });
    } else {
        window.thriftSearchSystem = new ThriftZoneSearchSystem();
    }
}

// Auto-initialize
initializeSearchSystem();

// Export for global access
window.ThriftZoneSearchSystem = ThriftZoneSearchSystem;
