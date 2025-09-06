// Real-time update handler for bot integration
class DealFamUpdater {
    constructor() {
        this.lastUpdateTime = localStorage.getItem('lastUpdate') || '0';
        this.updateInterval = 30000; // Check every 30 seconds
        this.init();
    }
    
    init() {
        // Check for updates immediately
        this.checkForUpdates();
        
        // Set up periodic checks
        setInterval(() => this.checkForUpdates(), this.updateInterval);
        
        // Listen for focus events (when user returns to tab)
        window.addEventListener('focus', () => this.checkForUpdates());
    }
    
    async checkForUpdates() {
        try {
            const response = await fetch('data/products.json');
            const data = await response.json();
            
            if (data.last_updated && data.last_updated > this.lastUpdateTime) {
                this.handleNewProducts(data.products);
                this.lastUpdateTime = data.last_updated;
                localStorage.setItem('lastUpdate', this.lastUpdateTime);
            }
        } catch (error) {
            console.log('Update check failed:', error);
        }
    }
    
    handleNewProducts(newProducts) {
        // Update global products array
        window.allProducts = newProducts;
        
        // Show notification
        this.showUpdateNotification();
        
        // Re-render products
        if (typeof renderProducts === 'function') {
            renderProducts();
            updateCategoryCounts();
            updateTotalDeals();
        }
    }
    
    showUpdateNotification() {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-bell"></i>
            New deals added! 🔥
        `;
        
        // Add animation keyframes
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Initialize updater when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DealFamUpdater();
});
