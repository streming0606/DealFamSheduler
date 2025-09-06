// Enhanced script with luxury features and image handling
let allProducts = [];
let displayedProducts = 0;
const productsPerPage = 9; // Reduced for better luxury feel
let currentFilter = 'all';

// DOM Elements
const productsContainer = document.getElementById('products-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryCards = document.querySelectorAll('.category-card');
const totalDealsSpan = document.getElementById('total-deals');

// Initialize with luxury animations
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    setupLuxuryAnimations();
    updateLastRefresh();
});

// Setup luxury scroll animations
function setupLuxuryAnimations() {
    // Add scroll effects for header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Add fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.category-card, .product-card').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// Load products with enhanced error handling
async function loadProducts() {
    try {
        showLuxuryLoader();
        const response = await fetch('data/products.json');
        const data = await response.json();
        allProducts = data.products || [];
        
        // Sort products by date (newest first) and category
        allProducts.sort((a, b) => {
            const dateA = new Date(a.posted_date);
            const dateB = new Date(b.posted_date);
            return dateB - dateA;
        });
        
        renderProducts();
        updateCategoryCounts();
        updateTotalDeals();
        hideLuxuryLoader();
        
    } catch (error) {
        console.error('Error loading products:', error);
        showLuxuryErrorMessage();
    }
}

// Enhanced product card creation with better image handling
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card fade-in';
    card.setAttribute('data-category', product.category);
    
    // Format date elegantly
    const date = new Date(product.posted_date);
    const formattedDate = date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Get better product image
    const productImage = getEnhancedProductImage(product);
    
    // Enhanced category names
    const categoryNames = {
        'electronics': 'Electronics & Gadgets',
        'fashion': 'Fashion & Style',
        'home': 'Home & Living',
        'health': 'Health & Beauty',
        'sports': 'Sports & Fitness',
        'vehicle': 'Automotive',
        'books': 'Books & Media'
    };
    
    const categoryName = categoryNames[product.category] || 'Special Offers';
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${productImage}" alt="${product.title}" class="product-image" 
                 onerror="this.src='https://via.placeholder.com/350x250/f8f9fa/6c757d?text=Product+Image'" 
                 loading="lazy">
            <div class="product-badge">Premium</div>
        </div>
        <div class="product-info">
            <div class="product-category">${categoryName}</div>
            <h3 class="product-title">${product.title}</h3>
            <div class="product-meta">
                <span class="product-price">${product.price}</span>
                <span class="product-rating">${product.rating}</span>
            </div>
            <div class="product-date">Added on ${formattedDate}</div>
            <a href="${product.affiliate_link}" target="_blank" class="deal-btn" onclick="trackLuxuryClick('${product.id}')">
                <span><i class="fas fa-shopping-bag"></i> Get Exclusive Deal</span>
            </a>
        </div>
    `;
    
    return card;
}

// Enhanced image fetching from Amazon
function getEnhancedProductImage(product) {
    // Try to extract ASIN from affiliate link
    const asinMatch = product.affiliate_link.match(/\/dp\/([A-Z0-9]{10})/);
    
    if (asinMatch) {
        const asin = asinMatch[1];
        // Try different Amazon image formats
        return `https://images-na.ssl-images-amazon.com/images/I/${asin}.01.L.jpg`;
    }
    
    // Fallback to product.image if available
    if (product.image && product.image !== '') {
        return product.image;
    }
    
    // Category-based placeholder images
    const categoryImages = {
        'electronics': 'https://via.placeholder.com/350x250/667eea/ffffff?text=Electronics',
        'fashion': 'https://via.placeholder.com/350x250/e74c3c/ffffff?text=Fashion',
        'home': 'https://via.placeholder.com/350x250/2ecc71/ffffff?text=Home',
        'health': 'https://via.placeholder.com/350x250/f39c12/ffffff?text=Health',
        'sports': 'https://via.placeholder.com/350x250/9b59b6/ffffff?text=Sports',
        'vehicle': 'https://via.placeholder.com/350x250/34495e/ffffff?text=Vehicle',
        'books': 'https://via.placeholder.com/350x250/e67e22/ffffff?text=Books'
    };
    
    return categoryImages[product.category] || categoryImages['electronics'];
}

// Render products with category separation
function renderProducts() {
    const filteredProducts = getFilteredProducts();
    
    if (filteredProducts.length === 0) {
        showLuxuryEmptyState();
        return;
    }
    
    // Clear container
    productsContainer.innerHTML = '';
    
    if (currentFilter === 'all') {
        // Show products grouped by category
        renderProductsByCategory(filteredProducts);
    } else {
        // Show filtered products
        renderFilteredProducts(filteredProducts);
    }
    
    // Setup lazy loading and animations
    setupLuxuryAnimations();
}

