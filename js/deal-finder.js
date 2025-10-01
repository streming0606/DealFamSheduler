// Deal Finder JavaScript
class DealFinder {
    constructor() {
        this.selectedCategory = 'all';
        this.selectedDiscount = 25;
        this.selectedPlatform = 'amazon';
        this.minPrice = 500;
        this.maxPrice = 25000;
        this.priceAlert = false;
        this.alertEmail = '';
        
        this.init();
    }
    
    init() {
        this.attachEventListeners();
        this.setDefaultSelections();
        this.loadTrendingData();
    }
    
    attachEventListeners() {
        // Category selection
        document.querySelectorAll('.category-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectCategory(e.currentTarget.dataset.category);
            });
        });
        
        // Discount selection
        document.querySelectorAll('.discount-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectDiscount(parseInt(e.currentTarget.dataset.discount));
            });
        });
        
        // Platform selection
        document.querySelectorAll('.platform-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectPlatform(e.currentTarget.dataset.platform);
            });
        });
        
        // Price range inputs
        document.getElementById('minPrice').addEventListener('input', (e) => {
            this.minPrice = parseInt(e.target.value);
            this.validatePriceRange();
        });
        
        document.getElementById('maxPrice').addEventListener('input', (e) => {
            this.maxPrice = parseInt(e.target.value);
            this.validatePriceRange();
        });
        
        // Price quick select buttons
        document.querySelectorAll('.price-quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setQuickPriceRange(e.currentTarget.dataset.range);
            });
        });
        
        // Price alert checkbox
        document.getElementById('priceAlert').addEventListener('change', (e) => {
            this.togglePriceAlert(e.target.checked);
        });
        
        // Form submission
        document.getElementById('dealFinderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.findDeals();
        });
        
        // Reset filters
        document.getElementById('resetFiltersBtn').addEventListener('click', () => {
            this.resetFilters();
        });
    }
    
    setDefaultSelections() {
        // Set default category
        document.querySelector(`[data-category="${this.selectedCategory}"]`).classList.add('selected');
        
        // Set default discount
        document.querySelector(`[data-discount="${this.selectedDiscount}"]`).classList.add('selected');
        
        // Set default platform (Amazon - priority)
        document.querySelector(`[data-platform="${this.selectedPlatform}"]`).classList.add('selected');
    }
    
    selectCategory(category) {
        // Remove previous selection
        document.querySelectorAll('.category-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add new selection
        document.querySelector(`[data-category="${category}"]`).classList.add('selected');
        this.selectedCategory = category;
        
        // Track selection
        this.trackEvent('category_selected', { category });
    }
    
    selectDiscount(discount) {
        // Remove previous selection
        document.querySelectorAll('.discount-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add new selection
        document.querySelector(`[data-discount="${discount}"]`).classList.add('selected');
        this.selectedDiscount = discount;
        
        // Track selection
        this.trackEvent('discount_selected', { discount });
    }
    
    selectPlatform(platform) {
        // Remove previous selection
        document.querySelectorAll('.platform-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add new selection
        document.querySelector(`[data-platform="${platform}"]`).classList.add('selected');
        this.selectedPlatform = platform;
        
        // Track selection
        this.trackEvent('platform_selected', { platform });
    }
    
    setQuickPriceRange(range) {
        const [min, max] = range.split('-').map(price => parseInt(price));
        
        document.getElementById('minPrice').value = min;
        document.getElementById('maxPrice').value = max || 100000;
        
        this.minPrice = min;
        this.maxPrice = max || 100000;
        
        // Update active button
        document.querySelectorAll('.price-quick-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-range="${range}"]`).classList.add('active');
        
        this.validatePriceRange();
    }
    
    validatePriceRange() {
        const minInput = document.getElementById('minPrice');
        const maxInput = document.getElementById('maxPrice');
        
        if (this.minPrice >= this.maxPrice) {
            maxInput.style.borderColor = '#EF4444';
            return false;
        } else {
            minInput.style.borderColor = '';
            maxInput.style.borderColor = '';
            return true;
        }
    }
    
    togglePriceAlert(enabled) {
        this.priceAlert = enabled;
        const emailGroup = document.getElementById('alertEmailGroup');
        
        if (enabled) {
            emailGroup.style.display = 'block';
        } else {
            emailGroup.style.display = 'none';
        }
    }
    
    async findDeals() {
        if (!this.validatePriceRange()) {
            this.showNotification('Please enter a valid price range', 'error');
            return;
        }
        
        const btn = document.getElementById('findDealsBtn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');
        
        // Show loading state
        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        
        try {
            // Simulate search delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Get price alert email if enabled
            if (this.priceAlert) {
                this.alertEmail = document.getElementById('alertEmail').value;
                if (this.alertEmail && this.isValidEmail(this.alertEmail)) {
                    this.savePriceAlert();
                }
            }
            
            // Generate affiliate URL and redirect
            const affiliateUrl = this.generateAffiliateUrl();
            
            // Track the search
            this.trackEvent('deal_search', {
                category: this.selectedCategory,
                platform: this.selectedPlatform,
                discount: this.selectedDiscount,
                price_min: this.minPrice,
                price_max: this.maxPrice
            });
            
            // Redirect to platform with affiliate link
            window.open(affiliateUrl, '_blank');
            
            // Show success message
            this.showNotification('Redirecting to ' + this.getPlatformName(this.selectedPlatform) + '...', 'success');
            
        } catch (error) {
            console.error('Error finding deals:', error);
            this.showDealNotFoundModal();
        } finally {
            // Reset button state
            btn.disabled = false;
            btnText.style.display = 'flex';
            btnLoader.style.display = 'none';
        }
    }
    
    generateAffiliateUrl() {
        const platformUrls = {
            amazon: this.generateAmazonUrl(),
            flipkart: this.generateFlipkartUrl(),
            myntra: this.generateMyntraUrl(),
            ajio: this.generateAjioUrl(),
            nykaa: this.generateNykaaUrl(),
            snapdeal: this.generateSnapdealUrl()
        };
        
        return platformUrls[this.selectedPlatform] || platformUrls.amazon;
    }
    
    generateAmazonUrl() {
        const baseUrl = 'https://www.amazon.in/s';
        const params = new URLSearchParams();
        
        // Add search term based on category
        if (this.selectedCategory !== 'all') {
            params.append('k', this.getCategorySearchTerm(this.selectedCategory));
        }
        
        // Add price range
        params.append('rh', `p_36:${this.minPrice * 100}-${this.maxPrice * 100}`);
        
        // Add discount filter
        if (this.selectedDiscount > 10) {
            params.append('rh', `p_n_pct-off-with-tax:${this.selectedDiscount}-`);
        }
        
        // Add affiliate tag (replace with your actual Amazon affiliate ID)
        params.append('tag', 'thriftzone-21');
        
        // Add sorting
        params.append('sort', 'price-asc-rank');
        
        return `${baseUrl}?${params.toString()}`;
    }
    
    generateFlipkartUrl() {
        const baseUrl = 'https://www.flipkart.com/search';
        const params = new URLSearchParams();
        
        if (this.selectedCategory !== 'all') {
            params.append('q', this.getCategorySearchTerm(this.selectedCategory));
        }
        
        // Add price filter
        params.append('p[]', `facets.price_range.from=${this.minPrice}`);
        params.append('p[]', `facets.price_range.to=${this.maxPrice}`);
        
        // Add discount filter
        if (this.selectedDiscount > 10) {
            params.append('p[]', `facets.discount_range_v1:${this.selectedDiscount}%25%20or%20more`);
        }
        
        // Add affiliate parameter (replace with your actual Flipkart affiliate ID)
        params.append('affid', 'thriftzone');
        
        return `${baseUrl}?${params.toString()}`;
    }
    
    generateMyntraUrl() {
        const baseUrl = 'https://www.myntra.com';
        let categoryPath = '';
        
        if (this.selectedCategory === 'fashion') {
            categoryPath = '/shop/women';
        } else {
            categoryPath = '/all';
        }
        
        // Add affiliate parameters (replace with your actual Myntra affiliate details)
        return `${baseUrl}${categoryPath}?rf=Affiliates%3A1&utm_source=thriftzone`;
    }
    
    generateAjioUrl() {
        const baseUrl = 'https://www.ajio.com';
        const params = new URLSearchParams();
        
        if (this.selectedCategory === 'fashion') {
            params.append('query', ':relevance:category:Men:category:Women');
        }
        
        // Add price range
        params.append('query', `:price-range:${this.minPrice}-${this.maxPrice}`);
        
        return `${baseUrl}/shop/sale?${params.toString()}`;
    }
    
    generateNykaaUrl() {
        const baseUrl = 'https://www.nykaa.com';
        
        if (this.selectedCategory === 'health' || this.selectedCategory === 'all') {
            return `${baseUrl}/beauty-offers`;
        }
        
        return baseUrl;
    }
    
    generateSnapdealUrl() {
        const baseUrl = 'https://www.snapdeal.com';
        const params = new URLSearchParams();
        
        if (this.selectedCategory !== 'all') {
            params.append('keyword', this.getCategorySearchTerm(this.selectedCategory));
        }
        
        // Add price filter
        params.append('priceMin', this.minPrice);
        params.append('priceMax', this.maxPrice);
        
        return `${baseUrl}/search?${params.toString()}`;
    }
    
    getCategorySearchTerm(category) {
        const categoryTerms = {
            electronics: 'electronics',
            fashion: 'clothing fashion',
            home: 'home kitchen',
            health: 'health beauty',
            sports: 'sports fitness',
            automotive: 'automotive',
            books: 'books',
            food: 'grocery food',
            toys: 'toys games'
        };
        
        return categoryTerms[category] || category;
    }
    
    getPlatformName(platform) {
        const names = {
            amazon: 'Amazon India',
            flipkart: 'Flipkart',
            myntra: 'Myntra',
            ajio: 'Ajio',
            nykaa: 'Nykaa',
            snapdeal: 'Snapdeal'
        };
        
        return names[platform] || platform;
    }
    
    resetFilters() {
        // Reset all selections
        this.selectedCategory = 'all';
        this.selectedDiscount = 25;
        this.selectedPlatform = 'amazon';
        this.minPrice = 500;
        this.maxPrice = 25000;
        this.priceAlert = false;
        
        // Reset UI
        document.querySelectorAll('.category-option, .discount-option, .platform-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        document.querySelectorAll('.price-quick-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Set defaults
        this.setDefaultSelections();
        
        // Reset form inputs
        document.getElementById('minPrice').value = this.minPrice;
        document.getElementById('maxPrice').value = this.maxPrice;
        document.getElementById('priceAlert').checked = false;
        document.getElementById('alertEmailGroup').style.display = 'none';
        document.getElementById('alertEmail').value = '';
        
        this.showNotification('Filters reset successfully', 'success');
    }
    
    showDealNotFoundModal() {
        document.getElementById('dealNotFoundModal').style.display = 'flex';
    }
    
    savePriceAlert() {
        const alertData = {
            email: this.alertEmail,
            category: this.selectedCategory,
            platform: this.selectedPlatform,
            discount: this.selectedDiscount,
            minPrice: this.minPrice,
            maxPrice: this.maxPrice,
            timestamp: Date.now()
        };
        
        // Save to localStorage (in production, send to server)
        const existingAlerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
        existingAlerts.push(alertData);
        localStorage.setItem('priceAlerts', JSON.stringify(existingAlerts));
        
        this.showNotification('Price alert saved! We\'ll notify you about matching deals.', 'success');
    }
    
    loadTrendingData() {
        // In production, load from server
        const trendingSearches = [
            { category: 'electronics', maxPrice: '25000', discount: '50' },
            { category: 'fashion', maxPrice: '2000', discount: '60' },
            { category: 'home', maxPrice: '10000', discount: '40' }
        ];
        
        // This data could be used to show popular searches
    }
    
    trackEvent(eventName, parameters) {
        // Google Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'deal_finder',
                ...parameters
            });
        }
        
        console.log('Event tracked:', eventName, parameters);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Global functions for trending tags and modal
function setQuickFilter(category, price, discount) {
    const dealFinder = window.dealFinderInstance;
    if (dealFinder) {
        dealFinder.selectCategory(category);
        dealFinder.maxPrice = parseInt(price);
        document.getElementById('maxPrice').value = price;
        dealFinder.selectDiscount(parseInt(discount));
        dealFinder.validatePriceRange();
    }
}

function closeDealModal() {
    document.getElementById('dealNotFoundModal').style.display = 'none';
}

function tryAnotherPlatform() {
    closeDealModal();
    // Logic to suggest alternative platform
    const dealFinder = window.dealFinderInstance;
    if (dealFinder) {
        const platforms = ['amazon', 'flipkart', 'myntra', 'ajio'];
        const currentIndex = platforms.indexOf(dealFinder.selectedPlatform);
        const nextPlatform = platforms[(currentIndex + 1) % platforms.length];
        dealFinder.selectPlatform(nextPlatform);
        dealFinder.showNotification(`Switched to ${dealFinder.getPlatformName(nextPlatform)}`, 'info');
    }
}

function browseAllDeals() {
    closeDealModal();
    window.location.href = '/';
}

// Add notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 10001;
        max-width: 300px;
        border-left: 4px solid #2874F0;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left-color: #10B981;
        color: #10B981;
    }
    
    .notification-error {
        border-left-color: #EF4444;
        color: #EF4444;
    }
    
    .notification-info {
        border-left-color: #2874F0;
        color: #2874F0;
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize Deal Finder when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.dealFinderInstance = new DealFinder();
});









