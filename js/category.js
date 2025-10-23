// Category Page JavaScript - FINAL FIXED VERSION
console.log('🚀 Category page loaded');

// Get category from URL
function getCategoryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('cat') || 'all';
}

// Category configuration
const categoryConfig = {
    electronics: { title: 'Electronics', description: 'Best deals on gadgets, phones, laptops and more', icon: 'fa-laptop' },
    fashion: { title: 'Fashion', description: 'Trendy clothing, shoes and accessories', icon: 'fa-tshirt' },
    home: { title: 'Home & Kitchen', description: 'Everything for your home and kitchen', icon: 'fa-home' },
    health: { title: 'Health & Beauty', description: 'Health, fitness and beauty products', icon: 'fa-heart-pulse' },
    sports: { title: 'Sports & Fitness', description: 'Sports equipment and fitness gear', icon: 'fa-dumbbell' },
    vehicle: { title: 'Vehicles & Parts', description: 'Vehicle accessories and parts', icon: 'fa-car' },
    books: { title: 'Books & Media', description: 'Books, magazines and media', icon: 'fa-book' },
    gaming: { title: 'Gaming', description: 'Gaming consoles, games and accessories', icon: 'fa-gamepad' },
    food: { title: 'Food & Grocery', description: 'Food items and grocery essentials', icon: 'fa-utensils' },
    all: { title: 'All Products', description: 'Browse all available deals', icon: 'fa-box' }
};

// Global variables
let currentCategory = getCategoryFromURL();
let allProducts = [];
let filteredProducts = [];
let displayedProducts = 0;
const productsPerPage = 12;

let filters = {
    minPrice: null,
    maxPrice: null,
    discounts: [],
    ratings: [],
    searchQuery: ''
};

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const loadMoreBtn = document.getElementById('load-more-btn');
const noProductsMsg = document.getElementById('no-products');
const totalProductsSpan = document.getElementById('total-products');
const showingCountSpan = document.getElementById('showing-count');
const sortSelect = document.getElementById('sort-select');
const categorySearch = document.getElementById('category-search');
const filterToggleBtn = document.getElementById('filter-toggle-btn');
const filtersSidebar = document.getElementById('filters-sidebar');
const closeFiltersBtn = document.getElementById('close-filters');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
const applyPriceBtn = document.getElementById('apply-price-btn');
const clearFiltersBtn = document.getElementById('clear-filters-btn');
const discountFilters = document.querySelectorAll('.discount-filter');
const ratingFilters = document.querySelectorAll('.rating-filter');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const closeMobileMenu = document.getElementById('close-mobile-menu');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Initializing for:', currentCategory);
    initializePage();
});

async function initializePage() {
    setCategoryInfo();
    await loadProducts();
    setupEventListeners();
    initMobileMenu();
}

function setCategoryInfo() {
    const config = categoryConfig[currentCategory] || categoryConfig.all;
    document.getElementById('category-title').textContent = config.title;
    document.getElementById('category-description').textContent = config.description;
    document.getElementById('category-breadcrumb').textContent = config.title;
    document.getElementById('page-title').textContent = `${config.title} - Thrift Maal`;
    document.querySelector('.category-icon i').className = `fas ${config.icon}`;
}

