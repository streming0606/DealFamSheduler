// Deals Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize deals page
    initializeDealsPage();
});

function initializeDealsPage() {
    // Load all products for deals page
    loadAllDeals();
    setupDealsPageEventListeners();
    updateDealsPageStats();
    
    // Check for category filter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFilter = urlParams.get('category');
    if (categoryFilter) {
        filterByCategory(categoryFilter);
    }
}

async function loadAllDeals() {
    try {
        showLoadingState();
        const response = await fetch('data/products.json');
        const data = await response.json();
        window.allProducts = data.products || [];
        
        renderAllProducts();
        updateDealsPageStats();
        
    } catch (error) {
        console.error('Error loading deals:', error);
        showErrorMessage();
    }
}

function renderAllProducts() {
    const filteredProducts = getFilteredProducts();
    const sortedProducts = sortProducts(filteredProducts);
    
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
    
    if (sortedProducts.length === 0) {
        showEmptyState();
        return;
    }
    
    sortedProducts.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        productsContainer.appendChild(productCard);
        
        // Add entrance animation
        setTimeout(() => {
            productCard.style.opacity = '1';
            productCard.style.transform = 'translateY(0)';
        }, index * 30);
    });
    
    // Initialize enhanced features
    setTimeout(() => {
        initializeCountdowns();
        loadUserPreferences();
    }, 500);
}

function updateDealsPageStats() {
    const totalDealsElement = document.getElementById('total-deals-page');
    if (totalDealsElement && window.allProducts) {
        totalDealsElement.textContent = window.allProducts.length;
    }
}

function setupDealsPageEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            window.currentFilter = this.getAttribute('data-filter');
            renderAllProducts();
        });
    });
    
    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            window.currentSort = this.value;
            renderAllProducts();
        });
    }
    
    // View toggle
    const viewToggle = document.getElementById('view-toggle');
    if (viewToggle) {
        viewToggle.addEventListener('click', function() {
            const productsContainer = document.getElementById('products-container');
            productsContainer.classList.toggle('list-view');
            const icon = this.querySelector('i');
            if (productsContainer.classList.contains('list-view')) {
                icon.className = 'fas fa-th';
                this.title = 'Grid View';
            } else {
                icon.className = 'fas fa-th-large';
                this.title = 'List View';
            }
        });
    }
}
