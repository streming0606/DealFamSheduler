class DealFamApp {
    constructor() {
        this.currentPage = 0;
        this.dealsPerPage = 12;
        this.allDeals = [];
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.loadDeals();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        loadMoreBtn.addEventListener('click', () => this.loadMoreDeals());
        
        // Auto-refresh every 30 minutes
        setInterval(() => this.refreshDeals(), 30 * 60 * 1000);
    }
    
    async loadDeals() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading(true);
        
        try {
            // Load from your GitHub repository
            const response = await fetch('https://raw.githubusercontent.com/streming0606/DealFamScheduler/main/data/products.json');
            
            if (response.ok) {
                const data = await response.json();
                this.allDeals = data.products || [];
                this.renderDeals();
            } else {
                throw new Error('Failed to load deals');
            }
            
        } catch (error) {
            console.error('Error loading deals:', error);
            this.showError('Unable to load deals. Please try again later.');
        }
        
        this.isLoading = false;
        this.showLoading(false);
    }
    
    async refreshDeals() {
        await this.loadDeals();
    }
    
    renderDeals() {
        const container = document.getElementById('deals-container');
        const startIndex = this.currentPage * this.dealsPerPage;
        const endIndex = startIndex + this.dealsPerPage;
        const dealsToShow = this.allDeals.slice(0, endIndex);
        
        if (dealsToShow.length === 0) {
            this.showEmptyState();
            return;
        }
        
        container.innerHTML = '';
        
        dealsToShow.forEach((deal, index) => {
            const dealCard = this.createDealCard(deal, index);
            container.appendChild(dealCard);
        });
        
        this.updateLoadMoreButton();
    }
    
    createDealCard(deal, index) {
        const card = document.createElement('div');
        card.className = 'deal-card';
        card.style.animationDelay = `${(index % this.dealsPerPage) * 0.1}s`;
        
        // Format time
        const postedTime = new Date(`${deal.posted_date}T${deal.posted_time}`).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short'
        });
        
        card.innerHTML = `
            <div class="deal-image">
                ${deal.image ? 
                    `<img src="${deal.image}" alt="${deal.title}" loading="lazy" onerror="this.style.display='none'">` :
                    `<div style="color: #999; font-size: 3rem;">📦</div>`
                }
            </div>
            <div class="deal-content">
                <h4 class="deal-title">${this.truncateText(deal.title, 80)}</h4>
                <div class="deal-meta">
                    <span class="deal-price">${deal.price}</span>
                    <span class="deal-rating">${deal.rating}</span>
                </div>
                <a href="${deal.affiliate_link}" target="_blank" rel="noopener nofollow" class="deal-link">
                    🛒 Get Deal Now
                </a>
                <div class="deal-footer">
                    <span class="deal-time">${postedTime}</span>
                    <span class="deal-session">${deal.session_type}</span>
                </div>
            </div>
        `;
        
        return card;
    }
    
    loadMoreDeals() {
        this.currentPage++;
        this.renderDeals();
    }
    
    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        const totalShown = (this.currentPage + 1) * this.dealsPerPage;
        
        if (totalShown >= this.allDeals.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = `Load More Deals (${this.allDeals.length - totalShown} remaining)`;
        }
    }
    
    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.style.display = show ? 'block' : 'none';
    }
    
    showError(message) {
        const container = document.getElementById('deals-container');
        container.innerHTML = `
            <div class="error-message">
                <h4>❌ Oops! Something went wrong</h4>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn-primary" style="margin-top: 1rem;">
                    🔄 Try Again
                </button>
            </div>
        `;
    }
    
    showEmptyState() {
        const container = document.getElementById('deals-container');
        container.innerHTML = `
            <div class="empty-state">
                <h4>🔍 No deals available right now</h4>
                <p>Check back soon for amazing deals!</p>
            </div>
        `;
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DealFamApp();
});
