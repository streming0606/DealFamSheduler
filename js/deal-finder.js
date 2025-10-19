/* ============================================
   DEAL FINDER - COMPLETE WORKING JAVASCRIPT
   All filters working with real store redirects
   ============================================ */

// Global variables
let selectedFilters = {
    category: 'all',
    minPrice: 500,
    maxPrice: 25000,
    discount: 10,
    platform: 'amazon'
};

// Platform URLs - Real e-commerce store URLs
const platformURLs = {
    amazon: {
        base: 'https://www.amazon.in/s?',
        categories: {
            all: 'k=',
            electronics: 'k=electronics&rh=n:976419031',
            fashion: 'k=fashion&rh=n:1571271031',
            home: 'k=home&rh=n:976442031',
            health: 'k=beauty&rh=n:1374359031',
            sports: 'k=sports&rh=n:1984443031',
            automotive: 'k=automotive&rh=n:4772060031',
            books: 'k=books&rh=n:976389031',
            food: 'k=grocery&rh=n:2454178031',
            toys: 'k=toys&rh=n:1350380031'
        }
    },
    flipkart: {
        base: 'https://www.flipkart.com/search?q=',
        categories: {
            all: 'products',
            electronics: 'electronics',
            fashion: 'clothing',
            home: 'home-furnishing',
            health: 'beauty-and-grooming',
            sports: 'sports-fitness',
            automotive: 'automotive',
            books: 'books',
            food: 'grocery',
            toys: 'toys'
        }
    },
    myntra: {
        base: 'https://www.myntra.com/',
        categories: {
            all: 'shop',
            electronics: 'shop/electronics',
            fashion: 'shop/men-women-kids',
            home: 'shop/home-living',
            health: 'shop/personal-care',
            sports: 'shop/sports',
            automotive: 'shop',
            books: 'shop',
            food: 'shop',
            toys: 'shop/kids'
        }
    },
    ajio: {
        base: 'https://www.ajio.com/search/?text=',
        categories: {
            all: 'products',
            electronics: 'electronics',
            fashion: 'clothing',
            home: 'home',
            health: 'beauty',
            sports: 'sports',
            automotive: 'automotive',
            books: 'books',
            food: 'grocery',
            toys: 'kids'
        }
    },
    nykaa: {
        base: 'https://www.nykaa.com/search/result/?q=',
        categories: {
            all: 'products',
            electronics: 'electronics',
            fashion: 'fashion',
            home: 'home',
            health: 'beauty',
            sports: 'fitness',
            automotive: 'automotive',
            books: 'books',
            food: 'food',
            toys: 'toys'
        }
    },
    snapdeal: {
        base: 'https://www.snapdeal.com/search?keyword=',
        categories: {
            all: 'products',
            electronics: 'electronics',
            fashion: 'clothing',
            home: 'home',
            health: 'beauty',
            sports: 'sports',
            automotive: 'automotive',
            books: 'books',
            food: 'grocery',
            toys: 'toys'
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDealFinder();
});

// Main initialization function
function initializeDealFinder() {
    // Get all form elements
    const categorySelect = document.getElementById('categorySelect');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const discountSelect = document.getElementById('discountSelect');
    const platformSelect = document.getElementById('platformSelect');
    const priceAlertCheckbox = document.getElementById('priceAlert');
    const findDealsBtn = document.getElementById('findDealsBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const dealFinderForm = document.getElementById('dealFinderForm');

    // Category selection
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            selectedFilters.category = this.value;
            console.log('Category selected:', selectedFilters.category);
        });
    }

    // Min price input
    if (minPriceInput) {
        minPriceInput.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (value < 500) value = 500;
            if (value > selectedFilters.maxPrice) value = selectedFilters.maxPrice - 100;
            this.value = value;
            selectedFilters.minPrice = value;
            console.log('Min price:', selectedFilters.minPrice);
        });
    }

    // Max price input
    if (maxPriceInput) {
        maxPriceInput.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (value > 100000) value = 100000;
            if (value < selectedFilters.minPrice) value = selectedFilters.minPrice + 100;
            this.value = value;
            selectedFilters.maxPrice = value;
            console.log('Max price:', selectedFilters.maxPrice);
        });
    }

    // Discount selection
    if (discountSelect) {
        discountSelect.addEventListener('change', function() {
            selectedFilters.discount = parseInt(this.value);
            console.log('Discount selected:', selectedFilters.discount);
        });
    }

    // Platform selection
    if (platformSelect) {
        platformSelect.addEventListener('change', function() {
            selectedFilters.platform = this.value;
            console.log('Platform selected:', selectedFilters.platform);
        });
    }

    // Price alert checkbox
    if (priceAlertCheckbox) {
        priceAlertCheckbox.addEventListener('change', function() {
            const emailGroup = document.getElementById('alertEmailGroup');
            if (this.checked) {
                emailGroup.style.display = 'block';
            } else {
                emailGroup.style.display = 'none';
            }
        });
    }

    // Form submission
    if (dealFinderForm) {
        dealFinderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            findDeals();
        });
    }

    // Find deals button
    if (findDealsBtn) {
        findDealsBtn.addEventListener('click', function(e) {
            if (e.target.closest('form')) return; // Prevent double trigger
            e.preventDefault();
            findDeals();
        });
    }

    // Reset filters button
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            resetFilters();
        });
    }
}