// Render products grouped by category
function renderProductsByCategory(products) {
    const categories = {
        'electronics': [],
        'fashion': [],
        'home': [],
        'health': [],
        'sports': [],
        'vehicle': [],
        'books': []
    };
    
    // Group products by category
    products.forEach(product => {
        if (categories[product.category]) {
            categories[product.category].push(product);
        }
    });
    
    // Render each category that has products
    Object.keys(categories).forEach(category => {
        if (categories[category].length > 0) {
            const categorySection = createCategorySection(category, categories[category]);
            productsContainer.appendChild(categorySection);
        }
    });
    
    loadMoreBtn.style.display = 'none'; // Hide load more for category view
}

// Create category section
function createCategorySection(category, products) {
    const categoryNames = {
        'electronics': 'Electronics & Gadgets',
        'fashion': 'Fashion & Style',
        'home': 'Home & Living',
        'health': 'Health & Beauty',
        'sports': 'Sports & Fitness',
        'vehicle': 'Automotive',
        'books': 'Books & Media'
    };
    
    const section = document.createElement('div');
    section.className = 'category-section';
    section.innerHTML = `
        <div class="category-header">
            <h3>${categoryNames[category]} <span class="category-count">(${products.length})</span></h3>
        </div>
        <div class="category-products-grid" id="category-${category}">
        </div>
    `;
    
    // Add CSS for category sections
    if (!document.getElementById('category-styles')) {
        const categoryStyles = document.createElement('style');
        categoryStyles.id = 'category-styles';
        categoryStyles.textContent = `
            .category-section {
                margin-bottom: 4rem;
            }
            .category-header {
                text-align: center;
                margin-bottom: 2rem;
            }
            .category-header h3 {
                font-family: 'Playfair Display', serif;
                font-size: 2.2rem;
                color: var(--luxury-dark);
                font-weight: 600;
            }
            .category-count {
                color: var(--primary-gold);
                font-size: 1.2rem;
            }
            .category-products-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 2rem;
            }
        `;
        document.head.appendChild(categoryStyles);
    }
    
    // Add products to this category
    const gridContainer = section.querySelector(`#category-${category}`);
    products.slice(0, 3).forEach(product => { // Show only first 3 products per category
        const productCard = createProductCard(product);
        gridContainer.appendChild(productCard);
    });
    
    return section;
}

// Render filtered products (single category)
function renderFilteredProducts(products) {
    const productsToShow = products.slice(0, displayedProducts + productsPerPage);
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
    
    displayedProducts = productsToShow.length;
    
    // Update load more button
    if (displayedProducts >= products.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// Enhanced loading states
function showLuxuryLoader() {
    productsContainer.innerHTML = `
        <div class="loading">
            <i class="fas fa-gem fa-spin"></i>
            <h3>Loading Premium Deals...</h3>
            <p>Curating the finest offers just for you</p>
        </div>
    `;
}

function hideLuxuryLoader() {
    // Loader will be replaced by products
}

function showLuxuryEmptyState() {
    productsContainer.innerHTML = `
        <div class="loading">
            <i class="fas fa-search-dollar"></i>
            <h3>No Premium Deals Found</h3>
            <p>We're constantly adding new luxury offers. Check back soon for exclusive deals!</p>
            <button onclick="loadProducts()" class="btn-primary">Refresh Offers</button>
        </div>
    `;
    loadMoreBtn.style.display = 'none';
}

function showLuxuryErrorMessage() {
    productsContainer.innerHTML = `
        <div class="loading">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Unable to Load Deals</h3>
            <p>Please check your connection and try again</p>
            <button onclick="loadProducts()" class="btn-primary">Retry</button>
        </div>
    `;
}

// Enhanced click tracking
function trackLuxuryClick(productId) {
    console.log(`Premium product clicked: ${productId}`);
    
    // Show elegant click feedback
    const clickFeedback = document.createElement('div');
    clickFeedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--gradient-luxury);
        color: var(--luxury-dark);
        padding: 1rem 2rem;
        border-radius: 25px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: var(--shadow-luxury);
        animation: fadeInOut 2s ease;
    `;
    clickFeedback.textContent = '🛍️ Redirecting to Amazon...';
    
    document.body.appendChild(clickFeedback);
    setTimeout(() => clickFeedback.remove(), 2000);
}

// Enhanced filter functionality
function setupEventListeners() {
    // Filter buttons with luxury animations
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update current filter
            currentFilter = this.getAttribute('data-filter');
            
            // Reset displayed products and render
            displayedProducts = 0;
            renderProducts();
            
            // Smooth scroll to products
            document.getElementById('deals').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        });
    });
    
    // Category cards
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterByCategory(category);
        });
    });
    
    // Load more button
    loadMoreBtn.addEventListener('click', function() {
        renderProducts();
    });
}

// Rest of your existing functions remain the same...
// (updateCategoryCounts, filterByCategory, etc.)