async function loadProducts() {
    try {
        console.log('📦 Loading from data/products.json...');
        const response = await fetch('data/products.json');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        let data = await response.json();
        console.log('📊 Raw data type:', typeof data, Array.isArray(data));
        
        // IMPORTANT FIX: Handle if data is object with products array inside
        if (!Array.isArray(data)) {
            console.log('⚠️ Data is not array, checking for products property...');
            if (data.products && Array.isArray(data.products)) {
                data = data.products;
                console.log('✅ Found products array inside object');
            } else if (typeof data === 'object') {
                // Convert object to array
                data = Object.values(data);
                console.log('✅ Converted object to array');
            } else {
                throw new Error('Invalid products.json format');
            }
        }
        
        console.log(`✅ Loaded ${data.length} products`);
        
        // Filter by category
        if (currentCategory === 'all') {
            allProducts = data;
        } else {
            allProducts = data.filter(product => {
                return product && product.category === currentCategory;
            });
        }
        
        console.log(`📊 ${allProducts.length} products in "${currentCategory}"`);
        
        applyFilters();
        
    } catch (error) {
        console.error('❌ Error:', error);
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #EF4444; margin-bottom: 1rem;"></i>
                <h3 style="color: #EF4444; margin-bottom: 0.5rem;">Failed to Load Products</h3>
                <p style="color: #666;">${error.message}</p>
                <p style="font-size: 0.9rem; color: #999; margin-top: 1rem;">Check browser console for details</p>
            </div>
        `;
    }
}

function applyFilters() {
    filteredProducts = allProducts.filter(product => {
        if (!product) return false;
        
        const price = extractPrice(product.price);
        if (filters.minPrice && price < filters.minPrice) return false;
        if (filters.maxPrice && price > filters.maxPrice) return false;
        
        if (filters.discounts.length > 0) {
            const discount = product.discount || calculateDiscount(price);
            if (discount < Math.max(...filters.discounts)) return false;
        }
        
        if (filters.ratings.length > 0) {
            const rating = product.rating || 4.0;
            if (rating < Math.max(...filters.ratings)) return false;
        }
        
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const title = (product.title || '').toLowerCase();
            if (!title.includes(query)) return false;
        }
        
        return true;
    });
    
    console.log(`✅ ${filteredProducts.length} products after filters`);
    
    applySorting();
    displayedProducts = 0;
    productsGrid.innerHTML = '';
    updateProductCounts();
    displayProducts();
}

function applySorting() {
    filteredProducts.sort((a, b) => {
        const sortValue = sortSelect.value;
        switch(sortValue) {
            case 'price-low':
                return extractPrice(a.price) - extractPrice(b.price);
            case 'price-high':
                return extractPrice(b.price) - extractPrice(a.price);
            case 'discount':
                return (b.discount || 30) - (a.discount || 30);
            case 'rating':
                return (b.rating || 4.0) - (a.rating || 4.0);
            default:
                return new Date(b.posted_date || 0) - new Date(a.posted_date || 0);
        }
    });
}

function displayProducts() {
    const productsToShow = filteredProducts.slice(displayedProducts, displayedProducts + productsPerPage);
    
    if (productsToShow.length === 0 && displayedProducts === 0) {
        showNoProducts();
        return;
    }
    
    hideNoProducts();
    
    productsToShow.forEach(product => {
        const card = createProductCard(product);
        productsGrid.appendChild(card);
    });
    
    displayedProducts += productsToShow.length;
    loadMoreBtn.style.display = displayedProducts < filteredProducts.length ? 'inline-flex' : 'none';
    updateProductCounts();
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const price = extractPrice(product.price);
    const discount = product.discount || calculateDiscount(price);
    const rating = product.rating || 4.0;
    const originalPrice = discount > 0 ? Math.round(price / (1 - discount / 100)) : price;
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image || 'https://via.placeholder.com/300x300?text=No+Image'}" 
                 alt="${escapeHtml(product.title)}" 
                 loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
            ${discount > 0 ? `<span class="discount-badge">${discount}% OFF</span>` : ''}
            <button class="wishlist-icon" onclick="toggleWishlistGlobal(this, event)">
                <i class="far fa-heart"></i>
            </button>
        </div>
        <div class="product-info">
            <h3 class="product-title">${truncateTitle(product.title, 60)}</h3>
            <div class="product-rating">
                ${generateStars(rating)}
                <span class="rating-count">(${Math.floor(Math.random() * 500) + 50})</span>
            </div>
            <div class="product-price">
                <span class="current-price">${product.price || '₹0'}</span>
                ${discount > 0 ? `<span class="original-price">₹${originalPrice}</span>` : ''}
            </div>
            <a href="${product.affiliate_link || '#'}" target="_blank" rel="noopener noreferrer" class="buy-btn">
                <i class="fas fa-shopping-cart"></i> View Deal
            </a>
        </div>
    `;
    
    return card;
}










// Search functionality for categorypage
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('.search-box');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    // Handle search submission
    if (searchForm && searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleSearch();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }

    function handleSearch() {
        const query = searchInput.value.trim();
        
        if (query) {
            // Redirect to search page with query
            window.location.href = `search?q=${encodeURIComponent(query)}`;
        }
    }
});