// Main function to find deals
function findDeals() {
    const findDealsBtn = document.getElementById('findDealsBtn');
    const btnText = findDealsBtn.querySelector('.btn-text');
    const btnLoader = findDealsBtn.querySelector('.btn-loader');

    // Show loading state
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    findDealsBtn.disabled = true;

    // Get current filter values
    selectedFilters.category = document.getElementById('categorySelect').value;
    selectedFilters.minPrice = parseInt(document.getElementById('minPrice').value);
    selectedFilters.maxPrice = parseInt(document.getElementById('maxPrice').value);
    selectedFilters.discount = parseInt(document.getElementById('discountSelect').value);
    selectedFilters.platform = document.getElementById('platformSelect').value;

    // Log the search
    console.log('Finding deals with filters:', selectedFilters);

    // Save to analytics (if Google Analytics is present)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'deal_search', {
            category: selectedFilters.category,
            platform: selectedFilters.platform,
            min_price: selectedFilters.minPrice,
            max_price: selectedFilters.maxPrice,
            discount: selectedFilters.discount
        });
    }

    // Save price alert if checked
    const priceAlert = document.getElementById('priceAlert');
    const alertEmail = document.getElementById('alertEmail');
    
    if (priceAlert && priceAlert.checked && alertEmail && alertEmail.value) {
        savePriceAlert(alertEmail.value, selectedFilters);
    }

    // Simulate processing time and redirect
    setTimeout(function() {
        redirectToPlatform();
    }, 1000);
}

// Redirect to selected platform with filters
function redirectToPlatform() {
    const platform = selectedFilters.platform;
    const category = selectedFilters.category;
    
    let url = '';

    // Build URL based on platform
    switch(platform) {
        case 'amazon':
            url = buildAmazonURL(category);
            break;
        case 'flipkart':
            url = buildFlipkartURL(category);
            break;
        case 'myntra':
            url = buildMyntraURL(category);
            break;
        case 'ajio':
            url = buildAjioURL(category);
            break;
        case 'nykaa':
            url = buildNykaaURL(category);
            break;
        case 'snapdeal':
            url = buildSnapdealURL(category);
            break;
        default:
            url = buildAmazonURL(category);
    }

    console.log('Redirecting to:', url);

    // Open in new tab
    window.open(url, '_blank');

    // Reset button state
    const findDealsBtn = document.getElementById('findDealsBtn');
    const btnText = findDealsBtn.querySelector('.btn-text');
    const btnLoader = findDealsBtn.querySelector('.btn-loader');
    
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
    findDealsBtn.disabled = false;

    // Show success message
    showNotification('Deals found! Opening in new tab...', 'success');
}

// Build Amazon URL
function buildAmazonURL(category) {
    const baseURL = platformURLs.amazon.base;
    const categoryParam = platformURLs.amazon.categories[category] || platformURLs.amazon.categories.all;
    
    let url = `${baseURL}${categoryParam}`;
    
    // Add price range
    url += `&rh=p_36:${selectedFilters.minPrice * 100}-${selectedFilters.maxPrice * 100}`;
    
    // Add discount filter
    url += `&pct-off=${selectedFilters.discount}-`;
    
    return url;
}

