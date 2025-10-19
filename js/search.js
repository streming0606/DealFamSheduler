// Search Functionality for Thrift Zone
// Global variables
let allProducts = [];
let filteredProducts = [];
let displayedProducts = 0;
const productsPerPage = 12;
let currentSort = 'relevance';
let searchQuery = '';

// DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchSuggestions = document.getElementById('search-suggestions');
const resultsGrid = document.getElementById('search-results-grid');
const resultsCount = document.getElementById('results-count');
const resultsShowing = document.getElementById('results-showing');
const searchQuerySpan = document.getElementById('search-query');
const searchTitle = document.getElementById('search-results-title');
const sortSelect = document.getElementById('results-sort');
const viewToggleBtns = document.querySelectorAll('.view-btn');
const loadMoreBtn = document.getElementById('load-more-btn');
const loadMoreContainer = document.getElementById('load-more-container');
const searchLoading = document.getElementById('search-loading');
const noResults = document.getElementById('no-results');
const relatedProductsSection = document.getElementById('related-products-section');
const relatedProductsGrid = document.getElementById('related-products-grid');

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Search page initialized');
    
    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    searchQuery = urlParams.get('q') || '';
    
    if (searchQuery) {
        if (searchInput) {
            searchInput.value = searchQuery;
        }
        if (searchQuerySpan) {
            searchQuerySpan.textContent = `"${searchQuery}"`;
        }
        if (searchTitle) {
            searchTitle.textContent = `Search Results for "${searchQuery}"`;
        }
        
        // Load and search products
        loadProducts();
    } else {
        // No search query, show message
        showNoResults();
    }
    
    // Setup event listeners
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // Search form submission
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchSubmit);
    }
    
    // Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleSearchSubmit(e);
        });
    }
    
    // Search input for suggestions
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.length >= 2 && searchSuggestions) {
                searchSuggestions.classList.add('active');
            }
        });
        
        // Enter key handler
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchSubmit(e);
            }
        });
    }
    
    // Sort select
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
    
    // View toggle
    viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', handleViewToggle);
    });
    
    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProducts);
    }
    
    // Event delegation for suggestion clicks
    if (searchSuggestions) {
        searchSuggestions.addEventListener('click', function(e) {
            const suggestionItem = e.target.closest('.suggestion-item');
            if (suggestionItem) {
                const title = suggestionItem.getAttribute('data-title');
                if (title) {
                    selectSuggestion(title);
                }
            }
        });
    }
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (searchInput && searchSuggestions && 
            !searchInput.contains(e.target) && 
            !searchSuggestions.contains(e.target)) {
            searchSuggestions.classList.remove('active');
        }
    });
}

// Handle search form submission
function handleSearchSubmit(e) {
    if (e) {
        e.preventDefault();
    }
    
    const query = searchInput ? searchInput.value.trim() : '';
    
    if (query) {
        // Redirect to search page with query
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
}

// Handle search input for suggestions
let suggestionTimeout;
function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    clearTimeout(suggestionTimeout);
    
    if (query.length >= 2) {
        suggestionTimeout = setTimeout(() => {
            showSuggestions(query);
        }, 300);
    } else {
        if (searchSuggestions) {
            searchSuggestions.classList.remove('active');
            searchSuggestions.innerHTML = '';
        }
    }
}

