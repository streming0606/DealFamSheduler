// Global variables
let allProducts = [];
let displayedProducts = 0;
const productsPerPage = 12;
let currentFilter = 'all';

// DOM Elements
const productsContainer = document.getElementById('products-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryCards = document.querySelectorAll('.category-card');
const totalDealsSpan = document.getElementById('total-deals');

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    updateLastRefresh();
});

// Load products from JSON file
async function loadProducts() {
    try {
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

// Render products based on current filter
function renderProducts() {
    const filteredProducts = getFilteredProducts();
    const productsToShow = filteredProducts.slice(0, displayedProducts + productsPerPage);
    
    if (productsToShow.length === 0) {
        showEmptyState();
        return;
    }
    
    productsContainer.innerHTML = '';
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
    
    displayedProducts = productsToShow.length;
    
    // Update load more button
    if (displayedProducts >= filteredProducts.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// Create individual product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', product.category);
    
    // Format date
    const date = new Date(product.posted_date);
    const formattedDate = date.toLocaleDateString('en-IN');
    
    card.innerHTML = `
        <div class="product-image">
            ${product.image ? `<img src="${product.image}" alt="${product.title}" style="width:100%;height:100%;object-fit:cover;">` : '<i class="fas fa-image"></i>'}
        </div>
        <div class="product-info">
            <div class="product-category">${product.category}</div>
            <h3 class="product-title">${product.title}</h3>
            <div class="product-meta">
                <span class="product-price">${product.price}</span>
                <span class="product-rating">${product.rating}</span>
            </div>
            <div class="product-date">Posted: ${formattedDate}</div>
            <a href="${product.affiliate_link}" target="_blank" class="deal-btn" onclick="trackClick('${product.id}')">
                🛒 Get Deal Now
            </a>
        </div>
    `;
    
    return card;
}

// Get filtered products based on current filter
function getFilteredProducts() {
    if (currentFilter === 'all') {
        return allProducts;
    }
    return allProducts.filter(product => 
        product.category.toLowerCase() === currentFilter
    );
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
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
        });
    });
    
    // Load more button
    loadMoreBtn.addEventListener('click', function() {
        renderProducts();
    });
    
    // Category cards
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterByCategory(category);
        });
    });
    
    // Smooth scrolling for navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Filter by category
function filterByCategory(category) {
    // Update filter buttons
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

// Update category counts
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

// Update total deals count
function updateTotalDeals() {
    if (totalDealsSpan) {
        totalDealsSpan.textContent = allProducts.length;
    }
}

// Track product clicks (for analytics)
function trackClick(productId) {
    console.log(`Product clicked: ${productId}`);
    // Add analytics tracking here if needed
}

// Show empty state
function showEmptyState() {
    productsContainer.innerHTML = `
        <div class="loading">
            <i class="fas fa-search"></i>
            <p>No deals found in this category yet.</p>
            <p>Check back soon for amazing offers!</p>
        </div>
    `;
    loadMoreBtn.style.display = 'none';
}

// Show error message
function showErrorMessage() {
    productsContainer.innerHTML = `
        <div class="loading">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Unable to load deals at the moment.</p>
            <button onclick="loadProducts()" class="btn-primary">Try Again</button>
        </div>
    `;
}

// Update last refresh time
function updateLastRefresh() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN');
    console.log(`Last updated: ${timeString}`);
}

// Auto-refresh products every 5 minutes
setInterval(loadProducts, 5 * 60 * 1000);