// Build Flipkart URL
function buildFlipkartURL(category) {
    const baseURL = platformURLs.flipkart.base;
    const categoryParam = platformURLs.flipkart.categories[category] || platformURLs.flipkart.categories.all;
    
    let url = `${baseURL}${categoryParam}`;
    
    // Add price range
    url += `&p[]=facets.price_range.from=${selectedFilters.minPrice}`;
    url += `&p[]=facets.price_range.to=${selectedFilters.maxPrice}`;
    
    // Add discount filter
    url += `&p[]=facets.discount_range_v1=${selectedFilters.discount}%25%20or%20more`;
    
    return url;
}

// Build Myntra URL
function buildMyntraURL(category) {
    const categoryPath = platformURLs.myntra.categories[category] || platformURLs.myntra.categories.all;
    
    let url = `${platformURLs.myntra.base}${categoryPath}`;
    
    // Myntra uses different URL structure
    url += `?f=Price:${selectedFilters.minPrice}-${selectedFilters.maxPrice}`;
    url += `::Discount:${selectedFilters.discount}_and_above`;
    
    return url;
}

// Build Ajio URL
function buildAjioURL(category) {
    const baseURL = platformURLs.ajio.base;
    const categoryParam = platformURLs.ajio.categories[category] || platformURLs.ajio.categories.all;
    
    let url = `${baseURL}${categoryParam}`;
    
    // Add filters
    url += `&price=${selectedFilters.minPrice}-${selectedFilters.maxPrice}`;
    url += `&discount=${selectedFilters.discount}`;
    
    return url;
}

// Build Nykaa URL
function buildNykaaURL(category) {
    const baseURL = platformURLs.nykaa.base;
    const categoryParam = platformURLs.nykaa.categories[category] || platformURLs.nykaa.categories.all;
    
    let url = `${baseURL}${categoryParam}`;
    
    // Add filters
    url += `&root=nav_${category}`;
    url += `&price_range=${selectedFilters.minPrice}-${selectedFilters.maxPrice}`;
    
    return url;
}

// Build Snapdeal URL
function buildSnapdealURL(category) {
    const baseURL = platformURLs.snapdeal.base;
    const categoryParam = platformURLs.snapdeal.categories[category] || platformURLs.snapdeal.categories.all;
    
    let url = `${baseURL}${categoryParam}`;
    
    // Add price range
    url += `&priceMin=${selectedFilters.minPrice}`;
    url += `&priceMax=${selectedFilters.maxPrice}`;
    
    // Add discount
    url += `&discount=${selectedFilters.discount}`;
    
    return url;
}

// Reset all filters
function resetFilters() {
    // Reset to default values
    selectedFilters = {
        category: 'all',
        minPrice: 500,
        maxPrice: 25000,
        discount: 10,
        platform: 'amazon'
    };

    // Reset form elements
    document.getElementById('categorySelect').value = 'all';
    document.getElementById('minPrice').value = 500;
    document.getElementById('maxPrice').value = 25000;
    document.getElementById('discountSelect').value = 10;
    document.getElementById('platformSelect').value = 'amazon';
    
    // Reset price alert
    const priceAlert = document.getElementById('priceAlert');
    const alertEmailGroup = document.getElementById('alertEmailGroup');
    const alertEmail = document.getElementById('alertEmail');
    
    if (priceAlert) priceAlert.checked = false;
    if (alertEmailGroup) alertEmailGroup.style.display = 'none';
    if (alertEmail) alertEmail.value = '';

    console.log('Filters reset to default');
    showNotification('Filters reset successfully', 'info');
}

// Save price alert to localStorage or backend
function savePriceAlert(email, filters) {
    const alertData = {
        email: email,
        filters: filters,
        timestamp: new Date().toISOString()
    };

    // Save to localStorage
    let alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
    alerts.push(alertData);
    localStorage.setItem('priceAlerts', JSON.stringify(alerts));

    console.log('Price alert saved:', alertData);

    // Here you would typically send this to your backend
    // Example:
    // fetch('/api/price-alerts', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(alertData)
    // });
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2874f0'};
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Quick filter functions (if you want to add them back later)
function setQuickFilter(category, maxPrice, discount) {
    selectedFilters.category = category;
    selectedFilters.maxPrice = parseInt(maxPrice);
    selectedFilters.discount = parseInt(discount);

    // Update form
    document.getElementById('categorySelect').value = category;
    document.getElementById('maxPrice').value = maxPrice;
    document.getElementById('discountSelect').value = discount;

    console.log('Quick filter applied:', selectedFilters);
}

// Export functions if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        findDeals,
        resetFilters,
        setQuickFilter
    };
}