// Show search suggestions
function showSuggestions(query) {
    if (!Array.isArray(allProducts) || allProducts.length === 0) return;
    if (!searchSuggestions) return;
    
    const suggestions = allProducts.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    
    if (suggestions.length > 0) {
        searchSuggestions.innerHTML = suggestions.map(product => `
            <div class="suggestion-item" data-title="${escapeHtml(product.title)}">
                <div class="suggestion-image">
                    <img src="${product.image}" alt="${escapeHtml(product.title)}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${highlightText(product.title, query)}</div>
                    <div class="suggestion-meta">
                        <span>${product.category}</span>
                        <span>•</span>
                        <span>${product.price}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        searchSuggestions.classList.add('active');
    } else {
        searchSuggestions.classList.remove('active');
    }
}

// Select a suggestion - FIXED VERSION
function selectSuggestion(title) {
    if (searchInput) {
        searchInput.value = title;
    }
    if (searchSuggestions) {
        searchSuggestions.classList.remove('active');
    }
    
    // Redirect to search page with the selected query
    window.location.href = `search.html?q=${encodeURIComponent(title)}`;
}

// Load products from JSON
async function loadProducts() {
    try {
        showLoading(true);
        
        console.log('📦 Loading products from data/products.json...');
        const response = await fetch('data/products.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 Raw data loaded:', data);
        
        // Handle different JSON structures
        if (Array.isArray(data)) {
            allProducts = data;
        } else if (data.products && Array.isArray(data.products)) {
            allProducts = data.products;
        } else if (typeof data === 'object') {
            const keys = Object.keys(data);
            const arrayKey = keys.find(key => Array.isArray(data[key]));
            if (arrayKey) {
                allProducts = data[arrayKey];
            } else {
                throw new Error('No array found in JSON data');
            }
        } else {
            throw new Error('Invalid JSON structure');
        }
        
        console.log(`✅ Loaded ${allProducts.length} products`);
        console.log('🔍 First product:', allProducts[0]);
        
        if (!Array.isArray(allProducts)) {
            throw new Error('allProducts is not an array after loading');
        }
        
        // Filter products based on search query
        searchProducts();
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        console.error('Error details:', error.message);
        showLoading(false);
        showNoResults();
        
        if (noResults) {
            const noResultsText = noResults.querySelector('p');
            if (noResultsText) {
                noResultsText.textContent = `Error: ${error.message}. Please check the console for details.`;
            }
        }
    }
}

// Search products based on query
function searchProducts() {
    if (!searchQuery) {
        filteredProducts = [];
        showLoading(false);
        showNoResults();
        if (relatedProductsSection) {
            relatedProductsSection.style.display = 'none';
        }
        return;
    }
    
    if (!Array.isArray(allProducts)) {
        console.error('❌ allProducts is not an array:', typeof allProducts);
        showLoading(false);
        showNoResults();
        return;
    }
    
    const query = searchQuery.toLowerCase();
    console.log(`🔍 Searching for: "${query}"`);
    
    // Filter products by title, category, or ASIN
    filteredProducts = allProducts.filter(product => {
        if (!product) return false;
        
        const titleMatch = product.title && product.title.toLowerCase().includes(query);
        const categoryMatch = product.category && product.category.toLowerCase().includes(query);
        const asinMatch = product.asin && product.asin.toLowerCase().includes(query);
        
        return titleMatch || categoryMatch || asinMatch;
    });
    
    console.log(`📊 Found ${filteredProducts.length} matching products`);
    
    // Update UI
    updateResultsCount();
    
    // Sort products
    sortProducts();
    
    // Display products
    displayedProducts = 0;
    if (resultsGrid) {
        resultsGrid.innerHTML = '';
    }
    
    showLoading(false);
    
    if (filteredProducts.length > 0) {
        loadMoreProducts();
        if (noResults) {
            noResults.style.display = 'none';
        }
        
        // Show related products
        showRelatedProducts();
    } else {
        showNoResults();
        if (relatedProductsSection) {
            relatedProductsSection.style.display = 'none';
        }
    }
}

// Sort products
function sortProducts() {
    if (!Array.isArray(filteredProducts)) return;
    
    switch(currentSort) {
        case 'newest':
            filteredProducts.sort((a, b) => {
                const dateA = new Date(a.posted_date || 0);
                const dateB = new Date(b.posted_date || 0);
                return dateB - dateA;
            });
            break;
            
        case 'price-low':
            filteredProducts.sort((a, b) => 
                extractPrice(a.price) - extractPrice(b.price)
            );
            break;
            
        case 'price-high':
            filteredProducts.sort((a, b) => 
                extractPrice(b.price) - extractPrice(a.price)
            );
            break;
            
        case 'relevance':
        default:
            // Already sorted by relevance (filter order)
            break;
    }
}

// Extract numeric price from price string
function extractPrice(priceString) {
    if (!priceString) return 0;
    const match = priceString.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, '')) : 0;
}

// Handle sort change
function handleSortChange(e) {
    currentSort = e.target.value;
    console.log(`📊 Sorting by: ${currentSort}`);
    
    sortProducts();
    
    // Re-render products
    displayedProducts = 0;
    if (resultsGrid) {
        resultsGrid.innerHTML = '';
    }
    loadMoreProducts();
}

// Handle view toggle
function handleViewToggle(e) {
    const view = e.currentTarget.dataset.view;
    
    viewToggleBtns.forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    if (resultsGrid) {
        if (view === 'list') {
            resultsGrid.classList.add('list-view');
        } else {
            resultsGrid.classList.remove('list-view');
        }
    }
}

// Load more products
function loadMoreProducts() {
    if (!Array.isArray(filteredProducts)) {
        console.error('❌ Cannot load more: filteredProducts is not an array');
        return;
    }
    
    if (!resultsGrid) {
        console.error('❌ Results grid not found');
        return;
    }
    
    const start = displayedProducts;
    const end = Math.min(start + productsPerPage, filteredProducts.length);
    
    const productsToShow = filteredProducts.slice(start, end);
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        resultsGrid.insertAdjacentHTML('beforeend', productCard);
    });
    
    displayedProducts = end;
    
    updateResultsCount();
    
    // Show/hide load more button
    if (loadMoreContainer) {
        if (displayedProducts < filteredProducts.length) {
            loadMoreContainer.style.display = 'block';
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }
}

// Create product card HTML - FIXED TO REDIRECT TO PRODUCT PAGE
function createProductCard(product) {
    if (!product) return '';
    
    const highlightedTitle = highlightText(product.title || 'No title', searchQuery);
    const productImage = product.image || 'images/placeholder.jpg';
    const productPrice = product.price || 'N/A';
    const productCategory = product.category || 'general';
    const productLink = product.affiliate_link || '#';
    const productRating = product.rating || '';
    const productId = product.id || product.asin || '';
    const titleSlug = (product.title || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
    
    return `
        <div class="product-card" 
             data-category="${productCategory}" 
             onclick="openProductPage('${escapeHtml(productId)}', '${escapeHtml(product.title || 'Product')}')" 
             style="cursor: pointer;">
            <div class="product-image-container">
                <img src="${productImage}" 
                     alt="${escapeHtml(product.title || 'Product')}" 
                     class="product-image"
                     onerror="this.src='images/placeholder.jpg'">
            </div>
            <div class="product-info">
                <h3 class="product-title">${highlightedTitle}</h3>
                ${productRating ? `
                    <div class="product-rating">
                        <span class="rating-stars">${productRating}</span>
                    </div>
                ` : ''}
                <div class="product-price">
                    <span class="current-price">${productPrice}</span>
                </div>
                <div class="product-category">
                    <span class="category-tag">${productCategory}</span>
                </div>
                <div class="product-actions">
                    <a href="product.html?id=${encodeURIComponent(productId)}&title=${encodeURIComponent(titleSlug)}" 
                       class="product-link"
                       onclick="event.stopPropagation()">
                        <i class="fas fa-shopping-cart"></i>
                        View Deal
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Product page navigation function (same as homepage)
function openProductPage(productId, productTitle) {
    const titleSlug = (productTitle || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
    
    const productUrl = `product.html?id=${encodeURIComponent(productId)}&title=${encodeURIComponent(titleSlug)}`;
    window.location.href = productUrl;
}

// Update results count
function updateResultsCount() {
    const total = filteredProducts.length;
    const showing = Math.min(displayedProducts, total);
    
    if (resultsCount) {
        resultsCount.textContent = `${total} result${total !== 1 ? 's' : ''} found`;
    }
    
    if (resultsShowing) {
        resultsShowing.textContent = `Showing ${showing} of ${total} results`;
    }
}

// Show/hide loading state
function showLoading(show) {
    if (show) {
        if (searchLoading) searchLoading.style.display = 'block';
        if (resultsGrid) resultsGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'none';
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    } else {
        if (searchLoading) searchLoading.style.display = 'none';
        if (resultsGrid) resultsGrid.style.display = 'grid';
    }
}

// Show no results state
function showNoResults() {
    if (noResults) noResults.style.display = 'block';
    if (resultsGrid) resultsGrid.style.display = 'none';
    if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    
    if (resultsCount) resultsCount.textContent = '0 results found';
    if (resultsShowing) resultsShowing.textContent = 'Showing 0 results';
}

// Clear search
function clearSearch() {
    if (searchInput) {
        searchInput.value = '';
    }
    window.location.href = 'index.html';
}

// Highlight search terms in text
function highlightText(text, query) {
    if (!text) return '';
    if (!query || query.length < 2) return escapeHtml(text);
    
    const escapedText = escapeHtml(text);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    return escapedText.replace(regex, '<mark>$1</mark>');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Related Products Functionality
let relatedProducts = [];

// Show related products based on search results
function showRelatedProducts() {
    if (!Array.isArray(allProducts) || allProducts.length === 0) {
        return;
    }
    
    if (!relatedProductsSection || !relatedProductsGrid) {
        return;
    }
    
    // Get categories from filtered products
    const searchCategories = [...new Set(filteredProducts.map(p => p.category))];
    
    console.log('🔗 Finding related products for categories:', searchCategories);
    
    // Find products from same categories that aren't in current results
    relatedProducts = allProducts.filter(product => {
        const sameCategory = searchCategories.includes(product.category);
        const notInResults = !filteredProducts.find(p => p.asin === product.asin);
        
        return sameCategory && notInResults;
    });
    
    // Shuffle and limit to 8 products
    relatedProducts = shuffleArray(relatedProducts).slice(0, 8);
    
    console.log(`🔗 Found ${relatedProducts.length} related products`);
    
    // Show related products if we have any
    if (relatedProducts.length > 0) {
        renderRelatedProducts();
        relatedProductsSection.style.display = 'block';
    } else {
        relatedProductsSection.style.display = 'none';
    }
}

// Render related products
function renderRelatedProducts() {
    if (!relatedProductsGrid) return;
    
    relatedProductsGrid.innerHTML = relatedProducts.map(product => {
        return createProductCard(product);
    }).join('');
    
    console.log('✅ Related products rendered');
}

// Shuffle array helper function
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Mobile Menu Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Mobile menu initialized');
    
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavClose = document.querySelector('.mobile-nav-close');
    const body = document.body;
    
    if (!mobileMenuToggle || !mobileNav) {
        console.log('ℹ️ Mobile menu elements not found (might not be on this page)');
        return;
    }
    
    function openMobileMenu() {
        mobileNav.classList.add('active');
        body.style.overflow = 'hidden';
        console.log('📱 Mobile menu opened');
    }
    
    function closeMobileMenu() {
        mobileNav.classList.remove('active');
        body.style.overflow = '';
        console.log('📱 Mobile menu closed');
    }
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (mobileNav.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }
    
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', function(e) {
            e.stopPropagation();
            closeMobileMenu();
        });
    }
    
    if (mobileNav) {
        mobileNav.addEventListener('click', function(e) {
            if (e.target === mobileNav) {
                closeMobileMenu();
            }
        });
    }
    
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768 && mobileNav && mobileNav.classList.contains('active')) {
                closeMobileMenu();
            }
        }, 250);
    });
    
    console.log('✅ Mobile menu functionality loaded');
});

// Make functions available globally
window.clearSearch = clearSearch;
window.selectSuggestion = selectSuggestion;
window.openProductPage = openProductPage;

console.log('✅ Search JavaScript loaded successfully');