// Global wishlist function
window.toggleWishlistGlobal = function(button, event) {
    event.preventDefault();
    event.stopPropagation();
    const icon = button.querySelector('i');
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
};

function extractPrice(priceString) {
    if (!priceString) return 0;
    return parseInt(String(priceString).replace(/[^0-9]/g, '')) || 0;
}

function calculateDiscount(price) {
    if (price > 5000) return Math.floor(Math.random() * 30) + 30;
    if (price > 1000) return Math.floor(Math.random() * 30) + 20;
    return Math.floor(Math.random() * 30) + 10;
}

function truncateTitle(title, maxLength) {
    if (!title) return 'Product';
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) stars += '<i class="fas fa-star"></i>';
        else if (i - 0.5 <= rating) stars += '<i class="fas fa-star-half-alt"></i>';
        else stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

function updateProductCounts() {
    totalProductsSpan.textContent = filteredProducts.length;
    showingCountSpan.textContent = displayedProducts;
}

function showNoProducts() {
    productsGrid.style.display = 'none';
    noProductsMsg.style.display = 'block';
    loadMoreBtn.style.display = 'none';
}

function hideNoProducts() {
    productsGrid.style.display = 'grid';
    noProductsMsg.style.display = 'none';
}

function setupEventListeners() {
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', displayProducts);
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
    
    if (applyPriceBtn) {
        applyPriceBtn.addEventListener('click', () => {
            filters.minPrice = minPriceInput.value ? parseInt(minPriceInput.value) : null;
            filters.maxPrice = maxPriceInput.value ? parseInt(maxPriceInput.value) : null;
            applyFilters();
        });
    }
    
    discountFilters.forEach(filter => {
        filter.addEventListener('change', (e) => {
            if (e.target.checked) {
                filters.discounts.push(parseInt(e.target.value));
            } else {
                filters.discounts = filters.discounts.filter(d => d !== parseInt(e.target.value));
            }
            applyFilters();
        });
    });
    
    ratingFilters.forEach(filter => {
        filter.addEventListener('change', (e) => {
            if (e.target.checked) {
                filters.ratings.push(parseInt(e.target.value));
            } else {
                filters.ratings = filters.ratings.filter(r => r !== parseInt(e.target.value));
            }
            applyFilters();
        });
    });
    
    let searchTimeout;
    if (categorySearch) {
        categorySearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filters.searchQuery = e.target.value;
                applyFilters();
            }, 500);
        });
    }
    
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearAllFilters);
    if (filterToggleBtn) filterToggleBtn.addEventListener('click', openFilters);
    if (closeFiltersBtn) closeFiltersBtn.addEventListener('click', closeFilters);
    
    createFilterOverlay();
}

function clearAllFilters() {
    filters = { minPrice: null, maxPrice: null, discounts: [], ratings: [], searchQuery: '' };
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';
    if (categorySearch) categorySearch.value = '';
    discountFilters.forEach(f => f.checked = false);
    ratingFilters.forEach(f => f.checked = false);
    applyFilters();
}

function createFilterOverlay() {
    if (!document.querySelector('.filter-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'filter-overlay';
        overlay.addEventListener('click', closeFilters);
        document.body.appendChild(overlay);
    }
}

function openFilters() {
    if (filtersSidebar) filtersSidebar.classList.add('active');
    const overlay = document.querySelector('.filter-overlay');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFilters() {
    if (filtersSidebar) filtersSidebar.classList.remove('active');
    const overlay = document.querySelector('.filter-overlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function initMobileMenu() {
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    if (closeMobileMenu && mobileMenu) {
        closeMobileMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
}

console.log('✅ Category script ready');
